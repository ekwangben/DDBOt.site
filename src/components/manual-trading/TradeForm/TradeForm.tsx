import React, { useCallback, useEffect, useRef, useState } from 'react';
import { localize } from '@deriv-com/translations';
import { api_base } from '@/external/bot-skeleton';
import { useProposal } from '@/hooks/api/useProposal';
import { useTradeExecution } from '@/hooks/api/useTradeExecution';
import { useStore } from '@/hooks/useStore';
import { TradeTypeSelector, TradeCategory } from './TradeTypeSelector';
import { ContractParameters } from './ContractParameters';
import './trade-form.scss';

interface TradeFormProps {
    currentSymbol?: string;
}

// Duration units
const DURATION_UNITS = [
    { value: 't', label: localize('Ticks') },
    { value: 's', label: localize('Seconds') },
    { value: 'm', label: localize('Minutes') },
    { value: 'h', label: localize('Hours') },
    { value: 'd', label: localize('Days') },
];

export const TradeForm: React.FC<TradeFormProps> = ({ currentSymbol }) => {
    const store = useStore();
    const client = store?.client;
    const currency = client?.currency || 'USD';
    const isLoggedIn = client?.is_logged_in;

    const symbol = currentSymbol || 'R_100';
    const [tradeCategory, setTradeCategory] = useState<TradeCategory>('digits');
    const [contractType, setContractType] = useState<string>('DIGITOVER');
    const [stake, setStake] = useState<number>(10);
    const [duration, setDuration] = useState<number>(5);
    const [durationUnit, setDurationUnit] = useState<string>('t');
    const [barrier, setBarrier] = useState<number>(0);
    const [barrier2, setBarrier2] = useState<number>(0);
    const [selectedDigit, setSelectedDigit] = useState<number>(5);
    const [lastPrice, setLastPrice] = useState<string>('0.00');

    const tickSubscriptionRef = useRef<string | null>(null);

    const { buy, isLoading: isBuying, error: buyError } = useTradeExecution();
    const {
        proposal,
        requestProposal,
        isLoading: isProposalLoading,
        error: proposalError,
    } = useProposal();

    // Subscribe to ticks for price display
    useEffect(() => {
        if (!api_base.api) return;

        const subscribeToTicks = async () => {
            try {
                if (tickSubscriptionRef.current) {
                    await api_base.api.forget(tickSubscriptionRef.current);
                }

                const response = await api_base.api.send({
                    ticks: symbol,
                    subscribe: 1,
                });

                if (response.error) {
                    console.error('Tick subscription error:', response.error.message);
                    return;
                }

                if (response.subscription) {
                    tickSubscriptionRef.current = response.subscription.id;
                }

                if (response.tick) {
                    setLastPrice(response.tick.quote.toFixed(2));
                }

                api_base.api.onMessage().subscribe(({ data }: { data: Record<string, unknown> }) => {
                    if (data.msg_type === 'tick' && (data as Record<string, { tick: { quote: number } }>).tick) {
                        const tickData = data as Record<string, { tick: { quote: number } }>;
                        setLastPrice(tickData.tick.quote.toFixed(2));
                    }
                });
            } catch (error) {
                console.error('Failed to subscribe to ticks:', error);
            }
        };

        subscribeToTicks();

        return () => {
            if (tickSubscriptionRef.current && api_base.api) {
                api_base.api.forget(tickSubscriptionRef.current).catch(() => {
                    // Ignore cleanup errors
                });
            }
        };
    }, [symbol]);

    // Request proposal when parameters change
    useEffect(() => {
        if (!symbol || !stake) return;

        const fetchProposal = async () => {
            try {
                requestProposal({
                    symbol,
                    contractType,
                    amount: stake,
                    currency,
                    duration: ['t', 's', 'm', 'h', 'd'].includes(durationUnit) ? duration : undefined,
                    durationUnit: ['t', 's', 'm', 'h', 'd'].includes(durationUnit) ? durationUnit : undefined,
                    barrier: barrier || undefined,
                    barrier2: barrier2 || undefined,
                    selectedDigit: ['DIGITOVER', 'DIGITUNDER', 'DIGITMATCH', 'DIGITDIFF'].includes(contractType)
                        ? selectedDigit
                        : undefined,
                }).catch(() => {
                    // Ignore proposal errors
                });
            } catch (error) {
                console.error('Proposal error:', error);
            }
        };

        const debounce = setTimeout(fetchProposal, 300);
        return () => clearTimeout(debounce);
    }, [
        symbol,
        contractType,
        stake,
        currency,
        duration,
        durationUnit,
        barrier,
        barrier2,
        selectedDigit,
    ]);

    // Handle trade category change
    const handleCategoryChange = useCallback((category: TradeCategory) => {
        setTradeCategory(category);

        // Set default contract type for category
        const defaultContracts: Record<TradeCategory, string> = {
            'rise-fall': 'CALL',
            'high-low': 'HIGH',
            digits: 'DIGITOVER',
            turbo: 'CALL',
            vanillas: 'CALL',
        };

        setContractType(defaultContracts[category] || 'CALL');
    }, []);

    // Handle buy
    const handleBuy = useCallback(async () => {
        if (!isLoggedIn) {
            alert(localize('Please log in to trade'));
            return;
        }

        try {
            const result = await buy({
                symbol,
                contractType,
                amount: stake,
                currency,
                duration: ['t', 's', 'm', 'h', 'd'].includes(durationUnit) ? duration : undefined,
                durationUnit: ['t', 's', 'm', 'h', 'd'].includes(durationUnit) ? durationUnit : undefined,
                barrier: barrier || undefined,
                barrier2: barrier2 || undefined,
                selectedDigit: ['DIGITOVER', 'DIGITUNDER', 'DIGITMATCH', 'DIGITDIFF'].includes(contractType)
                    ? selectedDigit
                    : undefined,
            });

            if (result) {
                console.log('Trade executed:', result);
            }
        } catch (error) {
            console.error('Buy error:', error);
        }
    }, [
        isLoggedIn,
        symbol,
        contractType,
        stake,
        currency,
        duration,
        durationUnit,
        barrier,
        barrier2,
        selectedDigit,
        buy,
    ]);

    const payout = proposal ? proposal.payout : 0;
    const profit = proposal ? proposal.payout - stake : 0;
    const profitPercent = stake > 0 ? ((profit / stake) * 100).toFixed(2) : '0';
    const error = buyError || proposalError;

    return (
        <div className='trade-form'>
            {/* Price Display */}
            <div className='trade-form__price'>
                <span className='trade-form__price-label'>{localize('Price')}</span>
                <span className='trade-form__price-value'>{lastPrice}</span>
            </div>

            {/* Trade Type Selector */}
            <TradeTypeSelector
                selectedCategory={tradeCategory}
                selectedContractType={contractType}
                onCategoryChange={handleCategoryChange}
                onContractTypeChange={setContractType}
            />

            {/* Contract Parameters (barrier, digit, etc.) */}
            <ContractParameters
                contractType={contractType}
                barrier={barrier}
                barrier2={barrier2}
                selectedDigit={selectedDigit}
                onBarrierChange={setBarrier}
                onBarrier2Change={setBarrier2}
                onDigitChange={setSelectedDigit}
            />

            {/* Duration */}
            <div className='trade-form__field'>
                <label className='trade-form__label'>{localize('Duration')}</label>
                <div className='trade-form__duration-group'>
                    <button
                        className='trade-form__duration-btn'
                        onClick={() => setDuration(Math.max(1, duration - 1))}
                    >
                        −
                    </button>
                    <div className='trade-form__duration-value'>
                        <input
                            type='number'
                            className='trade-form__duration-input'
                            value={duration}
                            onChange={e => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                            min={1}
                            max={365}
                        />
                        <select
                            className='trade-form__unit-select'
                            value={durationUnit}
                            onChange={e => setDurationUnit(e.target.value)}
                        >
                            {DURATION_UNITS.map(unit => (
                                <option key={unit.value} value={unit.value}>
                                    {unit.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        className='trade-form__duration-btn'
                        onClick={() => setDuration(Math.min(365, duration + 1))}
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Stake Input */}
            <div className='trade-form__field'>
                <label className='trade-form__label'>{localize('Stake')}</label>
                <div className='trade-form__input-group'>
                    <span className='trade-form__currency'>{currency}</span>
                    <input
                        type='number'
                        className='trade-form__input'
                        value={stake}
                        onChange={e => setStake(Math.max(0.35, parseFloat(e.target.value) || 0))}
                        min={0.35}
                        max={50000}
                        step={0.01}
                    />
                </div>
            </div>

            {/* Payout Preview */}
            {proposal && (
                <div className='trade-form__payout'>
                    <div className='trade-form__payout-row'>
                        <span className='trade-form__payout-label'>{localize('Payout')}</span>
                        <span className='trade-form__payout-value'>
                            {currency} {payout.toFixed(2)}
                        </span>
                    </div>
                    <div className='trade-form__payout-row'>
                        <span className='trade-form__payout-label'>{localize('Profit')}</span>
                        <span
                            className='trade-form__payout-value'
                            style={{ color: profit >= 0 ? '#4caf50' : '#ff444f' }}
                        >
                            +{profitPercent}% ({currency} {profit.toFixed(2)})
                        </span>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {(isBuying || isProposalLoading) && (
                <div className='trade-form__loading'>
                    <div className='spinner-small' />
                    <span>{isBuying ? localize('Processing...') : localize('Loading...')}</span>
                </div>
            )}

            {/* Error State */}
            {error && <div className='trade-form__error'>{error}</div>}

            {/* Buy Button */}
            <button
                className={`trade-form__buy-btn ${isBuying || !isLoggedIn ? 'disabled' : ''}`}
                onClick={handleBuy}
                disabled={isBuying || !isLoggedIn}
            >
                {!isLoggedIn
                    ? localize('Log in to trade')
                    : isBuying
                        ? localize('Processing...')
                        : localize('Buy')}
            </button>
        </div>
    );
};
