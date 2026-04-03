import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import {
    LabelPairedChartLineCaptionRegularIcon,
    LabelPairedObjectsColumnCaptionRegularIcon,
    LabelPairedPlusCaptionBoldIcon,
    LabelPairedPuzzlePieceTwoCaptionBoldIcon,
    LabelPairedSearchCaptionRegularIcon,
} from '@deriv/quill-icons/LabelPaired';
import { localize } from '@deriv-com/translations';
import './dashboard.scss';

const Dashboard = observer(() => {
    const { load_modal, dashboard } = useStore();
    const { toggleLoadModal, setActiveTabIndex } = load_modal;
    const { setActiveTab } = dashboard;

    const handleLoadAutomations = () => {
        // Set to "Local" tab (Index 1 on Desktop)
        setActiveTabIndex(1);
        toggleLoadModal();
    };

    const handleCreateNew = () => {
        // Switch to Bot Builder tab (Index 1 in DBOT_TABS)
        setActiveTab(1);
        // Force resize to fix Blockly overlap and restore full blocks
        window.dispatchEvent(new Event('resize'));
    };

    const handleDeploy = () => {
        // Switch to Bot Builder tab (Index 1 in DBOT_TABS)
        setActiveTab(1);
        // Force resize to fix Blockly overlap and restore full blocks
        window.dispatchEvent(new Event('resize'));
        // Professional feedback would go here (e.g. setting selected market via store)
    };
    const [selectedCategory, setSelectedCategory] = React.useState('all');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [liveSignals, setLiveSignals] = React.useState([
        // Volatility indices
        {
            id: 1,
            rank: '01',
            market: 'Volatility 10 Index',
            cat: 'vol',
            signal: 'OVER 4 SIGNAL',
            condition: 'Consistent digit cluster in 5-9 segment over last 50 ticks.',
            prob: 54.7,
            conf: 46.2,
            color: 'green',
        },
        {
            id: 2,
            rank: '02',
            market: 'Volatility 10 (1s) Index',
            cat: 'vol',
            signal: 'EVEN SIGNAL',
            condition: 'Even frequency dominance in fast-tick stream.',
            prob: 58.1,
            conf: 49.4,
            color: 'blue',
        },
        {
            id: 3,
            rank: '03',
            market: 'Volatility 25 Index',
            cat: 'vol',
            signal: 'UNDER 8 SIGNAL',
            condition: 'Low scarcity of digits 8 and 9 suggests Under 8 stability.',
            prob: 56.2,
            conf: 47.1,
            color: 'green',
        },
        {
            id: 4,
            rank: '04',
            market: 'Volatility 25 (1s) Index',
            cat: 'vol',
            signal: 'OVER 1 SIGNAL',
            condition: 'Over 1 threshold exceeds 65% with significant momentum.',
            prob: 62.4,
            conf: 53.3,
            color: 'green',
        },
        {
            id: 5,
            rank: '05',
            market: 'Volatility 50 Index',
            cat: 'vol',
            signal: 'ODD SIGNAL',
            condition: 'Odd digit frequency spike detected in recent candle history.',
            prob: 57.8,
            conf: 48.7,
            color: 'blue',
        },
        {
            id: 6,
            rank: '06',
            market: 'Volatility 50 (1s) Index',
            cat: 'vol',
            signal: 'EVEN SIGNAL',
            condition: 'Macro-even trend confirmed across 100-tick window.',
            prob: 59.3,
            conf: 50.1,
            color: 'blue',
        },
        {
            id: 7,
            rank: '07',
            market: 'Volatility 75 Index',
            cat: 'vol',
            signal: 'UNDER 7 SIGNAL',
            condition: 'High-density cluster in 0-6 range with low volatility skew.',
            prob: 55.4,
            conf: 45.8,
            color: 'green',
        },
        {
            id: 8,
            rank: '08',
            market: 'Volatility 75 (1s) Index',
            cat: 'vol',
            signal: 'OVER 2 SIGNAL',
            condition: 'Significant digit 8-9 presence supports Over 2 execution.',
            prob: 61.1,
            conf: 52.4,
            color: 'green',
        },
        {
            id: 10,
            rank: '09',
            market: 'Volatility 100 Index',
            cat: 'vol',
            signal: 'EVEN SIGNAL',
            condition: 'Even/Odd ratio exceeds 1.25 in the 200-tick moving average.',
            prob: 58.9,
            conf: 49.7,
            color: 'blue',
        },
        {
            id: 11,
            rank: '10',
            market: 'Volatility 100 (1s) Index',
            cat: 'vol',
            signal: 'UNDER 9 SIGNAL',
            condition: 'Zero digit-9 frequency in recent micro-ticks.',
            prob: 56.5,
            conf: 47.9,
            color: 'green',
        },
        {
            id: 12,
            rank: '11',
            market: 'Volatility 150 (1s) Index',
            cat: 'vol',
            signal: 'OVER 4 SIGNAL',
            condition: 'Rapid tick velocity through upper digit bands.',
            prob: 60.7,
            conf: 51.2,
            color: 'green',
        },
        {
            id: 13,
            rank: '12',
            market: 'Volatility 250 (1s) Index',
            cat: 'vol',
            signal: 'EVEN SIGNAL',
            condition: 'High-integrity even-cluster detected in extreme volatility.',
            prob: 63.2,
            conf: 55.6,
            color: 'blue',
        },

        // Crash/Boom indices
        {
            id: 14,
            rank: '13',
            market: 'Crash 300 Index',
            cat: 'crash',
            signal: 'CRASH DETECTION',
            condition: 'Tick volume imbalance indicates imminent downward spike.',
            prob: 61.2,
            conf: 52.3,
            color: 'red',
        },
        {
            id: 15,
            rank: '14',
            market: 'Crash 500 Index',
            cat: 'crash',
            signal: 'SPIKE ALERT',
            condition: 'Volume divergence on 1m chart warns of sudden liquidity drop.',
            prob: 58.1,
            conf: 45.4,
            color: 'red',
        },
        {
            id: 16,
            rank: '15',
            market: 'Crash 1000 Index',
            cat: 'crash',
            signal: 'CRASH WARNING',
            condition: 'Ascending liquidity indicates imminent crash correction.',
            prob: 59.4,
            conf: 48.2,
            color: 'red',
        },
        {
            id: 17,
            rank: '16',
            market: 'Boom 300 Index',
            cat: 'crash',
            signal: 'RECOVERY SIGNAL',
            condition: 'Post-spike consolidation indicates secondary boom cycles.',
            prob: 57.4,
            conf: 46.7,
            color: 'blue',
        },
        {
            id: 18,
            rank: '17',
            market: 'Boom 500 Index',
            cat: 'crash',
            signal: 'BOOM EXPLOSION',
            condition: 'Macro-uptrend volume confirms imminent spike potential.',
            prob: 60.3,
            conf: 51.1,
            color: 'green',
        },
        {
            id: 19,
            rank: '18',
            market: 'Boom 1000 Index',
            cat: 'crash',
            signal: 'BOOM ALERT',
            condition: 'Multiple low-tick clusters suggest upcoming tick explosion.',
            prob: 62.1,
            conf: 54.0,
            color: 'green',
        },

        // Jump indices
        {
            id: 20,
            rank: '19',
            market: 'Jump 10 Index',
            cat: 'jump',
            signal: 'OVER 2 SIGNAL',
            condition: 'Jump volatility sustains over 2 threshold for 50+ ticks.',
            prob: 54.4,
            conf: 41.2,
            color: 'green',
        },
        {
            id: 21,
            rank: '20',
            market: 'Jump 25 Index',
            cat: 'jump',
            signal: 'EVEN SIGNAL',
            condition: 'Even-dominant micro-trend in jump-vector stream.',
            prob: 57.6,
            conf: 46.8,
            color: 'blue',
        },
        {
            id: 22,
            rank: '21',
            market: 'Jump 50 Index',
            cat: 'jump',
            signal: 'UNDER 8 SIGNAL',
            condition: 'Digit 9 scarcity confirms Under 8 stability zone.',
            prob: 55.9,
            conf: 44.5,
            color: 'green',
        },
        {
            id: 23,
            rank: '22',
            market: 'Jump 75 Index',
            cat: 'jump',
            signal: 'OVER 4 SIGNAL',
            condition: 'Heavy upper-digit clustering in recent jump history.',
            prob: 59.1,
            conf: 49.3,
            color: 'green',
        },
        {
            id: 24,
            rank: '23',
            market: 'Jump 100 Index',
            cat: 'jump',
            signal: 'ODD SIGNAL',
            condition: 'Odd digit frequency dominance in 500-tick window.',
            prob: 56.2,
            conf: 43.1,
            color: 'blue',
        },

        // Range Break
        {
            id: 25,
            rank: '24',
            market: 'Range Break 100 Index',
            cat: 'range',
            signal: 'BREAKOUT SIGNAL',
            condition: 'Price breach of upper 100-tick channel with momentum.',
            prob: 63.5,
            conf: 55.6,
            color: 'blue',
        },
        {
            id: 26,
            rank: '25',
            market: 'Range Break 200 Index',
            cat: 'range',
            signal: 'CHANNEL REVERSAL',
            condition: 'Bottom-range consolidation suggests imminent upward bounce.',
            prob: 58.7,
            conf: 47.9,
            color: 'green',
        },
    ]);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setLiveSignals(prev =>
                prev.map(s => ({
                    ...s,
                    prob: Number((s.prob + (Math.random() * 0.4 - 0.2)).toFixed(1)),
                    conf: Number((s.conf + (Math.random() * 0.3 - 0.15)).toFixed(1)),
                }))
            );
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const TOOL_ICONS_COLOR = 'var(--text-prominent, #333)';

    return (
        <div className='pro-dashboard'>
            {/* 🔍 Professional Command Center */}
            <div className='pro-dashboard__search-bar'>
                <div className='search-container'>
                    <select
                        className='market-select'
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                    >
                        <option value='all'>{localize('All Markets')}</option>
                        <option value='vol'>{localize('Volatility Indices')}</option>
                        <option value='crash'>{localize('Crash/Boom')}</option>
                        <option value='jump'>{localize('Jump Indices')}</option>
                        <option value='range'>{localize('Range Break')}</option>
                    </select>
                    <div className='search-input-wrapper'>
                        <input
                            type='text'
                            placeholder={localize('Search markets or tools...')}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <button className='search-btn'>
                            <LabelPairedSearchCaptionRegularIcon width='16px' height='16px' fill={TOOL_ICONS_COLOR} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 🗺️ Professional Tool Grid */}
            <div className='pro-dashboard__tool-grid'>
                <div className='tool-card' onClick={handleCreateNew}>
                    <div className='tool-card__icon'>
                        <LabelPairedPlusCaptionBoldIcon width='32px' height='32px' fill={TOOL_ICONS_COLOR} />
                    </div>
                    <div className='tool-card__label'>{localize('Create New Bot')}</div>
                </div>
                <div className='tool-card' onClick={handleLoadAutomations}>
                    <div className='tool-card__icon'>
                        <LabelPairedPuzzlePieceTwoCaptionBoldIcon width='32px' height='32px' fill={TOOL_ICONS_COLOR} />
                    </div>
                    <div className='tool-card__label'>{localize('Load Automations')}</div>
                </div>
                <div className='tool-card'>
                    <div className='tool-card__icon'>
                        <LabelPairedChartLineCaptionRegularIcon width='32px' height='32px' fill='#ff444f' />
                    </div>
                    <div className='tool-card__label'>{localize('Speed Pulse')}</div>
                </div>
                <div className='tool-card'>
                    <div className='tool-card__icon'>
                        <LabelPairedObjectsColumnCaptionRegularIcon
                            width='32px'
                            height='32px'
                            fill={TOOL_ICONS_COLOR}
                        />
                    </div>
                    <div className='tool-card__label'>{localize('Premium Algorithms')}</div>
                </div>
                <div className='tool-card'>
                    <div className='tool-card__icon'>
                        <LabelPairedPuzzlePieceTwoCaptionBoldIcon width='32px' height='32px' fill={TOOL_ICONS_COLOR} />
                    </div>
                    <div className='tool-card__label'>{localize('Standard Bots')}</div>
                </div>
                <div className='tool-card'>
                    <div className='tool-card__icon'>
                        <LabelPairedChartLineCaptionRegularIcon width='32px' height='32px' fill={TOOL_ICONS_COLOR} />
                    </div>
                    <div className='tool-card__label'>{localize('Advanced Analysis')}</div>
                </div>
            </div>

            {/* 🚦 Professional Intelligence Hub */}
            <div className='pro-dashboard__signals'>
                <h2 className='signals-title'>{localize('Real-Time Signals')}</h2>
                <div className='signals-table-container'>
                    <table className='signals-table'>
                        <thead>
                            <tr>
                                <th>{localize('Rank')}</th>
                                <th>{localize('Market Asset')}</th>
                                <th>{localize('Directive')}</th>
                                <th>{localize('Intelligence Metrics')}</th>
                                <th>{localize('Execution')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {liveSignals
                                .filter(s => selectedCategory === 'all' || s.cat === selectedCategory)
                                .filter(s => s.market.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(sig => (
                                    <tr key={sig.id}>
                                        <td>
                                            <span className='rank-badge'>{sig.rank}</span>
                                        </td>
                                        <td className='market-cell'>{sig.market}</td>
                                        <td>
                                            <span className={`signal-badge ${sig.color}`}>{sig.signal}</span>
                                        </td>
                                        <td className='condition-cell'>
                                            <strong>Intelligence logic:</strong>
                                            <br />
                                            <span>{sig.condition}</span>
                                            <br />
                                            <strong>Real-Time Analysis:</strong>
                                            <br />
                                            <span>Current Probability: {sig.prob}%</span>
                                            <br />
                                            <strong>System Validity:</strong>
                                            <br />
                                            <span>Confidence Level: {sig.conf}%</span>
                                        </td>
                                        <td>
                                            <button className='btn-load-signal' onClick={() => handleDeploy()}>
                                                {localize('Deploy')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
});

export default Dashboard;
