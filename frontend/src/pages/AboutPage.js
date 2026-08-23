import React from 'react';
import { Link } from 'react-router-dom';
import { PHOTOS } from '../components/HeroScene';

const AboutPage = () => (
    <div className="page max-w-3xl">
        <div className="mb-10 grid grid-cols-3 gap-2">
            {[PHOTOS.wedding, PHOTOS.table, PHOTOS.rings].map((src) => (
                <img key={src} src={src} alt="" className="photo-grade h-28 w-full rounded-xl object-cover md:h-36" />
            ))}
        </div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-gold-dark">Hakkımızda</p>
        <h1 className="mt-3 font-display text-5xl text-navy">Anılar dağılmasın diye.</h1>
        <div className="gold-divider mx-0" />
        <div className="space-y-6 text-[17px] leading-relaxed text-navy/75">
            <p>
                EventVault, etkinlikte çekilen fotoğraf, video ve sesleri tek bir albümde toplamak için tasarlandı.
                Misafirleriniz hesap açmaz; QR kodu okutur, anısını bırakır.
            </p>
            <p>
                Amacımız gösterişli bir sosyal ağ değil: sakin, güvenli ve kalıcı bir kasa. Albümünüz size aittir;
                gizliliği, süreyi ve yükleme kurallarını siz belirlersiniz.
            </p>
            <ul className="space-y-2 text-base">
                <li className="flex gap-3"><span className="text-gold">—</span> QR kod ile kolay paylaşım</li>
                <li className="flex gap-3"><span className="text-gold">—</span> Kayıtsız dosya yükleme</li>
                <li className="flex gap-3"><span className="text-gold">—</span> Fotoğraf, video ve ses</li>
                <li className="flex gap-3"><span className="text-gold">—</span> Özel veya herkese açık albümler</li>
            </ul>
            <p>
                Yazışmak için:{' '}
                <a href="mailto:info@eventvault.com" className="text-gold-dark hover:underline">
                    info@eventvault.com
                </a>
            </p>
        </div>
        <Link to="/register" className="btn-primary mt-10 inline-flex">
            Albüm oluşturmaya başla
        </Link>
    </div>
);

export default AboutPage;
