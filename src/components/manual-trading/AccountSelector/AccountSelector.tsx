import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import { api_base } from '@/external/bot-skeleton';
import { Analytics } from '@deriv-com/analytics';
import './account-selector.scss';

export const AccountSelector: React.FC = observer(() => {
    const { client } = useStore();
    const [isOpen, setIsOpen] = useState(false);

    const { accounts, loginid, balance, currency, is_logged_in } = client;

    if (!is_logged_in) return null;

    const activeAccount = accounts[loginid];

    const switchAccount = async (newLoginId: string) => {
        if (newLoginId === loginid) return;

        const account_list = JSON.parse(localStorage.getItem('accountsList') ?? '{}');
        const token = account_list[newLoginId];
        if (!token) return;

        localStorage.setItem('authToken', token);
        localStorage.setItem('active_loginid', newLoginId);

        const account_type = newLoginId.match(/[a-zA-Z]+/g)?.join('') || '';
        Analytics.setAttributes({ account_type });

        await api_base.init(true);
        setIsOpen(false);

        // Update URL to reflect account change
        const search_params = new URLSearchParams(window.location.search);
        const selected_account = accounts[newLoginId];
        const account_param = selected_account.is_virtual ? 'demo' : selected_account.currency;
        search_params.set('account', account_param);
        window.history.pushState({}, '', `${window.location.pathname}?${search_params.toString()}`);
    };

    return (
        <div className='account-selector'>
            <div className='account-selector__display' onClick={() => setIsOpen(!isOpen)}>
                <div className='account-selector__info'>
                    <span className={`badge ${activeAccount?.is_virtual ? 'demo' : 'real'}`}>
                        {activeAccount?.is_virtual ? 'Demo' : 'Real'}
                    </span>
                    <span className='balance'>{balance} {currency}</span>
                </div>
                <span className='chevron'>{isOpen ? '▲' : '▼'}</span>
            </div>

            {isOpen && (
                <>
                    <div className='account-selector__overlay' onClick={() => setIsOpen(false)} />
                    <div className='account-selector__list'>
                        {Object.values(accounts).map((acc) => (
                            <div
                                key={acc.loginid}
                                className={`account-selector__item ${acc.loginid === loginid ? 'active' : ''}`}
                                onClick={() => switchAccount(acc.loginid)}
                            >
                                <div className='acc-info'>
                                    <span className='loginid'>{acc.loginid}</span>
                                    <span className='currency'>{acc.currency}</span>
                                </div>
                                {acc.loginid === loginid && <span className='check'>✓</span>}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
});
