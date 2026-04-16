import React, { useCallback, useEffect, useRef, useState } from 'react';
import { api_base } from '@/external/bot-skeleton';
import './digit-statistics.scss';

interface DigitStat {
    digit: number;
    percentage: number;
}

const CIRCLE_SIZE = 68;
const STROKE_WIDTH = 6;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface DigitStatisticsProps {
    selectedDigit?: number;
}

export const DigitStatistics: React.FC<DigitStatisticsProps> = ({ selectedDigit }) => {
    const [digitStats, setDigitStats] = useState<DigitStat[]>(
        Array.from({ length: 10 }, (_, i) => ({ digit: i, percentage: 0 }))
    );
    const tickSubscriptionRef = useRef<string | null>(null);
    const lastDigitCountsRef = useRef<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const totalTicksRef = useRef<number>(0);
    const [currentSymbol, setCurrentSymbol] = useState<string>('R_100');
    const [currentDigit, setCurrentDigit] = useState<number | null>(null);
    const [price, setPrice] = useState<string>('0.00');

    // Subscribe to ticks
    useEffect(() => {
        const subscribe = async () => {
            if (!api_base.api) return;

            // Forget previous subscription
            if (tickSubscriptionRef.current) {
                try {
                    await api_base.api.forget(tickSubscriptionRef.current);
                } catch (e) {
                    // Ignore forget errors
                }
            }

            // Reset stats
            lastDigitCountsRef.current = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            totalTicksRef.current = 0;

            try {
                const response = await api_base.api.send({
                    ticks: currentSymbol,
                    subscribe: 1,
                });

                if (response.error) {
                    console.error('[DigitStatistics] Tick subscription error:', response.error.message);
                    return;
                }

                if (response.subscription) {
                    tickSubscriptionRef.current = response.subscription.id;
                }

                if (response.tick) {
                    processTick(response.tick.quote);
                }

                api_base.api.onMessage().subscribe(({ data }: { data: unknown }) => {
                    if (data?.msg_type === 'tick' && (data as Record<string, unknown>).tick) {
                        const tickData = data as Record<string, { quote: number }>;
                        processTick(tickData.tick.quote);
                    }
                });
            } catch (error) {
                console.error('[DigitStatistics] Failed to subscribe to ticks:', error);
            }
        };

        subscribe();

        return () => {
            if (tickSubscriptionRef.current && api_base.api) {
                api_base.api.forget(tickSubscriptionRef.current).catch(() => {
                    // Ignore cleanup errors
                });
            }
        };
    }, [currentSymbol]);

    useEffect(() => {
        const checkSymbols = setInterval(() => {
            if (api_base.active_symbols && api_base.active_symbols.length > 0) {
                const randomSymbol = api_base.active_symbols.find(
                    (s: Record<string, unknown>) =>
                        s.submarket === 'random_index' || (s.symbol as string).startsWith('R_')
                );
                if (randomSymbol && randomSymbol.symbol !== currentSymbol) {
                    setCurrentSymbol(randomSymbol.symbol as string);
                }
                clearInterval(checkSymbols);
            }
        }, 1000);

        return () => clearInterval(checkSymbols);
    }, []);

    const processTick = useCallback((quote: number) => {
        const priceStr = quote.toFixed(2);
        const lastDigit = parseInt(priceStr.slice(-1));

        if (isNaN(lastDigit) || lastDigit < 0 || lastDigit > 9) return;

        setPrice(priceStr);
        setCurrentDigit(lastDigit);

        const newCounts = [...lastDigitCountsRef.current];
        newCounts[lastDigit]++;
        lastDigitCountsRef.current = newCounts;
        totalTicksRef.current++;

        const total = totalTicksRef.current;
        const stats: DigitStat[] = Array.from({ length: 10 }, (_, i) => ({
            digit: i,
            percentage: total > 0 ? (newCounts[i] / total) * 100 : 0,
        }));

        setDigitStats(stats);
    }, []);

    const percentages = digitStats.map(s => s.percentage);
    const maxPct = Math.max(...percentages);
    const minPct = Math.min(...percentages);
    const hasData = totalTicksRef.current > 0;

    return (
        <div className='digit-statistics'>
            <div className='digit-statistics__header'>
                <span className='digit-statistics__price'>{price}</span>
                <span className='digit-statistics__label'>Digit Stats</span>
            </div>
            <div className='digit-statistics__circles'>
                {digitStats.map(stat => {
                    const isMax = hasData && stat.percentage === maxPct && maxPct > 0;
                    const isMin = hasData && stat.percentage === minPct;
                    
                    // Only show arc for max or min
                    const showArc = isMax || isMin;
                    const strokeColor = isMax ? '#4caf50' : '#f44336';
                    
                    const isCurrentDigit = stat.digit === currentDigit;
                    const isSelectedDigit = selectedDigit !== undefined && stat.digit === selectedDigit;

                    return (
                        <div
                            key={stat.digit}
                            className={`digit-statistics__circle-wrapper${isSelectedDigit ? ' digit-statistics__circle-wrapper--selected' : ''}`}
                        >
                            <div className={`digit-statistics__circle${isSelectedDigit ? ' digit-statistics__circle--selected' : ''}`}>
                                <svg
                                    className='digit-statistics__svg'
                                    width={CIRCLE_SIZE}
                                    height={CIRCLE_SIZE}
                                    viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}
                                >
                                    <circle
                                        className='digit-statistics__bg-circle'
                                        cx={CIRCLE_SIZE / 2}
                                        cy={CIRCLE_SIZE / 2}
                                        r={RADIUS}
                                        fill='none'
                                        stroke={isSelectedDigit ? 'rgba(255,255,255,0.2)' : '#f0f0f0'}
                                        strokeWidth={STROKE_WIDTH}
                                    />
                                    {showArc && (
                                        <circle
                                            cx={CIRCLE_SIZE / 2}
                                            cy={CIRCLE_SIZE / 2}
                                            r={RADIUS}
                                            fill="none"
                                            stroke={strokeColor}
                                            strokeWidth={STROKE_WIDTH + 1}
                                            strokeDasharray="25 100"
                                            strokeDashoffset="0"
                                            pathLength="100"
                                            transform={`rotate(${90 - (25 * 3.6 / 2)} ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
                                            style={{
                                                opacity: 1,
                                                visibility: 'visible',
                                                transition: 'stroke 0.3s ease'
                                            }}
                                        />
                                    )}
                                </svg>
                                <div className='digit-statistics__center'>
                                    <span className={`digit-statistics__digit${isSelectedDigit ? ' digit-statistics__digit--selected' : ''}`}>
                                        {stat.digit}
                                    </span>
                                    <span className={`digit-statistics__percentage${isSelectedDigit ? ' digit-statistics__percentage--selected' : ''}`}>
                                        {stat.percentage.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            {isCurrentDigit && <div className='digit-statistics__cursor' />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
