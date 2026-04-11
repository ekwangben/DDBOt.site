import React from 'react';
import classNames from 'classnames';
import { Localize } from '@deriv-com/translations';
import './contract-result-overlay.scss';

type TContractResultOverlayProps = {
    profit: number;
    buyPrice?: number;
    exitPrice?: number;
    payout?: number;
    onClose?: () => void;
};

const ContractResultOverlay = ({ profit, buyPrice, exitPrice, payout, onClose }: TContractResultOverlayProps) => {
    const has_won_contract = profit >= 0;

    return (
        <>
            <div className='contract-result-overlay__backdrop' onClick={onClose} />
            <div
                className={classNames('contract-result-overlay', {
                    'contract-result-overlay--won': has_won_contract,
                    'contract-result-overlay--lost': !has_won_contract,
                })}
            >
                <div className='contract-result-overlay__icon'>
                    {has_won_contract ? (
                        <svg viewBox='0 0 24 24' fill='none' stroke='#4CAF50' strokeWidth='3'>
                            <path d='M20 6L9 17l-5-5' strokeLinecap='round' strokeLinejoin='round' />
                        </svg>
                    ) : (
                        <svg viewBox='0 0 24 24' fill='none' stroke='#FF4444' strokeWidth='3'>
                            <path d='M18 6L6 18M6 6l12 12' strokeLinecap='round' strokeLinejoin='round' />
                        </svg>
                    )}
                </div>

                <div className='contract-result-overlay__status'>
                    {has_won_contract ? (
                        <Localize i18n_default_text='You Won' />
                    ) : (
                        <Localize i18n_default_text='You Lost' />
                    )}
                </div>

                <div className='contract-result-overlay__amount'>
                    {has_won_contract ? '+' : ''}
                    {profit.toFixed(2)} USD
                </div>

                <div className='contract-result-overlay__details'>
                    <div className='contract-result-overlay__detail-row'>
                        <span className='label'>
                            <Localize i18n_default_text='Buy price' />
                        </span>
                        <span className='value'>{buyPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className='contract-result-overlay__detail-row'>
                        <span className='label'>
                            <Localize i18n_default_text='Exit price' />
                        </span>
                        <span className='value'>{exitPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                    {payout !== undefined && (
                        <div className='contract-result-overlay__detail-row'>
                            <span className='label'>
                                <Localize i18n_default_text='Total Payout' />
                            </span>
                            <span className='value'>{payout.toFixed(2)}</span>
                        </div>
                    )}
                </div>

                <button className='contract-result-overlay__close' onClick={onClose}>
                    <Localize i18n_default_text='OK' />
                </button>
            </div>
        </>
    );
};

export default ContractResultOverlay;
