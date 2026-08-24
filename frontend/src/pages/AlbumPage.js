import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'qrcode.react';
import { toast } from 'react-toastify';
import {
    HeartIcon as HeartOutline,
    ChatBubbleLeftIcon,
    ArrowDownTrayIcon,
    CloudArrowUpIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import PageLoader from '../components/PageLoader';
import { loadGoogleIdentity, requestDriveAccessToken } from '../utils/googleDrive';

const statusLabel = (status) => {
    switch (status) {
        case 'active':
            return 'Aktif';
        case 'completed':
            return 'Tamamlandı';
        case 'draft':
            return 'Taslak';
        case 'archived':
            return 'Arşivlendi';
        default:
            return status;
    }
};

const statusClass = (status) => {
    switch (status) {
        case 'active':
            return 'badge-green';
        case 'completed':
            return 'badge-navy';
        case 'draft':
            return 'badge-gold';
        case 'archived':
            return 'badge bg-cream-dark text-navy/60';
        default:
            return 'badge-navy';
    }
};

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|heic|bmp|avif)$/i;
const VIDEO_EXT = /\.(mp4|mov|avi|mkv|webm)$/i;
const AUDIO_EXT = /\.(mp3|wav|aac|m4a|ogg)$/i;

const mediaKind = (upload) => {
    const type = (upload.file_type || '').toLowerCase();
    const mime = (upload.mime_type || '').toLowerCase();
    const name = `${upload.file_url || ''} ${upload.file || ''} ${upload.original_filename || ''}`;
    if (type === 'video' || type.startsWith('video') || mime.startsWith('video/') || VIDEO_EXT.test(name)) {
        return 'video';
    }
    if (type === 'audio' || type.startsWith('audio') || mime.startsWith('audio/') || AUDIO_EXT.test(name)) {
        return 'audio';
    }
    if (
        upload.thumbnail_url
        || type === 'image'
        || type.startsWith('image')
        || mime.startsWith('image/')
        || IMAGE_EXT.test(name)
        || upload.file_url
        || upload.file
    ) {
        return 'image';
    }
    return 'other';
};

const mediaSrc = (upload) => upload.file_url || upload.thumbnail_url || upload.file || '';
const thumbSrc = (upload) => upload.thumbnail_url || upload.file_url || upload.file || '';
const noteText = (upload) => upload.message || upload.caption || '';

const AlbumPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [album, setAlbum] = useState(null);
    const [uploads, setUploads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [filter, setFilter] = useState('visible');
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [touchStartX, setTouchStartX] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [exporting, setExporting] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const [albumRes, uploadsRes] = await Promise.all([
                    axios.get(`/api/v1/albums/${id}/`),
                    axios.get(`/api/v1/uploads/album/${id}/`),
                ]);
                setAlbum(albumRes.data);
                const data = uploadsRes.data;
                setUploads(Array.isArray(data) ? data : (data.results || []));
            } catch (error) {
                setAlbum(null);
                setUploads([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const visibleUploads = uploads.filter((upload) => {
        if (filter === 'pending') return upload.status === 'pending';
        if (filter === 'rejected') return upload.status === 'rejected';
        if (filter === 'approved') return upload.status === 'approved';
        return upload.status !== 'rejected';
    });

    const pendingCount = uploads.filter((upload) => upload.status === 'pending').length;
    const activeUpload = lightboxIndex !== null ? visibleUploads[lightboxIndex] : null;

    useEffect(() => {
        if (lightboxIndex === null || !visibleUploads.length) return undefined;
        const onKey = (event) => {
            const tag = event.target && event.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;
            if (event.key === 'Escape') setLightboxIndex(null);
            if (event.key === 'ArrowRight') {
                setLightboxIndex((current) => (
                    current === null ? current : (current + 1) % visibleUploads.length
                ));
            }
            if (event.key === 'ArrowLeft') {
                setLightboxIndex((current) => (
                    current === null ? current : (current - 1 + visibleUploads.length) % visibleUploads.length
                ));
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lightboxIndex, visibleUploads.length]);

    const activeUploadId = activeUpload ? activeUpload.id : null;

    useEffect(() => {
        if (!activeUploadId) {
            setComments([]);
            setCommentText('');
            return undefined;
        }
        let cancelled = false;
        const loadComments = async () => {
            setCommentsLoading(true);
            try {
                const res = await axios.get(`/api/v1/uploads/album/${id}/${activeUploadId}/comments/`);
                const data = res.data;
                if (!cancelled) setComments(Array.isArray(data) ? data : (data.results || []));
            } catch (error) {
                if (!cancelled) setComments([]);
            } finally {
                if (!cancelled) setCommentsLoading(false);
            }
        };
        loadComments();
        return () => { cancelled = true; };
    }, [id, activeUploadId]);

    const patchUpload = (uploadId, changes) => {
        setUploads((prev) => prev.map((item) => (
            item.id === uploadId ? { ...item, ...changes } : item
        )));
    };

    const copyUploadLink = async () => {
        if (!album) return;
        const url = `${window.location.origin}/upload/${album.access_code}`;
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Yükleme bağlantısı kopyalandı.');
        } catch (error) {
            toast.error('Bağlantı kopyalanamadı.');
        }
    };

    const changeStatus = async (nextStatus) => {
        setBusy(true);
        try {
            const res = await axios.patch(`/api/v1/albums/${id}/`, { status: nextStatus });
            setAlbum(res.data);
            toast.success(`Durum: ${statusLabel(nextStatus)}`);
        } catch (error) {
            toast.error('Durum güncellenemedi.');
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Bu albümü ve içindeki tüm yüklemeleri silmek istediğine emin misin?')) {
            return;
        }
        setBusy(true);
        try {
            await axios.delete(`/api/v1/albums/${id}/`);
            toast.success('Albüm silindi.');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Albüm silinemedi.');
            setBusy(false);
        }
    };

    const toggleLike = async (upload) => {
        try {
            const res = await axios.post(`/api/v1/uploads/album/${id}/${upload.id}/like/`);
            patchUpload(upload.id, {
                is_liked_by_user: res.data.liked,
                like_count: res.data.like_count,
            });
        } catch (error) {
            toast.error('Beğeni kaydedilemedi.');
        }
    };

    const moderateUpload = async (upload, nextStatus) => {
        try {
            const res = await axios.patch(`/api/v1/uploads/moderate/${upload.id}/`, { status: nextStatus });
            patchUpload(upload.id, res.data);
            toast.success(nextStatus === 'approved' ? 'Yükleme onaylandı.' : 'Yükleme reddedildi.');
            if (filter !== 'visible' && filter !== nextStatus) {
                setLightboxIndex(null);
            }
        } catch (error) {
            toast.error('Moderasyon uygulanamadı.');
        }
    };

    const approveAllPending = async () => {
        const pendingIds = uploads.filter((item) => item.status === 'pending').map((item) => item.id);
        if (!pendingIds.length) return;
        setBusy(true);
        try {
            await axios.post(`/api/v1/uploads/album/${id}/bulk-moderate/`, {
                upload_ids: pendingIds,
                action: 'approve',
            });
            setUploads((prev) => prev.map((item) => (
                item.status === 'pending' ? { ...item, status: 'approved' } : item
            )));
            toast.success(`${pendingIds.length} yükleme onaylandı.`);
        } catch (error) {
            toast.error('Toplu onay uygulanamadı.');
        } finally {
            setBusy(false);
        }
    };

    const downloadUpload = async (upload) => {
        try {
            const res = await axios.get(`/api/v1/uploads/album/${id}/${upload.id}/download/`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(res.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = upload.original_filename || 'dosya';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            patchUpload(upload.id, { download_count: (upload.download_count || 0) + 1 });
        } catch (error) {
            toast.error('İndirme başarısız.');
        }
    };

    const exportError = async (error, fallback) => {
        const data = error.response && error.response.data;
        if (data instanceof Blob) {
            try {
                const parsed = JSON.parse(await data.text());
                return parsed.error || parsed.detail || fallback;
            } catch (parseError) {
                return fallback;
            }
        }
        if (data && data.error) return data.error;
        if (data && data.detail) return data.detail;
        return fallback;
    };

    const downloadAlbumZip = async () => {
        setExporting('zip');
        try {
            const res = await axios.get(`/api/v1/albums/${id}/export/zip/`, {
                responseType: 'blob',
                timeout: 600000,
            });
            const disposition = res.headers['content-disposition'] || '';
            const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
            const plainMatch = disposition.match(/filename="?([^"]+)"?/i);
            const filename = decodeURIComponent((utfMatch && utfMatch[1]) || (plainMatch && plainMatch[1]) || 'album.zip');
            const url = window.URL.createObjectURL(res.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('ZIP indirildi.');
        } catch (error) {
            toast.error(await exportError(error, 'ZIP hazırlanamadı.'));
        } finally {
            setExporting('');
        }
    };

    const exportAlbumToDrive = async () => {
        setExporting('drive');
        try {
            const configRes = await axios.get(`/api/v1/albums/${id}/export/drive/`);
            const clientId = configRes.data.client_id || process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
            if (!clientId) {
                toast.error('Google Drive için GOOGLE_OAUTH_CLIENT_ID tanımlayın. Şimdilik ZIP indirebilirsiniz.');
                return;
            }
            await loadGoogleIdentity();
            const accessToken = await requestDriveAccessToken(clientId, configRes.data.scope);
            const res = await axios.post(
                `/api/v1/albums/${id}/export/drive/`,
                { access_token: accessToken },
                { timeout: 600000 },
            );
            toast.success(`${res.data.uploaded || 0} dosya Google Drive'a gönderildi.`);
            if (res.data.folder_url) {
                window.open(res.data.folder_url, '_blank', 'noopener,noreferrer');
            }
        } catch (error) {
            toast.error(error.message && !error.response ? error.message : await exportError(error, 'Google Drive gönderilemedi.'));
        } finally {
            setExporting('');
        }
    };

    const submitComment = async (event) => {
        event.preventDefault();
        if (!activeUpload || !commentText.trim()) return;
        try {
            const res = await axios.post(`/api/v1/uploads/album/${id}/${activeUpload.id}/comments/`, {
                content: commentText.trim(),
            });
            setComments((prev) => [...prev, res.data]);
            setCommentText('');
            patchUpload(activeUpload.id, { comment_count: (activeUpload.comment_count || 0) + 1 });
        } catch (error) {
            toast.error('Yorum eklenemedi.');
        }
    };

    if (loading) return <PageLoader />;

    if (!album) {
        return (
            <div className="page text-center">
                <p className="font-display text-3xl text-navy">Albüm bulunamadı</p>
                <Link to="/dashboard" className="btn-secondary mt-6 inline-flex">Albümlere dön</Link>
            </div>
        );
    }

    const eventName = album.event_type && (album.event_type.name_tr || album.event_type.name);
    const settings = album.settings || {};
    const uploadUrl = `${window.location.origin}/upload/${album.access_code}`;
    const showPrev = () => setLightboxIndex((current) => (
        current === null ? current : (current - 1 + visibleUploads.length) % visibleUploads.length
    ));
    const showNext = () => setLightboxIndex((current) => (
        current === null ? current : (current + 1) % visibleUploads.length
    ));
    const dateLabel = album.event_date
        ? new Date(album.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';
    const privacyLabel = album.privacy === 'public' ? 'Herkese açık' : album.privacy === 'password_protected' ? 'Şifreli' : 'Özel';
    const commentsEnabled = album.enable_comments !== false;

    const filterTabs = [
        { key: 'visible', label: 'Galeri', count: uploads.filter((item) => item.status !== 'rejected').length },
        { key: 'pending', label: 'Onay bekleyen', count: pendingCount },
        { key: 'approved', label: 'Onaylı', count: uploads.filter((item) => item.status === 'approved').length },
        { key: 'rejected', label: 'Reddedilen', count: uploads.filter((item) => item.status === 'rejected').length },
    ];

    return (
        <div>
            {settings.cover_image && (
                <div className="h-56 w-full overflow-hidden bg-navy md:h-72">
                    <img src={settings.cover_image} alt="" className="h-full w-full object-cover opacity-90" />
                </div>
            )}

            <div className="page">
                <Link to="/dashboard" className="text-xs uppercase tracking-[0.16em] text-gold-dark hover:underline">
                    Albümlerim
                </Link>

                <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_220px]">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={statusClass(album.status)}>{statusLabel(album.status)}</span>
                            <span className="badge-gold">{privacyLabel}</span>
                            {album.require_approval && <span className="badge-navy">Onay gerekli</span>}
                        </div>
                        <h1 className="mt-3 font-display text-4xl text-navy md:text-5xl">{album.title}</h1>
                        <p className="mt-3 text-navy/55">
                            {[eventName, dateLabel, album.event_location].filter(Boolean).join(' · ')}
                        </p>
                        {album.description && (
                            <p className="mt-4 max-w-2xl leading-relaxed text-navy/75">{album.description}</p>
                        )}
                        {settings.welcome_message && (
                            <p className="mt-4 font-display text-xl italic text-navy/70">{settings.welcome_message}</p>
                        )}

                        <div className="mt-8 flex flex-wrap gap-2">
                            <Link to={`/album/${album.id}/edit`} className="btn-secondary py-2.5 text-sm">Düzenle</Link>
                            <Link to={`/upload/${album.access_code}`} className="btn-primary py-2.5 text-sm">Dosya yükle</Link>
                            {album.status !== 'active' && (
                                <button type="button" disabled={busy} onClick={() => changeStatus('active')} className="btn-ghost py-2.5 text-sm disabled:opacity-50">
                                    Aktifleştir
                                </button>
                            )}
                            {album.status === 'active' && (
                                <button type="button" disabled={busy} onClick={() => changeStatus('completed')} className="btn-ghost py-2.5 text-sm disabled:opacity-50">
                                    Tamamlandı
                                </button>
                            )}
                            {album.status !== 'archived' && (
                                <button type="button" disabled={busy} onClick={() => changeStatus('archived')} className="btn-ghost py-2.5 text-sm disabled:opacity-50">
                                    Arşivle
                                </button>
                            )}
                            <button type="button" disabled={busy} onClick={handleDelete} className="btn-ghost py-2.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50">
                                Sil
                            </button>
                        </div>
                    </div>

                    <aside className="card flex flex-col items-center p-5 text-center">
                        <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-navy/40">Davet kodu</p>
                        <div className="rounded-lg border border-gold/30 bg-white p-3">
                            <QRCode value={uploadUrl} size={132} bgColor="#FFFFFF" fgColor="#1A2748" />
                        </div>
                        <p className="mt-3 font-mono text-xs text-navy/50">{album.access_code}</p>
                        <button type="button" onClick={copyUploadLink} className="mt-3 text-sm text-gold-dark hover:underline">
                            Bağlantıyı kopyala
                        </button>
                    </aside>
                </div>

                {pendingCount > 0 && (
                    <div className="mt-10 flex flex-col gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-navy">
                            {pendingCount} yükleme onay bekliyor. Onaylananlar galeride kalır.
                        </p>
                        <button type="button" disabled={busy} onClick={approveAllPending} className="btn-primary py-2 text-sm">
                            Tümünü onayla
                        </button>
                    </div>
                )}

                <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-cream-dark bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="font-display text-2xl text-navy">Dışa aktar</p>
                        <p className="mt-1 text-sm text-navy/50">
                            {album.require_approval
                                ? 'Onaylı dosyalar ZIP veya Google Drive klasörü olarak çıkarılır. Onay bekleyenler dahil edilmez.'
                                : 'Reddedilmeyen dosyalar ZIP veya Google Drive klasörü olarak çıkarılır.'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            disabled={Boolean(exporting)}
                            onClick={downloadAlbumZip}
                            className="btn-secondary py-2.5 text-sm disabled:opacity-50"
                        >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            {exporting === 'zip' ? 'ZIP hazırlanıyor…' : 'ZIP indir'}
                        </button>
                        <button
                            type="button"
                            disabled={Boolean(exporting)}
                            onClick={exportAlbumToDrive}
                            className="btn-primary py-2.5 text-sm disabled:opacity-50"
                        >
                            <CloudArrowUpIcon className="h-4 w-4" />
                            {exporting === 'drive' ? 'Drive\'a gönderiliyor…' : 'Google Drive'}
                        </button>
                    </div>
                </div>

                <div className="mt-14">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="font-display text-3xl text-navy">Galeri</h2>
                            <p className="mt-1 text-sm text-navy/45">{visibleUploads.length} görünen yükleme</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {filterTabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => { setFilter(tab.key); setLightboxIndex(null); }}
                                    className={`rounded-full px-3 py-1.5 text-xs ${
                                        filter === tab.key
                                            ? 'bg-navy text-cream'
                                            : 'bg-white text-navy/60 ring-1 ring-cream-dark'
                                    }`}
                                >
                                    {tab.label} {tab.count}
                                </button>
                            ))}
                        </div>
                    </div>

                    {visibleUploads.length === 0 ? (
                        <div className="card px-6 py-14 text-center text-navy/50">
                            {filter === 'pending'
                                ? 'Onay bekleyen yükleme yok.'
                                : 'Henüz dosya yok. QR kodu paylaşarak toplamaya başlayın.'}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {visibleUploads.map((upload, index) => {
                                const kind = mediaKind(upload);
                                const note = noteText(upload);
                                return (
                                    <button
                                        key={upload.id}
                                        type="button"
                                        onClick={() => setLightboxIndex(index)}
                                        className="group overflow-hidden rounded-xl bg-white text-left shadow-sm ring-1 ring-cream-dark transition hover:-translate-y-0.5 hover:shadow-navy"
                                    >
                                        <div className="relative aspect-square overflow-hidden bg-cream-dark">
                                            {kind === 'image' ? (
                                                <img
                                                    src={thumbSrc(upload)}
                                                    alt={note || upload.original_filename || 'Yükleme'}
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            ) : kind === 'video' ? (
                                                <video src={mediaSrc(upload)} className="h-full w-full object-cover" muted />
                                            ) : (
                                                <div className="flex h-full items-center justify-center px-3 text-center text-xs text-navy/45">
                                                    {upload.original_filename || 'Dosya'}
                                                </div>
                                            )}
                                            {upload.status === 'pending' && (
                                                <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-medium text-navy">
                                                    Onay bekliyor
                                                </span>
                                            )}
                                            {upload.status === 'rejected' && (
                                                <span className="absolute left-2 top-2 rounded-full bg-red-700 px-2 py-0.5 text-[10px] text-white">
                                                    Reddedildi
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-2.5">
                                            <p className={`line-clamp-2 text-xs ${note ? 'text-navy' : 'text-navy/35'}`}>
                                                {note || 'Not yok'}
                                            </p>
                                            <div className="mt-1 flex items-center justify-between text-[11px] text-navy/40">
                                                <span className="truncate">{upload.uploader_display_name || 'Anonim'}</span>
                                                <span className="ml-2 shrink-0">
                                                    {upload.like_count || 0} · {upload.comment_count || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {activeUpload && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 p-3 backdrop-blur-sm sm:p-4"
                    onClick={() => setLightboxIndex(null)}
                    role="presentation"
                >
                    <div
                        className="relative grid max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-cream lg:grid-cols-[1.4fr_0.9fr]"
                        onClick={(event) => event.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        <button
                            type="button"
                            onClick={() => setLightboxIndex(null)}
                            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy"
                            aria-label="Kapat"
                        >
                            ×
                        </button>
                        {visibleUploads.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={showPrev}
                                    className="absolute left-3 top-[28%] z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-navy lg:top-1/2"
                                    aria-label="Önceki"
                                >
                                    ‹
                                </button>
                                <button
                                    type="button"
                                    onClick={showNext}
                                    className="absolute right-3 top-[28%] z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-navy lg:right-[calc(39%+0.75rem)] lg:top-1/2"
                                    aria-label="Sonraki"
                                >
                                    ›
                                </button>
                            </>
                        )}
                        <div
                            className="flex min-h-[240px] max-h-[48vh] items-center justify-center bg-navy lg:max-h-[92vh]"
                            onTouchStart={(event) => setTouchStartX(event.changedTouches[0].clientX)}
                            onTouchEnd={(event) => {
                                if (touchStartX === null) return;
                                const delta = event.changedTouches[0].clientX - touchStartX;
                                if (delta > 40) showPrev();
                                if (delta < -40) showNext();
                                setTouchStartX(null);
                            }}
                        >
                            {mediaKind(activeUpload) === 'image' ? (
                                <img
                                    src={mediaSrc(activeUpload)}
                                    alt={noteText(activeUpload) || activeUpload.original_filename}
                                    className="max-h-[48vh] w-full object-contain lg:max-h-[92vh]"
                                />
                            ) : mediaKind(activeUpload) === 'video' ? (
                                <video src={mediaSrc(activeUpload)} controls autoPlay className="max-h-[48vh] w-full lg:max-h-[92vh]" />
                            ) : mediaKind(activeUpload) === 'audio' ? (
                                <audio src={mediaSrc(activeUpload)} controls className="m-8 w-full" />
                            ) : (
                                <a href={mediaSrc(activeUpload)} target="_blank" rel="noopener noreferrer" className="p-8 text-gold underline">
                                    Dosyayı aç
                                </a>
                            )}
                        </div>

                        <div className="flex max-h-[44vh] flex-col overflow-y-auto p-5 lg:max-h-[92vh]">
                            <p className={noteText(activeUpload) ? 'font-display text-xl text-navy' : 'text-navy/40'}>
                                {noteText(activeUpload) || 'Bu yükleme için not yok.'}
                            </p>
                            <p className="mt-2 text-sm text-navy/45">
                                {activeUpload.uploader_display_name || 'Anonim'}
                                {activeUpload.created_at ? ` · ${new Date(activeUpload.created_at).toLocaleString('tr-TR')}` : ''}
                                {visibleUploads.length > 1 ? ` · ${lightboxIndex + 1} / ${visibleUploads.length}` : ''}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => toggleLike(activeUpload)}
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ${
                                        activeUpload.is_liked_by_user
                                            ? 'bg-navy text-gold'
                                            : 'bg-white text-navy ring-1 ring-cream-dark'
                                    }`}
                                >
                                    {activeUpload.is_liked_by_user
                                        ? <HeartSolid className="h-4 w-4" />
                                        : <HeartOutline className="h-4 w-4" />}
                                    {activeUpload.like_count || 0}
                                </button>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm text-navy ring-1 ring-cream-dark">
                                    <ChatBubbleLeftIcon className="h-4 w-4" />
                                    {activeUpload.comment_count || comments.length || 0}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => downloadUpload(activeUpload)}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm text-navy ring-1 ring-cream-dark"
                                >
                                    <ArrowDownTrayIcon className="h-4 w-4" />
                                    İndir
                                </button>
                            </div>

                            {activeUpload.status === 'pending' && (
                                <div className="mt-4 flex gap-2">
                                    <button type="button" onClick={() => moderateUpload(activeUpload, 'approved')} className="btn-primary flex-1 py-2 text-sm">
                                        Onayla
                                    </button>
                                    <button type="button" onClick={() => moderateUpload(activeUpload, 'rejected')} className="btn-secondary flex-1 py-2 text-sm">
                                        Reddet
                                    </button>
                                </div>
                            )}
                            {activeUpload.status === 'rejected' && (
                                <button type="button" onClick={() => moderateUpload(activeUpload, 'approved')} className="btn-ghost mt-4 py-2 text-sm">
                                    Yeniden onayla
                                </button>
                            )}

                            <div className="mt-6 border-t border-cream-dark pt-4">
                                <h3 className="text-[11px] uppercase tracking-[0.16em] text-navy/40">Yorumlar</h3>
                                {!commentsEnabled && (
                                    <p className="mt-3 text-sm text-navy/45">Bu albümde yorumlar kapalı.</p>
                                )}
                                {commentsEnabled && commentsLoading && (
                                    <p className="mt-3 text-sm text-navy/45">Yükleniyor…</p>
                                )}
                                {commentsEnabled && !commentsLoading && comments.length === 0 && (
                                    <p className="mt-3 text-sm text-navy/45">Henüz yorum yok.</p>
                                )}
                                {commentsEnabled && (
                                    <ul className="mt-3 space-y-3">
                                        {comments.map((comment) => (
                                            <li key={comment.id}>
                                                <p className="text-sm text-navy">{comment.content}</p>
                                                <p className="mt-0.5 text-[11px] text-navy/40">
                                                    {comment.author_name || 'Anonim'}
                                                    {comment.created_at ? ` · ${new Date(comment.created_at).toLocaleString('tr-TR')}` : ''}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {commentsEnabled && (
                                    <form onSubmit={submitComment} className="mt-4">
                                        <textarea
                                            value={commentText}
                                            onChange={(event) => setCommentText(event.target.value)}
                                            rows={2}
                                            className="input text-sm"
                                            placeholder="Bir yorum yazın"
                                        />
                                        <button type="submit" disabled={!commentText.trim()} className="btn-primary mt-2 w-full py-2 text-sm disabled:opacity-50">
                                            Yorum ekle
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlbumPage;
