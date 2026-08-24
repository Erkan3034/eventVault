import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import PageLoader from '../components/PageLoader';
import { useAuth } from '../contexts/AuthContext';

const unwrap = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
};

const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('tr-TR');
};

const statusText = {
    draft: 'Taslak',
    active: 'Aktif',
    completed: 'Tamamlandı',
    archived: 'Arşiv',
    pending: 'Onay bekliyor',
    approved: 'Onaylı',
    rejected: 'Reddedildi',
};

const TABS = [
    { id: 'overview', label: 'Özet' },
    { id: 'users', label: 'Kullanıcılar' },
    { id: 'albums', label: 'Albümler' },
    { id: 'uploads', label: 'Yüklemeler' },
    { id: 'reports', label: 'Raporlar' },
    { id: 'types', label: 'Etkinlik türleri' },
];

const Table = ({ columns, children }) => (
    <div className="card overflow-x-auto">
        <table className="min-w-full text-left text-sm">
            <thead className="bg-cream-dark/60 text-[11px] uppercase tracking-[0.14em] text-navy/50">
                <tr>
                    {columns.map((col) => (
                        <th key={col} className="px-4 py-3 font-medium whitespace-nowrap">{col}</th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-cream-dark text-navy/80">
                {children}
            </tbody>
        </table>
    </div>
);

const AdminPanelPage = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [uploads, setUploads] = useState([]);
    const [reports, setReports] = useState([]);
    const [eventTypes, setEventTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadFilter, setUploadFilter] = useState('');
    const [typeForm, setTypeForm] = useState({ name: '', name_tr: '', color: '#1A2748' });

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes, albumsRes, uploadsRes, reportsRes, typesRes] = await Promise.all([
                axios.get('/api/v1/admin/stats/'),
                axios.get('/api/v1/admin/users/'),
                axios.get('/api/v1/admin/albums/'),
                axios.get('/api/v1/admin/uploads/'),
                axios.get('/api/v1/admin/reports/'),
                axios.get('/api/v1/admin/event-types/'),
            ]);
            setStats(statsRes.data);
            setUsers(unwrap(usersRes.data));
            setAlbums(unwrap(albumsRes.data));
            setUploads(unwrap(uploadsRes.data));
            setReports(unwrap(reportsRes.data));
            setEventTypes(unwrap(typesRes.data));
        } catch (error) {
            toast.error('Yönetim verileri yüklenemedi.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const patchUser = async (id, payload) => {
        try {
            const res = await axios.patch(`/api/v1/admin/users/${id}/`, payload);
            setUsers((prev) => prev.map((item) => (item.id === id ? res.data : item)));
            toast.success('Kullanıcı güncellendi.');
        } catch (error) {
            toast.error((error.response && error.response.data && error.response.data.error) || 'Kullanıcı güncellenemedi.');
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Bu kullanıcı ve albümleri silinsin mi?')) return;
        try {
            await axios.delete(`/api/v1/admin/users/${id}/`);
            setUsers((prev) => prev.filter((item) => item.id !== id));
            toast.success('Kullanıcı silindi.');
            loadAll();
        } catch (error) {
            toast.error((error.response && error.response.data && error.response.data.error) || 'Silinemedi.');
        }
    };

    const patchAlbum = async (id, payload) => {
        try {
            const res = await axios.patch(`/api/v1/admin/albums/${id}/`, payload);
            setAlbums((prev) => prev.map((item) => (item.id === id ? res.data : item)));
            toast.success('Albüm güncellendi.');
        } catch (error) {
            toast.error('Albüm güncellenemedi.');
        }
    };

    const deleteAlbum = async (id) => {
        if (!window.confirm('Albüm ve tüm yüklemeleri silinsin mi?')) return;
        try {
            await axios.delete(`/api/v1/admin/albums/${id}/`);
            setAlbums((prev) => prev.filter((item) => item.id !== id));
            toast.success('Albüm silindi.');
            loadAll();
        } catch (error) {
            toast.error('Albüm silinemedi.');
        }
    };

    const moderateUpload = async (id, nextStatus) => {
        try {
            const res = await axios.patch(`/api/v1/admin/uploads/${id}/`, { status: nextStatus });
            setUploads((prev) => prev.map((item) => (item.id === id ? res.data : item)));
            toast.success('Yükleme güncellendi.');
            loadAll();
        } catch (error) {
            toast.error('Yükleme güncellenemedi.');
        }
    };

    const deleteUpload = async (id) => {
        if (!window.confirm('Bu yükleme silinsin mi?')) return;
        try {
            await axios.delete(`/api/v1/admin/uploads/${id}/`);
            setUploads((prev) => prev.filter((item) => item.id !== id));
            toast.success('Yükleme silindi.');
        } catch (error) {
            toast.error('Yükleme silinemedi.');
        }
    };

    const resolveReport = async (id, action) => {
        try {
            await axios.patch(`/api/v1/admin/reports/${id}/`, action ? { action } : { is_resolved: true });
            toast.success('Rapor işlendi.');
            loadAll();
        } catch (error) {
            toast.error('Rapor işlenemedi.');
        }
    };

    const saveEventType = async (event) => {
        event.preventDefault();
        try {
            const res = await axios.post('/api/v1/admin/event-types/', typeForm);
            setEventTypes((prev) => [...prev, res.data]);
            setTypeForm({ name: '', name_tr: '', color: '#1A2748' });
            toast.success('Etkinlik türü eklendi.');
        } catch (error) {
            toast.error('Tür eklenemedi.');
        }
    };

    const toggleEventType = async (type) => {
        try {
            const res = await axios.patch(`/api/v1/admin/event-types/${type.id}/`, { is_active: !type.is_active });
            setEventTypes((prev) => prev.map((item) => (item.id === type.id ? res.data : item)));
        } catch (error) {
            toast.error('Tür güncellenemedi.');
        }
    };

    const deleteEventType = async (type) => {
        if (!window.confirm('Bu etkinlik türü kaldırılsın mı?')) return;
        try {
            await axios.delete(`/api/v1/admin/event-types/${type.id}/`);
            toast.success('Etkinlik türü güncellendi.');
            loadAll();
        } catch (error) {
            toast.error('Tür silinemedi.');
        }
    };

    if (loading && !stats) return <PageLoader label="Yönetim yükleniyor" />;

    const filteredUploads = uploadFilter
        ? uploads.filter((item) => item.status === uploadFilter)
        : uploads;

    return (
        <div className="page">
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold-dark">Yönetim</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="font-display text-4xl text-navy">Admin paneli</h1>
                    <p className="mt-2 text-sm text-navy/50">Kullanıcı, albüm, yükleme ve rapor yönetimi.</p>
                </div>
                <button type="button" onClick={loadAll} className="btn-secondary py-2 text-sm">Yenile</button>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
                {TABS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setTab(item.id)}
                        className={`rounded-full px-4 py-1.5 text-sm ${
                            tab === item.id ? 'bg-navy text-cream' : 'bg-white text-navy/60 ring-1 ring-cream-dark'
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {tab === 'overview' && stats && (
                <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[
                        ['Kullanıcı', stats.users],
                        ['Aktif albüm', stats.active_albums],
                        ['Yükleme', stats.uploads],
                        ['Onay bekleyen', stats.pending_uploads],
                        ['Açık rapor', stats.open_reports],
                        ['Personel', stats.staff_users],
                        ['Reddedilen', stats.rejected_uploads],
                        ['Etkinlik türü', stats.event_types],
                    ].map(([label, value]) => (
                        <div key={label} className="card p-5">
                            <p className="font-display text-3xl text-navy">{value}</p>
                            <p className="mt-1 text-xs uppercase tracking-wider text-navy/45">{label}</p>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'users' && (
                <section className="mt-8">
                    <Table columns={['Ad', 'E-posta', 'Albüm', 'Durum', 'Yetki', 'İşlem']}>
                        {users.map((item) => (
                            <tr key={item.id}>
                                <td className="px-4 py-3">{item.full_name || item.email}</td>
                                <td className="px-4 py-3">{item.email}</td>
                                <td className="px-4 py-3">{item.album_count || 0}</td>
                                <td className="px-4 py-3">{item.is_active ? 'Aktif' : 'Pasif'}</td>
                                <td className="px-4 py-3">{item.is_superuser ? 'Süper' : item.is_staff ? 'Personel' : 'Kullanıcı'}</td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-2">
                                        <button type="button" className="text-xs text-gold-dark hover:underline" onClick={() => patchUser(item.id, { is_active: !item.is_active })}>
                                            {item.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                                        </button>
                                        {user && user.is_superuser && item.id !== user.id && (
                                            <button type="button" className="text-xs text-navy hover:underline" onClick={() => patchUser(item.id, { is_staff: !item.is_staff })}>
                                                {item.is_staff ? 'Yetkiyi al' : 'Personel yap'}
                                            </button>
                                        )}
                                        {item.id !== (user && user.id) && (
                                            <button type="button" className="text-xs text-red-700 hover:underline" onClick={() => deleteUser(item.id)}>
                                                Sil
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </Table>
                </section>
            )}

            {tab === 'albums' && (
                <section className="mt-8">
                    <Table columns={['Albüm', 'Sahibi', 'Durum', 'Onay', 'Yükleme', 'İşlem']}>
                        {albums.map((album) => (
                            <tr key={album.id}>
                                <td className="px-4 py-3">
                                    <Link to={`/album/${album.id}`} className="text-navy hover:underline">{album.title}</Link>
                                    <p className="text-[11px] text-navy/40">{album.event_type_name} · {album.access_code}</p>
                                </td>
                                <td className="px-4 py-3">{album.owner_name}<br /><span className="text-[11px] text-navy/40">{album.owner_email}</span></td>
                                <td className="px-4 py-3">
                                    <select
                                        value={album.status}
                                        onChange={(event) => patchAlbum(album.id, { status: event.target.value })}
                                        className="input py-1 text-xs"
                                    >
                                        {['draft', 'active', 'completed', 'archived'].map((value) => (
                                            <option key={value} value={value}>{statusText[value]}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <button type="button" className="text-xs hover:underline" onClick={() => patchAlbum(album.id, { require_approval: !album.require_approval })}>
                                        {album.require_approval ? 'Açık' : 'Kapalı'}
                                    </button>
                                </td>
                                <td className="px-4 py-3">{album.upload_count || 0}</td>
                                <td className="px-4 py-3">
                                    <Link to={`/album/${album.id}/edit`} className="mr-3 text-xs text-gold-dark hover:underline">Düzenle</Link>
                                    <button type="button" className="text-xs text-red-700 hover:underline" onClick={() => deleteAlbum(album.id)}>Sil</button>
                                </td>
                            </tr>
                        ))}
                    </Table>
                </section>
            )}

            {tab === 'uploads' && (
                <section className="mt-8">
                    <div className="mb-4 flex flex-wrap gap-2">
                        {['', 'pending', 'approved', 'rejected'].map((value) => (
                            <button
                                key={value || 'all'}
                                type="button"
                                onClick={() => setUploadFilter(value)}
                                className={`rounded-full px-3 py-1 text-xs ${
                                    uploadFilter === value ? 'bg-navy text-cream' : 'bg-white text-navy/60 ring-1 ring-cream-dark'
                                }`}
                            >
                                {value ? statusText[value] : 'Tümü'}
                            </button>
                        ))}
                    </div>
                    <Table columns={['Dosya', 'Albüm', 'Durum', 'Yükleyen', 'Tarih', 'İşlem']}>
                        {filteredUploads.map((item) => (
                            <tr key={item.id}>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        {item.thumbnail_url ? (
                                            <img src={item.thumbnail_url} alt="" className="h-10 w-10 rounded object-cover" />
                                        ) : (
                                            <span className="flex h-10 w-10 items-center justify-center rounded bg-cream-dark text-[10px]">{item.file_type}</span>
                                        )}
                                        <span>{item.original_filename}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <Link to={`/album/${item.album_id}`} className="hover:underline">{item.album_title}</Link>
                                </td>
                                <td className="px-4 py-3">{statusText[item.status] || item.status}</td>
                                <td className="px-4 py-3">{item.uploader_display_name || 'Anonim'}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{formatDate(item.created_at)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-2">
                                        {item.status !== 'approved' && (
                                            <button type="button" className="text-xs text-gold-dark hover:underline" onClick={() => moderateUpload(item.id, 'approved')}>Onayla</button>
                                        )}
                                        {item.status !== 'rejected' && (
                                            <button type="button" className="text-xs hover:underline" onClick={() => moderateUpload(item.id, 'rejected')}>Reddet</button>
                                        )}
                                        <button type="button" className="text-xs text-red-700 hover:underline" onClick={() => deleteUpload(item.id)}>Sil</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </Table>
                </section>
            )}

            {tab === 'reports' && (
                <section className="mt-8">
                    <Table columns={['Dosya', 'Sebep', 'Raporlayan', 'Durum', 'İşlem']}>
                        {reports.length === 0 && (
                            <tr><td className="px-4 py-8 text-navy/45" colSpan={5}>Açık veya geçmiş rapor yok.</td></tr>
                        )}
                        {reports.map((report) => (
                            <tr key={report.id}>
                                <td className="px-4 py-3">
                                    {report.filename}
                                    <p className="text-[11px] text-navy/40">{report.album_title}</p>
                                </td>
                                <td className="px-4 py-3">{report.reason}{report.description ? ` — ${report.description}` : ''}</td>
                                <td className="px-4 py-3">{report.reporter_name}</td>
                                <td className="px-4 py-3">{report.is_resolved ? 'Kapatıldı' : 'Açık'}</td>
                                <td className="px-4 py-3">
                                    {!report.is_resolved && (
                                        <div className="flex flex-wrap gap-2">
                                            <button type="button" className="text-xs text-gold-dark hover:underline" onClick={() => resolveReport(report.id)}>Kapat</button>
                                            <button type="button" className="text-xs hover:underline" onClick={() => resolveReport(report.id, 'reject_upload')}>Yüklemeyi reddet</button>
                                            <button type="button" className="text-xs text-red-700 hover:underline" onClick={() => resolveReport(report.id, 'delete_upload')}>Yüklemeyi sil</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </Table>
                </section>
            )}

            {tab === 'types' && (
                <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
                    <Table columns={['Tür', 'Durum', 'Albüm', 'İşlem']}>
                        {eventTypes.map((type) => (
                            <tr key={type.id}>
                                <td className="px-4 py-3">
                                    <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: type.color }} />
                                    {type.name_tr || type.name}
                                </td>
                                <td className="px-4 py-3">{type.is_active ? 'Aktif' : 'Pasif'}</td>
                                <td className="px-4 py-3">{type.album_count || 0}</td>
                                <td className="px-4 py-3">
                                    <button type="button" className="mr-3 text-xs hover:underline" onClick={() => toggleEventType(type)}>
                                        {type.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                                    </button>
                                    <button type="button" className="text-xs text-red-700 hover:underline" onClick={() => deleteEventType(type)}>Sil</button>
                                </td>
                            </tr>
                        ))}
                    </Table>
                    <form onSubmit={saveEventType} className="card h-fit space-y-4 p-5">
                        <h3 className="font-display text-2xl text-navy">Yeni tür</h3>
                        <div>
                            <label htmlFor="type_name" className="field-label">İngilizce ad</label>
                            <input id="type_name" className="input" value={typeForm.name} onChange={(event) => setTypeForm({ ...typeForm, name: event.target.value })} required />
                        </div>
                        <div>
                            <label htmlFor="type_name_tr" className="field-label">Türkçe ad</label>
                            <input id="type_name_tr" className="input" value={typeForm.name_tr} onChange={(event) => setTypeForm({ ...typeForm, name_tr: event.target.value })} required />
                        </div>
                        <div>
                            <label htmlFor="type_color" className="field-label">Renk</label>
                            <input id="type_color" type="color" className="h-10 w-full rounded border border-cream-dark" value={typeForm.color} onChange={(event) => setTypeForm({ ...typeForm, color: event.target.value })} />
                        </div>
                        <button type="submit" className="btn-primary w-full py-2 text-sm">Ekle</button>
                    </form>
                </section>
            )}
        </div>
    );
};

export default AdminPanelPage;
