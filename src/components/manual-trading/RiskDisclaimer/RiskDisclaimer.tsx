import React from 'react';
import { localize } from '@deriv-com/translations';
import './risk-disclaimer.scss';

const RiskDisclaimer: React.FC = () => {
    return (
        <div className='risk-disclaimer'>
            <div className='risk-disclaimer__content'>
                <p>
                    {localize(
                        'Trading derivatives and CFDs involves a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite. There is a possibility that you could sustain a loss of some or all of your initial investment and therefore you should not invest money that you cannot afford to lose.'
                    )}
                </p>
                <p>
                    {localize(
                        'Smart Trades Pro provides educational and trading tools. We do not provide investment advice or recommendations. All trading decisions are made solely by the user.'
                    )}
                </p>
            </div>
        </div>
    );
};

export default RiskDisclaimer;
