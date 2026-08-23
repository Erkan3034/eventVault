import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'qrcode.react';
import { toast } from 'react-toastify';
import PageLoader from '../components/PageLoader';

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
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [touchStartX, setTouchStartX] = useState(null);

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

    useEffect(() => {
        if (lightboxIndex === null) return undefined;
        const onKey = (event) => {
            if (event.key === 'Escape') setLightboxIndex(null);
            if (event.key === 'ArrowRight') {
                setLightboxIndex((current) => (current === null ? current : (current + 1) % uploads.length));
            }
            if (event.key === 'ArrowLeft') {
                setLightboxIndex((current) => (
                    current === null ? current : (current - 1 + uploads.length) % uploads.length
                ));
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lightboxIndex, uploads.length]);

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

    const changeStatus = async (status) => {
        setBusy(true);
        try {
            const res = await axios.patch(`/api/v1/albums/${id}/`, { status });
            setAlbum(res.data);
            toast.success(`Durum: ${statusLabel(status)}`);
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
    const activeUpload = lightboxIndex !== null ? uploads[lightboxIndex] : null;
    const showPrev = () => setLightboxIndex((current) => (
        current === null ? current : (current - 1 + uploads.length) % uploads.length
    ));
    const showNext = () => setLightboxIndex((current) => (
        current === null ? current : (current + 1) % uploads.length
    ));
    const dateLabel = album.event_date
        ? new Date(album.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';
    const privacyLabel = album.privacy === 'public' ? 'Herkese açık' : album.privacy === 'password_protected' ? 'Şifreli' : 'Özel';

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

                <div className="mt-14">
                    <div className="mb-6 flex items-end justify-between">
                        <h2 className="font-display text-3xl text-navy">Galeri</h2>
                        <p className="text-sm text-navy/45">{uploads.length} yükleme</p>
                    </div>

                    {uploads.length === 0 ? (
                        <div className="card px-6 py-14 text-center text-navy/50">
                            Henüz dosya yok. QR kodu paylaşarak toplamaya başlayın.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {uploads.map((upload, index) => {
                                const kind = mediaKind(upload);
                                const note = noteText(upload);
                                return (
                                    <button
                                        key={upload.id}
                                        type="button"
                                        onClick={() => setLightboxIndex(index)}
                                        className="group overflow-hidden rounded-xl bg-white text-left shadow-sm ring-1 ring-cream-dark transition hover:-translate-y-0.5 hover:shadow-navy"
                                    >
                                        <div className="aspect-square overflow-hidden bg-cream-dark">
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
                                        </div>
                                        <div className="p-2.5">
                                            <p className={`line-clamp-2 text-xs ${note ? 'text-navy' : 'text-navy/35'}`}>
                                                {note || 'Not yok'}
                                            </p>
                                            <p className="mt-1 truncate text-[11px] text-navy/40">
                                                {upload.uploader_display_name || 'Anonim'}
                                            </p>
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
                    className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 p-4 backdrop-blur-sm"
                    onClick={() => setLightboxIndex(null)}
                    role="presentation"
                >
                    <div
                        className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-cream"
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
                        {uploads.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={showPrev}
                                    className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-navy"
                                    aria-label="Önceki"
                                >
                                    ‹
                                </button>
                                <button
                                    type="button"
                                    onClick={showNext}
                                    className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-navy"
                                    aria-label="Sonraki"
                                >
                                    ›
                                </button>
                            </>
                        )}
                        <div
                            className="flex min-h-[280px] max-h-[70vh] items-center justify-center bg-navy"
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
                                    className="max-h-[70vh] w-full object-contain"
                                />
                            ) : mediaKind(activeUpload) === 'video' ? (
                                <video src={mediaSrc(activeUpload)} controls autoPlay className="max-h-[70vh] w-full" />
                            ) : mediaKind(activeUpload) === 'audio' ? (
                                <audio src={mediaSrc(activeUpload)} controls className="m-8 w-full" />
                            ) : (
                                <a href={mediaSrc(activeUpload)} target="_blank" rel="noopener noreferrer" className="p-8 text-gold underline">
                                    Dosyayı aç
                                </a>
                            )}
                        </div>
                        <div className="p-5">
                            <p className={noteText(activeUpload) ? 'font-display text-xl text-navy' : 'text-navy/40'}>
                                {noteText(activeUpload) || 'Bu yükleme için not yok.'}
                            </p>
                            <p className="mt-2 text-sm text-navy/45">
                                {activeUpload.uploader_display_name || 'Anonim'}
                                {activeUpload.created_at ? ` · ${new Date(activeUpload.created_at).toLocaleString('tr-TR')}` : ''}
                                {uploads.length > 1 ? ` · ${lightboxIndex + 1} / ${uploads.length}` : ''}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlbumPage;
