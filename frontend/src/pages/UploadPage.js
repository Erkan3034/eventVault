import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

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
            toast.error('Desteklenmeyen dosya türü!');
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
            toast.success('Dosya başarıyla yüklendi!');
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
    const thankYou = settings.thank_you_message || 'Dosyanız başarıyla yüklendi.';

    if (albumError) {
        return (
            <div className="max-w-md mx-auto py-12 text-center text-red-600">
                {albumError}
            </div>
        );
    }

    if (success) {
        return (
            <div className="max-w-md mx-auto py-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Teşekkürler!</h2>
                <p className="mb-4 text-gray-700">{thankYou}</p>
                <button
                    type="button"
                    className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700"
                    onClick={() => setSuccess(false)}
                >
                    Yeni dosya yükle
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto py-12 px-4">
            <h2 className="text-2xl font-bold mb-2">{album ? album.title : 'Dosya yükle'}</h2>
            {settings.welcome_message && (
                <p className="mb-6 text-gray-600">{settings.welcome_message}</p>
            )}
            {!settings.welcome_message && <p className="mb-6 text-gray-500">Etkinlik anınızı paylaşın.</p>}
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="uploader_name" className="block text-sm font-medium text-gray-700">Adınız (isteğe bağlı)</label>
                    <input
                        id="uploader_name"
                        type="text"
                        name="uploader_name"
                        value={uploaderName}
                        onChange={(e) => setUploaderName(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Adınız"
                    />
                </div>
                <div>
                    <label htmlFor="file" className="block text-sm font-medium text-gray-700">Dosya</label>
                    <input
                        id="file"
                        type="file"
                        accept={allowedTypes.join(',')}
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mesaj (isteğe bağlı)</label>
                    <textarea
                        id="message"
                        name="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Bir mesaj bırakabilirsiniz..."
                    />
                </div>
                <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                    {uploading ? 'Yükleniyor...' : 'Yükle'}
                </button>
            </form>
        </div>
    );
};

export default UploadPage;
