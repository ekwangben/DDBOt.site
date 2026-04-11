import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useProposal } from '@/hooks/api/useProposal';
import { useTradeExecution } from '@/hooks/api/useTradeExecution';
import { useStore } from '@/hooks/useStore';
import { localize } from '@deriv-com/translations';
import { ContractParameters } from './ContractParameters';
import { CONTRACT_TYPES,TradeCategory, TradeTypeSelector } from './TradeTypeSelector';
import './trade-form.scss';

interface TradeFormProps {
    currentSymbol?: string;
    onContractTypeChange?: (contractType: string) => void;
}

export const TradeForm: React.FC<TradeFormProps> = observer(({ currentSymbol, onContractTypeChange }) => {
    const store = useStore();
    const client = store?.client;
    const isLoggedIn = client?.is_logged_in;
    const [selectedCurrency, setSelectedCurrency] = useState<string>(client?.currency || 'USD');
    const [isCurrencySelectorOpen, setIsCurrencySelectorOpen] = useState(false);

    useEffect(() => {
        if (client?.currency && selectedCurrency !== client.currency) {
            setSelectedCurrency(client.currency);
        }
    }, [client?.currency]);

    const symbol = currentSymbol || 'R_100';
    const [tradeCategory, setTradeCategory] = useState<TradeCategory>('accumulators');
    const [contractType, setContractType] = useState<string>('ACCU');
    
    useEffect(() => {
        if (onContractTypeChange) {
            onContractTypeChange(contractType);
        }
    }, [contractType, onContractTypeChange]);

    const [stake, setStake] = useState<number>(10);
    const [growthRate, setGrowthRate] = useState<number>(0.03);
    const [multiplier] = useState<number>(100);
    const [takeProfit, setTakeProfit] = useState<boolean>(false);
    const [stopLoss, setStopLoss] = useState<boolean>(false);
    const [tpValue, setTpValue] = useState<string>('');
    const [slValue, setSlValue] = useState<string>('');
    const [duration] = useState<number>(5);
    const [durationUnit] = useState<string>('t');
    const [barrier, setBarrier] = useState<number>(0);
    const [barrier2, setBarrier2] = useState<number>(0);
    const [selectedDigit, setSelectedDigit] = useState<number>(5);
    const [dealCancellation, setDealCancellation] = useState<boolean>(false);

    const { buy, isLoading: isBuying } = useTradeExecution();
    const { proposal, requestProposal, error: proposalError } = useProposal();
    const { proposal: secondaryProposal, requestProposal: requestSecondaryProposal } = useProposal();

    const needsDualButtons = [
        'DIGITOVER',
        'DIGITUNDER',
        'DIGITMATCH',
        'DIGITDIFF',
        'DIGITEVEN',
        'DIGITODD',
        'MULTUP',
        'MULTDOWN',
        'CALL',
        'PUT',
        'VANILLA',
        'TURBO',
    ].includes(contractType);

    // Request proposal when parameters change
    useEffect(() => {
        if (!symbol || !stake) return;

        const fetchProposal = async () => {
            try {
                // Request primary proposal
                requestProposal({
                    symbol,
                    contractType,
                    amount: stake,
                    currency: selectedCurrency,
                    ...(contractType === 'ACCU' && { growth_rate: growthRate }),
                    ...(tradeCategory === 'options' && {
                        duration,
                        durationUnit,
                        barrier: ['HIGH', 'LOW', 'ONETOUCH', 'NOTOUCH'].includes(contractType) ? barrier : undefined,
                        selectedDigit: ['DIGITOVER', 'DIGITUNDER', 'DIGITMATCH', 'DIGITDIFF'].includes(contractType)
                            ? selectedDigit
                            : undefined,
                    }),
                }).catch(() => {});

                // Request secondary proposal if needed
                if (needsDualButtons) {
                    const secondaryType = getSecondaryType(contractType);
                    requestSecondaryProposal({
                        symbol,
                        contractType: secondaryType,
                        amount: stake,
                        currency: selectedCurrency,
                        duration,
                        durationUnit,
                        selectedDigit: ['DIGITOVER', 'DIGITUNDER', 'DIGITMATCH', 'DIGITDIFF'].includes(secondaryType)
                            ? selectedDigit
                            : undefined,
                    }).catch(() => {});
                }
            } catch (error) {
                // Ignore proposal errors - they are handled via proposalError state
            }
        };

        const debounce = setTimeout(fetchProposal, 300);
        return () => clearTimeout(debounce);
    }, [
        symbol,
        contractType,
        stake,
        selectedCurrency,
        growthRate,
        multiplier,
        duration,
        durationUnit,
        barrier,
        barrier2,
        selectedDigit,
        needsDualButtons,
        dealCancellation,
    ]);

    function getSecondaryType(primary: string) {
        const mapping: Record<string, string> = {
            DIGITOVER: 'DIGITUNDER',
            DIGITUNDER: 'DIGITOVER',
            DIGITMATCH: 'DIGITDIFF',
            DIGITDIFF: 'DIGITMATCH',
            DIGITEVEN: 'DIGITODD',
            DIGITODD: 'DIGITEVEN',
            CALL: 'PUT',
            PUT: 'CALL',
            MULTUP: 'MULTDOWN',
            MULTDOWN: 'MULTUP',
        };
        return mapping[primary] || primary;
    }

    const handleBuy = useCallback(
        async (specificType?: string) => {
            if (!isLoggedIn) {
                alert(localize('Please log in to trade'));
                return;
            }

            const typeToBuy = specificType || contractType;

            try {
                await buy({
                    symbol,
                    contractType: typeToBuy,
                    amount: stake,
                    currency: selectedCurrency,
                    ...(typeToBuy === 'ACCU' && { growth_rate: growthRate }),
                    ...(tradeCategory === 'options' && {
                        duration,
                        durationUnit,
                        barrier: ['HIGH', 'LOW', 'ONETOUCH', 'NOTOUCH'].includes(typeToBuy) ? barrier : undefined,
                        selectedDigit: ['DIGITOVER', 'DIGITUNDER', 'DIGITMATCH', 'DIGITDIFF'].includes(typeToBuy)
                            ? selectedDigit
                            : undefined,
                    }),
                });
            } catch (error) {
                console.error('Buy error:', error);
            }
        },
        [
            isLoggedIn,
            symbol,
            contractType,
            stake,
            selectedCurrency,
            growthRate,
            duration,
            durationUnit,
            barrier,
            selectedDigit,
            buy,
            tradeCategory,
        ]
    );

    const growthRates = [
        { label: '1%', value: 0.01 },
        { label: '2%', value: 0.02 },
        { label: '3%', value: 0.03 },
        { label: '4%', value: 0.04 },
        { label: '5%', value: 0.05 },
    ];

    const currentContract = CONTRACT_TYPES.find(ct => ct.value === contractType);

    const handleContractTypeChange = (type: string) => {
        setContractType(type);
        const contract = CONTRACT_TYPES.find(ct => ct.value === type);
        if (contract) {
            setTradeCategory(contract.category);
        }
    };

    return (
        <div className='trade-form'>
            <TradeTypeSelector
                selectedContractType={contractType}
                onCategoryChange={setTradeCategory}
                onContractTypeChange={handleContractTypeChange}
            />

            <div className='trade-form__content'>
                {contractType === 'ACCU' && (
                    <div className='trade-form__section'>
                        <label className='trade-form__label'>
                            {localize('Growth rate')}
                            <span className='info-icon'>i</span>
                        </label>
                        <div className='trade-form__grid'>
                            {growthRates.map(rate => (
                                <button
                                    key={rate.value}
                                    className={`trade-form__btn ${growthRate === rate.value ? 'trade-form__btn--active' : ''}`}
                                    onClick={() => setGrowthRate(rate.value)}
                                >
                                    {rate.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {tradeCategory === 'multipliers' && (
                    <div className='trade-form__section'>
                        <label className='trade-form__label'>{localize('Multiplier')}</label>
                        <div className='trade-form__multiplier-selector'>
                            <svg
                                className='chevron-left'
                                width='16'
                                height='16'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2'
                            >
                                <path d='m15 18-6-6 6-6' />
                            </svg>
                            <span className='value'>x{multiplier}</span>
                        </div>
                    </div>
                )}

                {tradeCategory === 'options' && (
                    <div className='trade-form__section'>
                        <ContractParameters
                            contractType={contractType}
                            barrier={barrier}
                            barrier2={barrier2}
                            selectedDigit={selectedDigit}
                            onBarrierChange={setBarrier}
                            onBarrier2Change={setBarrier2}
                            onDigitChange={setSelectedDigit}
                        />
                    </div>
                )}

                <div className='trade-form__main-inputs'>
                    <div className='trade-form__section'>
                        <label className='trade-form__label'>{localize('Stake')}</label>
                        <div className='trade-form__stake-input'>
                            <button className='stake-btn' onClick={() => setStake(Math.max(1, stake - 1))}>
                                <svg
                                    width='16'
                                    height='16'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                >
                                    <path d='M5 12h14' />
                                </svg>
                            </button>
                            <input type='number' value={stake} onChange={e => setStake(Number(e.target.value))} />
                            <button className='stake-btn' onClick={() => setStake(stake + 1)}>
                                <svg
                                    width='16'
                                    height='16'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                >
                                    <path d='M12 5v14M5 12h14' />
                                </svg>
                            </button>
                            <div
                                className='currency-selector'
                                onClick={() => setIsCurrencySelectorOpen(!isCurrencySelectorOpen)}
                            >
                                <svg
                                    width='14'
                                    height='14'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2.5'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    style={{
                                        transform: isCurrencySelectorOpen ? 'rotate(-90deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s',
                                    }}
                                >
                                    <path d='m15 18-6-6 6-6' />
                                </svg>
                                <span>{selectedCurrency}</span>

                                {isCurrencySelectorOpen && (
                                    <>
                                        <div
                                            className='trade-type-selector__overlay'
                                            onClick={e => {
                                                e.stopPropagation();
                                                setIsCurrencySelectorOpen(false);
                                            }}
                                        />
                                        <div className='currency-mini-modal'>
                                            <div className='currency-mini-modal__header'>
                                                <span>{localize('Fiat')}</span>
                                                <button
                                                    className='close-btn'
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        setIsCurrencySelectorOpen(false);
                                                    }}
                                                >
                                                    <svg
                                                        width='18'
                                                        height='18'
                                                        viewBox='0 0 24 24'
                                                        fill='none'
                                                        stroke='currentColor'
                                                        strokeWidth='2.5'
                                                    >
                                                        <line x1='18' y1='6' x2='6' y2='18'></line>
                                                        <line x1='6' y1='6' x2='18' y2='18'></line>
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className='currency-mini-modal__body'>
                                                <div className='currency-mini-modal__list'>
                                                    {['AUD', 'EUR', 'GBP', 'USD'].map(curr => (
                                                        <div
                                                            key={curr}
                                                            className={`currency-mini-modal__item ${curr === selectedCurrency ? 'active' : ''}`}
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                setSelectedCurrency(curr);
                                                                setIsCurrencySelectorOpen(false);
                                                            }}
                                                        >
                                                            <span className='currency-name'>{curr}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className='currency-mini-modal__footer-line' />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {tradeCategory === 'multipliers' && (
                    <div className='trade-form__info-row'>
                        <div className='info-item'>
                            <span>{localize('Commission')}</span>
                            <span className='info-value'>0.14 {selectedCurrency}</span>
                        </div>
                        <div className='info-item'>
                            <span>{localize('Stop out')}</span>
                            <span className='info-value'>10.00 {selectedCurrency}</span>
                        </div>
                    </div>
                )}

                <div className='trade-form__risk'>
                    <div className='risk-item'>
                        <div className='risk-item__left'>
                            <input
                                type='checkbox'
                                checked={takeProfit}
                                onChange={e => setTakeProfit(e.target.checked)}
                            />
                            <span>{localize('Take profit')}</span>
                        </div>
                        <span className='info-icon'>i</span>
                    </div>
                    {takeProfit && (
                        <div className='trade-form__input-wrapper' style={{ marginBottom: '12px' }}>
                            <input
                                type='text'
                                placeholder='Amount'
                                value={tpValue}
                                onChange={e => setTpValue(e.target.value)}
                            />
                        </div>
                    )}

                    <div className='risk-item'>
                        <div className='risk-item__left'>
                            <input type='checkbox' checked={stopLoss} onChange={e => setStopLoss(e.target.checked)} />
                            <span>{localize('Stop loss')}</span>
                        </div>
                        <span className='info-icon'>i</span>
                    </div>
                    {stopLoss && (
                        <div className='trade-form__input-wrapper' style={{ marginBottom: '12px' }}>
                            <input
                                type='text'
                                placeholder='Amount'
                                value={slValue}
                                onChange={e => setSlValue(e.target.value)}
                            />
                        </div>
                    )}

                    {tradeCategory === 'multipliers' && (
                        <div className='risk-item'>
                            <div className='risk-item__left'>
                                <input
                                    type='checkbox'
                                    checked={dealCancellation}
                                    onChange={e => setDealCancellation(e.target.checked)}
                                />
                                <span>{localize('Deal cancellation')}</span>
                            </div>
                            <span className='info-icon'>i</span>
                        </div>
                    )}
                </div>

                <div className='trade-form__summary'>
                    {proposalError && (
                        <div className='trade-form__error-banner'>
                            {proposalError.includes('Contract type ACCU not supported')
                                ? localize('Choose a (1s) Symbol for Accumulators')
                                : proposalError}
                        </div>
                    )}
                    {contractType === 'ACCU' && (
                        <>
                            <div className='trade-form__info-row'>
                                <div className='info-item'>
                                    <span>{localize('Max. payout')}</span>
                                    <span className='info-value'>
                                        {proposal?.maxPayout
                                            ? proposal.maxPayout.toLocaleString(undefined, {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 2,
                                              })
                                            : '—'}{' '}
                                        {selectedCurrency}
                                    </span>
                                </div>
                                <div className='info-item'>
                                    <span>{localize('Max. ticks')}</span>
                                    <span className='info-value'>{proposal?.maxTicks || '—'} ticks</span>
                                </div>
                            </div>
                        </>
                    )}
                    {(proposal || tradeCategory === 'multipliers') && (
                        <div className='trade-form__info-row'>
                            <div className='info-item'>
                                <span>{localize('Potential Payout')}</span>
                                <span className='info-value'>
                                    {proposal?.payout ? proposal.payout.toFixed(2) : '—'} {selectedCurrency}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className='trade-form__footer'>
                {needsDualButtons ? (
                    <div className='trade-form__dual-buttons'>
                        <button
                            className='trade-form__buy-btn up'
                            onClick={() =>
                                handleBuy(
                                    contractType.includes('UNDER') ||
                                        contractType.includes('DIFF') ||
                                        contractType.includes('ODD')
                                        ? getSecondaryType(contractType)
                                        : contractType
                                )
                            }
                            disabled={isBuying || !isLoggedIn}
                        >
                            <div className='btn-content'>
                                <svg width='18' height='18' viewBox='0 0 24 24' fill='#fff'>
                                    <path d='M12 4l-8 12h16l-8-12z' />
                                </svg>
                                <span className='label'>
                                    {contractType.includes('MATCH')
                                        ? localize('Matches')
                                        : contractType.includes('EVEN')
                                          ? localize('Even')
                                          : contractType.includes('OVER')
                                            ? localize('Over')
                                            : contractType.includes('HIGHER')
                                              ? localize('Higher')
                                              : contractType === 'CALL'
                                                ? localize('Rise')
                                                : contractType === 'VANILLA'
                                                  ? localize('Call')
                                                  : contractType === 'TURBO'
                                                    ? localize('Turbo Up')
                                                    : localize('Up')}
                                </span>
                                <span className='payout'>
                                    {proposal?.payout.toFixed(2) || '10.00'} {selectedCurrency}
                                </span>
                            </div>
                        </button>
                        <button
                            className='trade-form__buy-btn down'
                            onClick={() =>
                                handleBuy(
                                    contractType.includes('OVER') ||
                                        contractType.includes('MATCH') ||
                                        contractType.includes('EVEN')
                                        ? getSecondaryType(contractType)
                                        : contractType
                                )
                            }
                            disabled={isBuying || !isLoggedIn}
                        >
                            <div className='btn-content'>
                                <svg width='18' height='18' viewBox='0 0 24 24' fill='#fff'>
                                    <path d='M12 20l8-12h-16l8 12z' />
                                </svg>
                                <span className='label'>
                                    {contractType.includes('DIFF')
                                        ? localize('Differs')
                                        : contractType.includes('ODD')
                                          ? localize('Odd')
                                          : contractType.includes('UNDER')
                                            ? localize('Under')
                                            : contractType.includes('LOWER')
                                              ? localize('Lower')
                                              : contractType === 'PUT'
                                                ? localize('Fall')
                                                : contractType === 'VANILLA'
                                                  ? localize('Put')
                                                  : contractType === 'TURBO'
                                                    ? localize('Turbo Down')
                                                    : localize('Down')}
                                </span>
                                <span className='payout'>
                                    {secondaryProposal?.payout.toFixed(2) || '10.00'} {selectedCurrency}
                                </span>
                            </div>
                        </button>
                    </div>
                ) : (
                    <button
                        className='trade-form__buy-btn single'
                        onClick={() => handleBuy(contractType)}
                        disabled={isBuying || !isLoggedIn}
                    >
                        <div className='btn-content'>
                            {currentContract?.icon}
                            <span>{isBuying ? localize('Processing...') : localize('Buy')}</span>
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
});
