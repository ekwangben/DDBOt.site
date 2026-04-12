import React, { useEffect, useState } from 'react';
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
    description_link?: string;
}

export const CONTRACT_TYPES: ContractTypeInfo[] = [
    // Accumulators
    {
        value: 'ACCU',
        label: localize('Accumulators'),
        category: 'accumulators',
        group: localize('Accumulators'),
        description: localize('Accumulators'),
        description_link: 'https://docs.deriv.com/trade-types/accumulators/',
        isNew: true,
        icon: (
            <div className='dual-icons'>
                <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <path d='M2 18l4-6 4 4 4-8 4 2 4-6' stroke='#4CAF50' strokeWidth='2.5' />
                </svg>
            </div>
        ),
    },
    // Vanillas
    {
        value: 'VANILLA',
        label: localize('Call/Put'),
        category: 'options',
        group: localize('Vanillas'),
        description: localize('Vanillas'),
        isNew: true,
        icon: (
            <div className='dual-icons'>
                <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <path d='M4 16l6-10 4 6 6-8' stroke='#4CAF50' strokeWidth='2.5' />
                </svg>
                <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <path d='M4 8l6 10 4-6 6 8' stroke='#FF4444' strokeWidth='2.5' />
                </svg>
            </div>
        ),
    },
    // Turbos
    {
        value: 'TURBO',
        label: localize('Turbos'),
        category: 'options',
        group: localize('Turbos'),
        description: localize('Turbos'),
        isNew: true,
        icon: (
            <div className='dual-icons'>
                <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <path d='M4 16l6-10 4 6 6-8' stroke='#4CAF50' strokeWidth='2.5' />
                </svg>
                <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <path d='M4 8l6 10 4-6 6 8' stroke='#FF4444' strokeWidth='2.5' />
                </svg>
            </div>
        ),
    },
    // Multipliers
    {
        value: 'MULTUP',
        label: localize('Multipliers'),
        category: 'multipliers',
        group: localize('Multipliers'),
        description: localize('Multipliers'),
        icon: (
            <div className='dual-icons'>
                <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <path d='M4 16l6-10 4 6 6-8' stroke='#4CAF50' strokeWidth='2.5' />
                </svg>
                <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <path d='M4 8l6 10 4-6 6 8' stroke='#FF4444' strokeWidth='2.5' />
                </svg>
            </div>
        ),
    },
    // Ups & Downs
    {
        value: 'CALL',
        label: localize('Rise/Fall'),
        category: 'options',
        group: localize('Ups & Downs'),
        description: localize('Starts higher/lower than entry spot'),
        icon: (
            <div className='dual-icons'>
                <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <path d='M4 16l6-10 4 6 6-8' stroke='#4CAF50' strokeWidth='2.5' />
                </svg>
                <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <path d='M4 8l6 10 4-6 6 8' stroke='#FF4444' strokeWidth='2.5' />
                </svg>
            </div>
        ),
    },
    {
        value: 'CALLHIGHER',
        label: localize('Higher/Lower'),
        category: 'options',
        group: localize('Ups & Downs'),
        description: localize('Higher/Lower'),
        icon: (
            <div className='dual-icons'>
                <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <path d='M4 16l6-10 4 6 6-8' stroke='#4CAF50' strokeWidth='2.5' />
                </svg>
                <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <path d='M4 8l6 10 4-6 6 8' stroke='#FF4444' strokeWidth='2.5' />
                </svg>
            </div>
        ),
    },
    // Highs & Lows
    {
        value: 'ONETOUCH',
        label: localize('Touch/No Touch'),
        category: 'options',
        group: localize('Ups & Downs'), // Placed here for better visibility alongside Higher/Lower
        description: localize('Touch/No Touch'),
        icon: (
            <div className='dual-icons'>
                <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <path d='M4 16l6-10 4 6 6-8' stroke='#4CAF50' strokeWidth='2.5' />
                </svg>
                <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <path d='M4 8l6 10 4-6 6 8' stroke='#FF4444' strokeWidth='2.5' />
                </svg>
            </div>
        ),
    },
    // Digits
    {
        value: 'DIGITMATCH',
        label: localize('Matches/Differs'),
        category: 'options',
        group: localize('Digits'),
        description: localize('Matches/Differs'),
        icon: (
            <div className='dual-icons'>
                <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <path d='M4 16l6-10 4 6 6-8' stroke='#4CAF50' strokeWidth='2.5' />
                </svg>
                <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <path d='M4 8l6 10 4-6 6 8' stroke='#FF4444' strokeWidth='2.5' />
                </svg>
            </div>
        ),
    },
    {
        value: 'DIGITOVER',
        label: localize('Over/Under'),
        category: 'options',
        group: localize('Digits'),
        description: localize('Over/Under'),
        description_link: 'https://deriv.com/trade-types/digits/',
        icon: (
            <div className='dual-icons'>
                <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <path d='M4 16l6-10 4 6 6-8' stroke='#4CAF50' strokeWidth='2.5' />
                </svg>
                <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <path d='M4 8l6 10 4-6 6 8' stroke='#FF4444' strokeWidth='2.5' />
                </svg>
            </div>
        ),
    },
    {
        value: 'DIGITEVEN',
        label: localize('Even/Odd'),
        category: 'options',
        group: localize('Digits'),
        description: localize('Even/Odd'),
        icon: (
            <div className='dual-icons'>
                <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <path d='M4 16l6-10 4 6 6-8' stroke='#4CAF50' strokeWidth='2.5' />
                </svg>
                <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <path d='M4 8l6 10 4-6 6 8' stroke='#FF4444' strokeWidth='2.5' />
                </svg>
            </div>
        ),
    },
];

interface TradeTypeSelectorProps {
    selectedContractType: string;
    onCategoryChange: (category: TradeCategory) => void;
    onContractTypeChange: (contractType: string) => void;
}

const CategoryIcon = ({ category }: { category: TradeCategory }) => {
    switch (category) {
        case 'all':
            return (
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <rect x='3' y='3' width='6' height='6' />
                    <rect x='15' y='3' width='6' height='6' />
                    <rect x='3' y='15' width='6' height='6' />
                    <rect x='15' y='15' width='6' height='6' />
                </svg>
            );
        case 'multipliers':
            return (
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#333' strokeWidth='1.5'>
                    <path d='M18 6L6 18M6 6l12 12' />
                </svg>
            );
        case 'options':
            return (
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#333' strokeWidth='1.5'>
                    <path d='m7 13 5 5 5-5M17 11l-5-5-5 5' />
                </svg>
            );
        case 'accumulators':
            return (
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#333' strokeWidth='1.5'>
                    <path d='M3 17l4-4 4 4 4-4 6 6' />
                </svg>
            );
        default:
            return null;
    }
};

export const TradeTypeSelector: React.FC<TradeTypeSelectorProps> = ({
    selectedContractType,
    onCategoryChange,
    onContractTypeChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<TradeCategory>('all');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

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

    const groupedContracts = filteredContracts.reduce(
        (acc, ct) => {
            const group = ct.group;
            if (!acc[group]) acc[group] = { contracts: [], isNew: ct.isNew };
            acc[group].contracts.push(ct);
            return acc;
        },
        {} as Record<string, { contracts: ContractTypeInfo[]; isNew?: boolean }>
    );

    const currentContract = CONTRACT_TYPES.find(ct => ct.value === selectedContractType) || CONTRACT_TYPES[0];

    const handleContractSelect = (contract: ContractTypeInfo) => {
        onContractTypeChange(contract.value);
        onCategoryChange(contract.category);
        setIsOpen(false);
    };

    return (
        <div className='trade-type-selector'>
            <div className='trade-type-selector__info-header'>
                <a
                    href={currentContract.description_link || '#'}
                    className='learn-more-link'
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    {localize('Learn about this trade type')}
                </a>
            </div>
            <button
                className={`trade-type-selector__trigger${selectedContractType ? ' trade-type-selector__trigger--active' : ''}`}
                onClick={() => setIsOpen(true)}
            >
                <div className='trade-type-selector__trigger-content'>
                    <svg
                        className='back-arrow'
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    >
                        <path d='m15 18-6-6 6-6' />
                    </svg>
                    <div className='icon-wrapper'>{currentContract.icon}</div>
                    <span className='trade-type-selector__trigger-label'>{currentContract.label}</span>
                </div>
            </button>

            {isOpen && (
                <>
                    <div className='trade-type-selector__overlay' onClick={() => setIsOpen(false)} />
                    <div className='trade-type-selector__modal'>
                        <div className='trade-type-selector__mobile-header'>
                            <span>{localize('Trade types')}</span>
                            <button className='close-btn' onClick={() => setIsOpen(false)}>
                                <svg
                                    width='20'
                                    height='20'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                >
                                    <line x1='18' y1='6' x2='6' y2='18'></line>
                                    <line x1='6' y1='6' x2='18' y2='18'></line>
                                </svg>
                            </button>
                        </div>
                        <div className='trade-type-selector__body'>
                            <div className='trade-type-selector__sidebar'>
                                <div className='trade-type-selector__sidebar-title'>
                                    <span>{localize('Trade types')}</span>
                                </div>
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
                                        <div className='category-suffix'>
                                            {cat.isNew && <span className='badge-new'>{localize('NEW!')}</span>}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className='trade-type-selector__main-content'>
                                <div className='trade-type-selector__search-wrapper'>
                                    <div className='trade-type-selector__search'>
                                        <svg
                                            className='search-icon'
                                            width='18'
                                            height='18'
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                        >
                                            <circle cx='11' cy='11' r='8' />
                                            <path d='m21 21-4.3-4.3' />
                                        </svg>
                                        <input
                                            type='text'
                                            placeholder={localize('Search')}
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className='trade-type-selector__learn-more'>
                                    <div className='learn-more-block'>
                                        <span>{localize('Learn more about trade types')}</span>
                                        <svg
                                            width='16'
                                            height='16'
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                        >
                                            <path d='m9 18 6-6-6-6' />
                                        </svg>
                                    </div>
                                </div>
                                <div className='trade-type-selector__scroll-area'>
                                    {Object.entries(groupedContracts).map(([group, data]) => (
                                        <div key={group} className='trade-type-selector__group'>
                                            <div className='group-header'>
                                                <span className='group-title'>{group}</span>
                                                {data.isNew && <span className='badge-new'>{localize('NEW!')}</span>}
                                            </div>
                                            <div className='trade-type-selector__contracts-grid'>
                                                {data.contracts.map(contract => (
                                                    <div
                                                        key={contract.value}
                                                        className={`trade-type-selector__contract-card ${selectedContractType === contract.value ? 'active' : ''}`}
                                                        onClick={() => handleContractSelect(contract)}
                                                    >
                                                        <div className='card-icon'>{contract.icon}</div>
                                                        <div className='card-body'>
                                                            <span className='card-name'>{contract.label}</span>
                                                        </div>
                                                        {selectedContractType === contract.value && (
                                                            <svg
                                                                className='check-icon'
                                                                width='16'
                                                                height='16'
                                                                viewBox='0 0 24 24'
                                                                fill='none'
                                                                stroke='#4CAF50'
                                                                strokeWidth='3'
                                                            >
                                                                <path d='M20 6L9 17l-5-5' />
                                                            </svg>
                                                        )}
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
