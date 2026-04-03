import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { localize } from '@deriv-com/translations';
import './risk-management.scss';
import 'react-toastify/dist/ReactToastify.css';

const RiskManagement = () => {
    // Persistency: Load settings from localStorage or use defaults
    const [settings, setSettings] = React.useState(() => {
        const saved = localStorage.getItem('pro_risk_settings');
        return saved
            ? JSON.parse(saved)
            : {
                  take_profit: '100',
                  stop_loss: '50',
                  drawdown: '10',
                  protection_active: true,
              };
    });

    const updateSetting = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        localStorage.setItem('pro_risk_settings', JSON.stringify(newSettings));
    };

    const handleEmergencyStop = () => {
        toast.error(localize('!!! EMERGENCY STOP TRIGGERED: ALL SESSIONS HALTED !!!'), {
            position: 'top-center',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: 'colored',
        });
        // Logic: Broadcast 'abort' to all running bot instances
    };

    const toggleProtection = () => {
        const newState = !settings.protection_active;
        updateSetting('protection_active', newState);

        if (newState) {
            toast.success(localize('PRO SHIELD ACTIVE: MONITORING LIVE EQUITY'), {
                icon: '🛡️',
                theme: 'dark',
            });
        } else {
            toast.warn(localize('PROTECTION DISABLED: SHIELD DOWN'), {
                icon: '⚠️',
                theme: 'dark',
            });
        }
    };

    return (
        <div className='risk-management'>
            <div className='risk-management__header'>
                <h2>{localize('Risk Management Centre')}</h2>
                <p>
                    {localize(
                        'Set global safety limits that apply across all your trading bots and copy trading sessions.'
                    )}
                </p>
            </div>

            <div className='risk-management__grid'>
                {/* 🎯 Global Limits Card */}
                <div className='risk-management__card'>
                    <h3>{localize('Global Session Limits')}</h3>
                    <div className='card-desc'>
                        {localize('Automatically stop all bots when your total session profit or loss is hit.')}
                    </div>
                    <div className='input-row'>
                        <div className='input-group'>
                            <label>{localize('Total Take Profit ($)')}</label>
                            <input
                                type='number'
                                value={settings.take_profit}
                                onChange={e => updateSetting('take_profit', e.target.value)}
                            />
                        </div>
                        <div className='input-group'>
                            <label>{localize('Total Stop Loss ($)')}</label>
                            <input
                                type='number'
                                value={settings.stop_loss}
                                onChange={e => updateSetting('stop_loss', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className='info-banner'>
                        {localize('Protects your balance from large combined drawdowns.')}
                    </div>
                </div>

                {/* 🛡️ Drawdown Card */}
                <div className='risk-management__card highlight'>
                    <div className='card-top'>
                        <h3>{localize('Drawdown Protection')}</h3>
                        <label className='toggle-switch'>
                            <input type='checkbox' checked={settings.protection_active} onChange={toggleProtection} />
                            <span className='slider'></span>
                        </label>
                    </div>
                    <div className='card-desc'>
                        {localize('Emergency shutdown if floating loss exceeds a percentage of your equity.')}
                    </div>
                    <div className='input-row'>
                        <div className='input-group'>
                            <label>{localize('Max Equity Drop (%)')}</label>
                            <input
                                type='number'
                                value={settings.drawdown}
                                onChange={e => updateSetting('drawdown', e.target.value)}
                            />
                        </div>
                        <div className='input-group'>
                            <label>{localize('Safety Buffer (%)')}</label>
                            <input type='number' defaultValue='1.5' />
                        </div>
                    </div>
                    <div className={`protection-status ${settings.protection_active ? 'status-on' : 'status-off'}`}>
                        {settings.protection_active ? localize('SHIELD ACTIVE') : localize('SHIELD INACTIVE')}
                    </div>
                </div>
            </div>

            {/* 🚨 Emergency Response */}
            <div className='emergency-zone'>
                <h3>{localize('Emergency Control Panel')}</h3>
                <button className='btn-emergency' onClick={handleEmergencyStop}>
                    {localize('STOP ALL BOTS IMMEDIATELY')}
                </button>
            </div>

            <ToastContainer />
        </div>
    );
};

export default RiskManagement;
