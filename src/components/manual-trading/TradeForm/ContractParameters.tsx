import React from 'react';
import { localize } from '@deriv-com/translations';
import './contract-parameters.scss';

interface ContractParametersProps {
    contractType: string;
    barrier?: number;
    barrier2?: number;
    selectedDigit?: number;
    onBarrierChange?: (barrier: number) => void;
    onBarrier2Change?: (barrier2: number) => void;
    onDigitChange?: (digit: number) => void;
}

export const ContractParameters: React.FC<ContractParametersProps> = ({
    contractType,
    barrier,
    barrier2,
    selectedDigit,
    onBarrierChange,
    onBarrier2Change,
    onDigitChange,
}) => {
    // Determine which parameters to show based on contract type
    const needsBarrier = ['HIGH', 'LOW', 'ONETOUCH', 'NOTOUCH'].includes(contractType);
    const needsDoubleBarrier = ['EXPIRYRANGE', 'EXPIRYMISS'].includes(contractType);
    const needsDigit = ['DIGITOVER', 'DIGITUNDER', 'DIGITMATCH', 'DIGITDIFF'].includes(contractType);
    const needsEvenOdd = ['DIGITEVEN', 'DIGITODD'].includes(contractType);

    if (needsBarrier) {
        return (
            <div className='contract-parameters'>
                <label className='contract-parameters__label'>{localize('Barrier')}</label>
                <input
                    type='number'
                    className='contract-parameters__input'
                    value={barrier || 0}
                    onChange={e => onBarrierChange?.(parseFloat(e.target.value))}
                    step='0.01'
                    placeholder='Enter barrier'
                />
            </div>
        );
    }

    if (needsDoubleBarrier) {
        return (
            <div className='contract-parameters'>
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
        );
    }

    if (needsDigit) {
        return (
            <div className='contract-parameters'>
                <label className='contract-parameters__label'>
                    {contractType === 'DIGITOVER'
                        ? localize('Over Digit')
                        : contractType === 'DIGITUNDER'
                          ? localize('Under Digit')
                          : localize('Selected Digit')}
                </label>
                <div className='contract-parameters__digit-selector'>
                    {Array.from({ length: 10 }, (_, i) => i).map(digit => (
                        <button
                            key={digit}
                            type='button'
                            className={`contract-parameters__digit-btn ${
                                selectedDigit === digit ? 'active' : ''
                            }`}
                            onClick={() => onDigitChange?.(digit)}
                        >
                            {digit}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (needsEvenOdd) {
        return (
            <div className='contract-parameters'>
                <label className='contract-parameters__label'>{localize('Prediction')}</label>
                <div className='contract-parameters__even-odd'>
                    <div className='contract-parameters__prediction'>
                        {contractType === 'DIGITEVEN' ? localize('Even') : localize('Odd')}
                    </div>
                </div>
            </div>
        );
    }

    // No special parameters needed
    return null;
};
