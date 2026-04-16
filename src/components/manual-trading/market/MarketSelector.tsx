import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { localize } from '@deriv-com/translations';
import { api_base } from '@/external/bot-skeleton';
import { MarketIcon } from '../../market/market-icon';
import { LabelPairedChevronDownCaptionBoldIcon } from '@deriv/quill-icons';
import './market-selector.scss';

interface MarketSelectorProps {
    onSymbolChange: (symbol: string) => void;
    currentSymbol: string;
}

export const MarketSelector: React.FC<MarketSelectorProps> = ({ onSymbolChange, currentSymbol }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('Derived');
    const [symbols, setSymbols] = useState<any[]>([]);
    const [tick, setTick] = useState<any>(null);

    useEffect(() => {
        const fetchSymbols = async () => {
            if (!api_base.api) return;
            try {
                const response = await api_base.api.send({ active_symbols: 'brief', product_type: 'basic' });
                if (response.active_symbols) {
                    setSymbols(response.active_symbols);
                }
            } catch (err) {}
        };
        fetchSymbols();
    }, []);

    useEffect(() => {
        if (!api_base.api || !currentSymbol) return;

        let subscription: any;
        const subscribeTick = async () => {
            try {
                const response = await api_base.api!.send({
                    ticks: currentSymbol,
                    subscribe: 1
                });

                if (response.subscription) {
                    subscription = response.subscription;
                }

                const sub = api_base.api!.onMessage().subscribe(({ data }: any) => {
                    if (data.msg_type === 'tick' && data.tick && data.tick.symbol === currentSymbol) {
                        setTick(data.tick);
                    }
                });

                return () => {
                    sub.unsubscribe();
                    if (subscription) {
                        api_base.api!.send({ forget: subscription.id });
                    }
                };
            } catch (err) {}
        };

        const cleanupPromise = subscribeTick();
        return () => {
            cleanupPromise.then(cleanup => cleanup && cleanup());
        };
    }, [currentSymbol]);

    const filteredSymbols = symbols.filter(s => {
        const matchesSearch = s.display_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'All' || s.market_display_name.includes(activeTab);
        return matchesSearch && matchesTab;
    });

    const currentSymbolData = symbols.find(s => s.symbol === currentSymbol);

    return (
        <div className='market-selector'>
            <div className='manual-trading__market-selector-wrapper' onClick={() => setIsOpen(true)}>
                <div className='market-info'>
                    <div className='market-name-row'>
                        <div className='market-icon-wrapper'>
                            <MarketIcon type={currentSymbol} size='sm' />
                        </div>
                        <span className='market-name'>{currentSymbolData?.display_name || currentSymbol}</span>
                        <LabelPairedChevronDownCaptionBoldIcon className='chevron-icon' />
                    </div>
                    <span className={`market-price-change ${tick ? 'live' : ''}`}>
                        {tick ? (
                            <>
                                <span className='price'>{tick.quote}</span>
                                <span className='indicator'>● LIVE</span>
                            </>
                        ) : (
                            'Retrieving price...'
                        )}
                    </span>
                </div>
            </div>

            {isOpen && createPortal(
                <>
                    <div className='market-selector__overlay' onClick={() => setIsOpen(false)} />
                    <div className='market-selector__modal'>
                        <div className='market-selector__search'>
                            <input
                                type='text'
                                placeholder={localize('Search markets')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className='market-selector__tabs'>
                            {['All', 'Derived', 'Forex', 'Stock', 'Commodities'].map(tab => (
                                <button
                                    key={tab}
                                    className={activeTab === tab ? 'active' : ''}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className='market-selector__list'>
                            {filteredSymbols.map(s => (
                                <div
                                    key={s.symbol}
                                    className='market-selector__item'
                                    onClick={() => {
                                        onSymbolChange(s.symbol);
                                        setIsOpen(false);
                                    }}
                                >
                                    <div className='icon'>
                                        <MarketIcon type={s.symbol} size='sm' />
                                    </div>
                                    <div className='info'>
                                        <span className='name'>{s.display_name}</span>
                                        <span className='submarket'>{s.submarket_display_name}</span>
                                    </div>
                                    <div className='fav'>☆</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>,
                document.getElementById('modal_root') || document.body
            )}
        </div>
    );
};
