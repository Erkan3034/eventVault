import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import BrandMark from './BrandMark';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setIsProfileOpen(false);
        setIsOpen(false);
    };

    useEffect(() => {
        const onClick = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const linkClass = ({ isActive }) =>
        `text-sm tracking-wide transition-colors ${
            isActive ? 'text-gold-dark' : 'text-navy/70 hover:text-navy'
        }`;

    const firstName = user && user.first_name ? user.first_name : 'Hesap';

    return (
        <nav className="sticky top-0 z-40 border-b border-cream-dark/80 bg-cream/90 backdrop-blur-md">
            <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <BrandMark compact />

                <div className="hidden items-center gap-8 md:flex">
                    <NavLink to="/" end className={linkClass}>Ana Sayfa</NavLink>
                    <NavLink to="/about" className={linkClass}>Hakkında</NavLink>
                    {isAuthenticated && (
                        <>
                            <NavLink to="/dashboard" className={linkClass}>Albümlerim</NavLink>
                            <NavLink to="/create-album" className={linkClass}>Albüm Oluştur</NavLink>
                        </>
                    )}
                </div>

                <div className="hidden items-center gap-3 md:flex">
                    {isAuthenticated ? (
                        <div className="relative" ref={profileRef}>
                            <button
                                type="button"
                                onClick={() => setIsProfileOpen((open) => !open)}
                                className="flex items-center gap-2 rounded-full border border-cream-dark bg-white px-3 py-1.5 text-sm text-navy"
                            >
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy font-display text-gold">
                                    {firstName.charAt(0).toUpperCase()}
                                </span>
                                {firstName}
                            </button>
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-cream-dark bg-white py-1 shadow-navy">
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="block px-4 py-2 text-sm text-navy hover:bg-cream"
                                    >
                                        Albümlerim
                                    </Link>
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="block px-4 py-2 text-sm text-navy hover:bg-cream"
                                    >
                                        Profil
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="block w-full px-4 py-2 text-left text-sm text-navy/70 hover:bg-cream"
                                    >
                                        Çıkış Yap
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm text-navy/70 hover:text-navy">
                                Giriş Yap
                            </Link>
                            <Link to="/register" className="btn-primary px-5 py-2 text-sm">
                                Kayıt Ol
                            </Link>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    className="text-navy md:hidden"
                    onClick={() => setIsOpen((open) => !open)}
                    aria-label={isOpen ? 'Menüyü kapat' : 'Menüyü aç'}
                >
                    {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                </button>
            </div>

            {isOpen && (
                <div className="border-t border-cream-dark bg-cream px-4 py-4 md:hidden">
                    <div className="flex flex-col gap-3">
                        <NavLink to="/" end className={linkClass} onClick={() => setIsOpen(false)}>Ana Sayfa</NavLink>
                        <NavLink to="/about" className={linkClass} onClick={() => setIsOpen(false)}>Hakkında</NavLink>
                        {isAuthenticated && (
                            <>
                                <NavLink to="/dashboard" className={linkClass} onClick={() => setIsOpen(false)}>Albümlerim</NavLink>
                                <NavLink to="/create-album" className={linkClass} onClick={() => setIsOpen(false)}>Albüm Oluştur</NavLink>
                                <NavLink to="/profile" className={linkClass} onClick={() => setIsOpen(false)}>Profil</NavLink>
                                <button type="button" onClick={handleLogout} className="text-left text-sm text-navy/70">
                                    Çıkış Yap
                                </button>
                            </>
                        )}
                        {!isAuthenticated && (
                            <div className="flex gap-3 pt-2">
                                <Link to="/login" className="btn-secondary flex-1 py-2 text-sm" onClick={() => setIsOpen(false)}>
                                    Giriş Yap
                                </Link>
                                <Link to="/register" className="btn-primary flex-1 py-2 text-sm" onClick={() => setIsOpen(false)}>
                                    Kayıt Ol
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
