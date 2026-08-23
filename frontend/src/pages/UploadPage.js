import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import BrandMark from '../components/BrandMark';
import PageLoader from '../components/PageLoader';

const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
    'text/plain', 'application/pdf',
];

const UploadPage = () => {
    const { accessCode } = useParams();
    const [album, setAlbum] = useState(null);
    const [albumError, setAlbumError] = useState('');
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [uploaderName, setUploaderName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef();

    useEffect(() => {
        const loadAlbum = async () => {
            try {
                const res = await axios.get(`/api/v1/albums/public/${accessCode}/`);
                setAlbum(res.data);
            } catch (error) {
                setAlbumError('Bu albüm bulunamadı veya yüklemeye kapalı.');
            }
        };
        loadAlbum();
    }, [accessCode]);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && !allowedTypes.includes(selected.type)) {
            toast.error('Desteklenmeyen dosya türü.');
            fileInputRef.current.value = '';
            return;
        }
        setFile(selected);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error('Lütfen bir dosya seçin.');
            return;
        }
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('message', message);
        formData.append('uploader_name', uploaderName);
        try {
            await axios.post(`/api/v1/uploads/${accessCode}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSuccess(true);
            setFile(null);
            setMessage('');
            setUploaderName('');
            if (fileInputRef.current) fileInputRef.current.value = '';
            toast.success('Dosya yüklendi.');
        } catch (err) {
            const payload = err.response && err.response.data;
            const detail = payload && typeof payload === 'object'
                ? Object.values(payload).flat().join(' ')
                : 'Yükleme başarısız.';
            toast.error(detail || 'Yükleme başarısız.');
        } finally {
            setUploading(false);
        }
    };

    const settings = (album && album.settings) || {};
    const thankYou = settings.thank_you_message || 'Anınız albüme eklendi. Teşekkürler.';

    if (!album && !albumError) return <PageLoader />;

    if (albumError) {
        return (
            <div className="page max-w-lg text-center">
                <BrandMark to="/" />
                <p className="mt-10 font-display text-3xl text-navy">Albüm kapalı</p>
                <p className="mt-3 text-navy/55">{albumError}</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="page max-w-lg text-center">
                <p className="text-[11px] uppercase tracking-[0.22em] text-gold-dark">{album.title}</p>
                <h2 className="mt-3 font-display text-5xl text-navy">Teşekkürler</h2>
                <div className="gold-divider" />
                <p className="text-navy/70">{thankYou}</p>
                <button type="button" className="btn-primary mt-8" onClick={() => setSuccess(false)}>
                    Yeni dosya yükle
                </button>
            </div>
        );
    }

    return (
        <div className="page max-w-lg">
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold-dark">Davetli yükleme</p>
            <h1 className="mt-3 font-display text-4xl text-navy">{album.title}</h1>
            <p className="mt-3 text-navy/60">
                {settings.welcome_message || 'Bir fotoğraf veya kısa bir not bırakın.'}
            </p>

            <form className="card mt-8 space-y-5 p-6 sm:p-8" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="uploader_name" className="field-label">Adınız</label>
                    <input
                        id="uploader_name"
                        type="text"
                        name="uploader_name"
                        value={uploaderName}
                        onChange={(e) => setUploaderName(e.target.value)}
                        className="input"
                        placeholder="İsteğe bağlı"
                    />
                </div>
                <div>
                    <label htmlFor="file" className="field-label">Dosya</label>
                    <input
                        id="file"
                        type="file"
                        accept={allowedTypes.join(',')}
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="input file:mr-3 file:rounded-md file:border-0 file:bg-cream-dark file:px-3 file:py-1.5 file:text-sm file:text-navy"
                        required
                    />
                    {file && <p className="mt-2 text-xs text-navy/50">{file.name}</p>}
                </div>
                <div>
                    <label htmlFor="message" className="field-label">Not</label>
                    <textarea
                        id="message"
                        name="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        className="input"
                        placeholder="İsteğe bağlı bir satır"
                    />
                </div>
                <button type="submit" disabled={uploading} className="btn-primary w-full disabled:opacity-50">
                    {uploading ? 'Yükleniyor…' : 'Albüme ekle'}
                </button>
            </form>
        </div>
    );
};

export default UploadPage;
