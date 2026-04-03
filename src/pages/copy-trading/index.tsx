import React from 'react';
import { localize } from '@deriv-com/translations';
import './copy-trading.scss';

const CopyTrading = () => {
    const [token, setToken] = React.useState('');
    const [is_synced, setIsSynced] = React.useState(false);

    return (
        <div className='copy-trading'>
            <div className='copy-trading__header'>
                <h2 className='copy-trading__title'>{localize('Social Trading Terminal')}</h2>
                <p className='copy-trading__subtitle'>
                    {localize('Securely link master accounts and mirror high-performance strategies.')}
                </p>
            </div>

            <div className='copy-trading__grid'>
                {/* 🎯 Master Connection Panel */}
                <div className='copy-trading__card main-panel'>
                    <div className='card-header'>
                        <h3>{localize('Account Mirroring Control')}</h3>
                        <div className={`sync-indicator ${is_synced ? 'state-active' : 'state-inactive'}`}>
                            <span className='dot'></span>
                            {is_synced ? localize('LIVE SYNCING') : localize('STANDBY')}
                        </div>
                    </div>

                    <div className='input-container'>
                        <div className='input-field'>
                            <label>{localize('Master Account API Token')}</label>
                            <input
                                type='text'
                                placeholder={localize('Enter Master Token (e.g. 1a2b3c4d...)')}
                                value={token}
                                onChange={e => setToken(e.target.value)}
                            />
                        </div>

                        <div className='settings-row'>
                            <div className='setting'>
                                <span>{localize('Lot Multiplier')}</span>
                                <select>
                                    <option>1.0x (Exact Copy)</option>
                                    <option>0.5x (Safe)</option>
                                    <option>2.0x (Aggressive)</option>
                                </select>
                            </div>
                            <div className='setting'>
                                <span>{localize('Max Slippage')}</span>
                                <input type='number' defaultValue='0.5' step='0.1' />
                            </div>
                        </div>

                        <button
                            className={`btn-sync ${is_synced ? 'btn-disconnect' : 'btn-connect'}`}
                            onClick={() => setIsSynced(!is_synced)}
                        >
                            {is_synced ? localize('DISCONNECT FROM MASTER') : localize('ESTABLISH SYNC CONNECTION')}
                        </button>
                    </div>
                </div>

                {/* 📜 Advanced Sync Logs */}
                <div className='copy-trading__card terminal-panel'>
                    <h3>{localize('Live Sync Logs')}</h3>
                    <div className='terminal-window'>
                        <div className='log-line'>
                            <span className='timestamp'>[23:41:02]</span> System initialized...
                        </div>
                        <div className='log-line'>
                            <span className='timestamp'>[23:41:05]</span> Local gateway ready.
                        </div>
                        {is_synced && (
                            <>
                                <div className='log-line success'>
                                    <span className='timestamp'>[23:42:10]</span> WebSocket Handshake: SUCCESS
                                </div>
                                <div className='log-line success'>
                                    <span className='timestamp'>[23:42:11]</span> Authenticated Master ID: #78342
                                </div>
                                <div className='log-line'>
                                    <span className='timestamp'>[23:42:15]</span> Monitoring trade stream...
                                </div>
                            </>
                        )}
                        {!is_synced && (
                            <div className='log-line warning'>
                                <span className='timestamp'>[--:--:--]</span> DISCONNECTED. Waiting for token...
                            </div>
                        )}
                    </div>
                </div>

                {/* 🏆 Recommended strategies */}
                <div className='copy-trading__card full-width'>
                    <h3>{localize('Master Performance Profiles')}</h3>
                    <div className='master-profiles'>
                        <div className='profile-card'>
                            <span className='rank'>#1</span>
                            <div className='profile-info'>
                                <strong>Volatility Pro v4</strong>
                                <span>88% Success Rate</span>
                            </div>
                            <div className='profile-stats'>
                                <span className='profit'>+142%</span>
                                <button className='btn-mini'>Auto-Fill Token</button>
                            </div>
                        </div>
                        <div className='profile-card'>
                            <span className='rank'>#2</span>
                            <div className='profile-info'>
                                <strong>Scalp Master AI</strong>
                                <span>82% Success Rate</span>
                            </div>
                            <div className='profile-stats'>
                                <span className='profit'>+94%</span>
                                <button className='btn-mini'>Auto-Fill Token</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='copy-trading__safety'>
                <strong>{localize('SAFETY PROTOCOL:')}</strong>{' '}
                {localize(
                    'Mirroring only executes if your account has sufficient margin. Stop-losses are inherited from the master by default.'
                )}
            </div>
        </div>
    );
};

export default CopyTrading;
