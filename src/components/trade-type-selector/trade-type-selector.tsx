import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Localize } from '@deriv-com/translations';
import './trade-type-selector.scss';

interface TradeTypeSelectorProps {
    onSelect: (tradeType: 'multipliers' | 'options') => void;
    onClose: () => void;
}

const TradeTypeSelector: React.FC<TradeTypeSelectorProps> = observer(({ onSelect, onClose }) => {
    const [selectedType, setSelectedType] = useState<'multipliers' | 'options'>('multipliers');

    const handleSelect = () => {
        onSelect(selectedType);
        onClose();
    };

    return (
        <div className='trade-type-selector-overlay' onClick={onClose}>
            <div className='trade-type-selector' onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className='trade-type-selector__header'>
                    <h2>
                        <Localize i18n_default_text='Trade Type' />
                    </h2>
                    <button className='close-button' onClick={onClose}>
                        <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
                            <path d='M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z' />
                        </svg>
                    </button>
                </div>

                {/* Trade Types */}
                <div className='trade-type-selector__types'>
                    {/* Multipliers */}
                    <div
                        className={`trade-type-card ${selectedType === 'multipliers' ? 'selected' : ''}`}
                        onClick={() => setSelectedType('multipliers')}
                    >
                        <div className='trade-type-card__icon'>
                            <svg width='40' height='40' viewBox='0 0 40 40' fill='none'>
                                <circle cx='20' cy='20' r='18' stroke='currentColor' strokeWidth='2' />
                                <path
                                    d='M14 20h12M20 14v12'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                />
                            </svg>
                        </div>
                        <div className='trade-type-card__content'>
                            <h3>
                                <Localize i18n_default_text='Multipliers' />
                            </h3>
                            <p>
                                <Localize i18n_default_text='Amplify gains, limit losses. Close any time.' />
                            </p>
                        </div>
                        <div className='trade-type-card__radio'>
                            <div className='radio-circle'>
                                {selectedType === 'multipliers' && <div className='radio-circle__inner' />}
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div
                        className={`trade-type-card ${selectedType === 'options' ? 'selected' : ''}`}
                        onClick={() => setSelectedType('options')}
                    >
                        <div className='trade-type-card__icon'>
                            <svg width='40' height='40' viewBox='0 0 40 40' fill='none'>
                                <path
                                    d='M12 28l8-8 8 8'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M12 12l8 8 8-8'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                            </svg>
                        </div>
                        <div className='trade-type-card__content'>
                            <h3>
                                <Localize i18n_default_text='Options' />
                            </h3>
                            <p>
                                <Localize i18n_default_text='Predict upside or downside' />
                            </p>
                        </div>
                        <div className='trade-type-card__radio'>
                            <div className='radio-circle'>
                                {selectedType === 'options' && <div className='radio-circle__inner' />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className='trade-type-selector__footer'>
                    <button className='trade-type-selector__apply' onClick={handleSelect}>
                        <Localize i18n_default_text='Apply' />
                    </button>
                    <p className='trade-type-selector__disclaimer'>
                        <Localize i18n_default_text="Trade types are powered by Deriv's proprietary Random Number Generator (RNG)" />
                    </p>
                </div>
            </div>
        </div>
    );
});

export default TradeTypeSelector;
