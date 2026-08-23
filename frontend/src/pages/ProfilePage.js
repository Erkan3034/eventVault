import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import PageLoader from '../components/PageLoader';

const ProfilePage = () => {
    const { user, updateProfile } = useAuth();
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await updateProfile(form);
            if (result.success) {
                toast.success('Profil güncellendi.');
            } else {
                toast.error(result.error || 'Güncelleme başarısız');
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <PageLoader />;

    return (
        <div className="page max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold-dark">Hesap</p>
            <h1 className="mt-2 font-display text-4xl text-navy">Profil</h1>
            <p className="mt-2 text-navy/55">Adınız albümlerde ve bildirimlerde görünür.</p>

            <form onSubmit={handleSubmit} className="card mt-8 space-y-5 p-6 sm:p-8">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="first_name" className="field-label">Ad</label>
                        <input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} className="input" />
                    </div>
                    <div>
                        <label htmlFor="last_name" className="field-label">Soyad</label>
                        <input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} className="input" />
                    </div>
                </div>
                <div>
                    <label htmlFor="email" className="field-label">E-posta</label>
                    <input id="email" type="email" name="email" value={form.email} onChange={handleChange} className="input" />
                </div>
                <div>
                    <label htmlFor="phone" className="field-label">Telefon</label>
                    <input id="phone" type="tel" name="phone" value={form.phone} onChange={handleChange} className="input" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                    {loading ? 'Kaydediliyor…' : 'Kaydet'}
                </button>
            </form>
        </div>
    );
};

export default ProfilePage;
