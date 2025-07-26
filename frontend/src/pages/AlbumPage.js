import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'qrcode.react';

const AlbumPage = () => {
    const { id } = useParams();
    const [album, setAlbum] = useState(null);
    const [uploads, setUploads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlbum();
        fetchUploads();
    }, [id]);

    const fetchAlbum = async() => {
        try {
            const res = await axios.get(`/api/v1/albums/${id}/`);
            setAlbum(res.data);
        } catch (err) {
            setAlbum(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchUploads = async() => {
        try {
            const res = await axios.get(`/api/v1/uploads/album/${id}/`);
            setUploads(res.data);
        } catch (err) {
            setUploads([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className = "min-h-screen flex items-center justify-center" > Yükleniyor... < /div>;
    }

    if (!album) {
        return <div className = "min-h-screen flex items-center justify-center text-red-600" > Albüm bulunamadı. < /div>;
    }

    return ( <
        div className = "max-w-4xl mx-auto py-12" >
        <
        div className = "mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6" >
        <
        div >
        <
        h2 className = "text-2xl font-bold mb-2" > { album.title } < /h2> <
        p className = "text-gray-600 mb-1" > { album.event_type && album.event_type.name ? album.event_type.name : 'Etkinlik' } | { album.event_date } <
        /p> <
        p className = "text-gray-500 text-sm mb-2" > { album.event_location } < /p> <
        p className = "text-gray-700 mb-2" > { album.description } < /p> <
        span className = "inline-block px-2 py-1 text-xs rounded bg-gray-200 text-gray-700 mr-2" > { album.privacy === 'private' ? 'Özel' : 'Herkese Açık' } <
        /span> <
        span className = "inline-block px-2 py-1 text-xs rounded bg-blue-200 text-blue-700" > { album.status === 'active' ? 'Aktif' : 'Tamamlandı' } <
        /span> <
        /div> <
        div className = "flex flex-col items-center" >
        <
        QRCode value = { window.location.origin + '/upload/' + album.access_code }
        size = { 120 }
        /> <
        Link to = { '/upload/' + album.access_code }
        className = "mt-2 text-blue-600 hover:underline text-sm" >
        Yükleme Linki <
        /Link> <
        /div> <
        /div>

        <
        div className = "mb-8 flex justify-end" >
        <
        Link to = { `/upload/${album.access_code}` }
        className = "bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700" >
        Dosya Yükle <
        /Link> <
        /div>

        <
        h3 className = "text-xl font-semibold mb-4" > Yüklenen Dosyalar < /h3> {
            uploads.length === 0 ? ( <
                div className = "text-gray-500" > Henüz dosya yüklenmemiş. < /div>
            ) : ( <
                div className = "grid grid-cols-1 md:grid-cols-2 gap-6" > {
                    uploads.map((upload) => ( <
                        div key = { upload.id }
                        className = "border rounded-lg p-4 flex flex-col" >
                        <
                        div className = "mb-2" >
                        <
                        span className = "font-medium text-gray-900" > { upload.original_filename } < /span> <
                        span className = "ml-2 text-xs text-gray-500" > { upload.file_type } < /span> <
                        /div> <
                        div className = "flex-1 mb-2" > {
                            upload.file_type.startsWith('image') ? ( <
                                img src = { upload.file }
                                alt = { upload.original_filename }
                                className = "max-h-48 rounded" /
                                >
                            ) : upload.file_type.startsWith('video') ? ( <
                                video src = { upload.file }
                                controls className = "max-h-48 rounded" /
                                >
                            ) : upload.file_type.startsWith('audio') ? ( <
                                audio src = { upload.file }
                                controls /
                                >
                            ) : ( <
                                a href = { upload.file }
                                target = "_blank"
                                rel = "noopener noreferrer"
                                className = "text-blue-600 underline" >
                                Dosyayı Görüntüle <
                                /a>
                            )
                        } <
                        /div> <
                        div className = "text-sm text-gray-600 mb-1" > { upload.caption } < /div> <
                        div className = "text-xs text-gray-400" >
                        Yükleyen: { upload.uploader_display_name || 'Anonim' } <
                        /div> <
                        div className = "text-xs text-gray-400" >
                        Yüklenme: { new Date(upload.created_at).toLocaleString('tr-TR') } <
                        /div> <
                        /div>
                    ))
                } <
                /div>
            )
        } <
        /div>
    );
};

export default AlbumPage;