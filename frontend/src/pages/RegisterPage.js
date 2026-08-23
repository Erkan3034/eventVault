import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import BrandMark from '../components/BrandMark';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirm: '',
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.password_confirm) {
            toast.error('Şifreler eşleşmiyor');
            return;
        }
        setLoading(true);
        try {
            const result = await register({
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                password: formData.password,
                password_confirm: formData.password_confirm,
            });
            if (result.success) {
                toast.success('Hesabınız oluşturuldu.');
                navigate('/dashboard');
            } else {
                toast.error(result.error || 'Kayıt başarısız');
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            <div className="hidden flex-col justify-between bg-navy px-12 py-16 text-cream lg:flex">
                <BrandMark to="/" light />
                <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Yeni hesap</p>
                    <h1 className="mt-4 font-display text-5xl leading-tight">
                        İlk albümünüz<br />birkaç dakikada.
                    </h1>
                    <p className="mt-5 max-w-sm text-cream/60">
                        Ücretsiz başlayın. QR kodu oluşturun, masaya koyun, anılar gelsin.
                    </p>
                </div>
                <p className="text-sm text-cream/40">EventVault</p>
            </div>

            <div className="flex items-center justify-center px-4 py-16">
                <div className="w-full max-w-md">
                    <div className="mb-8 lg:hidden">
                        <BrandMark />
                    </div>
                    <h2 className="font-display text-4xl text-navy">Kayıt olun</h2>
                    <p className="mt-2 text-sm text-navy/55">
                        Zaten hesabınız var mı?{' '}
                        <Link to="/login" className="text-gold-dark hover:underline">Giriş yapın</Link>
                    </p>
                    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="first_name" className="field-label">Ad</label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    autoComplete="given-name"
                                    required
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label htmlFor="last_name" className="field-label">Soyad</label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    autoComplete="family-name"
                                    required
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>
                        </div>
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
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="field-label">Şifre</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="input"
                            />
                        </div>
                        <div>
                            <label htmlFor="password_confirm" className="field-label">Şifre tekrar</label>
                            <input
                                id="password_confirm"
                                name="password_confirm"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={formData.password_confirm}
                                onChange={handleChange}
                                className="input"
                            />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                            {loading ? 'Oluşturuluyor…' : 'Hesap Oluştur'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
