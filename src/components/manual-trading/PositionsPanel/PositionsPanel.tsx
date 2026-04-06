import React, { useCallback, useEffect, useRef,useState } from 'react';
import { api_base } from '@/external/bot-skeleton';
import { useStore } from '@/hooks/useStore';
import './positions-panel.scss';

interface Position {
    contract_id: string;
    symbol: string;
    contract_type: string;
    buy_price: number;
    bid_price: number;
    currency: string;
    status: string;
    is_sold: boolean;
    profit?: number;
    purchase_time: number;
    expiry_time: number;
}

export const PositionsPanel: React.FC = () => {
    const store = useStore();
    const client = store?.client;
    const currency = client?.currency || 'USD';
    const isLoggedIn = client?.is_logged_in;

    const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
    const [positions, setPositions] = useState<Position[]>([]);
    const subscriptionIdRef = useRef<string | null>(null);

    // Subscribe to contract updates
    const subscribeToContracts = useCallback(async () => {
        if (!api_base.api || !isLoggedIn) return;

        try {
            // Forget previous subscription
            if (subscriptionIdRef.current) {
                await api_base.api.forget(subscriptionIdRef.current);
                subscriptionIdRef.current = null;
            }

            const response = await api_base.api.send({
                proposal_open_contract: 1,
                subscribe: 1,
            });

            if (response.error) {
                console.error('Contract subscription error:', response.error.message);
                return;
            }

            if (response.subscription) {
                subscriptionIdRef.current = response.subscription.id;
            }

            if (response.proposal_open_contract) {
                const contract = response.proposal_open_contract;
                setPositions(prev => {
                    const existingIndex = prev.findIndex(c => c.contract_id === contract.contract_id);
                    if (existingIndex >= 0) {
                        const updated = [...prev];
                        updated[existingIndex] = {
                            ...updated[existingIndex],
                            ...contract,
                            profit: contract.bid_price - contract.buy_price,
                        };
                        return updated;
                    }
                    return [
                        ...prev,
                        {
                            ...contract,
                            profit: contract.bid_price - contract.buy_price,
                        },
                    ];
                });
            }

            // Subscribe to future updates
            api_base.api.onMessage().subscribe(({ data }: { data: Record<string, unknown> }) => {
                if (data.msg_type === 'proposal_open_contract' && data.proposal_open_contract) {
                    const contract = data.proposal_open_contract as Record<string, unknown>;
                    setPositions(prev => {
                        const existingIndex = prev.findIndex(c => c.contract_id === contract.contract_id);
                        if (existingIndex >= 0) {
                            const updated = [...prev];
                            updated[existingIndex] = {
                                ...updated[existingIndex],
                                ...contract,
                                profit: contract.bid_price - contract.buy_price,
                            };
                            return updated;
                        }
                        return [
                            ...prev,
                            {
                                ...contract,
                                profit: contract.bid_price - contract.buy_price,
                            },
                        ];
                    });
                }
            });
        } catch (error) {
            console.error('Failed to subscribe to contracts:', error);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        subscribeToContracts();
        return () => {
            if (subscriptionIdRef.current && api_base.api) {
                api_base.api.forget(subscriptionIdRef.current);
            }
        };
    }, [subscribeToContracts]);

    const formatCurrency = (amount: number, curr: string) => {
        return `${curr} ${amount?.toFixed(2) || '0.00'}`;
    };

    const formatTime = (timestamp: number) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString();
    };

    const activePositions = positions.filter(p => !p.is_sold && p.status === 'open');
    const closedPositions = positions.filter(p => p.is_sold || p.status !== 'open');

    return (
        <div className='positions-panel'>
            <div className='positions-panel__header'>
                <h3>Positions</h3>
            </div>

            <div className='positions-panel__tabs'>
                <button
                    className={`positions-panel__tab ${activeTab === 'open' ? 'active' : ''}`}
                    onClick={() => setActiveTab('open')}
                >
                    Open ({activePositions.length})
                </button>
                <button
                    className={`positions-panel__tab ${activeTab === 'closed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('closed')}
                >
                    Closed ({closedPositions.length})
                </button>
            </div>

            <div className='positions-panel__content'>
                {!isLoggedIn && (
                    <div className='positions-panel__empty'>
                        <p>Log in to view positions</p>
                    </div>
                )}

                {isLoggedIn && positions.length === 0 && (
                    <div className='positions-panel__empty'>
                        <p>No positions yet</p>
                    </div>
                )}

                {isLoggedIn && positions.length > 0 && (
                    <div className='positions-list'>
                        {(activeTab === 'open' ? activePositions : closedPositions).map(position => (
                            <div key={position.contract_id} className='position-item'>
                                <div className='position-header'>
                                    <span className='position-symbol'>{position.symbol}</span>
                                    <span className={`position-status ${position.is_sold ? 'closed' : 'open'}`}>
                                        {position.is_sold ? 'Closed' : 'Open'}
                                    </span>
                                </div>
                                <div className='position-details'>
                                    <div className='position-row'>
                                        <span>Type:</span>
                                        <span>{position.contract_type}</span>
                                    </div>
                                    <div className='position-row'>
                                        <span>Buy Price:</span>
                                        <span>
                                            {formatCurrency(position.buy_price || 0, position.currency || currency)}
                                        </span>
                                    </div>
                                    <div className='position-row'>
                                        <span>Current:</span>
                                        <span>
                                            {formatCurrency(position.bid_price || 0, position.currency || currency)}
                                        </span>
                                    </div>
                                    <div className='position-row'>
                                        <span>P/L:</span>
                                        <span
                                            className={`position-pl ${(position.profit || 0) >= 0 ? 'profit' : 'loss'}`}
                                        >
                                            {(position.profit || 0) >= 0 ? '+' : ''}
                                            {formatCurrency(position.profit || 0, position.currency || currency)}
                                        </span>
                                    </div>
                                    {position.is_sold && (
                                        <div className='position-row'>
                                            <span>Closed at:</span>
                                            <span>{formatTime(position.expiry_time)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
