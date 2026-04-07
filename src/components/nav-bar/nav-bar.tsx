import React from 'react';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import {
    LabelPairedChartLineCaptionRegularIcon,
    LabelPairedObjectsColumnCaptionRegularIcon,
    LabelPairedPuzzlePieceTwoCaptionBoldIcon,
    LabelPairedShieldCheckCaptionRegularIcon,
    LabelPairedUsersCaptionRegularIcon,
} from '@deriv/quill-icons/LabelPaired';
import { LegacyBuysellIcon, LegacyGuide1pxIcon } from '@deriv/quill-icons/Legacy';
import { Localize } from '@deriv-com/translations';
import './nav-bar.scss';

type TNavBarProps = {
    activeTab: number;
    onTabChange: (index: number) => void;
};

const TABS = [
    {
        id: 'id-dbot-dashboard',
        label: 'Dashboard',
        icon: LabelPairedObjectsColumnCaptionRegularIcon,
    },
    {
        id: 'id-bot-builder',
        label: 'Bot Builder',
        icon: LabelPairedPuzzlePieceTwoCaptionBoldIcon,
    },
    {
        id: 'id-free-bots',
        label: 'Free Bots',
        icon: LabelPairedChartLineCaptionRegularIcon,
    },
    {
        id: 'id-analysis-tool',
        label: 'Analysis Tool',
        icon: LabelPairedChartLineCaptionRegularIcon,
    },
    {
        id: 'id-accumulators',
        label: 'Strategy',
        icon: LabelPairedChartLineCaptionRegularIcon,
    },
    {
        id: 'id-charts',
        label: 'Charts',
        icon: LabelPairedChartLineCaptionRegularIcon,
    },
    {
        id: 'id-tutorials',
        label: 'Tutorial',
        icon: LegacyGuide1pxIcon,
    },
    {
        id: 'id-copy-trading',
        label: 'Copy Trading',
        icon: LabelPairedUsersCaptionRegularIcon,
    },
    {
        id: 'id-risk-management',
        label: 'Risk Management',
        icon: LabelPairedShieldCheckCaptionRegularIcon,
    },
];

const NavBar: React.FC<TNavBarProps> = ({ activeTab, onTabChange }) => {
    const navigate = useNavigate();

    // Sync hash-based navigation with React Router for deep linking
    const handleTabChange = (index: number) => {
        onTabChange(index);
        // Navigate to root with hash for URL consistency
        navigate(`/#${getHashForTab(index)}`);
    };

    const getHashForTab = (index: number) => {
        const hashes = [
            'dashboard',
            'bot_builder',
            'free_bots',
            'analysis_tool',
            'accumulators',
            'chart',
            'tutorial',
            'copy_trading',
            'risk_management',
            'manual_trading',
        ];
        return hashes[index] || 'dashboard';
    };

    return (
        <div className='nav-bar'>
            <div className='nav-bar__tabs'>
                {TABS.map((tab, index) => {
                    const IconComponent = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            id={tab.id}
                            className={classNames('nav-bar__tab', {
                                'nav-bar__tab--active': activeTab === index,
                            })}
                            onClick={() => handleTabChange(index)}
                            type='button'
                        >
                            <IconComponent height='16px' width='16px' fill='currentColor' />
                            <span className='nav-bar__tab-label'>
                                <Localize i18n_default_text={tab.label} />
                            </span>
                        </button>
                    );
                })}
                {/* Manual Trading Tab - Integrated into main tab system */}
                <button
                    id='id-manual-trading'
                    className={classNames('nav-bar__tab', {
                        'nav-bar__tab--active': activeTab === 9,
                    })}
                    onClick={() => handleTabChange(9)}
                    type='button'
                >
                    <LegacyBuysellIcon height='16px' width='16px' fill='currentColor' />
                    <span className='nav-bar__tab-label'>
                        <Localize i18n_default_text='Manual Trading' />
                    </span>
                </button>
            </div>
            <div className='nav-bar__actions'>
                <button className='nav-bar__run-button' type='button'>
                    <svg width='12' height='14' viewBox='0 0 12 14' fill='none'>
                        <path d='M0 0L12 7L0 14V0Z' fill='currentColor' />
                    </svg>
                    <Localize i18n_default_text='Run' />
                </button>
                <div className='nav-bar__status'>
                    <span className='nav-bar__status-text'>
                        <Localize i18n_default_text='Bot is not running' />
                    </span>
                </div>
            </div>
        </div>
    );
};

export default NavBar;
