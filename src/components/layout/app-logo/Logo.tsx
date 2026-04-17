import React from 'react';

export const SmartTradesLogo: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <svg 
            width="40" 
            height="40" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Frame */}
            <path d="M10 10V90H90V10H10Z" stroke="#00c03d" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 90H90V10" stroke="#ff444f" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Candlesticks */}
            {/* C1: Red */}
            <line x1="25" y1="40" x2="25" y2="70" stroke="#ff444f" strokeWidth="2" />
            <rect x="20" y="45" width="10" height="20" fill="#ff444f" />
            
            {/* C2: Green */}
            <line x1="45" y1="30" x2="45" y2="60" stroke="#00c03d" strokeWidth="2" />
            <rect x="40" y="35" width="10" height="20" fill="#00c03d" />
            
            {/* C3: Green */}
            <line x1="65" y1="20" x2="65" y2="50" stroke="#00c03d" strokeWidth="2" />
            <rect x="60" y="25" width="10" height="20" fill="#00c03d" />
            
            {/* C4: Red */}
            <line x1="85" y1="45" x2="85" y2="75" stroke="#ff444f" strokeWidth="2" />
            <rect x="80" y="50" width="10" height="20" fill="#ff444f" />

            {/* Rising Arrow */}
            <path 
                d="M15 65L40 50L55 60L85 30M85 30H75M85 30V40" 
                stroke="#00c03d" 
                strokeWidth="5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
            />
        </svg>
    );
};
