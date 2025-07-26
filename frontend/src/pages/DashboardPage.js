import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    PlusIcon,
    PhotoIcon,
    VideoCameraIcon,
    MusicalNoteIcon,
    DocumentTextIcon,
    EyeIcon,
    HeartIcon,
    CloudArrowDownIcon
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
    const { user } = useAuth();
    const [albums, setAlbums] = useState([]);
    const [stats, setStats] = useState({
        total_albums: 0,
        active_albums: 0,
        total_uploads: 0,
        total_size_mb: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlbums();
        fetchStats();
    }, []);

    const fetchAlbums = async() => {
        try {
            // TODO: Replace with actual API call
            const mockAlbums = [{
                    id: '1',
                    title: 'Düğün Albümü',
                    event_type: { name: 'Düğün' },
                    event_date: '2024-06-15',
                    status: 'active',
                    total_uploads: 45,
                    total_size_mb: 125.5,
                    view_count: 156
                },
                {
                    id: '2',
                    title: 'Doğum Günü Partisi',
                    event_type: { name: 'Doğum Günü' },
                    event_date: '2024-05-20',
                    status: 'completed',
                    total_uploads: 23,
                    total_size_mb: 67.2,
                    view_count: 89
                }
            ];
            setAlbums(mockAlbums);
        } catch (error) {
            console.error('Error fetching albums:', error);
        }
    };

    const fetchStats = async() => {
        try {
            // TODO: Replace with actual API call
            const mockStats = {
                total_albums: 2,
                active_albums: 1,
                total_uploads: 68,
                total_size_mb: 192.7
            };
            setStats(mockStats);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-gray-100 text-gray-800';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active':
                return 'Aktif';
            case 'completed':
                return 'Tamamlandı';
            case 'draft':
                return 'Taslak';
            default:
                return status;
        }
    };

    if (loading) {
        return ( < div className = "min-h-screen bg-gray-50 flex items-center justify-center" >
            <
            div className = "animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" > < /div> < /
            div >
        );
    }

    return ( <
        div className = "min-h-screen bg-gray-50" >
        <
        div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" > { /* Header */ } <
        div className = "mb-8" >
        <
        h1 className = "text-3xl font-bold text-gray-900" >
        Hoş geldin, { user && user.first_name ? user.first_name : 'Kullanıcı' }!
        <
        /h1> <
        p className = "mt-2 text-gray-600" >
        Albümlerinizi yönetin ve etkinlik anılarınızı takip edin. <
        /p> < /
        div >

        { /* Stats Cards */ } <
        div className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" >
        <
        div className = "bg-white rounded-lg shadow p-6" >
        <
        div className = "flex items-center" >
        <
        div className = "p-2 bg-blue-100 rounded-lg" >
        <
        PhotoIcon className = "h-6 w-6 text-blue-600" / >
        <
        /div> <
        div className = "ml-4" >
        <
        p className = "text-sm font-medium text-gray-600" > Toplam Albüm < /p> <
        p className = "text-2xl font-bold text-gray-900" > { stats.total_albums } < /p> < /
        div > <
        /div> < /
        div >

        <
        div className = "bg-white rounded-lg shadow p-6" >
        <
        div className = "flex items-center" >
        <
        div className = "p-2 bg-green-100 rounded-lg" >
        <
        EyeIcon className = "h-6 w-6 text-green-600" / >
        <
        /div> <
        div className = "ml-4" >
        <
        p className = "text-sm font-medium text-gray-600" > Aktif Albüm < /p> <
        p className = "text-2xl font-bold text-gray-900" > { stats.active_albums } < /p> < /
        div > <
        /div> < /
        div >

        <
        div className = "bg-white rounded-lg shadow p-6" >
        <
        div className = "flex items-center" >
        <
        div className = "p-2 bg-purple-100 rounded-lg" >
        <
        CloudArrowDownIcon className = "h-6 w-6 text-purple-600" / >
        <
        /div> <
        div className = "ml-4" >
        <
        p className = "text-sm font-medium text-gray-600" > Toplam Yükleme < /p> <
        p className = "text-2xl font-bold text-gray-900" > { stats.total_uploads } < /p> < /
        div > <
        /div> < /
        div >

        <
        div className = "bg-white rounded-lg shadow p-6" >
        <
        div className = "flex items-center" >
        <
        div className = "p-2 bg-yellow-100 rounded-lg" >
        <
        HeartIcon className = "h-6 w-6 text-yellow-600" / >
        <
        /div> <
        div className = "ml-4" >
        <
        p className = "text-sm font-medium text-gray-600" > Toplam Boyut < /p> <
        p className = "text-2xl font-bold text-gray-900" > { stats.total_size_mb }
        MB < /p> < /
        div > <
        /div> < /
        div > <
        /div>

        { /* Quick Actions */ } <
        div className = "bg-white rounded-lg shadow mb-8" >
        <
        div className = "px-6 py-4 border-b border-gray-200" >
        <
        h2 className = "text-lg font-medium text-gray-900" > Hızlı İşlemler < /h2> < /
        div > <
        div className = "p-6" >
        <
        div className = "grid grid-cols-1 md:grid-cols-3 gap-4" >
        <
        Link to = "/create-album"
        className = "flex items-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors" >
        <
        PlusIcon className = "h-8 w-8 text-blue-600 mr-3" / >
        <
        div >
        <
        h3 className = "font-medium text-gray-900" > Yeni Albüm Oluştur < /h3> <
        p className = "text-sm text-gray-600" > Etkinlik albümü oluşturun < /p> < /
        div > <
        /Link>

        <
        Link to = "/albums"
        className = "flex items-center p-4 border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors" >
        <
        PhotoIcon className = "h-8 w-8 text-green-600 mr-3" / >
        <
        div >
        <
        h3 className = "font-medium text-gray-900" > Albümleri Görüntüle < /h3> <
        p className = "text-sm text-gray-600" > Tüm albümlerinizi yönetin < /p> < /
        div > <
        /Link>

        <
        Link to = "/settings"
        className = "flex items-center p-4 border border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors" >
        <
        HeartIcon className = "h-8 w-8 text-purple-600 mr-3" / >
        <
        div >
        <
        h3 className = "font-medium text-gray-900" > Ayarlar < /h3> <
        p className = "text-sm text-gray-600" > Hesap ayarlarınızı düzenleyin < /p> < /
        div > <
        /Link> < /
        div > <
        /div> < /
        div >

        { /* Recent Albums */ } <
        div className = "bg-white rounded-lg shadow" >
        <
        div className = "px-6 py-4 border-b border-gray-200 flex justify-between items-center" >
        <
        h2 className = "text-lg font-medium text-gray-900" > Son Albümler < /h2> <
        Link to = "/albums"
        className = "text-blue-600 hover:text-blue-500 text-sm font-medium" >
        Tümünü Görüntüle <
        /Link> < /
        div > <
        div className = "p-6" > {
            albums.length === 0 ? ( <
                div className = "text-center py-12" >
                <
                PhotoIcon className = "mx-auto h-12 w-12 text-gray-400" / >
                <
                h3 className = "mt-2 text-sm font-medium text-gray-900" > Henüz albüm yok < /h3> <
                p className = "mt-1 text-sm text-gray-500" >
                İlk albümünüzü oluşturmaya başlayın. <
                /p> <
                div className = "mt-6" >
                <
                Link to = "/create-album"
                className = "inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700" >
                <
                PlusIcon className = "-ml-1 mr-2 h-5 w-5" / >
                Albüm Oluştur <
                /Link> < /
                div > <
                /div>
            ) : ( <
                div className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" > {
                    albums.map((album) => ( <
                        div key = { album.id }
                        className = "border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow" >
                        <
                        div className = "flex items-center justify-between mb-4" >
                        <
                        h3 className = "text-lg font-medium text-gray-900" > { album.title } < /h3> <
                        span className = { `px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(album.status)}` } > { getStatusText(album.status) } <
                        /span> < /
                        div >

                        <
                        div className = "space-y-2 mb-4" >
                        <
                        p className = "text-sm text-gray-600" >
                        <
                        span className = "font-medium" > Etkinlik: < /span> {album.event_type.name} < /
                        p > <
                        p className = "text-sm text-gray-600" >
                        <
                        span className = "font-medium" > Tarih: < /span> {new Date(album.event_date).toLocaleDateString('tr-TR')} < /
                        p > <
                        /div>

                        <
                        div className = "grid grid-cols-3 gap-4 mb-4 text-center" >
                        <
                        div >
                        <
                        p className = "text-lg font-semibold text-gray-900" > { album.total_uploads } < /p> <
                        p className = "text-xs text-gray-600" > Yükleme < /p> < /
                        div > <
                        div >
                        <
                        p className = "text-lg font-semibold text-gray-900" > { album.total_size_mb }
                        MB < /p> <
                        p className = "text-xs text-gray-600" > Boyut < /p> < /
                        div > <
                        div >
                        <
                        p className = "text-lg font-semibold text-gray-900" > { album.view_count } < /p> <
                        p className = "text-xs text-gray-600" > Görüntüleme < /p> < /
                        div > <
                        /div>

                        <
                        div className = "flex space-x-2" >
                        <
                        Link to = { `/album/${album.id}` }
                        className = "flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors" >
                        Görüntüle <
                        /Link> <
                        Link to = { `/album/${album.id}/edit` }
                        className = "flex-1 bg-gray-600 text-white text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors" >
                        Düzenle <
                        /Link> < /
                        div > <
                        /div>
                    ))
                } <
                /div>
            )
        } <
        /div> < /
        div > <
        /div> < /
        div >
    );
};

export default DashboardPage;