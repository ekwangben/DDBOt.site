import React from 'react';
import { localize } from '@deriv-com/translations';
import './trade-type-selector.scss';

// Trade type categories (matching DTrader)
export type TradeCategory = 'rise-fall' | 'high-low' | 'digits' | 'turbo' | 'vanillas';

// Contract types mapping
export interface ContractTypeInfo {
    value: string;
    label: string;
    category: TradeCategory;
    description: string;
}

export const CONTRACT_TYPES: ContractTypeInfo[] = [
    // Rise & Fall
    { value: 'CALL', label: localize('Rise'), category: 'rise-fall', description: localize('Starts higher than entry spot') },
    { value: 'PUT', label: localize('Fall'), category: 'rise-fall', description: localize('Starts lower than entry spot') },
    { value: 'CALL_EVEN', label: localize('Rise (Even)'), category: 'rise-fall', description: localize('Ends higher on even seconds') },
    { value: 'PUT_EVEN', label: localize('Fall (Even)'), category: 'rise-fall', description: localize('Ends lower on even seconds') },
    { value: 'CALL_ODD', label: localize('Rise (Odd)'), category: 'rise-fall', description: localize('Ends higher on odd seconds') },
    { value: 'PUT_ODD', label: localize('Fall (Odd)'), category: 'rise-fall', description: localize('Ends lower on odd seconds') },

    // High & Low
    { value: 'ONETOUCH', label: localize('Touch'), category: 'high-low', description: localize('Touches barrier at any point') },
    { value: 'NOTOUCH', label: localize('No Touch'), category: 'high-low', description: localize('Never touches barrier') },
    { value: 'HIGH', label: localize('High'), category: 'high-low', description: localize('Ends higher than barrier') },
    { value: 'LOW', label: localize('Low'), category: 'high-low', description: localize('Ends lower than barrier') },

    // Digits
    { value: 'DIGITOVER', label: localize('Over'), category: 'digits', description: localize('Last digit is over selected digit') },
    { value: 'DIGITUNDER', label: localize('Under'), category: 'digits', description: localize('Last digit is under selected digit') },
    { value: 'DIGITMATCH', label: localize('Matches'), category: 'digits', description: localize('Last digit matches selected digit') },
    { value: 'DIGITDIFF', label: localize('Differs'), category: 'digits', description: localize('Last digit differs from selected digit') },
    { value: 'DIGITEVEN', label: localize('Even'), category: 'digits', description: localize('Last digit is even') },
    { value: 'DIGITODD', label: localize('Odd'), category: 'digits', description: localize('Last digit is odd') },

    // Turbo
    { value: 'CALL', label: localize('Rise (5 ticks)'), category: 'turbo', description: localize('5 tick rise/fall') },
    { value: 'PUT', label: localize('Fall (5 ticks)'), category: 'turbo', description: localize('5 tick rise/fall') },

    // Vanillas
    { value: 'CALL', label: localize('Call'), category: 'vanillas', description: localize('Standard call option') },
    { value: 'PUT', label: localize('Put'), category: 'vanillas', description: localize('Standard put option') },
];

interface TradeTypeSelectorProps {
    selectedCategory: TradeCategory;
    selectedContractType: string;
    onCategoryChange: (category: TradeCategory) => void;
    onContractTypeChange: (contractType: string) => void;
}

export const TradeTypeSelector: React.FC<TradeTypeSelectorProps> = ({
    selectedCategory,
    selectedContractType,
    onCategoryChange,
    onContractTypeChange,
}) => {
    const categories: { value: TradeCategory; label: string }[] = [
        { value: 'rise-fall', label: localize('Up/Down') },
        { value: 'high-low', label: localize('High/Low') },
        { value: 'digits', label: localize('Digits') },
        { value: 'turbo', label: localize('Turbo') },
        { value: 'vanillas', label: localize('Vanillas') },
    ];

    const getContractTypesForCategory = (category: TradeCategory) => {
        return CONTRACT_TYPES.filter(ct => ct.category === category);
    };

    return (
        <div className='trade-type-selector'>
            {/* Category Tabs */}
            <div className='trade-type-selector__categories'>
                {categories.map(cat => (
                    <button
                        key={cat.value}
                        className={`trade-type-selector__category-btn ${
                            selectedCategory === cat.value ? 'active' : ''
                        }`}
                        onClick={() => onCategoryChange(cat.value)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Contract Type Buttons */}
            <div className='trade-type-selector__contracts'>
                {getContractTypesForCategory(selectedCategory).map(contract => (
                    <button
                        key={contract.value}
                        className={`trade-type-selector__contract-btn ${
                            selectedContractType === contract.value ? 'active' : ''
                        }`}
                        onClick={() => onContractTypeChange(contract.value)}
                        title={contract.description}
                    >
                        {contract.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
