import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'qrcode.react';
import { toast } from 'react-toastify';

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
            return 'bg-green-100 text-green-800';
        case 'completed':
            return 'bg-blue-100 text-blue-800';
        case 'draft':
            return 'bg-yellow-100 text-yellow-800';
        case 'archived':
            return 'bg-gray-200 text-gray-700';
        default:
            return 'bg-gray-100 text-gray-700';
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
            toast.success(`Albüm durumu: ${statusLabel(status)}`);
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

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
    }

    if (!album) {
        return <div className="min-h-screen flex items-center justify-center text-red-600">Albüm bulunamadı.</div>;
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

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            {settings.cover_image && (
                <img
                    src={settings.cover_image}
                    alt=""
                    className="w-full h-48 object-cover rounded-lg mb-6"
                />
            )}

            <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div>
                    <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">Dashboard</Link>
                    <h2 className="text-2xl font-bold mt-2 mb-2">{album.title}</h2>
                    <p className="text-gray-600 mb-1">{eventName || 'Etkinlik'} | {album.event_date}</p>
                    {album.event_location && <p className="text-gray-500 text-sm mb-2">{album.event_location}</p>}
                    {album.description && <p className="text-gray-700 mb-3">{album.description}</p>}
                    {settings.welcome_message && (
                        <p className="text-sm text-gray-600 italic mb-3">{settings.welcome_message}</p>
                    )}
                    <span className="inline-block px-2 py-1 text-xs rounded bg-gray-200 text-gray-700 mr-2">
                        {album.privacy === 'private' ? 'Özel' : album.privacy === 'public' ? 'Herkese açık' : 'Şifreli'}
                    </span>
                    <span className={`inline-block px-2 py-1 text-xs rounded ${statusClass(album.status)}`}>
                        {statusLabel(album.status)}
                    </span>
                </div>
                <div className="flex flex-col items-center">
                    <QRCode value={uploadUrl} size={120} />
                    <button type="button" onClick={copyUploadLink} className="mt-2 text-blue-600 hover:underline text-sm">
                        Yükleme bağlantısını kopyala
                    </button>
                    <p className="mt-1 text-xs text-gray-500 break-all text-center max-w-[180px]">{album.access_code}</p>
                </div>
            </div>

            <div className="mb-8 flex flex-wrap gap-2">
                <Link
                    to={`/album/${album.id}/edit`}
                    className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-900"
                >
                    Düzenle
                </Link>
                <Link
                    to={`/upload/${album.access_code}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                    Dosya yükle
                </Link>
                {album.status !== 'active' && (
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => changeStatus('active')}
                        className="border px-4 py-2 rounded-md text-sm disabled:opacity-50"
                    >
                        Aktifleştir
                    </button>
                )}
                {album.status === 'active' && (
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => changeStatus('completed')}
                        className="border px-4 py-2 rounded-md text-sm disabled:opacity-50"
                    >
                        Tamamlandı işaretle
                    </button>
                )}
                {album.status !== 'archived' && (
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => changeStatus('archived')}
                        className="border px-4 py-2 rounded-md text-sm disabled:opacity-50"
                    >
                        Arşivle
                    </button>
                )}
                <button
                    type="button"
                    disabled={busy}
                    onClick={handleDelete}
                    className="text-red-600 px-4 py-2 rounded-md text-sm hover:bg-red-50 disabled:opacity-50"
                >
                    Sil
                </button>
            </div>

            <h3 className="text-xl font-semibold mb-4">Yüklenen dosyalar ({uploads.length})</h3>
            {uploads.length === 0 ? (
                <div className="text-gray-500">Henüz dosya yüklenmemiş.</div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {uploads.map((upload, index) => {
                        const kind = mediaKind(upload);
                        const note = noteText(upload);
                        return (
                            <button
                                key={upload.id}
                                type="button"
                                onClick={() => setLightboxIndex(index)}
                                className="text-left bg-white border rounded-md overflow-hidden hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <div className="aspect-square bg-gray-100 overflow-hidden">
                                    {kind === 'image' ? (
                                        <img
                                            src={thumbSrc(upload)}
                                            alt={note || upload.original_filename || 'Yükleme'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : kind === 'video' ? (
                                        <video src={mediaSrc(upload)} className="w-full h-full object-cover" muted />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 px-2 text-center">
                                            {upload.original_filename || 'Dosya'}
                                        </div>
                                    )}
                                </div>
                                <div className="p-2">
                                    {note ? (
                                        <p className="text-xs text-gray-800 line-clamp-2">{note}</p>
                                    ) : (
                                        <p className="text-xs text-gray-400">Not yok</p>
                                    )}
                                    <p className="mt-1 text-[11px] text-gray-500 truncate">
                                        {upload.uploader_display_name || 'Anonim'}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {activeUpload && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setLightboxIndex(null)}
                >
                    <div
                        className="relative w-full max-w-4xl bg-white rounded-lg overflow-hidden"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setLightboxIndex(null)}
                            className="absolute top-3 right-3 z-10 bg-white/90 rounded-full w-9 h-9 text-lg"
                            aria-label="Kapat"
                        >
                            ×
                        </button>
                        {uploads.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={showPrev}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-full w-10 h-10 text-xl"
                                    aria-label="Önceki"
                                >
                                    ‹
                                </button>
                                <button
                                    type="button"
                                    onClick={showNext}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-full w-10 h-10 text-xl"
                                    aria-label="Sonraki"
                                >
                                    ›
                                </button>
                            </>
                        )}
                        <div
                            className="bg-black flex items-center justify-center min-h-[280px] max-h-[70vh]"
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
                                <audio src={mediaSrc(activeUpload)} controls className="w-full m-8" />
                            ) : (
                                <a
                                    href={mediaSrc(activeUpload)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white underline p-8"
                                >
                                    Dosyayı aç
                                </a>
                            )}
                        </div>
                        <div className="p-4">
                            {noteText(activeUpload) ? (
                                <p className="text-gray-900">{noteText(activeUpload)}</p>
                            ) : (
                                <p className="text-gray-400">Bu yükleme için not yok.</p>
                            )}
                            <p className="mt-2 text-sm text-gray-500">
                                {activeUpload.uploader_display_name || 'Anonim'}
                                {activeUpload.created_at
                                    ? ` · ${new Date(activeUpload.created_at).toLocaleString('tr-TR')}`
                                    : ''}
                                {uploads.length > 1 ? ` · ${lightboxIndex + 1}/${uploads.length}` : ''}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlbumPage;
