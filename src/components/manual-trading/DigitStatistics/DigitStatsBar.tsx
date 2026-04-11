import React, { useCallback, useEffect, useRef, useState } from 'react';
import { api_base } from '@/external/bot-skeleton';
import { DigitDistribution } from './DigitDistribution';
import './digit-stats-bar.scss';

interface DigitStatsBarProps {
    symbol?: string;
    onToggle?: () => void;
    isExpanded?: boolean;
    hideToggle?: boolean;
}

export const DigitStatsBar: React.FC<DigitStatsBarProps> = ({ symbol = 'R_100', onToggle, isExpanded, hideToggle }) => {
    const [stats, setStats] = useState<number[]>(new Array(10).fill(0));
    const [currentSymbol, setCurrentSymbol] = useState<string>(symbol);
    const [lastDigit, setLastDigit] = useState<number | null>(null);
    const tickSubscriptionRef = useRef<string | null>(null);
    const ticksBufferRef = useRef<number[]>([]);
    const countsRef = useRef<number[]>(new Array(10).fill(0));

    const updateCounts = (newTicks: number[], isInitial = false) => {
        if (isInitial) {
            const counts = new Array(10).fill(0);
            newTicks.forEach(tick => {
                const lastDigit = parseInt(tick.toFixed(2).slice(-1));
                if (!isNaN(lastDigit)) counts[lastDigit]++;
            });
            countsRef.current = counts;
            ticksBufferRef.current = newTicks;
        } else {
            // New tick arrives
            newTicks.forEach(tick => {
                const digit = parseInt(tick.toFixed(2).slice(-1));
                if (isNaN(digit)) return;

                setLastDigit(digit);
                countsRef.current[digit]++;
                ticksBufferRef.current.push(tick);

                // Maintain 1000 ticks window
                if (ticksBufferRef.current.length > 1000) {
                    const removedTick = ticksBufferRef.current.shift();
                    const removedDigit = parseInt(removedTick!.toFixed(2).slice(-1));
                    if (!isNaN(removedDigit) && countsRef.current[removedDigit] > 0) {
                        countsRef.current[removedDigit]--;
                    }
                }
            });
        }
        setStats([...countsRef.current]);
    };

    useEffect(() => {
        const initAndSubscribe = async () => {
            if (!api_base.api) return;

            // Cleanup
            if (tickSubscriptionRef.current) {
                try { await api_base.api.forget(tickSubscriptionRef.current); } catch (e) {}
            }

            try {
                // 1. Fetch History (Last 1000 ticks)
                const historyResponse = await api_base.api.send({
                    ticks_history: currentSymbol,
                    count: 1000,
                    end: 'latest',
                    style: 'ticks',
                });

                if (historyResponse.history?.prices) {
                    updateCounts(historyResponse.history.prices, true);
                }

                // 2. Subscribe to Live Ticks
                const subscribeResponse = await api_base.api.send({
                    ticks: currentSymbol,
                    subscribe: 1,
                });

                if (subscribeResponse.subscription) {
                    tickSubscriptionRef.current = subscribeResponse.subscription.id;
                }

                api_base.api.onMessage().subscribe(({ data }: { data: any }) => {
                    if (data?.msg_type === 'tick' && data.tick?.symbol === currentSymbol) {
                        updateCounts([data.tick.quote]);
                    }
                });
            } catch (error) {
                console.error('[DigitStatsBar] Error fetching history or subscribing:', error);
            }
        };

        initAndSubscribe();

        return () => {
            if (tickSubscriptionRef.current && api_base.api) {
                api_base.api.forget(tickSubscriptionRef.current).catch(() => {});
            }
        };
    }, [currentSymbol]);

    useEffect(() => {
        if (symbol !== currentSymbol) {
            setCurrentSymbol(symbol);
        }
    }, [symbol]);

    return (
        <div className='digit-stats-bar-container'>
            {isExpanded && !hideToggle && (
                <div className='digit-stats-bar__expanded-view'>
                    <DigitDistribution stats={stats} />
                </div>
            )}
            <div className='digit-stats-bar'>
                <div className='digit-stats-bar__info'>
                    <div className='digit-stats-bar__icon'>
                        <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                            <circle cx='12' cy='12' r='10' />
                            <line x1='12' y1='16' x2='12' y2='12' />
                            <line x1='12' y1='8' x2='12.01' y2='8' />
                        </svg>
                    </div>
                    <span className='digit-stats-bar__label'>Stats</span>
                </div>
                <div className='digit-stats-bar__separator' />
                <div className='digit-stats-bar__values'>
                    {stats.map((val, idx) => (
                        <div key={idx} className='digit-stats-bar__value-item'>
                            <span className='digit-stats-bar__value'>{val}</span>
                            {lastDigit === idx && (
                                <div className='digit-stats-bar__indicator'>
                                    <span>.</span><span>.</span><span>.</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                {!hideToggle && (
                    <div className='digit-stats-bar__expand' onClick={onToggle}>
                        <svg
                            className={isExpanded ? 'digit-stats-bar__expand-icon--expanded' : ''}
                            width='12'
                            height='12'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='3'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        >
                            <polyline points='18 15 12 9 6 15' />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
};
