import React, { useState } from 'react';
import { localize } from '@deriv-com/translations';
import './trade-type-selector.scss';

export type TradeCategory = 'multipliers' | 'options' | 'accumulators' | 'turbos' | 'vanillas';

export interface ContractTypeInfo {
    value: string;
    label: string;
    category: TradeCategory;
    group: string;
    description: string;
}

export const CONTRACT_TYPES: ContractTypeInfo[] = [
    // Multipliers
    { value: 'MULTUP', label: localize('Multipliers'), category: 'multipliers', group: localize('Multipliers'), description: localize('Multipliers') },

    // Accumulators
    { value: 'ACCU', label: localize('Accumulators'), category: 'accumulators', group: localize('Accumulators'), description: localize('Accumulators') },

    // Ups & Downs
    { value: 'CALL', label: localize('Rise/Fall'), category: 'options', group: localize('Ups & Downs'), description: localize('Starts higher/lower than entry spot') },
    { value: 'HIGH', label: localize('Higher/Lower'), category: 'options', group: localize('Ups & Downs'), description: localize('Ends higher/lower than barrier') },

    // Touch & No Touch
    { value: 'ONETOUCH', label: localize('Touch/No Touch'), category: 'options', group: localize('Touch & No Touch'), description: localize('Touches/Never touches barrier') },

    // Digits
    { value: 'DIGITMATCH', label: localize('Matches/Differs'), category: 'options', group: localize('Digits'), description: localize('Last digit matches/differs from selected digit') },
    { value: 'DIGITEVEN', label: localize('Even/Odd'), category: 'options', group: localize('Digits'), description: localize('Last digit is even/odd') },
    { value: 'DIGITOVER', label: localize('Over/Under'), category: 'options', group: localize('Digits'), description: localize('Last digit is over/under selected digit') },

    // Turbos
    { value: 'TURBOS', label: localize('Turbos'), category: 'turbos', group: localize('Turbos'), description: localize('Turbos') },

    // Vanillas
    { value: 'VANILLAS', label: localize('Vanillas'), category: 'vanillas', group: localize('Vanillas'), description: localize('Vanillas') },
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
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<TradeCategory>(selectedCategory);

    const categories: { value: TradeCategory; label: string; isNew?: boolean }[] = [
        { value: 'options', label: localize('Options') },
        { value: 'multipliers', label: localize('Multipliers') },
        { value: 'accumulators', label: localize('Accumulators'), isNew: true },
        { value: 'turbos', label: localize('Turbos'), isNew: true },
        { value: 'vanillas', label: localize('Vanillas'), isNew: true },
    ];

    const filteredContracts = CONTRACT_TYPES.filter(ct => {
        const matchesSearch = ct.label.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'options' ? (ct.category === 'options') : (ct.category === activeCategory);
        return matchesSearch && matchesCategory;
    });

    const groupedContracts = filteredContracts.reduce((acc, ct) => {
        if (!acc[ct.group]) acc[ct.group] = [];
        acc[ct.group].push(ct);
        return acc;
    }, {} as Record<string, ContractTypeInfo[]>);

    const currentContract = CONTRACT_TYPES.find(ct => ct.value === selectedContractType) || CONTRACT_TYPES[0];

    return (
        <div className='trade-type-selector'>
            <button className='trade-type-selector__trigger' onClick={() => setIsOpen(true)}>
                <span className='trade-type-selector__trigger-icon'>
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M3 3v18h18'/><path d='m19 9-5 5-4-4-3 3'/></svg>
                </span>
                <span className='trade-type-selector__trigger-label'>{currentContract.label}</span>
                <span className='chevron'>▼</span>
            </button>

            {isOpen && (
                <>
                    <div className='trade-type-selector__overlay' onClick={() => setIsOpen(false)} />
                    <div className='trade-type-selector__modal'>
                        <div className='trade-type-selector__header'>
                            <h3>{localize('Trade types')}</h3>
                            <button className='close-btn' onClick={() => setIsOpen(false)}>×</button>
                        </div>

                        <div className='trade-type-selector__search'>
                            <span className='search-icon'>🔍</span>
                            <input
                                type='text'
                                placeholder={localize('Search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className='trade-type-selector__body'>
                            <div className='trade-type-selector__categories'>
                                {categories.map(cat => (
                                    <button
                                        key={cat.value}
                                        className={`trade-type-selector__category-btn ${activeCategory === cat.value ? 'active' : ''}`}
                                        onClick={() => setActiveCategory(cat.value)}
                                    >
                                        <span>{cat.label}</span>
                                        {cat.isNew && <span className='badge'>{localize('New!')}</span>}
                                    </button>
                                ))}
                            </div>

                            <div className='trade-type-selector__content'>
                                {Object.entries(groupedContracts).map(([group, contracts]) => (
                                    <div key={group} className='trade-type-selector__group'>
                                        <h4>{group}</h4>
                                        <div className='trade-type-selector__contracts-grid'>
                                            {contracts.map(contract => (
                                                <div
                                                    key={contract.value}
                                                    className={`trade-type-selector__contract-card ${selectedContractType === contract.value ? 'active' : ''}`}
                                                    onClick={() => {
                                                        onContractTypeChange(contract.value);
                                                        onCategoryChange(contract.category);
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    <span className='icon'>
                                                        <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M3 3v18h18'/><path d='m19 9-5 5-4-4-3 3'/></svg>
                                                    </span>
                                                    <span className='name'>{contract.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
