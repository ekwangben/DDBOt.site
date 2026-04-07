import React, { lazy, Suspense, useEffect } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate } from 'react-router-dom';
import ChunkLoader from '@/components/loader/chunk-loader';
import NavBar from '@/components/nav-bar/nav-bar';
import { generateOAuthURL } from '@/components/shared';
import DesktopWrapper from '@/components/shared_ui/desktop-wrapper';
import Dialog from '@/components/shared_ui/dialog';
import MobileWrapper from '@/components/shared_ui/mobile-wrapper';
import TradingViewModal from '@/components/trading-view-chart/trading-view-modal';
import { DBOT_TABS, TAB_IDS } from '@/constants/bot-contents';
import { api_base, updateWorkspaceName } from '@/external/bot-skeleton';
import { CONNECTION_STATUS } from '@/external/bot-skeleton/services/api/observables/connection-status-stream';
import { isDbotRTL } from '@/external/bot-skeleton/utils/workspace';
import { useOauth2 } from '@/hooks/auth/useOauth2';
import { useApiBase } from '@/hooks/useApiBase';
import { useStore } from '@/hooks/useStore';
import useTMB from '@/hooks/useTMB';
import { handleOidcAuthFailure } from '@/utils/auth-utils';
import { requestOidcAuthentication } from '@deriv-com/auth-client';
import { localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import RunPanel from '../../components/run-panel';
import AccumulatorsTerminal from '../accumulators-terminal';
import BotBuilder from '../bot-builder/bot-builder';
import ChartModal from '../chart/chart-modal';
import Dashboard from '../dashboard';
import RunStrategy from '../dashboard/run-strategy';
import './main.scss';

const ChartWrapper = lazy(() => import('../chart/chart-wrapper'));
const Tutorial = lazy(() => import('../tutorials'));
const FreeBots = lazy(() => import('../free-bots'));
const AnalysisTool = lazy(() => import('../analysis-tool'));
const CopyTrading = lazy(() => import('../copy-trading'));
const RiskManagement = lazy(() => import('../risk-management'));
const ManualTrading = lazy(() => import('../manual-trading'));

const AppWrapper = observer(() => {
    const { connectionStatus } = useApiBase();
    const { dashboard, load_modal, run_panel, quick_strategy, summary_card } = useStore();
    const { active_tab, active_tour, setActiveTab, setWebSocketState, setActiveTour, setTourDialogVisibility } =
        dashboard;
    const { dashboard_strategies } = load_modal;
    const {
        is_dialog_open,
        is_drawer_open,
        dialog_options,
        onCancelButtonClick,
        onCloseDialog,
        onOkButtonClick,
        stopBot,
    } = run_panel;
    const { is_open } = quick_strategy;
    const { cancel_button_text, ok_button_text, title, message, dismissable, is_closed_on_cancel } = dialog_options as {
        [key: string]: string;
    };
    const { clear } = summary_card;
    const { DASHBOARD, BOT_BUILDER } = DBOT_TABS;
    const init_render = React.useRef(true);
    const hash = [
        'dashboard',
        'bot_builder',
        'chart',
        'tutorial',
        'free_bots',
        'analysis_tool',
        'copy_trading',
        'risk_management',
        'manual_trading',
    ];
    const { isDesktop } = useDevice();
    const location = useLocation();
    const navigate = useNavigate();

    let tab_value: number | string = active_tab;
    const GetHashedValue = (tab: number) => {
        tab_value = location.hash?.split('#')[1];
        if (!tab_value) return tab;
        const hashIndex = hash.indexOf(String(tab_value));
        // Return the found index or default to the current tab
        return hashIndex >= 0 ? hashIndex : tab;
    };
    const active_hash_tab = GetHashedValue(active_tab);

    const { onRenderTMBCheck, isTmbEnabled } = useTMB();

    React.useEffect(() => {
        if (connectionStatus !== CONNECTION_STATUS.OPENED) {
            const is_bot_running = document.getElementById('db-animation__stop-button') !== null;
            if (is_bot_running) {
                clear();
                stopBot();
                api_base.setIsRunning(false);
                setWebSocketState(false);
            }
        }
    }, [clear, connectionStatus, setWebSocketState, stopBot]);

    React.useEffect(() => {
        if (is_open) {
            setTourDialogVisibility(false);
        }

        if (init_render.current) {
            setActiveTab(Number(active_hash_tab));
            if (!isDesktop) handleTabChange(Number(active_hash_tab));
            init_render.current = false;
        } else {
            navigate(`#${hash[active_tab] || hash[0]}`);
        }
        if (active_tour !== '') {
            setActiveTour('');
        }

        // Prevent scrolling when tutorial tab is active (only on mobile)
        const mainElement = document.querySelector('.main__container');
        if (active_tab === DBOT_TABS.TUTORIAL && !isDesktop) {
            document.body.style.overflow = 'hidden';
            if (mainElement instanceof HTMLElement) {
                mainElement.classList.add('no-scroll');
            }
        } else {
            document.body.style.overflow = '';
            if (mainElement instanceof HTMLElement) {
                mainElement.classList.remove('no-scroll');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active_tab]);

    React.useEffect(() => {
        const trashcan_init_id = setTimeout(() => {
            if (active_tab === BOT_BUILDER && Blockly?.derivWorkspace?.trashcan) {
                const trashcanY = window.innerHeight - 250;
                let trashcanX;
                if (is_drawer_open) {
                    trashcanX = isDbotRTL() ? 380 : window.innerWidth - 460;
                } else {
                    trashcanX = isDbotRTL() ? 20 : window.innerWidth - 100;
                }
                Blockly?.derivWorkspace?.trashcan?.setTrashcanPosition(trashcanX, trashcanY);
            }
        }, 100);

        return () => {
            clearTimeout(trashcan_init_id); // Clear the timeout on unmount
        };
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active_tab, is_drawer_open]);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (dashboard_strategies.length > 0) {
            // Needed to pass this to the Callback Queue as on tab changes
            // document title getting override by 'Bot | Deriv' only
            timer = setTimeout(() => {
                updateWorkspaceName();
            });
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [dashboard_strategies, active_tab]);

    const handleTabChange = React.useCallback(
        (tab_index: number) => {
            setActiveTab(tab_index);
            const el_id = TAB_IDS[tab_index];
            if (el_id) {
                const el_tab = document.getElementById(el_id);
                setTimeout(() => {
                    el_tab?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                    // Trigger resize to fix Blockly/Chart rendering in tabs
                    if (tab_index === 1) {
                        window.dispatchEvent(new Event('resize'));
                    }
                }, 10);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [active_tab]
    );

    const { isOAuth2Enabled } = useOauth2();
    const handleLoginGeneration = async () => {
        if (!isOAuth2Enabled) {
            window.location.replace(generateOAuthURL());
        } else {
            const getQueryParams = new URLSearchParams(window.location.search);
            const currency = getQueryParams.get('account') ?? '';
            const query_param_currency = currency || sessionStorage.getItem('query_param_currency') || 'USD';

            try {
                // First, explicitly wait for TMB status to be determined
                const tmbEnabled = await isTmbEnabled();
                // Now use the result of the explicit check
                if (tmbEnabled) {
                    await onRenderTMBCheck();
                } else {
                    try {
                        await requestOidcAuthentication({
                            redirectCallbackUri: `${window.location.origin}/callback`,
                            ...(query_param_currency
                                ? {
                                      state: {
                                          account: query_param_currency,
                                      },
                                  }
                                : {}),
                        });
                    } catch (err) {
                        handleOidcAuthFailure(err);
                    }
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
            }
        }
    };
    return (
        <React.Fragment>
            <div className='main'>
                <div
                    className={classNames('main__container', {
                        'main__container--active': active_tour && active_tab === DASHBOARD && !isDesktop,
                    })}
                >
                    <NavBar activeTab={active_tab} onTabChange={handleTabChange} />
                    <div className='main__content'>
                        {active_tab === 0 && <Dashboard handleTabChange={handleTabChange} />}
                        {active_tab === 1 && <BotBuilder />}
                        {active_tab === 2 && (
                            <div className='free-bots-wrapper'>
                                <Suspense
                                    fallback={<ChunkLoader message={localize('Please wait, loading free bots...')} />}
                                >
                                    <FreeBots />
                                </Suspense>
                            </div>
                        )}
                        {active_tab === 3 && (
                            <div className='analysis-tool-wrapper'>
                                <Suspense
                                    fallback={
                                        <ChunkLoader message={localize('Please wait, loading analysis tools...')} />
                                    }
                                >
                                    <AnalysisTool />
                                </Suspense>
                            </div>
                        )}
                        {active_tab === 4 && <AccumulatorsTerminal />}
                        {active_tab === 5 && (
                            <Suspense fallback={<ChunkLoader message={localize('Please wait, loading chart...')} />}>
                                <ChartWrapper show_digits_stats={false} />
                            </Suspense>
                        )}
                        {active_tab === 6 && (
                            <Suspense fallback={<ChunkLoader message={localize('Please wait, loading tutorial...')} />}>
                                <Tutorial />
                            </Suspense>
                        )}
                        {active_tab === 7 && (
                            <div className='copy-trading-wrapper'>
                                <Suspense
                                    fallback={
                                        <ChunkLoader message={localize('Please wait, loading copy trading...')} />
                                    }
                                >
                                    <CopyTrading />
                                </Suspense>
                            </div>
                        )}
                        {active_tab === 8 && (
                            <div className='risk-management-wrapper'>
                                <Suspense
                                    fallback={
                                        <ChunkLoader message={localize('Please wait, loading risk management...')} />
                                    }
                                >
                                    <RiskManagement />
                                </Suspense>
                            </div>
                        )}
                        {active_tab === 9 && (
                            <div className='manual-trading-wrapper'>
                                <Suspense
                                    fallback={
                                        <ChunkLoader message={localize('Please wait, loading manual trading...')} />
                                    }
                                >
                                    <ManualTrading />
                                </Suspense>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <DesktopWrapper>
                <div className='main__run-strategy-wrapper'>
                    <RunStrategy />
                    <RunPanel />
                </div>
                <ChartModal />
                <TradingViewModal />
            </DesktopWrapper>
            <MobileWrapper>{!is_open && <RunPanel />}</MobileWrapper>
            <Dialog
                cancel_button_text={cancel_button_text || localize('Cancel')}
                className='dc-dialog__wrapper--fixed'
                confirm_button_text={ok_button_text || localize('Ok')}
                has_close_icon
                is_mobile_full_width={false}
                is_visible={is_dialog_open}
                onCancel={onCancelButtonClick}
                onClose={onCloseDialog}
                onConfirm={onOkButtonClick || onCloseDialog}
                portal_element_id='modal_root'
                title={title}
                login={handleLoginGeneration}
                dismissable={dismissable} // Prevents closing on outside clicks
                is_closed_on_cancel={is_closed_on_cancel}
            >
                {message}
            </Dialog>
        </React.Fragment>
    );
});

export default AppWrapper;
