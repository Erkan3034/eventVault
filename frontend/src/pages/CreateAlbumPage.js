import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import QRCode from 'qrcode.react';
import PageLoader from '../components/PageLoader';

const CreateAlbumPage = () => {
    const [form, setForm] = useState({
        title: '',
        event_type_id: '',
        event_date: '',
        event_location: '',
        privacy: 'private',
        description: '',
    });
    const [eventTypes, setEventTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [album, setAlbum] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const initializePage = async () => {
            await fetchEventTypes();
            setLoading(false);
        };
        initializePage();
    }, []);

    const fetchEventTypes = async () => {
        try {
            const res = await axios.get('/api/v1/albums/event-types/');
            const data = res.data;
            setEventTypes(Array.isArray(data) ? data : (data.results || []));
        } catch (err) {
            toast.error('Etkinlik türleri yüklenemedi.');
            setEventTypes([]);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/api/v1/albums/', form);
            setAlbum(res.data);
            toast.success('Albüm oluşturuldu.');
        } catch (err) {
            const errorMessage = err.response?.data?.message
                || (typeof err.response?.data === 'object'
                    ? Object.values(err.response.data).flat().join(' ')
                    : null)
                || 'Albüm oluşturulamadı.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !album) return <PageLoader />;

    if (album) {
        const uploadUrl = `${window.location.origin}/upload/${album.access_code}`;
        return (
            <div className="page max-w-xl text-center">
                <p className="text-[11px] uppercase tracking-[0.22em] text-gold-dark">Hazır</p>
                <h2 className="mt-3 font-display text-4xl text-navy">Albüm oluşturuldu</h2>
                <div className="gold-divider" />
                <p className="text-navy/60">QR kodu davetlilerinizle paylaşın.</p>
                <div className="card mx-auto mt-8 inline-flex flex-col items-center p-8">
                    <div className="rounded-lg border border-gold/30 bg-white p-3">
                        <QRCode value={uploadUrl} size={200} level="H" bgColor="#FFFFFF" fgColor="#1A2748" />
                    </div>
                    <p className="mt-4 break-all text-xs text-navy/50">{uploadUrl}</p>
                </div>
                <div className="mt-8">
                    <button type="button" className="btn-primary" onClick={() => navigate(`/album/${album.id}`)}>
                        Galeriye git
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold-dark">Yeni albüm</p>
            <h1 className="mt-2 font-display text-4xl text-navy">Etkinliği tanımlayın</h1>
            <p className="mt-2 text-navy/55">Başlık ve tarih yeterli. QR kod oluşturma sonrası hazır olur.</p>

            <form className="card mt-8 space-y-5 p-6 sm:p-8" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title" className="field-label">Başlık</label>
                    <input id="title" name="title" value={form.title} onChange={handleChange} required className="input" />
                </div>
                <div>
                    <label htmlFor="event_type_id" className="field-label">Etkinlik türü</label>
                    <select id="event_type_id" name="event_type_id" value={form.event_type_id} onChange={handleChange} required className="input">
                        <option value="">Seçiniz</option>
                        {eventTypes.map((et) => (
                            <option key={et.id} value={et.id}>{et.name_tr || et.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="event_date" className="field-label">Tarih</label>
                    <input id="event_date" type="date" name="event_date" value={form.event_date} onChange={handleChange} required className="input" />
                </div>
                <div>
                    <label htmlFor="event_location" className="field-label">Lokasyon</label>
                    <input id="event_location" name="event_location" value={form.event_location} onChange={handleChange} className="input" />
                </div>
                <div>
                    <label htmlFor="description" className="field-label">Açıklama</label>
                    <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={3} className="input" />
                </div>
                <div>
                    <label htmlFor="privacy" className="field-label">Gizlilik</label>
                    <select id="privacy" name="privacy" value={form.privacy} onChange={handleChange} className="input">
                        <option value="private">Özel</option>
                        <option value="public">Herkese açık</option>
                    </select>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                    {loading ? 'Oluşturuluyor…' : 'Albüm oluştur'}
                </button>
            </form>
        </div>
    );
};

export default CreateAlbumPage;
