import React, { useState } from 'react';
import { localize } from '@deriv-com/translations';
import './trade-type-selector.scss';

export type TradeCategory = 'all' | 'multipliers' | 'options' | 'accumulators';

export interface ContractTypeInfo {
    value: string;
    label: string;
    category: TradeCategory;
    group: string;
    description: string;
    isNew?: boolean;
    icon?: React.ReactNode;
}

export const CONTRACT_TYPES: ContractTypeInfo[] = [
    // Accumulators
    {
        value: 'ACCU',
        label: localize('Accumulators'),
        category: 'accumulators',
        group: localize('Accumulators'),
        description: localize('Accumulators'),
        isNew: true,
        icon: <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M3 17l6-6 4 4 8-8'/><path d='M17 7h4v4'/></svg>
    },

    // Vanillas
    {
        value: 'VANILLAS',
        label: localize('Call/Put'),
        category: 'options',
        group: localize('Vanillas'),
        description: localize('Vanillas'),
        isNew: true,
        icon: <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M21 12c0 1.66-4 3-9 3s-9-1.34-9-3'/><path d='M3 5c0 1.66 4 3 9 3s9-1.34 9-3'/><path d='M21 5v14c0 1.66-4 3-9 3s-9-1.34-9-3V5'/></svg>
    },

    // Turbos
    {
        value: 'TURBOS',
        label: localize('Turbos'),
        category: 'options',
        group: localize('Turbos'),
        description: localize('Turbos'),
        isNew: true,
        icon: <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='m13 2-2 10h8L7 22l2-10H1L13 2z'/></svg>
    },

    // Multipliers
    {
        value: 'MULTUP',
        label: localize('Multipliers'),
        category: 'multipliers',
        group: localize('Multipliers'),
        description: localize('Multipliers'),
        icon: <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='m12 15 2 2 4-4'/><rect width='20' height='20' x='2' y='2' rx='2'/><path d='m9 17-2-2 4-4'/></svg>
    },

    // Ups & Downs
    {
        value: 'CALL',
        label: localize('Rise/Fall'),
        category: 'options',
        group: localize('Ups & Downs'),
        description: localize('Starts higher/lower than entry spot'),
        icon: <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='m7 11 5-5 5 5'/><path d='m7 18 5-5 5 5'/></svg>
    },

    // High/Low
    {
        value: 'HIGH',
        label: localize('Higher/Lower'),
        category: 'options',
        group: localize('High/Low'),
        description: localize('Ends higher/lower than barrier'),
        icon: <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M21 12H3'/><path d='m16 7 5 5-5 5'/><path d='m8 17-5-5 5-5'/></svg>
    },

    // Touch/No Touch
    {
        value: 'ONETOUCH',
        label: localize('Touch/No Touch'),
        category: 'options',
        group: localize('Touch/No Touch'),
        description: localize('Touches/Never touches barrier'),
        icon: <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><circle cx='12' cy='12' r='10'/><path d='M12 16v-4'/><path d='M12 8h.01'/></svg>
    },

    // Digits
    {
        value: 'DIGITMATCH',
        label: localize('Matches/Differs'),
        category: 'options',
        group: localize('Digits'),
        description: localize('Last digit matches/differs from selected digit'),
        icon: <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z'/><path d='M13 2v7h7'/></svg>
    },
    {
        value: 'DIGITEVEN',
        label: localize('Even/Odd'),
        category: 'options',
        group: localize('Digits'),
        description: localize('Last digit is even/odd'),
        icon: <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><rect width='18' height='18' x='3' y='3' rx='2'/><path d='M15 9h-6'/><path d='M15 15h-6'/></svg>
    },
    {
        value: 'DIGITOVER',
        label: localize('Over/Under'),
        category: 'options',
        group: localize('Digits'),
        description: localize('Last digit is over/under selected digit'),
        icon: <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='m7 15 5 5 5-5'/><path d='m7 9 5-5 5 5'/></svg>
    },
];

interface TradeTypeSelectorProps {
    selectedCategory: TradeCategory;
    selectedContractType: string;
    onCategoryChange: (category: TradeCategory) => void;
    onContractTypeChange: (contractType: string) => void;
}

const CategoryIcon = ({ category }: { category: TradeCategory }) => {
    switch (category) {
        case 'all':
            return <svg className='category-icon' width='16' height='16' viewBox='0 0 16 16' fill='currentColor'><path d='M2 2h5v5H2V2zm0 7h5v5H2V9zm7-7h5v5H9V2zm0 7h5v5H9V9z'/></svg>;
        case 'multipliers':
            return <svg className='category-icon' width='16' height='16' viewBox='0 0 16 16' fill='currentColor'><path d='M11.5 3.5l-3 3-3-3L4.5 4.5l3 3-3 3 1 1 3-3 3 3 1-1-3-3 3-3z'/></svg>;
        case 'options':
            return <svg className='category-icon' width='16' height='16' viewBox='0 0 16 16' fill='currentColor'><path d='M8 2l-6 4 1 1 5-3.33L13 7l1-1-6-4zm0 12l6-4-1-1-5 3.33L3 9l-1 1 6 4z'/></svg>;
        case 'accumulators':
            return <svg className='category-icon' width='16' height='16' viewBox='0 0 16 16' fill='currentColor'><path d='M2 11l4-4 3 3 5-5-1-1-4 4-3-3-5 5 1 1z'/></svg>;
        default:
            return null;
    }
};

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
        { value: 'all', label: localize('All') },
        { value: 'multipliers', label: localize('Multipliers') },
        { value: 'options', label: localize('Options'), isNew: true },
        { value: 'accumulators', label: localize('Accumulators'), isNew: true },
    ];

    const filteredContracts = CONTRACT_TYPES.filter(ct => {
        const matchesSearch = ct.label.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || ct.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const groupedContracts = filteredContracts.reduce((acc, ct) => {
        const group = ct.group;
        if (!acc[group]) acc[group] = { contracts: [], isNew: ct.isNew };
        acc[group].contracts.push(ct);
        return acc;
    }, {} as Record<string, { contracts: ContractTypeInfo[]; isNew?: boolean }>);

    const currentContract = CONTRACT_TYPES.find(ct => ct.value === selectedContractType) || CONTRACT_TYPES[0];

    const handleContractSelect = (contract: ContractTypeInfo) => {
        onContractTypeChange(contract.value);
        onCategoryChange(contract.category);
        setIsOpen(false);
    };

    return (
        <div className='trade-type-selector'>
            <button className='trade-type-selector__trigger' onClick={() => setIsOpen(true)}>
                <span className='trade-type-selector__trigger-label'>{currentContract.label}</span>
                <span className='chevron'>
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='m6 9 6 6 6-6'/></svg>
                </span>
            </button>

            {isOpen && (
                <>
                    <div className='trade-type-selector__overlay' onClick={() => setIsOpen(false)} />
                    <div className='trade-type-selector__modal'>
                        <div className='trade-type-selector__header'>
                            <div className='trade-type-selector__search'>
                                <svg className='search-icon' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='8'/><path d='m21 21-4.3-4.3'/></svg>
                                <input
                                    type='text'
                                    placeholder={localize('Search')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <button className='close-btn' onClick={() => setIsOpen(false)}>
                                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M18 6 6 18'/><path d='m6 6 12 12'/></svg>
                            </button>
                        </div>

                        <div className='trade-type-selector__body'>
                            <div className='trade-type-selector__sidebar'>
                                {categories.map(cat => (
                                    <button
                                        key={cat.value}
                                        className={`trade-type-selector__category-btn ${activeCategory === cat.value ? 'active' : ''}`}
                                        onClick={() => setActiveCategory(cat.value)}
                                    >
                                        <div className='category-label-wrapper'>
                                            <CategoryIcon category={cat.value} />
                                            <span className='category-label'>{cat.label}</span>
                                        </div>
                                        {cat.isNew && <span className='badge-new'>{localize('NEW')}</span>}
                                    </button>
                                ))}
                            </div>

                            <div className='trade-type-selector__main-content'>
                                <div className='trade-type-selector__scroll-area'>
                                    {Object.entries(groupedContracts).map(([group, data]) => (
                                        <div key={group} className='trade-type-selector__group'>
                                            <div className='group-header'>
                                                <span className='group-title'>{group}</span>
                                                {data.isNew && <span className='badge-new-dot' />}
                                            </div>
                                            <div className='trade-type-selector__contracts-grid'>
                                                {data.contracts.map(contract => (
                                                    <div
                                                        key={contract.value}
                                                        className={`trade-type-selector__contract-card ${selectedContractType === contract.value ? 'active' : ''}`}
                                                        onClick={() => handleContractSelect(contract)}
                                                    >
                                                        <div className='card-header'>
                                                            <span className='card-name'>{contract.label}</span>
                                                            <svg className='info-icon' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><path d='M12 16v-4'/><path d='M12 8h.01'/></svg>
                                                        </div>
                                                        <span className='card-description'>{contract.description}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
