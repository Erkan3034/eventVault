import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import BrandMark from '../components/BrandMark';
import { PHOTOS } from '../components/HeroScene';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                toast.success('Hoş geldiniz.');
                navigate('/dashboard');
            } else {
                toast.error(result.error || 'Giriş başarısız');
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            <div className="relative hidden flex-col justify-between overflow-hidden bg-navy px-12 py-16 text-cream lg:flex">
                <img src={PHOTOS.wedding} alt="" className="photo-grade absolute inset-0 h-full w-full object-cover opacity-35" />
                <div className="absolute inset-0 bg-navy/70" />
                <div className="relative flex h-full flex-col justify-between">
                    <BrandMark to="/" light />
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Tekrar hoş geldiniz</p>
                        <h1 className="mt-4 font-display text-5xl leading-tight">
                            Albümleriniz<br />sizi bekliyor.
                        </h1>
                        <p className="mt-5 max-w-sm text-cream/70">
                            Yüklemeleri görün, QR kodu paylaşın, anıları düzenleyin.
                        </p>
                    </div>
                    <p className="text-sm text-cream/50">EventVault</p>
                </div>
            </div>

            <div className="flex items-center justify-center px-4 py-16">
                <div className="w-full max-w-md">
                    <div className="mb-8 lg:hidden">
                        <BrandMark />
                    </div>
                    <h2 className="font-display text-4xl text-navy">Giriş yapın</h2>
                    <p className="mt-2 text-sm text-navy/55">
                        Hesabınız yok mu?{' '}
                        <Link to="/register" className="text-gold-dark hover:underline">Kayıt olun</Link>
                    </p>
                    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="field-label">E-posta</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="input"
                                placeholder="ornek@email.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="field-label">Şifre</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="input"
                                placeholder="••••••••"
                            />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                            {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
