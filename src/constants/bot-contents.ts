type TTabsTitle = {
    [key: string]: string | number;
};

type TDashboardTabIndex = {
    [key: string]: number;
};

export const tabs_title: TTabsTitle = Object.freeze({
    WORKSPACE: 'Workspace',
    CHART: 'Chart',
});

export const DBOT_TABS: TDashboardTabIndex = Object.freeze({
    DASHBOARD: 0,
    BOT_BUILDER: 1,
    FREE_BOTS: 2,
    ANALYSIS_TOOL: 3,
    STRATEGY: 4,
    CHART: 5,
    TUTORIAL: 6,
    COPY_TRADING: 7,
    RISK_MANAGEMENT: 8,
    MANUAL_TRADING: 9,
});

export const MAX_STRATEGIES = 10;

export const TAB_IDS = [
    'id-dbot-dashboard',
    'id-bot-builder',
    'id-free-bots',
    'id-analysis-tool',
    'id-accumulators',
    'id-charts',
    'id-tutorials',
    'id-copy-trading',
    'id-risk-management',
    'id-manual-trading',
];

export const DEBOUNCE_INTERVAL_TIME = 500;
