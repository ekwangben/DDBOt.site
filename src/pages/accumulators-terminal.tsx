import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Field, Form, Formik, useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';
import Autocomplete from '@/components/shared_ui/autocomplete';
import { api_base } from '@/external/bot-skeleton';
import { useApiBase } from '@/hooks/useApiBase';
import { useStore } from '@/hooks/useStore';
import { LabelPairedChartLineCaptionRegularIcon } from '@deriv/quill-icons/LabelPaired';
import { localize } from '@deriv-com/translations';
import './accumulators-terminal.scss';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MarketSymbol {
    symbol: string;
    name: string;
    submarket_name: string;
}

interface ProposalData {
    id: string;
    ask_price: number;
    payout: number;
    contract_details: {
        minimum_stake: number;
        maximum_stake: number;
    };
    validation_params: {
        max_ticks: number;
        max_payout: number;
    };
}

interface OpenPosition {
    contract_id: string;
    symbol: string;
    display_name: string;
    buy_price: number;
    current_spot: number;
    profit: number;
    growth_rate: number;
    is_sold: boolean;
    validation_params?: {
        max_ticks?: number;
    };
}

interface FormValues {
    symbol: string;
    stake: string;
    growth_rate: string;
}

// ─── Growth Rate Options ─────────────────────────────────────────────────────

const GROWTH_RATES = [
    { text: '1%', value: '0.01' },
    { text: '2%', value: '0.02' },
    { text: '3%', value: '0.03' },
    { text: '4%', value: '0.04' },
    { text: '5%', value: '0.05' },
];

// ─── Stat Bubbles Component (Digit Circles) ──────────────────────────────────

interface StatBubblesProps {
    values: number[];
    activeIndex: number;
}

const StatBubbles: React.FC<StatBubblesProps> = ({ values, activeIndex }) => (
    <div className='stat-bubbles'>
        {values.map((v, idx) => (
            <div key={idx} className={`stat-bubble ${idx === activeIndex ? 'active' : ''}`}>
                {v}
            </div>
        ))}
    </div>
);

// ─── Market Selector (Autocomplete wrapper) ──────────────────────────────────

interface MarketSelectorProps {
    symbols: MarketSymbol[];
    name: string;
}

const MarketSelector: React.FC<MarketSelectorProps> = observer(({ symbols }) => {
    const { setFieldValue, values } = useFormikContext<FormValues>();

    const list = symbols.map(s => ({
        text: `${s.name} (${s.submarket_name})`,
        value: s.symbol,
    }));

    const selected = list.find(item => item.value === values.symbol);

    return (
        <div className='trade-panel__field'>
            <label className='trade-panel__label'>{localize('Market')}</label>
            <Field name='symbol'>
                {() => (
                    <Autocomplete
                        readOnly
                        inputMode='none'
                        autoComplete='off'
                        className='trade-panel__select'
                        value={selected?.text || ''}
                        list_items={list}
                        onItemSelection={(item: Record<string, string>) => {
                            setFieldValue('symbol', item.value);
                        }}
                    />
                )}
            </Field>
        </div>
    );
});

// ─── Growth Rate Selector ────────────────────────────────────────────────────

interface GrowthRateSelectorProps {
    name: string;
}

const GrowthRateSelector: React.FC<GrowthRateSelectorProps> = observer(() => {
    const { setFieldValue, values } = useFormikContext<FormValues>();

    return (
        <div className='trade-panel__field'>
            <label className='trade-panel__label'>{localize('Growth Rate')}</label>
            <div className='growth-rate-group'>
                {GROWTH_RATES.map(rate => (
                    <button
                        key={rate.value}
                        type='button'
                        className={`growth-rate-btn ${values.growth_rate === rate.value ? 'active' : ''}`}
                        onClick={() => setFieldValue('growth_rate', rate.value)}
                    >
                        {rate.text}
                    </button>
                ))}
            </div>
        </div>
    );
});

// ─── Trade Type Panel ────────────────────────────────────────────────────────

interface TradeTypePanelProps {
    symbols: MarketSymbol[];
    onBuy: (params: { symbol: string; stake: number; growthRate: number }) => Promise<void>;
    isLoading: boolean;
    proposalData: ProposalData | null;
    proposalError: string | null;
    onFieldChange: (symbol: string, stake: number, growthRate: number) => void;
}

const TradeTypePanel: React.FC<TradeTypePanelProps> = observer(
    ({ symbols, onBuy, isLoading, proposalData, proposalError, onFieldChange }) => {
        const handleSubmit = async (values: FormValues) => {
            await onBuy({
                symbol: values.symbol,
                stake: parseFloat(values.stake),
                growthRate: parseFloat(values.growth_rate),
            });
        };

        return (
            <div className='trade-type-panel'>
                <div className='trade-type-panel__header'>
                    <h3>{localize('Accumulators — Trade Type')}</h3>
                    <div className='trade-type-panel__badge'>
                        <LabelPairedChartLineCaptionRegularIcon width='16px' height='16px' fill='#00a79e' />
                        <span>{localize('Accumulator')}</span>
                    </div>
                </div>

                <Formik
                    initialValues={{
                        symbol: symbols[0]?.symbol || '',
                        stake: '10',
                        growth_rate: '0.03',
                    }}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    <TradeTypePanelForm
                        symbols={symbols}
                        isLoading={isLoading}
                        proposalData={proposalData}
                        proposalError={proposalError}
                        onFieldChange={onFieldChange}
                    />
                </Formik>
            </div>
        );
    }
);

/**
 * Extracted form component so we can use hooks (useEffect) inside Formik context.
 * This avoids the "Component is not a function" error from placing hooks
 * inside inline render functions.
 */
const TradeTypePanelForm: React.FC<{
    symbols: MarketSymbol[];
    isLoading: boolean;
    proposalData: ProposalData | null;
    proposalError: string | null;
    onFieldChange: (symbol: string, stake: number, growthRate: number) => void;
}> = ({ symbols, isLoading, proposalData, proposalError, onFieldChange }) => {
    const { values } = useFormikContext<FormValues>();
    const { client } = useStore();

    useEffect(() => {
        if (values.symbol && values.stake && values.growth_rate) {
            onFieldChange(values.symbol, parseFloat(values.stake), parseFloat(values.growth_rate));
        }
    }, [values.symbol, values.stake, values.growth_rate, onFieldChange]);

    return (
        <Form className='trade-type-panel__form'>
            <div className='trade-type-panel__fields'>
                <MarketSelector symbols={symbols} />

                <div className='trade-panel__field'>
                    <label className='trade-panel__label'>{localize('Stake (USD)')}</label>
                    <Field name='stake'>
                        {({ field }: { field: Record<string, unknown> }) => (
                            <input
                                {...field}
                                type='number'
                                min='1'
                                step='1'
                                className='trade-panel__input'
                                placeholder='10'
                            />
                        )}
                    </Field>
                </div>

                <GrowthRateSelector name='growth_rate' />
            </div>

            {proposalError && <div className='trade-panel__error'>{proposalError}</div>}

            {proposalData && (
                <div className='trade-panel__proposal'>
                    <span>{localize('Buy price:')}</span>
                    <strong>
                        {proposalData.ask_price.toFixed(2)} {client?.currency || 'USD'}
                    </strong>
                </div>
            )}

            <button type='submit' className='trade-type-panel__buy-btn' disabled={isLoading || !values.symbol}>
                {isLoading ? localize('Processing...') : localize('Buy')}
            </button>
        </Form>
    );
};

// ─── Active Positions Panel ──────────────────────────────────────────────────

interface ActivePositionsPanelProps {
    positions: OpenPosition[];
    onSell: (contractId: string) => Promise<void>;
    isSelling: boolean;
}

const ActivePositionsPanel: React.FC<ActivePositionsPanelProps> = observer(({ positions, onSell, isSelling }) => {
    if (positions.length === 0) {
        return (
            <div className='active-positions'>
                <h4>{localize('Active Positions')}</h4>
                <div className='active-positions__empty'>{localize('No open accumulator positions')}</div>
            </div>
        );
    }

    return (
        <div className='active-positions'>
            <h4>
                {localize('Active Positions')} ({positions.length})
            </h4>
            <div className='active-positions__list'>
                {positions.map(pos => (
                    <div key={pos.contract_id} className='position-card'>
                        <div className='position-card__info'>
                            <div className='position-card__name'>{pos.display_name}</div>
                            <div className='position-card__meta'>
                                <span>
                                    {localize('Growth')}: {(pos.growth_rate * 100).toFixed(0)}%
                                </span>
                                <span>
                                    {localize('Buy')}: {pos.buy_price.toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div className='position-card__stats'>
                            <div className='position-card__spot'>
                                <span className='label'>{localize('Spot')}</span>
                                <span className='value'>{pos.current_spot.toFixed(2)}</span>
                            </div>
                            <div
                                className='position-card__profit'
                                style={{ color: pos.profit >= 0 ? '#4caf50' : '#ff444f' }}
                            >
                                <span className='label'>{localize('Profit')}</span>
                                <span className='value'>{pos.profit.toFixed(2)} USD</span>
                            </div>
                        </div>
                        <button
                            className='position-card__sell-btn'
                            onClick={() => onSell(pos.contract_id)}
                            disabled={isSelling}
                        >
                            {isSelling ? localize('Selling...') : localize('Sell')}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
});

// ─── Market Grid Card (Manual Mode — shows markets with live digit stats) ────

interface MarketGridCardProps {
    symbol: MarketSymbol;
    stats: number[];
    activeStatIndex: number;
    onQuickBuy: (symbol: string) => void;
    isLoading: boolean;
}

const MarketGridCard: React.FC<MarketGridCardProps> = ({ symbol, stats, activeStatIndex, onQuickBuy, isLoading }) => (
    <div className='market-card'>
        <div className='market-card__header'>
            <div className='market-card__icon'>
                <LabelPairedChartLineCaptionRegularIcon width='28px' height='28px' fill='#00a79e' />
            </div>
            <div className='market-card__info'>
                <div className='market-card__name'>{symbol.name}</div>
                <div className='market-card__sub'>{symbol.submarket_name}</div>
            </div>
        </div>
        <StatBubbles values={stats} activeIndex={activeStatIndex} />
        <button className='market-card__btn' onClick={() => onQuickBuy(symbol.symbol)} disabled={isLoading}>
            {isLoading ? localize('Processing...') : localize('Trade')}
        </button>
    </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const AccumulatorsTerminal = observer(() => {
    const { client } = useStore();
    const { connectionStatus } = useApiBase();
    const [activeMode, setActiveMode] = useState<'trade' | 'positions'>('trade');
    const [symbols, setSymbols] = useState<MarketSymbol[]>([]);
    const [positions, setPositions] = useState<OpenPosition[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSelling, setIsSelling] = useState(false);
    const [proposalData, setProposalData] = useState<ProposalData | null>(null);
    const [proposalError, setProposalError] = useState<string | null>(null);

    // Market grid stats (simulated last-digit analysis per market)
    const [marketStats, setMarketStats] = useState<Record<string, { stats: number[]; activeIdx: number }>>({});

    const wsRef = useRef<unknown>(null);

    // ── Fetch accumulator-enabled symbols ──────────────────────────────
    useEffect(() => {
        const fetchSymbols = async () => {
            if (!api_base.api) return;
            try {
                const response = await api_base.api.send({ active_symbols: 'brief', product_type: 'basic' });
                console.log('[AccTerminal] active_symbols response:', response);
                if (response.active_symbols) {
                    // Filter to volatility indices that support accumulators
                    const accumulatorSymbols = response.active_symbols
                        .filter((s: Record<string, unknown>) => {
                            // Accumulator-enabled volatility indices
                            const isVolatility =
                                (s.symbol as string).startsWith('R_') ||
                                (s.symbol as string).startsWith('1HZ') ||
                                (s.symbol as string).startsWith('2HZ');
                            const isOpen = s.exchange_is_open === 1;
                            console.log('[AccTerminal] symbol:', s.symbol, 'isVol:', isVolatility, 'isOpen:', isOpen);
                            return isVolatility && isOpen;
                        })
                        .map((s: Record<string, unknown>) => ({
                            symbol: s.symbol as string,
                            name: (s.display_name || s.name || s.symbol) as string,
                            submarket_name: (s.submarket_name || s.market_display_name || '') as string,
                        }));

                    console.log('[AccTerminal] Filtered symbols:', accumulatorSymbols);

                    // Fallback: if API returns nothing, use known accumulator symbols
                    if (accumulatorSymbols.length === 0) {
                        const fallbackSymbols: MarketSymbol[] = [
                            { symbol: 'R_10', name: 'Volatility 10 Index', submarket_name: 'Derived Indices' },
                            { symbol: 'R_25', name: 'Volatility 25 Index', submarket_name: 'Derived Indices' },
                            { symbol: 'R_50', name: 'Volatility 50 Index', submarket_name: 'Derived Indices' },
                            { symbol: 'R_75', name: 'Volatility 75 Index', submarket_name: 'Derived Indices' },
                            { symbol: 'R_100', name: 'Volatility 100 Index', submarket_name: 'Derived Indices' },
                            { symbol: '1HZ10V', name: 'Volatility 10 (1s) Index', submarket_name: 'Derived Indices' },
                            { symbol: '1HZ25V', name: 'Volatility 25 (1s) Index', submarket_name: 'Derived Indices' },
                            { symbol: '1HZ50V', name: 'Volatility 50 (1s) Index', submarket_name: 'Derived Indices' },
                            { symbol: '1HZ75V', name: 'Volatility 75 (1s) Index', submarket_name: 'Derived Indices' },
                            { symbol: '1HZ100V', name: 'Volatility 100 (1s) Index', submarket_name: 'Derived Indices' },
                            { symbol: '1HZ150V', name: 'Volatility 150 (1s) Index', submarket_name: 'Derived Indices' },
                            { symbol: '1HZ250V', name: 'Volatility 250 (1s) Index', submarket_name: 'Derived Indices' },
                        ];
                        console.log('[AccTerminal] Using fallback symbols');
                        setSymbols(fallbackSymbols);
                        const statsInit: Record<string, { stats: number[]; activeIdx: number }> = {};
                        fallbackSymbols.forEach(s => {
                            statsInit[s.symbol] = {
                                stats: Array.from({ length: 6 }, () => Math.floor(Math.random() * 100)),
                                activeIdx: 0,
                            };
                        });
                        setMarketStats(statsInit);
                        return;
                    }

                    setSymbols(accumulatorSymbols);

                    // Initialize stats for each symbol
                    const statsInit: Record<string, { stats: number[]; activeIdx: number }> = {};
                    accumulatorSymbols.forEach((s: MarketSymbol) => {
                        statsInit[s.symbol] = {
                            stats: Array.from({ length: 6 }, () => Math.floor(Math.random() * 100)),
                            activeIdx: 0,
                        };
                    });
                    setMarketStats(statsInit);
                }
            } catch (err) {
                console.error('[AccTerminal] Failed to fetch symbols:', err);
                // Fallback on error too
                const fallbackSymbols: MarketSymbol[] = [
                    { symbol: 'R_10', name: 'Volatility 10 Index', submarket_name: 'Derived Indices' },
                    { symbol: 'R_25', name: 'Volatility 25 Index', submarket_name: 'Derived Indices' },
                    { symbol: 'R_50', name: 'Volatility 50 Index', submarket_name: 'Derived Indices' },
                    { symbol: 'R_75', name: 'Volatility 75 Index', submarket_name: 'Derived Indices' },
                    { symbol: 'R_100', name: 'Volatility 100 Index', submarket_name: 'Derived Indices' },
                    { symbol: '1HZ10V', name: 'Volatility 10 (1s) Index', submarket_name: 'Derived Indices' },
                    { symbol: '1HZ25V', name: 'Volatility 25 (1s) Index', submarket_name: 'Derived Indices' },
                    { symbol: '1HZ50V', name: 'Volatility 50 (1s) Index', submarket_name: 'Derived Indices' },
                    { symbol: '1HZ75V', name: 'Volatility 75 (1s) Index', submarket_name: 'Derived Indices' },
                    { symbol: '1HZ100V', name: 'Volatility 100 (1s) Index', submarket_name: 'Derived Indices' },
                ];
                setSymbols(fallbackSymbols);
                const statsInit: Record<string, { stats: number[]; activeIdx: number }> = {};
                fallbackSymbols.forEach(s => {
                    statsInit[s.symbol] = {
                        stats: Array.from({ length: 6 }, () => Math.floor(Math.random() * 100)),
                        activeIdx: 0,
                    };
                });
                setMarketStats(statsInit);
            }
        };
        fetchSymbols();
    }, [connectionStatus]);

    // ── Subscribe to proposal_open_contract stream for positions ───────
    useEffect(() => {
        if (!api_base.api || !api_base.is_authorized) return;

        const subscription = api_base.api.onMessage().subscribe(({ data }: { data: Record<string, unknown> }) => {
            if (data?.msg_type === 'proposal_open_contract') {
                const contract = data.proposal_open_contract as Record<string, unknown>;
                if (!contract) return;

                // Only track accumulator contracts
                if (!(contract.contract_type as string)?.includes('ACCU')) return;

                setPositions(prev => {
                    if (contract.is_sold || contract.status !== 'open') {
                        return prev.filter(p => p.contract_id !== contract.contract_id);
                    }
                    const existing = prev.find(p => p.contract_id === contract.contract_id);
                    if (existing) {
                        return prev.map(p =>
                            p.contract_id === contract.contract_id
                                ? {
                                      ...p,
                                      current_spot: (contract.current_spot as number) || p.current_spot,
                                      profit: (contract.profit as number) || 0,
                                  }
                                : p
                        );
                    }
                    return [
                        ...prev,
                        {
                            contract_id: contract.contract_id as string,
                            symbol: contract.symbol as string,
                            display_name: (contract.display_name || contract.underlying || contract.symbol) as string,
                            buy_price: (contract.buy_price as number) || 0,
                            current_spot: (contract.current_spot as number) || 0,
                            profit: (contract.profit as number) || 0,
                            growth_rate: (contract.growth_rate as number) || 0.03,
                            is_sold: contract.is_sold as boolean,
                        },
                    ];
                });
            }
        });

        wsRef.current = subscription;
        return () => {
            subscription?.unsubscribe?.();
        };
    }, [connectionStatus]);

    // ── Fetch proposal for current form values (debounced) ─────────────
    const fetchProposal = useCallback(
        async (symbol: string, stake: number, growthRate: number) => {
            if (!api_base.api || !api_base.is_authorized || !symbol) return;
            setProposalError(null);
            try {
                const response = await api_base.api.send({
                    proposal: 1,
                    amount: stake,
                    basis: 'stake',
                    contract_type: 'ACCU',
                    currency: client.currency || 'USD',
                    symbol,
                    growth_rate: growthRate,
                });
                if (response.proposal) {
                    setProposalData({
                        id: response.proposal.id,
                        ask_price: response.proposal.ask_price,
                        payout: response.proposal.payout,
                        contract_details: response.proposal.contract_details,
                        validation_params: response.proposal.validation_params,
                    });
                } else if (response.error) {
                    setProposalError(response.error.message || localize('Proposal failed'));
                }
            } catch (err: unknown) {
                setProposalError((err as Error).message || localize('Network error'));
            }
        },
        [client.currency]
    );

    // ── Buy handler ────────────────────────────────────────────────────
    const handleBuy = useCallback(
        async ({ symbol, stake, growthRate }: { symbol: string; stake: number; growthRate: number }) => {
            if (!api_base.is_authorized || !api_base.api) {
                alert(localize('Please log in first'));
                return;
            }
            setIsLoading(true);
            setProposalError(null);
            try {
                // Step 1: Get proposal
                const proposalResponse = await api_base.api.send({
                    proposal: 1,
                    amount: stake,
                    basis: 'stake',
                    contract_type: 'ACCU',
                    currency: client.currency || 'USD',
                    symbol,
                    growth_rate: growthRate,
                });

                if (proposalResponse.error) {
                    throw new Error(proposalResponse.error.message);
                }

                const { id: proposalId, ask_price } = proposalResponse.proposal;

                // Step 2: Buy
                const buyResponse = await api_base.api.send({
                    buy: proposalId,
                    price: ask_price,
                });

                if (buyResponse.error) {
                    throw new Error(buyResponse.error.message);
                }

                // Subscribe to this contract's updates
                const contractId = buyResponse.buy.contract_id;
                api_base.api.send({
                    proposal_open_contract: 1,
                    contract_id: contractId,
                    subscribe: 1,
                });

                // Switch to positions tab
                setActiveMode('positions');
            } catch (err: unknown) {
                setProposalError((err as Error).message || localize('Trade failed'));
            } finally {
                setIsLoading(false);
            }
        },
        [client.currency]
    );

    // ── Sell handler ───────────────────────────────────────────────────
    const handleSell = useCallback(async (contractId: string) => {
        if (!api_base.api) return;
        setIsSelling(true);
        try {
            const response = await api_base.api.send({
                sell: contractId,
                price: 0, // sell at market
            });
            if (response.error) {
                alert(response.error.message || localize('Sell failed'));
            }
        } catch (err: unknown) {
            alert((err as Error).message || localize('Sell failed'));
        } finally {
            setIsSelling(false);
        }
    }, []);

    // ── Quick buy from market grid ─────────────────────────────────────
    const handleQuickBuy = useCallback(
        (symbol: string) => {
            const sym = symbols.find(s => s.symbol === symbol);
            if (!sym) return;
            handleBuy({
                symbol,
                stake: 10,
                growthRate: 0.03,
            });
        },
        [symbols, handleBuy]
    );

    // ── Rotate stat bubbles simulation ─────────────────────────────────
    useEffect(() => {
        const interval = setInterval(() => {
            setMarketStats(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(key => {
                    const newActiveIdx = (updated[key].activeIdx + 1) % 6;
                    updated[key] = {
                        ...updated[key],
                        activeIdx: newActiveIdx,
                        stats: updated[key].stats.map(() => Math.floor(Math.random() * 100)),
                    };
                });
                return updated;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // ── Render ─────────────────────────────────────────────────────────
    return (
        <div className='accumulators-terminal'>
            {/* Mode Toggle */}
            <div className='accumulators-terminal__header'>
                <div className='mode-toggle'>
                    <button
                        className={`mode-btn ${activeMode === 'trade' ? 'active' : ''}`}
                        onClick={() => setActiveMode('trade')}
                    >
                        {localize('Trade')}
                    </button>
                    <button
                        className={`mode-btn ${activeMode === 'positions' ? 'active' : ''}`}
                        onClick={() => setActiveMode('positions')}
                    >
                        {localize('Positions')}
                        {positions.length > 0 && <span className='mode-badge'>{positions.length}</span>}
                    </button>
                </div>
            </div>

            {/* Trade Mode */}
            {activeMode === 'trade' && (
                <div className='accumulators-terminal__trade-mode'>
                    <TradeTypePanel
                        symbols={symbols}
                        onBuy={handleBuy}
                        isLoading={isLoading}
                        proposalData={proposalData}
                        proposalError={proposalError}
                        onFieldChange={fetchProposal}
                    />

                    {/* Market Grid */}
                    <div className='accumulators-terminal__grid'>
                        {symbols.map(symbol => {
                            const stats = marketStats[symbol.symbol];
                            if (!stats) return null;
                            return (
                                <MarketGridCard
                                    key={symbol.symbol}
                                    symbol={symbol}
                                    stats={stats.stats}
                                    activeStatIndex={stats.activeIdx}
                                    onQuickBuy={handleQuickBuy}
                                    isLoading={isLoading}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Positions Mode */}
            {activeMode === 'positions' && (
                <div className='accumulators-terminal__positions-mode'>
                    <ActivePositionsPanel positions={positions} onSell={handleSell} isSelling={isSelling} />
                </div>
            )}
        </div>
    );
});

export default AccumulatorsTerminal;
