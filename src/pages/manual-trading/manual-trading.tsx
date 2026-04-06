import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { DigitStatistics } from '@/components/manual-trading/DigitStatistics';
import { TradeForm } from '@/components/manual-trading/TradeForm';
import { PositionsPanel } from '@/components/manual-trading/PositionsPanel';
import chart_api from '@/external/bot-skeleton/services/api/chart-api';
import { useStore } from '@/hooks/useStore';
import {
    ChartMode,
    ChartTitle,
    DrawTools,
    Share,
    SmartChart,
    StudyLegend,
    ToolbarWidget,
    Views,
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
                    console.log('[ManualTrading] chart_api initialized');
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
                    console.log('[ManualTrading] Chart ready with symbol:', validSymbol);
                }
            } catch (error) {
                console.error('Failed to initialize chart:', error);
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
                console.log('[ManualTrading] Forcing chart display after timeout');
                setShowFallback(true);
                setIsLoading(false);
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [isLoading]);

    // Initialize Deriv API for trading
    // (Already handled in chart init useEffect above)

    const requestAPI = async (req: any) => {
        try {
            if (!chart_api.api) return null;
            const response = await chart_api.api.send(req);
            return response;
        } catch (error: any) {
            if (error?.error?.code === 'WrongResponse') {
                console.warn('[ManualTrading] Non-critical API error:', error.error.message);
                return null;
            }
            console.error('[ManualTrading] API error:', error);
            throw error;
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
            console.log(e?.error?.message);
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

    const ToolbarWidgets = () => (
        <ToolbarWidget position='top'>
            <ChartMode portalNodeId='modal_root' onChartType={updateChartType} onGranularity={updateGranularity} />
            <StudyLegend portalNodeId='modal_root' searchInputClassName='data-hj-whitelist' />
            <Views
                portalNodeId='modal_root'
                onChartType={updateChartType}
                onGranularity={updateGranularity}
                searchInputClassName='data-hj-whitelist'
            />
            <DrawTools portalNodeId='modal_root' />
            <Share portalNodeId='modal_root' />
        </ToolbarWidget>
    );

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
        if (onSymbolChange) {
            onSymbolChange(newSymbol);
        }
    };

    return (
        <div className='manual-trading'>
            <div className='manual-trading__layout'>
                {/* Chart Section */}
                <div className='manual-trading__chart-section'>
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
                            topWidgets={() => <ChartTitle onChange={handleSymbolChange} />}
                            isConnectionOpened={is_connection_opened}
                            getMarketsOrder={getMarketsOrder}
                            isLive
                            leftMargin={80}
                            toolbarWidget={() => <ToolbarWidgets />}
                        />
                    </div>

                    {/* Digit Statistics - Below Chart */}
                    <DigitStatistics />
                </div>

                {/* Trade Form Panel */}
                <div className='manual-trading__trade-panel'>
                    {!showPositions ? (
                        <>
                            <div className='manual-trading__toggle-positions'>
                                <button
                                    className='manual-trading__positions-btn'
                                    onClick={() => setShowPositions(true)}
                                >
                                    📊 View Positions
                                </button>
                            </div>
                            <TradeForm currentSymbol={chartSymbol} />
                        </>
                    ) : (
                        <PositionsPanel onBack={() => setShowPositions(false)} />
                    )}
                </div>
            </div>
        </div>
    );
});

export default ManualTrading;
