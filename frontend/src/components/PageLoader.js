import React from 'react';

const PageLoader = ({ label = 'Yükleniyor' }) => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-navy/50">
        <div className="spinner" aria-hidden="true" />
        <p className="text-sm tracking-wide">{label}</p>
    </div>
);

export default PageLoader;
