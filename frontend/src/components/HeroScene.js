import React from 'react';
import QRCode from 'qrcode.react';

export const PHOTOS = {
    wedding: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80',
    table: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80',
    rings: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    dinner: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1000&q=80',
    couple: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80',
    cake: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
};

const HeroScene = () => {
    const sampleUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/upload/ornek`
        : 'https://eventvault.app/upload/ornek';

    return (
        <div className="relative mx-auto h-[420px] w-full max-w-md lg:h-[520px] lg:max-w-none">
            <div className="absolute inset-0 overflow-hidden rounded-3xl border border-gold/20 shadow-navy">
                <img
                    src={PHOTOS.wedding}
                    alt="Düğün anı"
                    className="photo-grade h-full w-full object-cover animate-ken-burns"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent" />
            </div>

            <div className="absolute right-4 top-6 hidden w-24 overflow-hidden rounded-xl border border-cream/25 shadow-navy sm:block md:w-28">
                <img src={PHOTOS.rings} alt="" className="photo-grade h-32 w-full object-cover md:h-36" />
            </div>

            <div className="absolute bottom-5 left-4 w-[196px] animate-float-slow rounded-2xl border border-gold/25 bg-cream p-4 shadow-navy sm:bottom-7">
                <p className="text-[10px] uppercase tracking-[0.18em] text-gold-dark">Masa daveti</p>
                <p className="mt-1 font-display text-xl text-navy">Elif &amp; Can</p>
                <div className="mx-auto mt-3 w-fit rounded-lg bg-white p-2">
                    <QRCode value={sampleUrl} size={88} bgColor="#FFFFFF" fgColor="#1A2748" />
                </div>
                <p className="mt-2 text-center text-[11px] leading-snug text-navy/55">
                    Kamerayı açın, albüme ekleyin.
                </p>
            </div>

            <div className="absolute bottom-6 right-4 hidden rounded-full bg-cream/90 px-3 py-1.5 text-[11px] text-navy shadow-navy sm:block">
                48 anı toplandı
            </div>
        </div>
    );
};

export default HeroScene;
