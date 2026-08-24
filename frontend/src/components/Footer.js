import React from 'react';
import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';

const Footer = () => (
    <footer className="mt-auto bg-navy text-cream">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="grid gap-10 md:grid-cols-3">
                <div>
                    <BrandMark to="/" light compact />
                    <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/65">
                        Etkinlik anılarınızı QR kod ile toplayın. Düğün, kına, kurumsal etkinlik ve özel günler için sakin, güvenli bir albüm.
                    </p>
                </div>
                <div>
                    <h3 className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-gold">Keşfet</h3>
                    <ul className="space-y-2.5 text-sm text-cream/70">
                        <li><Link to="/" className="hover:text-cream">Ana Sayfa</Link></li>
                        <li><Link to="/about" className="hover:text-cream">Hakkında</Link></li>
                        <li><Link to="/create-album" className="hover:text-cream">Albüm Oluştur</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-gold">İletişim</h3>
                    <ul className="space-y-2.5 text-sm text-cream/70">
                        <li>
                            <a href="mailto:info@eventvault.com" className="hover:text-cream">
                                info@eventvault.com
                            </a>
                        </li>
                        <li>
                            <a href="mailto:support@eventvault.com" className="hover:text-cream">
                                Destek
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-cream/45 sm:flex-row sm:items-center">
                <p>© {new Date().getFullYear()} EventVault. Tüm hakları saklıdır.</p>
                <p>Anılarınız güvende.</p>
            </div>
        </div>
    </footer>
);

export default Footer;
