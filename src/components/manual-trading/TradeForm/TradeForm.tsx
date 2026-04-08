import React, { useCallback, useEffect, useRef, useState } from 'react';
import { localize } from '@deriv-com/translations';
import { api_base } from '@/external/bot-skeleton';
import { useProposal } from '@/hooks/api/useProposal';
import { useTradeExecution } from '@/hooks/api/useTradeExecution';
import { useStore } from '@/hooks/useStore';
import { TradeTypeSelector, TradeCategory } from './TradeTypeSelector';
import { ContractParameters } from './ContractParameters';
import './trade-form.scss';

interface TradeFormProps {
    currentSymbol?: string;
}

export const TradeForm: React.FC<TradeFormProps> = ({ currentSymbol }) => {
    const store = useStore();
    const client = store?.client;
    const currency = client?.currency || 'USD';
    const isLoggedIn = client?.is_logged_in;

    const symbol = currentSymbol || 'R_100';
    const [tradeCategory, setTradeCategory] = useState<TradeCategory>('accumulators');
    const [contractType, setContractType] = useState<string>('ACCU');
    const [stake, setStake] = useState<number>(10);
    const [growthRate, setGrowthRate] = useState<number>(0.03);
    const [multiplier, setMultiplier] = useState<number>(100);
    const [takeProfit, setTakeProfit] = useState<boolean>(false);
    const [stopLoss, setStopLoss] = useState<boolean>(false);
    const [tpValue, setTpValue] = useState<string>('');
    const [slValue, setSlValue] = useState<string>('');
    const [duration, setDuration] = useState<number>(5);
    const [durationUnit, setDurationUnit] = useState<string>('t');
    const [barrier, setBarrier] = useState<number>(0);
    const [barrier2, setBarrier2] = useState<number>(0);
    const [selectedDigit, setSelectedDigit] = useState<number>(5);

    const { buy, isLoading: isBuying, error: buyError } = useTradeExecution();
    const {
        proposal,
        requestProposal,
        isLoading: isProposalLoading,
        error: proposalError,
    } = useProposal();

    // Request proposal when parameters change
    useEffect(() => {
        if (!symbol || !stake) return;

        const fetchProposal = async () => {
            try {
                requestProposal({
                    symbol,
                    contractType,
                    amount: stake,
                    currency,
                    ...(contractType === 'ACCU' && { growthRate }),
                    ...(tradeCategory === 'options' && {
                        duration,
                        durationUnit,
                        barrier: (['HIGH', 'LOW', 'ONETOUCH', 'NOTOUCH'].includes(contractType)) ? barrier : undefined,
                        selectedDigit: (['DIGITOVER', 'DIGITUNDER', 'DIGITMATCH', 'DIGITDIFF'].includes(contractType)) ? selectedDigit : undefined,
                    })
                }).catch(() => {});
            } catch (error) {}
        };

        const debounce = setTimeout(fetchProposal, 300);
        return () => clearTimeout(debounce);
    }, [symbol, contractType, stake, currency, growthRate, multiplier, duration, durationUnit, barrier, barrier2, selectedDigit]);

    const handleBuy = useCallback(async () => {
        if (!isLoggedIn) {
            alert(localize('Please log in to trade'));
            return;
        }

        try {
            await buy({
                symbol,
                contractType,
                amount: stake,
                currency,
                ...(contractType === 'ACCU' && { growthRate }),
                ...(tradeCategory === 'options' && {
                    duration,
                    durationUnit,
                    barrier: (['HIGH', 'LOW', 'ONETOUCH', 'NOTOUCH'].includes(contractType)) ? barrier : undefined,
                    selectedDigit: (['DIGITOVER', 'DIGITUNDER', 'DIGITMATCH', 'DIGITDIFF'].includes(contractType)) ? selectedDigit : undefined,
                })
            });
        } catch (error) {
            console.error('Buy error:', error);
        }
    }, [isLoggedIn, symbol, contractType, stake, currency, growthRate, duration, durationUnit, barrier, selectedDigit, buy]);

    const growthRates = [
        { label: '1%', value: 0.01 },
        { label: '2%', value: 0.02 },
        { label: '3%', value: 0.03 },
        { label: '4%', value: 0.04 },
        { label: '5%', value: 0.05 },
    ];

    return (
        <div className='trade-form'>
            <TradeTypeSelector
                selectedCategory={tradeCategory}
                selectedContractType={contractType}
                onCategoryChange={setTradeCategory}
                onContractTypeChange={setContractType}
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
                        <div className='trade-form__grid'>
                            {[100, 200, 400, 500, 1000].map(m => (
                                <button
                                    key={m}
                                    className={`trade-form__btn ${multiplier === m ? 'trade-form__btn--active' : ''}`}
                                    onClick={() => setMultiplier(m)}
                                >
                                    x{m}
                                </button>
                            ))}
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
                         <div className='trade-form__field' style={{marginTop: '12px'}}>
                            <label className='trade-form__label'>{localize('Duration')}</label>
                            <div className='trade-form__input-wrapper'>
                                <input
                                    type='number'
                                    value={duration}
                                    onChange={e => setDuration(parseInt(e.target.value) || 1)}
                                />
                                <select
                                    value={durationUnit}
                                    onChange={e => setDurationUnit(e.target.value)}
                                    style={{border: 'none', background: 'none', outline: 'none', fontWeight: 600}}
                                >
                                    <option value='t'>{localize('Ticks')}</option>
                                    <option value='s'>{localize('Seconds')}</option>
                                    <option value='m'>{localize('Minutes')}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div className='trade-form__section'>
                    <label className='trade-form__label'>{localize('Stake')}</label>
                    <div className='trade-form__input-wrapper'>
                        <button className='control-btn' onClick={() => setStake(Math.max(1, stake - 1))}>−</button>
                        <input
                            type='number'
                            value={stake}
                            onChange={e => setStake(parseFloat(e.target.value) || 0)}
                        />
                        <button className='control-btn' onClick={() => setStake(stake + 1)}>+</button>
                        <div className='currency-selector'>
                            {currency}
                            <span>▼</span>
                        </div>
                    </div>
                </div>

                <div className='trade-form__risk'>
                    <div className='risk-item'>
                        <input
                            type='checkbox'
                            checked={takeProfit}
                            onChange={e => setTakeProfit(e.target.checked)}
                        />
                        <span>{localize('Take profit')}</span>
                        <span className='info-icon'>i</span>
                    </div>
                    {takeProfit && (
                        <div className='trade-form__input-wrapper' style={{marginBottom: '12px'}}>
                            <input
                                type='text'
                                placeholder='Amount'
                                value={tpValue}
                                onChange={e => setTpValue(e.target.value)}
                            />
                        </div>
                    )}

                    {tradeCategory === 'multipliers' && (
                        <>
                            <div className='risk-item'>
                                <input
                                    type='checkbox'
                                    checked={stopLoss}
                                    onChange={e => setStopLoss(e.target.checked)}
                                />
                                <span>{localize('Stop loss')}</span>
                                <span className='info-icon'>i</span>
                            </div>
                            {stopLoss && (
                                <div className='trade-form__input-wrapper'>
                                    <input
                                        type='text'
                                        placeholder='Amount'
                                        value={slValue}
                                        onChange={e => setSlValue(e.target.value)}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className='trade-form__summary'>
                    {contractType === 'ACCU' && (
                        <>
                            <div className='trade-form__info-row'>
                                <span className='label'>{localize('Max. payout')}</span>
                                <span className='value'>6,000.00 {currency}</span>
                            </div>
                            <div className='trade-form__info-row'>
                                <span className='label'>{localize('Max. ticks')}</span>
                                <span className='value'>85 ticks</span>
                            </div>
                        </>
                    )}
                    {proposal && (
                         <div className='trade-form__info-row'>
                            <span className='label'>{localize('Potential Payout')}</span>
                            <span className='value'>{proposal.payout.toFixed(2)} {currency}</span>
                        </div>
                    )}
                </div>
            </div>

            <button
                className='trade-form__buy-btn'
                onClick={handleBuy}
                disabled={isBuying || !isLoggedIn}
            >
                <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'><path d='M5 12h14M12 5l7 7-7 7'/></svg>
                {isBuying ? localize('Processing...') : localize('Buy')}
            </button>
        </div>
    );
};
