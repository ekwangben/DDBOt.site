import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LabelPairedChevronDownCaptionRegularIcon,
    LabelPairedPuzzlePieceTwoCaptionBoldIcon,
} from '@deriv/quill-icons/LabelPaired';
import { useDevice } from '@deriv-com/ui';
import './app-logo.scss';

export const AppLogo = () => {
    const { isDesktop } = useDevice();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeMode, setActiveMode] = useState<'bot' | 'manual'>('bot');

    if (!isDesktop) return null;

    const handleModeSelect = (mode: 'bot' | 'manual') => {
        setActiveMode(mode);
        setIsDropdownOpen(false);
        localStorage.setItem('trading_mode', mode);
        if (mode === 'manual') {
            navigate('/manual-trading');
        }
        if (mode === 'bot') {
            navigate('/');
        }
    };

    return (
        <div className='app-header__logo-wrapper'>
            <div className='app-header__logo-dropdown' onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <span className='app-header__logo-text'>smart trades pro</span>
                <LabelPairedChevronDownCaptionRegularIcon
                    className={`app-header__logo-chevron ${isDropdownOpen ? 'rotated' : ''}`}
                    height='16px'
                    width='16px'
                />
            </div>
            {isDropdownOpen && (
                <div className='app-header__logo-dropdown-menu'>
                    <div
                        className={`dropdown-menu-item ${activeMode === 'bot' ? 'active' : ''}`}
                        onClick={() => handleModeSelect('bot')}
                    >
                        <LabelPairedPuzzlePieceTwoCaptionBoldIcon height='24px' width='24px' />
                        <div className='dropdown-menu-item__text'>
                            <span className='dropdown-menu-item__title'>Bot Trading</span>
                            <span className='dropdown-menu-item__subtitle'>Automated trading strategies</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
