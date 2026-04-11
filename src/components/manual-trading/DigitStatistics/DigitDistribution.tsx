import React from 'react';
import './digit-distribution.scss';

interface DigitDistributionProps {
    stats: number[]; // Array of 10 numbers (counts over 1000 ticks)
}

export const DigitDistribution: React.FC<DigitDistributionProps> = ({ stats }) => {
    const maxVal = Math.max(...stats, 1); // Avoid division by zero
    const total = 1000;
    const average = 10; // 10% is the theoretical average

    return (
        <div className='digit-distribution'>
            <div className='digit-distribution__bars'>
                {stats.map((count, digit) => {
                    const percentage = (count / total) * 100;
                    const height = (percentage / Math.max(percentage, 25)) * 100; // Scaled height
                    const isAboveAverage = percentage > average;

                    return (
                        <div key={digit} className='digit-distribution__column'>
                            <div className='digit-distribution__percentage'>
                                {percentage.toFixed(1)}%
                            </div>
                            <div className='digit-distribution__bar-container'>
                                <div 
                                    className={`digit-distribution__bar ${isAboveAverage ? 'digit-distribution__bar--high' : 'digit-distribution__bar--low'}`}
                                    style={{ height: `${Math.min(height, 100)}%` }}
                                >
                                    <span className='digit-distribution__count'>{count}</span>
                                </div>
                            </div>
                            <div className='digit-distribution__digit'>{digit}</div>
                        </div>
                    );
                })}
            </div>
            <div className='digit-distribution__average-line' style={{ bottom: '44px' }}>
                <span className='digit-distribution__average-label'>10%</span>
            </div>
        </div>
    );
};
