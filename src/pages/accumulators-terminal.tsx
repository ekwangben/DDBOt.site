import React from 'react';
import { LabelPairedChartLineCaptionRegularIcon,LabelPairedPlayCaptionBoldIcon } from '@deriv/quill-icons/LabelPaired';
import { localize } from '@deriv-com/translations';
import './accumulators-terminal.scss';

const AccumulatorsTerminal = () => {
    const [activeMode, setActiveMode] = React.useState('manual');
    const [selectedGrowth, setSelectedGrowth] = React.useState('3%');
    const [activeContracts, setActiveContracts] = React.useState<number[]>([]);
    const [isAutoTrading, setIsAutoTrading] = React.useState(false);
    const [sessionProfit, setSessionProfit] = React.useState(0.0);
    const [markets, setMarkets] = React.useState([
        {
            id: 1,
            name: 'Volatility 10 Index',
            price: '620.04',
            stats: [99, 14, 24, 87, 70, 86],
            current: 99,
            profit: 0.0,
            growth: '3%',
        },
        {
            id: 2,
            name: 'Volatility 10 (1s) Index',
            price: '1263.29',
            stats: [14, 38, 38, 25, 26, 7],
            current: 14,
            profit: 0.0,
            growth: '3%',
        },
        {
            id: 3,
            name: 'Volatility 25 Index',
            price: '9806.20',
            stats: [2, 30, 14, 68, 19, 0],
            current: 2,
            profit: 0.0,
            growth: '3%',
        },
        {
            id: 4,
            name: 'Volatility 25 (1s) Index',
            price: '5078.43',
            stats: [47, 0, 166, 6, 43, 22],
            current: 47,
            profit: 0.0,
            growth: '3%',
        },
        {
            id: 5,
            name: 'Volatility 50 Index',
            price: '215.12',
            stats: [12, 45, 8, 3, 21, 56],
            current: 12,
            profit: 0.0,
            growth: '3%',
        },
        {
            id: 6,
            name: 'Volatility 50 (1s) Index',
            price: '842.15',
            stats: [67, 23, 11, 89, 4, 30],
            current: 67,
            profit: 0.0,
            growth: '3%',
        },
        {
            id: 7,
            name: 'Volatility 75 Index',
            price: '4512.67',
            stats: [34, 5, 12, 78, 9, 44],
            current: 34,
            profit: 0.0,
            growth: '3%',
        },
        {
            id: 8,
            name: 'Volatility 75 (1s) Index',
            price: '912.44',
            stats: [88, 12, 56, 4, 33, 19],
            current: 88,
            profit: 0.0,
            growth: '3%',
        },
        {
            id: 9,
            name: 'Volatility 100 Index',
            price: '3210.55',
            stats: [5, 67, 22, 11, 90, 8],
            current: 5,
            profit: 0.0,
            growth: '3%',
        },
        {
            id: 10,
            name: 'Volatility 100 (1s) Index',
            price: '1543.22',
            stats: [23, 89, 4, 56, 12, 77],
            current: 23,
            profit: 0.0,
            growth: '3%',
        },
        {
            id: 11,
            name: 'Volatility 150 (1s) Index',
            price: '8902.11',
            stats: [45, 12, 7, 33, 67, 5],
            current: 45,
            profit: 0.0,
            growth: '3%',
        },
        {
            id: 12,
            name: 'Volatility 250 (1s) Index',
            price: '12456.78',
            stats: [90, 3, 44, 18, 56, 12],
            current: 90,
            profit: 0.0,
            growth: '3%',
        },
        {
            id: 13,
            name: 'Volatility 10 (2s) Index',
            price: '5078.43',
            stats: [47, 0, 166, 6, 43, 22],
            current: 47,
            profit: 0.0,
            growth: '3%',
        },
    ]);

    const handleGlobalGrowthChange = (growth: string) => {
        setSelectedGrowth(growth);
        setMarkets(prev => prev.map(m => ({ ...m, growth })));
    };

    const handleToggleAutoTrading = () => {
        setIsAutoTrading(!isAutoTrading);
        if (isAutoTrading) setSessionProfit(0);
    };

    const handleBuy = (id: number) => {
        if (activeContracts.includes(id)) {
            setActiveContracts(activeContracts.filter(c => c !== id));
        } else {
            setActiveContracts([...activeContracts, id]);
        }
    };

    // Real-time price and profit simulation
    React.useEffect(() => {
        const interval = setInterval(() => {
            setMarkets(prev =>
                prev.map(m => {
                    const isActive = activeContracts.includes(m.id);
                    return {
                        ...m,
                        price: (parseFloat(m.price) + (Math.random() - 0.5) * 5).toFixed(2),
                        current: Math.floor(Math.random() * 100),
                        profit: isActive ? m.profit + Math.random() * 0.1 : 0.0,
                    };
                })
            );
            if (isAutoTrading) {
                setSessionProfit(prev => prev + Math.random() * 0.05);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [activeContracts, isAutoTrading]);

    return (
        <div className='accumulators-terminal'>
            {/* 🛡️ Header Toggle */}
            <div className='accumulators-terminal__header'>
                <div className='mode-toggle'>
                    <button
                        className={`mode-btn ${activeMode === 'manual' ? 'active' : ''}`}
                        onClick={() => setActiveMode('manual')}
                    >
                        {localize('Manual')}
                    </button>
                    <button
                        className={`mode-btn ${activeMode === 'auto' ? 'active' : ''}`}
                        onClick={() => setActiveMode('auto')}
                    >
                        {localize('Auto Trader')}
                    </button>
                </div>
            </div>

            {/* 📊 Filter Bar */}
            <div className='accumulators-terminal__filters'>
                <div className='filter-left'>
                    <span className='market-count'>13</span> {localize('ranked auto markets')}
                </div>
                <div className='growth-selectors'>
                    {['1%', '2%', '3%', '4%', '5%'].map(g => (
                        <button
                            key={g}
                            className={`growth-btn ${selectedGrowth === g ? 'active' : ''}`}
                            onClick={() => handleGlobalGrowthChange(g)}
                        >
                            {g}
                        </button>
                    ))}
                </div>
                <div className='status-msg'>
                    <LabelPairedChartLineCaptionRegularIcon width='16px' height='16px' fill='#888' />
                    {localize('Realtime ticks and live accumulator stats are streaming across all supported markets.')}
                </div>
            </div>

            {/* 🗂️ Conditional Content: Manual Grid or Auto Strategy */}
            {activeMode === 'manual' ? (
                <div className='accumulators-terminal__grid'>
                    {markets.map(market => {
                        const isActive = activeContracts.includes(market.id);
                        return (
                            <div key={market.id} className='acc-card'>
                                <div className='acc-card__top'>
                                    <div className='market-icon'>
                                        <LabelPairedChartLineCaptionRegularIcon
                                            width='32px'
                                            height='32px'
                                            fill='#00a79e'
                                        />
                                    </div>
                                    <div className='market-info'>
                                        <div className='name'>{localize(market.name)}</div>
                                        <div className='price'>{market.price}</div>
                                    </div>
                                </div>

                                <div className='acc-card__stats-row'>
                                    {market.stats.map((s, idx) => (
                                        <div key={idx} className={`stat-bubble ${idx === 0 ? 'active' : ''}`}>
                                            {s}
                                        </div>
                                    ))}
                                </div>

                                <div className='acc-card__inputs'>
                                    <div className='input-group'>
                                        <label>{localize('STAKE')}</label>
                                        <div className='input-wrapper'>
                                            <input type='text' defaultValue='2' disabled={isActive} />
                                            <span className='unit'>USD</span>
                                        </div>
                                    </div>
                                    <div className='input-group'>
                                        <label>{localize('PROFIT TARGET')}</label>
                                        <div className='input-wrapper'>
                                            <input type='text' defaultValue='0.5' disabled={isActive} />
                                            <span className='unit'>USD</span>
                                        </div>
                                    </div>
                                </div>

                                <div className='acc-card__summary'>
                                    <div className='summary-item'>
                                        <div className='label'>{localize('Current stat')}</div>
                                        <div className='value'>{market.current}</div>
                                    </div>
                                    <div className='summary-item'>
                                        <div className='label'>{localize('Growth')}</div>
                                        <div className='value'>{market.growth}</div>
                                    </div>
                                    <div className='summary-item'>
                                        <div className='label'>{localize('Profit')}</div>
                                        <div className='value profit' style={{ color: isActive ? '#4caf50' : '#333' }}>
                                            {market.profit.toFixed(2)} USD
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className='acc-card__buy-btn'
                                    onClick={() => handleBuy(market.id)}
                                    style={{
                                        background: isActive
                                            ? 'linear-gradient(to right, #ff7179, #ff444f)'
                                            : 'linear-gradient(to right, #82bdb8, #00a79e)',
                                    }}
                                >
                                    <div className='btn-label'>
                                        <LabelPairedChartLineCaptionRegularIcon
                                            width='20px'
                                            height='20px'
                                            fill='#fff'
                                        />
                                        <span>{localize(isActive ? 'Sell / Close' : 'Buy')}</span>
                                    </div>
                                    <div className='btn-price'>{isActive ? localize('Executing...') : '2.00 USD'}</div>
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className='accumulators-terminal__auto-view'>
                    {/* 🔌 Auto Trader Engine Dashboard */}
                    <div className='auto-trader-dashboard'>
                        <div className='dashboard-label'>
                            <span>AUTO TRADER</span>
                            <h3>Best-market breakout strategy</h3>
                        </div>
                        <div className='dashboard-grid'>
                            <div className='stat-card'>
                                <label>STAKE</label>
                                <div className='val'>
                                    2 <span>USD</span>
                                </div>
                            </div>
                            <div className='stat-card'>
                                <label>PER-TRADE TP %</label>
                                <div className='val'>
                                    20 <span>%</span>
                                </div>
                            </div>
                            <div className='stat-card'>
                                <label>PER-TRADE TAKE PROFIT</label>
                                <div className='val'>
                                    0.40 USD <small>20% of stake</small>
                                </div>
                            </div>
                            <div className='stat-card'>
                                <label>SESSION TAKE PROFIT</label>
                                <div className='val'>
                                    20 <span>USD</span>
                                </div>
                            </div>
                            <div className='stat-card'>
                                <label>SESSION STOP LOSS</label>
                                <div className='val'>
                                    20 <span>USD</span>
                                </div>
                            </div>
                            <div className='stat-card highlight'>
                                <label>AUTO SESSION P&L</label>
                                <div className='val' style={{ color: isAutoTrading ? '#4caf50' : '#333' }}>
                                    {sessionProfit.toFixed(2)} USD{' '}
                                    <small>
                                        {Math.floor(sessionProfit * 5)} {localize('closed auto trades')}
                                    </small>
                                </div>
                            </div>
                            <div className='action-hub'>
                                <button
                                    className='start-btn'
                                    onClick={handleToggleAutoTrading}
                                    style={{
                                        background: isAutoTrading
                                            ? 'linear-gradient(to right, #ff7179, #ff444f)'
                                            : 'linear-gradient(to right, #82bdb8, #00a79e)',
                                    }}
                                >
                                    {isAutoTrading ? (
                                        <LabelPairedPlayCaptionBoldIcon width='16px' height='16px' fill='#fff' />
                                    ) : (
                                        <LabelPairedPlayCaptionBoldIcon width='16px' height='16px' fill='#fff' />
                                    )}
                                    <span>{localize(isAutoTrading ? 'Stop Auto Trading' : 'Start Auto Trading')}</span>
                                </button>
                                <div className='engine-status'>
                                    <LabelPairedChartLineCaptionRegularIcon
                                        width='14px'
                                        height='14px'
                                        fill={isAutoTrading ? '#4caf50' : '#888'}
                                    />
                                    <span style={{ color: isAutoTrading ? '#4caf50' : '#888' }}>
                                        {localize(
                                            isAutoTrading ? 'Strategy Engine Active / Placing' : 'Strategy Engine Idle'
                                        )}
                                    </span>
                                </div>
                                <small>{isAutoTrading ? localize('Placing trades...') : localize('Idle')}</small>
                            </div>
                        </div>
                    </div>

                    {/* 📊 Strategy Ranking Table */}
                    <div className='strategy-ranking'>
                        <div className='ranking-header'>
                            <span>AUTO MARKETS</span>
                            <h4>Strategy ranking table</h4>
                        </div>
                        <div className='table-container'>
                            <table className='ranking-table'>
                                <thead>
                                    <tr>
                                        <th>MARKET</th>
                                        <th>SCORE</th>
                                        <th>STREAK</th>
                                        <th>MA SIGNAL</th>
                                        <th>SAFETY</th>
                                        <th>SPOT</th>
                                        <th>GROWTH</th>
                                        <th>STATUS</th>
                                        <th>STRATEGY</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {markets.map(m => (
                                        <tr key={m.id}>
                                            <td>
                                                <div className='market-cell'>
                                                    <strong>{m.name}</strong>
                                                    <span>
                                                        {m.id}HZ{m.id}0V
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className='score-pill'>{(6 + Math.random()).toFixed(2)}</span>
                                            </td>
                                            <td>{isAutoTrading ? Math.floor(Math.random() * 5) : 0}</td>
                                            <td className={m.id % 2 === 0 ? ' bearish' : 'bullish'}>
                                                {m.id % 2 === 0 ? 'bearish' : 'bullish'}
                                            </td>
                                            <td>{Math.floor(Math.random() * 100)}</td>
                                            <td className='mono'>{m.price}</td>
                                            <td>{m.growth}</td>
                                            <td
                                                style={{
                                                    color: isAutoTrading && m.id % 3 === 0 ? '#4caf50' : '#888',
                                                    fontWeight: isAutoTrading && m.id % 3 === 0 ? 'bold' : 'normal',
                                                }}
                                            >
                                                {isAutoTrading && m.id % 3 === 0
                                                    ? localize('Placing')
                                                    : localize('Watching')}
                                            </td>
                                            <td>
                                                {isAutoTrading && m.id % 3 === 0
                                                    ? localize('Executing breakout')
                                                    : localize('Scanning for safer setup')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 🏁 Footer Bar */}
            <div className='accumulators-terminal__footer'>
                <button className='run-btn'>
                    <LabelPairedPlayCaptionBoldIcon width='16px' height='16px' fill='#fff' />
                    <span>{localize('Run')}</span>
                </button>
                <div className='bot-status'>{localize('Bot is not running')}</div>
            </div>
        </div>
    );
};

export default AccumulatorsTerminal;
