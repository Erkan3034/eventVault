import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Taslak' },
    { value: 'active', label: 'Aktif' },
    { value: 'completed', label: 'Tamamlandı' },
    { value: 'archived', label: 'Arşivlendi' },
];

const emptyForm = {
    title: '',
    description: '',
    event_type_id: '',
    event_date: '',
    event_location: '',
    privacy: 'private',
    status: 'active',
    max_files_per_user: 10,
    max_file_size_mb: 50,
    require_approval: false,
    enable_comments: true,
    expires_at: '',
    welcome_message: '',
    thank_you_message: '',
    notify_on_upload: true,
    notification_email: '',
};

const EditAlbumPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(emptyForm);
    const [eventTypes, setEventTypes] = useState([]);
    const [coverPreview, setCoverPreview] = useState('');
    const [coverFile, setCoverFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [albumRes, typesRes] = await Promise.all([
                    axios.get(`/api/v1/albums/${id}/`),
                    axios.get('/api/v1/albums/event-types/'),
                ]);
                const album = albumRes.data;
                const types = Array.isArray(typesRes.data) ? typesRes.data : (typesRes.data.results || []);
                const settings = album.settings || {};
                setEventTypes(types);
                setForm({
                    title: album.title || '',
                    description: album.description || '',
                    event_type_id: album.event_type ? album.event_type.id : '',
                    event_date: album.event_date || '',
                    event_location: album.event_location || '',
                    privacy: album.privacy || 'private',
                    status: album.status || 'active',
                    max_files_per_user: album.max_files_per_user || 10,
                    max_file_size_mb: album.max_file_size_mb || 50,
                    require_approval: Boolean(album.require_approval),
                    enable_comments: album.enable_comments !== false,
                    expires_at: album.expires_at ? album.expires_at.slice(0, 10) : '',
                    welcome_message: settings.welcome_message || '',
                    thank_you_message: settings.thank_you_message || '',
                    notify_on_upload: settings.notify_on_upload !== false,
                    notification_email: settings.notification_email || '',
                });
                setCoverPreview(settings.cover_image || '');
            } catch (error) {
                toast.error('Albüm yüklenemedi.');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleCoverChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = new FormData();
            data.append('title', form.title);
            data.append('description', form.description);
            data.append('event_type_id', form.event_type_id);
            data.append('event_date', form.event_date);
            data.append('event_location', form.event_location);
            data.append('privacy', form.privacy);
            data.append('status', form.status);
            data.append('max_files_per_user', form.max_files_per_user);
            data.append('max_file_size_mb', form.max_file_size_mb);
            data.append('require_approval', form.require_approval);
            data.append('enable_comments', form.enable_comments);
            if (form.expires_at) {
                data.append('expires_at', `${form.expires_at}T23:59:59`);
            }
            data.append('welcome_message', form.welcome_message);
            data.append('thank_you_message', form.thank_you_message);
            data.append('notify_on_upload', form.notify_on_upload);
            data.append('notification_email', form.notification_email);
            if (coverFile) {
                data.append('cover_image', coverFile);
            }

            await axios.patch(`/api/v1/albums/${id}/`, data);
            toast.success('Albüm güncellendi.');
            navigate(`/album/${id}`);
        } catch (error) {
            const payload = error.response && error.response.data;
            const message = payload && typeof payload === 'object'
                ? Object.values(payload).flat().join(' ')
                : 'Albüm güncellenemedi.';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Bu albümü ve içindeki tüm yüklemeleri silmek istediğine emin misin?')) {
            return;
        }
        setDeleting(true);
        try {
            await axios.delete(`/api/v1/albums/${id}/`);
            toast.success('Albüm silindi.');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Albüm silinemedi.');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Yükleniyor...
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Albümü Düzenle</h1>
                    <p className="text-sm text-gray-600 mt-1">Bilgileri, gizliliği ve davetli karşılama metinlerini güncelle.</p>
                </div>
                <Link to={`/album/${id}`} className="text-blue-600 hover:underline text-sm">
                    Albüme dön
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Başlık</label>
                    <input
                        id="title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="event_type_id" className="block text-sm font-medium text-gray-700">Etkinlik türü</label>
                        <select
                            id="event_type_id"
                            name="event_type_id"
                            value={form.event_type_id}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
                        >
                            <option value="">Seçiniz</option>
                            {eventTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name_tr || type.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="event_date" className="block text-sm font-medium text-gray-700">Etkinlik tarihi</label>
                        <input
                            id="event_date"
                            type="date"
                            name="event_date"
                            value={form.event_date}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="event_location" className="block text-sm font-medium text-gray-700">Lokasyon</label>
                    <input
                        id="event_location"
                        name="event_location"
                        value={form.event_location}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Açıklama</label>
                    <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={form.description}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="privacy" className="block text-sm font-medium text-gray-700">Gizlilik</label>
                        <select
                            id="privacy"
                            name="privacy"
                            value={form.privacy}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
                        >
                            <option value="private">Özel</option>
                            <option value="public">Herkese açık</option>
                            <option value="password_protected">Şifreli</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Durum</label>
                        <select
                            id="status"
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="max_files_per_user" className="block text-sm font-medium text-gray-700">Kişi başı dosya</label>
                        <input
                            id="max_files_per_user"
                            type="number"
                            min="1"
                            name="max_files_per_user"
                            value={form.max_files_per_user}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="max_file_size_mb" className="block text-sm font-medium text-gray-700">Maks. dosya (MB)</label>
                        <input
                            id="max_file_size_mb"
                            type="number"
                            min="1"
                            name="max_file_size_mb"
                            value={form.max_file_size_mb}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700">Son yükleme tarihi</label>
                        <input
                            id="expires_at"
                            type="date"
                            name="expires_at"
                            value={form.expires_at}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <label className="inline-flex items-center text-sm text-gray-700">
                        <input
                            type="checkbox"
                            name="require_approval"
                            checked={form.require_approval}
                            onChange={handleChange}
                            className="mr-2"
                        />
                        Yüklemeler onay beklesin
                    </label>
                    <label className="inline-flex items-center text-sm text-gray-700">
                        <input
                            type="checkbox"
                            name="enable_comments"
                            checked={form.enable_comments}
                            onChange={handleChange}
                            className="mr-2"
                        />
                        Yorumlara izin ver
                    </label>
                    <label className="inline-flex items-center text-sm text-gray-700">
                        <input
                            type="checkbox"
                            name="notify_on_upload"
                            checked={form.notify_on_upload}
                            onChange={handleChange}
                            className="mr-2"
                        />
                        Yeni yüklemede bildir
                    </label>
                </div>

                <div>
                    <label htmlFor="notification_email" className="block text-sm font-medium text-gray-700">Bildirim e-postası</label>
                    <input
                        id="notification_email"
                        type="email"
                        name="notification_email"
                        value={form.notification_email}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                </div>

                <div>
                    <label htmlFor="welcome_message" className="block text-sm font-medium text-gray-700">Karşılama mesajı</label>
                    <textarea
                        id="welcome_message"
                        name="welcome_message"
                        rows={2}
                        value={form.welcome_message}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Davetlilerin yükleme sayfasında göreceği metin"
                    />
                </div>

                <div>
                    <label htmlFor="thank_you_message" className="block text-sm font-medium text-gray-700">Teşekkür mesajı</label>
                    <textarea
                        id="thank_you_message"
                        name="thank_you_message"
                        rows={2}
                        value={form.thank_you_message}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Yükleme sonrası gösterilecek metin"
                    />
                </div>

                <div>
                    <label htmlFor="cover_image" className="block text-sm font-medium text-gray-700">Kapak görseli</label>
                    <input
                        id="cover_image"
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="mt-1 block w-full text-sm"
                    />
                    {coverPreview && (
                        <img src={coverPreview} alt="Kapak önizleme" className="mt-3 h-32 rounded object-cover" />
                    )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                    >
                        {deleting ? 'Siliniyor...' : 'Albümü sil'}
                    </button>
                    <div className="flex gap-3">
                        <Link to={`/album/${id}`} className="px-4 py-2 rounded-md border text-sm">
                            Vazgeç
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? 'Kaydediliyor...' : 'Değişiklikleri kaydet'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditAlbumPage;
