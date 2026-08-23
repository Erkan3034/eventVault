import React from 'react';
import { Link } from 'react-router-dom';

const BrandMark = ({ to = '/', light = false, compact = false }) => {
    const mark = (
        <span className="inline-flex items-center gap-2.5">
            <span className={`flex items-center justify-center rounded-md font-display leading-none ${
                compact ? 'h-8 w-8 text-lg' : 'h-9 w-9 text-xl'
            } ${light ? 'bg-gold text-navy' : 'bg-navy text-gold'}`}>
                E
            </span>
            <span className={`font-display tracking-wide ${
                compact ? 'text-xl' : 'text-[1.65rem]'
            } ${light ? 'text-cream' : 'text-navy'}`}>
                EventVault
            </span>
        </span>
    );

    if (!to) return mark;
    return (
        <Link to={to} className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 rounded-md">
            {mark}
        </Link>
    );
};

export default BrandMark;
