import React from 'react';
import './smart-trades-landing.scss';

const SmartTradesLanding = ({ message }: { message?: string }) => {
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
        const startTime = Date.now();
        const duration = 10000; // 10 seconds

        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min(Math.floor((elapsed / duration) * 100), 100);
            setProgress(newProgress);

            if (elapsed < duration) {
                requestAnimationFrame(updateProgress);
            }
        };

        requestAnimationFrame(updateProgress);
    }, []);

    return (
        <div className='smart-trades-landing'>
            <div className='grid-overlay'></div>

            {/* Logo Section */}
            <div className='logo-container'>
                <div className='logo-box'>
                    <img src='/assets/landing/logo.png' alt='Smart Trades Pro' className='logo-img' />
                    <span className='logo-text'>SMART TRADES PRO</span>
                </div>
                <div className='system-label'>TRADING SYSTEM</div>
            </div>

            {/* Initialization Card */}
            <div className='card main-card'>
                <div className='card-header'>
                    <span className='card-title'>SYSTEM INITIALIZATION</span>
                    <span className='card-percentage'>{progress}%</span>
                </div>
                <div className='progress-container'>
                    <div className='progress-bar' style={{ width: `${progress}%` }}></div>
                </div>
                <div className='card-footer'>Optimizing performance...</div>
            </div>

            {/* Stats Grid */}
            <div className='stats-row'>
                <div className='card stat-card pulse'>
                    <div className='stat-icon gain'>📈</div>
                    <div className='stat-value'>+2.34%</div>
                    <div className='stat-label'>TODAY&apos;S GAIN</div>
                </div>
                <div className='card stat-card pulse'>
                    <div className='stat-icon speed'>⚡</div>
                    <div className='stat-value'>0.04s</div>
                    <div className='stat-label'>RESPONSE TIME</div>
                </div>
                <div className='card stat-card pulse'>
                    <div className='stat-icon security'>🔒</div>
                    <div className='stat-value'>100%</div>
                    <div className='stat-label'>SECURITY</div>
                </div>
            </div>

            {/* Processing Banner */}
            <div className='processing-section'>
                <div className='hourglass'>⌛</div>
                <div className='processing-text'>Processing</div>
                <div className='status-pill'>
                    <span className='pill-icon'>💠</span>
                    {message || 'Preparing your trading experience...'}
                </div>
            </div>

            {/* Footer Links */}
            <div className='landing-footer'>
                <span>Advanced Algorithms</span>
                <span className='dot'>•</span>
                <span>Real-time Data</span>
                <span className='dot'>•</span>
                <span>Secure Connection</span>
            </div>
        </div>
    );
};

export default SmartTradesLanding;
