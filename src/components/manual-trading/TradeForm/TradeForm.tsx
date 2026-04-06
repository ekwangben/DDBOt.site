import React, { useCallback, useEffect, useRef,useState } from 'react';
import { api_base } from '@/external/bot-skeleton';
import { useProposal } from '@/hooks/api/useProposal';
import { useTradeExecution } from '@/hooks/api/useTradeExecution';
import { useStore } from '@/hooks/useStore';
import './trade-form.scss';

interface TradeFormProps {
    currentSymbol?: string;
}

interface DigitStat {
    digit: number;
    count: number;
    percentage: number;
}

export const TradeForm: React.FC<TradeFormProps> = ({ currentSymbol }) => {
    const store = useStore();
    const client = store?.client;
    const currency = client?.currency || 'USD';
    const isLoggedIn = client?.is_logged_in;

    const symbol = currentSymbol || 'R_100';
    const [contractType, setContractType] = useState<string>('DIGITOVER'); // DIGITOVER or DIGITUNDER
    const [stake, setStake] = useState<number>(10);
    const [duration, setDuration] = useState<number>(5);
    const [isApiReady, setIsApiReady] = useState(false);
    const [digitStats, setDigitStats] = useState<DigitStat[]>([
        { digit: 0, count: 0, percentage: 0 },
        { digit: 1, count: 0, percentage: 0 },
        { digit: 2, count: 0, percentage: 0 },
        { digit: 3, count: 0, percentage: 0 },
        { digit: 4, count: 0, percentage: 0 },
        { digit: 5, count: 0, percentage: 0 },
        { digit: 6, count: 0, percentage: 0 },
        { digit: 7, count: 0, percentage: 0 },
        { digit: 8, count: 0, percentage: 0 },
        { digit: 9, count: 0, percentage: 0 },
    ]);
    const [lastPrice, setLastPrice] = useState<string>('0.00');

    const { buy, isLoading: isBuying, error: buyError } = useTradeExecution();
    const { proposal: overProposal, requestProposal: requestOverProposal, isLoading: isOverLoading } = useProposal();
    const { proposal: underProposal, requestProposal: requestUnderProposal, isLoading: isUnderLoading } = useProposal();
    const tickSubscriptionRef = useRef<string | null>(null);
    const lastDigitMapRef = useRef<Record<number, number>>({
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
    });
    const totalTicksRef = useRef<number>(0);

    // Initialize API and subscribe to ticks
    useEffect(() => {
        const init = async () => {
            try {
                if (!api_base.api) {
                    await api_base.init(true);
                }

                // Wait for API ready
                const checkAPI = setInterval(() => {
                    if (api_base.api) {
                        clearInterval(checkAPI);
                        setIsApiReady(true);
                        subscribeToTicks();
                    }
                }, 500);

                setTimeout(() => clearInterval(checkAPI), 10000);
            } catch (error) {
                console.error('TradeForm init error:', error);
            }
        };

        init();

        return () => {
            if (tickSubscriptionRef.current && api_base.api) {
                api_base.api.forget(tickSubscriptionRef.current);
            }
        };
    }, [symbol]);

    const subscribeToTicks = async () => {
        if (!api_base.api) return;

        try {
            // Forget previous subscription
            if (tickSubscriptionRef.current) {
                await api_base.api.forget(tickSubscriptionRef.current);
            }

            // Reset stats
            lastDigitMapRef.current = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
            totalTicksRef.current = 0;

            // Subscribe to ticks
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
                processTick(response.tick.quote);
            }

            // Listen to future ticks
            api_base.api.onMessage().subscribe(({ data }: { data: Record<string, unknown> }) => {
                if (data.msg_type === 'tick' && (data as Record<string, { tick: { quote: number } }>).tick) {
                    const tickData = data as Record<string, { tick: { quote: number } }>;
                    processTick(tickData.tick.quote);
                }
            });
        } catch (error) {
            console.error('Failed to subscribe to ticks:', error);
        }
    };

    const processTick = (quote: number) => {
        const priceStr = quote.toFixed(2);
        const lastDigit = parseInt(priceStr.slice(-1));

        setLastPrice(priceStr);

        // Update digit statistics
        const newMap = { ...lastDigitMapRef.current };
        newMap[lastDigit] = (newMap[lastDigit] || 0) + 1;
        lastDigitMapRef.current = newMap;
        totalTicksRef.current++;

        const total = totalTicksRef.current;
        const stats: DigitStat[] = Array.from({ length: 10 }, (_, i) => ({
            digit: i,
            count: newMap[i] || 0,
            percentage: total > 0 ? ((newMap[i] || 0) / total) * 100 : 0,
        }));

        setDigitStats(stats);
    };

    // Request proposals for both Over and Under
    useEffect(() => {
        if (!isApiReady) return;

        const fetchProposals = async () => {
            try {
                // Fetch Over proposal
                requestOverProposal({
                    symbol,
                    contractType: 'DIGITOVER',
                    amount: stake,
                    currency,
                    duration,
                    durationUnit: 't',
                    selectedDigit: 5, // Default barrier
                }).catch(() => {});

                // Fetch Under proposal
                requestUnderProposal({
                    symbol,
                    contractType: 'DIGITUNDER',
                    amount: stake,
                    currency,
                    duration,
                    durationUnit: 't',
                    selectedDigit: 5, // Default barrier
                }).catch(() => {});
            } catch (error) {
                console.error('Proposal error:', error);
            }
        };

        const debounce = setTimeout(fetchProposals, 300);
        return () => clearTimeout(debounce);
    }, [symbol, stake, currency, duration, isApiReady]);

    const handleBuy = useCallback(async () => {
        if (!isLoggedIn) {
            alert('Please log in to trade');
            return;
        }

        try {
            const result = await buy({
                symbol,
                contractType,
                amount: stake,
                currency,
                duration,
                durationUnit: 't',
            });

            if (result) {
                console.log('Trade executed:', result);
            }
        } catch (error) {
            console.error('Buy error:', error);
        }
    }, [isLoggedIn, symbol, contractType, stake, currency, duration, buy]);

    const overPayout = overProposal ? overProposal.payout : 0;
    const underPayout = underProposal ? underProposal.payout : 0;
    const overProfit = overProposal ? overProposal.payout - stake : 0;
    const underProfit = underProposal ? underProposal.payout - stake : 0;
    const overPercent = stake > 0 ? ((overProfit / stake) * 100).toFixed(2) : '0';
    const underPercent = stake > 0 ? ((underProfit / stake) * 100).toFixed(2) : '0';

    const error = buyError;

    return (
        <div className='trade-form'>
            {/* Price Display */}
            <div className='trade-form__price'>
                <span className='trade-form__price-label'>Price</span>
                <span className='trade-form__price-value'>{lastPrice}</span>
            </div>

            {/* Digit Statistics */}
            <div className='trade-form__digit-stats'>
                <label className='trade-form__label'>Digit Statistics</label>
                <div className='digit-circles'>
                    {digitStats.map(stat => (
                        <div key={stat.digit} className='digit-stat'>
                            <div className={`digit-circle digit-circle--stat`}>{stat.digit}</div>
                            <span className='digit-stat__percent'>{stat.percentage.toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trade Type Selector */}
            <div className='trade-form__field'>
                <label className='trade-form__label'>Trade Type</label>
                <div className='trade-form__trade-types'>
                    <button className='trade-form__trade-type-btn active'>Over/Under</button>
                    <button className='trade-form__trade-type-btn disabled'>Matches/Differs</button>
                    <button className='trade-form__trade-type-btn disabled'>Even/Odd</button>
                </div>
            </div>

            {/* Over/Under Cards */}
            <div className='trade-form__contracts'>
                <div
                    className={`trade-form__contract-card ${contractType === 'DIGITOVER' ? 'active' : ''}`}
                    onClick={() => setContractType('DIGITOVER')}
                >
                    <div className='contract-card__header'>
                        <span className='contract-card__title'>Over</span>
                        <span className='contract-card__percent'>+{overPercent}%</span>
                    </div>
                    <div className='contract-card__payout'>
                        <span className='contract-card__label'>Payout:</span>
                        <span className='contract-card__value'>
                            {currency} {overPayout.toFixed(2)}
                        </span>
                    </div>
                    <div className='contract-card__check'>{contractType === 'DIGITOVER' && '✓'}</div>
                </div>

                <div
                    className={`trade-form__contract-card ${contractType === 'DIGITUNDER' ? 'active' : ''}`}
                    onClick={() => setContractType('DIGITUNDER')}
                >
                    <div className='contract-card__header'>
                        <span className='contract-card__title'>Under</span>
                        <span className='contract-card__percent'>+{underPercent}%</span>
                    </div>
                    <div className='contract-card__payout'>
                        <span className='contract-card__label'>Payout:</span>
                        <span className='contract-card__value'>
                            {currency} {underPayout.toFixed(2)}
                        </span>
                    </div>
                    <div className='contract-card__check'>{contractType === 'DIGITUNDER' && '✓'}</div>
                </div>
            </div>

            {/* Duration */}
            <div className='trade-form__field'>
                <label className='trade-form__label'>Duration</label>
                <div className='trade-form__duration-selector'>
                    <button className='trade-form__duration-btn' onClick={() => setDuration(Math.max(1, duration - 1))}>
                        −
                    </button>
                    <div className='trade-form__duration-value'>
                        {duration} {duration === 1 ? 'Tick' : 'Ticks'}
                    </div>
                    <button
                        className='trade-form__duration-btn'
                        onClick={() => setDuration(Math.min(10, duration + 1))}
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Stake Input */}
            <div className='trade-form__field'>
                <label className='trade-form__label'>Stake</label>
                <div className='trade-form__input-group'>
                    <span className='trade-form__currency'>{currency}</span>
                    <input
                        type='number'
                        className='trade-form__input'
                        value={stake}
                        onChange={e => setStake(parseFloat(e.target.value) || 0)}
                        min={0.35}
                        max={50000}
                        step={0.01}
                    />
                </div>
            </div>

            {/* Loading State */}
            {(isOverLoading || isUnderLoading) && (
                <div className='trade-form__loading'>
                    <div className='spinner-small' />
                    <span>Loading...</span>
                </div>
            )}

            {/* Error State */}
            {error && <div className='trade-form__error'>{error}</div>}

            {/* Buy Button */}
            <button
                className={`trade-form__buy-btn ${isBuying || !isLoggedIn ? 'disabled' : ''}`}
                onClick={handleBuy}
                disabled={
                    isBuying ||
                    !isLoggedIn ||
                    (contractType === 'DIGITOVER' && !overProposal) ||
                    (contractType === 'DIGITUNDER' && !underProposal)
                }
            >
                {!isLoggedIn
                    ? 'Log in to trade'
                    : isBuying
                      ? 'Processing...'
                      : `Buy ${contractType === 'DIGITOVER' ? 'Over' : 'Under'}`}
            </button>
        </div>
    );
};
