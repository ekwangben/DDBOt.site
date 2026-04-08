import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { DigitStatistics } from '@/components/manual-trading/DigitStatistics';
import { TradeForm } from '@/components/manual-trading/TradeForm';
import { PositionsPanel } from '@/components/manual-trading/PositionsPanel';
import { MarketSelector } from '@/components/manual-trading/market/MarketSelector';
import chart_api from '@/external/bot-skeleton/services/api/chart-api';
import { useStore } from '@/hooks/useStore';
import {
    SmartChart,
} from '@deriv/deriv-charts';
import '@deriv/deriv-charts/dist/smartcharts.css';
import './manual-trading.scss';

const ManualTrading: React.FC = observer(() => {
    const store = useStore();
    const [isLoading, setIsLoading] = useState(true);
    const [chartSymbol, setChartSymbol] = useState('R_100');
    const [granularity, setGranularity] = useState(0);
    const [chartType, setChartType] = useState('line');
    const [showFallback, setShowFallback] = useState(false);
    const [showPositions, setShowPositions] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const chartSubscriptionIdRef = useRef<string | undefined>(undefined);
    const subscriptionsRef = useRef<Record<string, any>>({});

    const chart_store = store?.chart_store;
    const ui = store?.ui;
    const common = store?.common;
    const storeSymbol = chart_store?.symbol;
    const storeChartType = chart_store?.chart_type;
    const storeGranularity = chart_store?.granularity;
    const onSymbolChange = chart_store?.onSymbolChange;
    const setChartSubscriptionId = chart_store?.setChartSubscriptionId;
    const setChartStatus = chart_store?.setChartStatus;
    const getMarketsOrder = chart_store?.getMarketsOrder;
    const updateChartType = chart_store?.updateChartType;
    const updateGranularity = chart_store?.updateGranularity;
    const chart_subscription_id = chart_store?.chart_subscription_id;

    // Initialize chart_api and symbols
    useEffect(() => {
        let isMounted = true;
        const initChart = async () => {
            setIsLoading(true);
            try {
                if (!chart_api.api) {
                    await chart_api.init();
                }

                let validSymbol = storeSymbol || 'R_100';
                if (validSymbol === 'na' || validSymbol === 'undefined') {
                    validSymbol = 'R_100';
                }

                if (isMounted) {
                    setChartSymbol(validSymbol);
                    setGranularity(storeGranularity || 0);
                    setChartType(storeChartType || 'line');
                    setIsLoading(false);
                }
            } catch (error) {
                if (isMounted) {
                    setChartSymbol('R_100');
                    setGranularity(0);
                    setChartType('line');
                    setIsLoading(false);
                }
            }
        };

        initChart();

        return () => {
            isMounted = false;
            if (chart_api.api) {
                chart_api.api.forgetAll('ticks');
            }
        };
    }, []);

    // Update when store changes
    useEffect(() => {
        if (storeSymbol && storeSymbol !== 'na') setChartSymbol(storeSymbol);
        if (storeGranularity !== undefined) setGranularity(storeGranularity);
        if (storeChartType) setChartType(storeChartType);
    }, [storeSymbol, storeGranularity, storeChartType]);

    useEffect(() => {
        if (chart_subscription_id) {
            chartSubscriptionIdRef.current = chart_subscription_id;
        }
    }, [chart_subscription_id]);

    // Force show chart after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isLoading) {
                setShowFallback(true);
                setIsLoading(false);
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [isLoading]);

    const requestAPI = async (req: any) => {
        try {
            if (!chart_api.api) return null;
            const response = await chart_api.api.send(req);
            return response;
        } catch (error: any) {
            return null;
        }
    };

    const requestForgetStream = (subscription_id: string) => {
        if (chart_api.api && subscription_id) {
            chart_api.api.forget(subscription_id);
        }
    };

    const requestSubscribe = async (req: any, callback: (data: any) => void) => {
        try {
            if (!chart_api.api) return;

            requestForgetStream(chartSubscriptionIdRef.current);
            const history = await chart_api.api.send(req);
            setChartSubscriptionId(history?.subscription?.id);
            if (history) callback(history);
            if (req.subscribe === 1) {
                subscriptionsRef.current[history?.subscription?.id] = chart_api.api
                    .onMessage()
                    ?.subscribe(({ data }: { data: any }) => {
                        callback(data);
                    });
            }
        } catch (e: any) {
            e?.error?.code === 'MarketIsClosed' && callback([]);
        }
    };

    const settings = {
        assetInformation: false,
        countdown: true,
        isHighestLowestMarkerEnabled: false,
        language: common?.current_language?.toLowerCase() || 'en',
        position: 'bottom',
        theme: ui?.is_dark_mode_on ? 'dark' : 'light',
    };

    if (isLoading && !showFallback) {
        return (
            <div className='manual-trading__loading'>
                <div className='spinner' />
                <p>Loading chart...</p>
            </div>
        );
    }

    const is_connection_opened = !!chart_api?.api;

    const handleSymbolChange = (newSymbol: string) => {
        setChartSymbol(newSymbol);
        if (onSymbolChange) {
            onSymbolChange(newSymbol);
        }
    };

    return (
        <div className='manual-trading'>
            <div className='manual-trading__layout'>
                {/* Left Sidebar Tools */}
                <div className='manual-trading__sidebar'>
                    <div className='manual-trading__sidebar-item manual-trading__sidebar-item--active'>
                        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M3 3v18h18'/><path d='m19 9-5 5-4-4-3 3'/></svg>
                    </div>
                    <div className='manual-trading__sidebar-item'>
                        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M12 20v-6M6 20V10M18 20V4'/></svg>
                    </div>
                    <div className='manual-trading__sidebar-item'>
                        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M21 12H3M12 3v18'/></svg>
                    </div>
                    <div className='manual-trading__sidebar-item'>
                        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'/><path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'/></svg>
                    </div>
                </div>

                {/* Chart Section */}
                <div className='manual-trading__chart-section'>
                    {/* Market Selector Overlay */}
                    <MarketSelector onSymbolChange={handleSymbolChange} currentSymbol={chartSymbol} />

                    <div className='manual-trading__chart-wrapper' dir='ltr'>
                        <SmartChart
                            id='dbot'
                            showLastDigitStats={false}
                            chartControlsWidgets={null}
                            enabledChartFooter={false}
                            chartStatusListener={(v: boolean) => setChartStatus(!v)}
                            chartType={chartType}
                            isMobile={false}
                            enabledNavigationWidget={true}
                            granularity={granularity}
                            requestAPI={requestAPI}
                            requestForget={() => { }}
                            requestForgetStream={requestForgetStream}
                            requestSubscribe={requestSubscribe}
                            settings={settings}
                            symbol={chartSymbol}
                            topWidgets={() => null}
                            isConnectionOpened={is_connection_opened}
                            getMarketsOrder={getMarketsOrder}
                            isLive
                            leftMargin={80}
                        />
                    </div>

                    {/* Digit Statistics Overlay Toggle */}
                    <div className='manual-trading__stats-toggle' onClick={() => setShowStats(!showStats)}>
                        <span>ⓘ Stats</span>
                        {showStats && (
                             <div style={{position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', width: '600px', background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}}>
                                <DigitStatistics />
                             </div>
                        )}
                    </div>
                </div>

                {/* Trade Form Panel */}
                <div className='manual-trading__trade-panel'>
                    <div className='manual-trading__trade-panel-tabs'>
                        <button
                            className={`tab-btn ${!showPositions ? 'active' : ''}`}
                            onClick={() => setShowPositions(false)}
                        >
                            Trade
                        </button>
                        <button
                            className={`tab-btn ${showPositions ? 'active' : ''}`}
                            onClick={() => setShowPositions(true)}
                        >
                            Positions
                        </button>
                    </div>

                    {!showPositions ? (
                        <TradeForm currentSymbol={chartSymbol} />
                    ) : (
                        <div className='manual-trading__positions-container'>
                            <PositionsPanel onBack={() => setShowPositions(false)} />
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Status Bar */}
            <div className='manual-trading__bottom-bar'>
                <div className='status-dot'></div>
                <span>{new Date().toISOString().replace('T', ' ').split('.')[0]} GMT</span>

                <div className='timestamp'>
                    <div className='icon-group'>
                         <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/></svg>
                         <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='5'/><path d='M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42'/></svg>
                         <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01'/></svg>
                         <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z'/><circle cx='12' cy='12' r='3'/></svg>
                         <span style={{marginLeft: '8px', fontWeight: 600}}>EN</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ManualTrading;
