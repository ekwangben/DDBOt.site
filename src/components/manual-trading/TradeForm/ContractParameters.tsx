import React from 'react';
import { localize } from '@deriv-com/translations';
import './contract-parameters.scss';

interface ContractParametersProps {
    contractType: string;
    barrier?: number;
    barrier2?: number;
    selectedDigit?: number;
    durationTicks?: number | '';
    durationMinutes?: number | '';
    durationUnit?: string;
    onBarrierChange?: (barrier: number) => void;
    onBarrier2Change?: (barrier2: number) => void;
    onDigitChange?: (digit: number) => void;
    onDurationTicksChange?: (duration: number | '') => void;
    onDurationMinutesChange?: (duration: number | '') => void;
    onDurationUnitChange?: (unit: string) => void;
    hideMinutes?: boolean;
}

export const ContractParameters: React.FC<ContractParametersProps> = ({
    contractType,
    barrier,
    barrier2,
    selectedDigit,
    durationTicks = 5,
    durationMinutes = 1,
    durationUnit = 't',
    onBarrierChange,
    onBarrier2Change,
    onDigitChange,
    onDurationTicksChange,
    onDurationMinutesChange,
    onDurationUnitChange,
    hideMinutes = false,
}) => {
    // Determine which parameters to show based on contract type
    const needsBarrier = ['HIGH', 'LOW', 'ONETOUCH', 'NOTOUCH'].includes(contractType);
    const needsDoubleBarrier = ['EXPIRYRANGE', 'EXPIRYMISS'].includes(contractType);
    const needsDigit = ['DIGITOVER', 'DIGITUNDER', 'DIGITMATCH', 'DIGITDIFF'].includes(contractType);
    const needsEvenOdd = ['DIGITEVEN', 'DIGITODD'].includes(contractType);

    // Most options need duration, but allow hiding minutes for specific types
    const needsMinutes = !hideMinutes;

    return (
        <div className='contract-parameters'>
            <div className='contract-parameters__block'>
                <label className='contract-parameters__label'>
                    {durationUnit === 't' ? localize('Ticks') : localize('Minutes')}
                </label>
                <div className='contract-parameters__duration-wrapper'>
                    {durationUnit === 't' ? (
                        <div className='contract-parameters__duration-input-stepper'>
                            <button
                                type='button'
                                className='stepper-btn'
                                onClick={() => {
                                    const current = typeof durationTicks === 'number' ? durationTicks : 1;
                                    onDurationTicksChange?.(Math.max(1, current - 1));
                                }}
                            >
                                <svg
                                    width='14'
                                    height='14'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                >
                                    <path d='M5 12h14' />
                                </svg>
                            </button>
                            <input
                                type='number'
                                className='contract-parameters__input duration-input'
                                value={durationTicks}
                                onChange={e => {
                                    if (e.target.value === '') {
                                        onDurationTicksChange?.('');
                                        return;
                                    }
                                    let val = parseInt(e.target.value);
                                    if (isNaN(val)) return;
                                    val = Math.min(10, Math.max(1, val));
                                    onDurationTicksChange?.(val);
                                }}
                                min='1'
                                max='10'
                            />
                            <button
                                type='button'
                                className='stepper-btn r-border'
                                onClick={() => {
                                    const current = typeof durationTicks === 'number' ? durationTicks : 0;
                                    const next = current + 1;
                                    onDurationTicksChange?.(Math.min(10, next));
                                }}
                            >
                                <svg
                                    width='14'
                                    height='14'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                >
                                    <path d='M12 5v14M5 12h14' />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div className='contract-parameters__duration-input-stepper'>
                            <button
                                type='button'
                                className='stepper-btn'
                                onClick={() => {
                                    const current = typeof durationMinutes === 'number' ? durationMinutes : 1;
                                    onDurationMinutesChange?.(Math.max(1, current - 1));
                                }}
                            >
                                <svg
                                    width='14'
                                    height='14'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                >
                                    <path d='M5 12h14' />
                                </svg>
                            </button>
                            <input
                                type='number'
                                className='contract-parameters__input duration-input'
                                value={durationMinutes}
                                onChange={e => {
                                    if (e.target.value === '') {
                                        onDurationMinutesChange?.('');
                                        return;
                                    }
                                    let val = parseInt(e.target.value);
                                    if (isNaN(val)) return;
                                    val = Math.max(1, val);
                                    onDurationMinutesChange?.(val);
                                }}
                                min='1'
                            />
                            <button
                                type='button'
                                className='stepper-btn r-border'
                                onClick={() => {
                                    const current = typeof durationMinutes === 'number' ? durationMinutes : 0;
                                    onDurationMinutesChange?.(current + 1);
                                }}
                            >
                                <svg
                                    width='14'
                                    height='14'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                >
                                    <path d='M12 5v14M5 12h14' />
                                </svg>
                            </button>
                        </div>
                    )}
                    <div className='contract-parameters__duration-units'>
                        <button
                            type='button'
                            className={`duration-unit-btn ${durationUnit === 't' ? 'active' : ''}`}
                            onClick={() => onDurationUnitChange?.('t')}
                        >
                            {localize('Ticks')}
                        </button>
                        {needsMinutes && (
                            <button
                                type='button'
                                className={`duration-unit-btn ${durationUnit === 'm' ? 'active' : ''}`}
                                onClick={() => onDurationUnitChange?.('m')}
                            >
                                {localize('Minutes')}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {needsBarrier && (
                <div className='contract-parameters__block'>
                    <label className='contract-parameters__label'>{localize('Barrier offset')}</label>
                    <input
                        type='number'
                        className='contract-parameters__input'
                        value={barrier || 0}
                        onChange={e => onBarrierChange?.(parseFloat(e.target.value))}
                        step='0.01'
                        placeholder='Enter barrier'
                    />
                </div>
            )}

            {needsDoubleBarrier && (
                <div className='contract-parameters__block'>
                    <div className='contract-parameters__double-barrier'>
                        <div className='contract-parameters__field'>
                            <label className='contract-parameters__label'>{localize('Low Barrier')}</label>
                            <input
                                type='number'
                                className='contract-parameters__input'
                                value={barrier || 0}
                                onChange={e => onBarrierChange?.(parseFloat(e.target.value))}
                                step='0.01'
                                placeholder='Low barrier'
                            />
                        </div>
                        <div className='contract-parameters__field'>
                            <label className='contract-parameters__label'>{localize('High Barrier')}</label>
                            <input
                                type='number'
                                className='contract-parameters__input'
                                value={barrier2 || 0}
                                onChange={e => onBarrier2Change?.(parseFloat(e.target.value))}
                                step='0.01'
                                placeholder='High barrier'
                            />
                        </div>
                    </div>
                </div>
            )}

            {needsDigit && (
                <div className='contract-parameters__block'>
                    <label className='contract-parameters__label'>
                        {localize('Last Digit Prediction')}
                    </label>
                    <div className='contract-parameters__digit-selector'>
                        {Array.from({ length: 10 }, (_, i) => i).map(digit => (
                            <button
                                key={digit}
                                type='button'
                                className={`contract-parameters__digit-btn ${selectedDigit === digit ? 'active' : ''}`}
                                onClick={() => onDigitChange?.(digit)}
                            >
                                {digit}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {needsEvenOdd && (
                <div className='contract-parameters__block'>
                    <label className='contract-parameters__label'>{localize('Prediction')}</label>
                    <div className='contract-parameters__even-odd'>
                        <div className='contract-parameters__prediction'>
                            {contractType === 'DIGITEVEN' ? localize('Even') : localize('Odd')}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
