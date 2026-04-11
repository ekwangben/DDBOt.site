import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { AccountSelector } from '@/components/manual-trading/AccountSelector/AccountSelector';
import { DigitStatistics } from '@/components/manual-trading/DigitStatistics';
import { DigitStatsBar } from '@/components/manual-trading/DigitStatistics/DigitStatsBar';
import { PositionsPanel } from '@/components/manual-trading/PositionsPanel';
import { TradeForm } from '@/components/manual-trading/TradeForm';
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

const ToolbarWidgets = ({
    updateChartType,
    updateGranularity,
    position,
    isDesktop,
}: {
    updateChartType: (chart_type: string) => void;
    updateGranularity: (granularity: number) => void;
    position?: string;
    isDesktop?: boolean;
}) => {
    return (
        <ToolbarWidget position={position}>
            <ChartMode portalNodeId='modal_root' onChartType={updateChartType} onGranularity={updateGranularity} />
            {isDesktop && (
                <>
                    <StudyLegend portalNodeId='modal_root' searchInputClassName='data-hj-whitelist' />
                    <Views
                        portalNodeId='modal_root'
                        onChartType={updateChartType}
                        onGranularity={updateGranularity}
                        searchInputClassName='data-hj-whitelist'
                    />
                    <DrawTools portalNodeId='modal_root' />
                    <Share portalNodeId='modal_root' />
                </>
            )}
        </ToolbarWidget>
    );
};

const ManualTrading: React.FC = observer(() => {
    const store = useStore();
    const [isLoading, setIsLoading] = useState(true);
    const [chartSymbol, setChartSymbol] = useState('R_100');
    const [granularity, setGranularity] = useState(0);
    const [chartType, setChartType] = useState('line');
    const [showFallback, setShowFallback] = useState(false);
    const [showPositions, setShowPositions] = useState(false);
    const [currentContractType, setCurrentContractType] = useState('ACCU');
    const [showDetailedStats, setShowDetailedStats] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const chartSubscriptionIdRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsPanelOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
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
                {/* Chart Section */}
                <div className='manual-trading__chart-section'>
                    <div className='dashboard__chart-wrapper manual-trading__chart-wrapper' dir='ltr'>
                        <SmartChart
                            id='dbot'
                            showLastDigitStats={false}
                            chartControlsWidgets={null}
                            enabledChartFooter={false}
                            portalNodeId='modal_root'
                            chartStatusListener={(v: boolean) => setChartStatus(!v)}
                            toolbarWidget={() => (
                                <ToolbarWidgets
                                    updateChartType={updateChartType || (() => {})}
                                    updateGranularity={updateGranularity || (() => {})}
                                    position='top'
                                    isDesktop={true}
                                />
                            )}
                            chartType={chartType}
                            isMobile={isMobile}
                            enabledNavigationWidget={true}
                            granularity={granularity}
                            requestAPI={requestAPI}
                            requestForget={() => {}}
                            requestForgetStream={requestForgetStream}
                            requestSubscribe={requestSubscribe}
                            settings={settings}
                            symbol={chartSymbol}
                            topWidgets={() => <ChartTitle onChange={handleSymbolChange} />}
                            isConnectionOpened={is_connection_opened}
                            getMarketsOrder={getMarketsOrder}
                            isLive
                            onChartType={(chartType: string) => {
                                setChartType(chartType);
                                if (updateChartType) updateChartType(chartType);
                            }}
                            onGranularity={(granularity: number) => {
                                setGranularity(granularity);
                                if (updateGranularity) updateGranularity(granularity);
                            }}
                        />
                    </div>

                    {/* Digit Statistics Overlay */}
                    <div className='manual-trading__stats-container'>
                        {/* 1. Circular Digits + Cursor: Strictly for Over/Under */}
                        {['DIGITOVER', 'DIGITUNDER'].includes(currentContractType) && (
                            <div className='manual-trading__stats-detailed'>
                                <DigitStatistics />
                            </div>
                        )}

                        {/* 2. Professional Pill Bar: Strictly for Accumulators */}
                        {['ACCU'].includes(currentContractType) && (
                            <DigitStatsBar 
                                symbol={chartSymbol} 
                                onToggle={() => setShowDetailedStats(!showDetailedStats)}
                                isExpanded={showDetailedStats}
                                hideToggle={true}
                            />
                        )}
                    </div>
                </div>

                {/* Trade Form Panel */}
                <div
                    className={`manual-trading__trade-panel ${!isPanelOpen ? 'manual-trading__trade-panel--closed' : ''}`}
                >
                    <AccountSelector />
                    
                    {!showPositions ? (
                        <TradeForm
                            currentSymbol={chartSymbol}
                            onContractTypeChange={setCurrentContractType}
                        />
                    ) : (
                        <div className='manual-trading__positions-container'>
                            <PositionsPanel onBack={() => setShowPositions(false)} />
                        </div>
                    )}
                </div>

                <button className='manual-trading__panel-toggle' onClick={() => setIsPanelOpen(!isPanelOpen)}>
                    {isPanelOpen ? '▼' : '▲'}
                </button>
            </div>

            {/* Bottom Status Bar */}
            <div className='manual-trading__bottom-bar'>
                <div className='status-dot'></div>
                <span>{new Date().toISOString().replace('T', ' ').split('.')[0]} GMT</span>

                <div className='timestamp'>
                    <div className='icon-group'>
                        <svg
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        >
                            <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
                        </svg>
                        <svg
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        >
                            <circle cx='12' cy='12' r='5' />
                            <path d='M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42' />
                        </svg>
                        <svg
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        >
                            <circle cx='12' cy='12' r='10' />
                            <path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01' />
                        </svg>
                        <svg
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        >
                            <path d='M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' />
                            <circle cx='12' cy='12' r='3' />
                        </svg>
                        <span style={{ marginLeft: '8px', fontWeight: 600 }}>EN</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ManualTrading;
