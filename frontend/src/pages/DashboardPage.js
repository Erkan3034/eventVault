import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    PlusIcon,
    PhotoIcon,
    EyeIcon,
    CloudArrowDownIcon,
    RectangleStackIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import PageLoader from '../components/PageLoader';

const unwrapList = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
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

const statusText = (status) => {
    switch (status) {
        case 'active':
            return 'Aktif';
        case 'completed':
            return 'Tamamlandı';
        case 'draft':
            return 'Taslak';
        case 'archived':
            return 'Arşiv';
        default:
            return status;
    }
};

const DashboardPage = () => {
    const { user } = useAuth();
    const [albums, setAlbums] = useState([]);
    const [stats, setStats] = useState({
        total_albums: 0,
        active_albums: 0,
        total_uploads: 0,
        total_size_mb: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [albumsRes, statsRes] = await Promise.all([
                    axios.get('/api/v1/albums/'),
                    axios.get('/api/v1/albums/user/stats/'),
                ]);
                setAlbums(unwrapList(albumsRes.data));
                setStats({
                    total_albums: statsRes.data.total_albums || 0,
                    active_albums: statsRes.data.active_albums || 0,
                    total_uploads: statsRes.data.total_uploads || 0,
                    total_size_mb: statsRes.data.total_size_mb || 0,
                });
            } catch (error) {
                setAlbums([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <PageLoader label="Albümler yükleniyor" />;

    const greeting = user && user.first_name ? user.first_name : 'Hoş geldiniz';

    const statCards = [
        { label: 'Albüm', value: stats.total_albums, icon: RectangleStackIcon },
        { label: 'Aktif', value: stats.active_albums, icon: EyeIcon },
        { label: 'Yükleme', value: stats.total_uploads, icon: PhotoIcon },
        { label: 'Boyut', value: `${stats.total_size_mb} MB`, icon: CloudArrowDownIcon },
    ];

    return (
        <div className="page">
            <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-gold-dark">Albümlerim</p>
                    <h1 className="mt-2 font-display text-4xl text-navy md:text-5xl">{greeting}</h1>
                    <p className="mt-2 text-navy/55">Etkinliklerinizi buradan yönetin.</p>
                </div>
                <Link to="/create-album" className="btn-primary">
                    <PlusIcon className="h-5 w-5" />
                    Yeni albüm
                </Link>
            </div>

            <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {statCards.map((card) => (
                    <div key={card.label} className="card p-5">
                        <card.icon className="h-5 w-5 text-gold-dark" />
                        <p className="mt-4 font-display text-3xl text-navy">{card.value}</p>
                        <p className="mt-1 text-xs uppercase tracking-wider text-navy/45">{card.label}</p>
                    </div>
                ))}
            </div>

            {albums.length === 0 ? (
                <div className="card px-8 py-16 text-center">
                    <PhotoIcon className="mx-auto h-10 w-10 text-gold" />
                    <h2 className="mt-4 font-display text-3xl text-navy">Henüz albüm yok</h2>
                    <p className="mt-2 text-sm text-navy/55">İlk etkinliğiniz için bir albüm açın.</p>
                    <Link to="/create-album" className="btn-primary mt-6 inline-flex">
                        Albüm oluştur
                    </Link>
                </div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {albums.map((album) => {
                        const eventName = album.event_type && (album.event_type.name_tr || album.event_type.name);
                        const dateLabel = album.event_date
                            ? new Date(album.event_date).toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })
                            : '';
                        return (
                            <article key={album.id} className="card flex flex-col p-6">
                                <div className="mb-4 flex items-start justify-between gap-3">
                                    <h3 className="font-display text-2xl leading-snug text-navy">{album.title}</h3>
                                    <span className={statusClass(album.status)}>{statusText(album.status)}</span>
                                </div>
                                <p className="text-sm text-navy/55">
                                    {[eventName, dateLabel].filter(Boolean).join(' · ')}
                                </p>
                                <div className="mt-6 grid grid-cols-3 gap-2 border-y border-cream-dark py-4 text-center">
                                    <div>
                                        <p className="font-display text-xl text-navy">{album.total_uploads || 0}</p>
                                        <p className="text-[11px] uppercase tracking-wide text-navy/40">Yükleme</p>
                                    </div>
                                    <div>
                                        <p className="font-display text-xl text-navy">{album.total_size_mb || 0}</p>
                                        <p className="text-[11px] uppercase tracking-wide text-navy/40">MB</p>
                                    </div>
                                    <div>
                                        <p className="font-display text-xl text-navy">{album.view_count || 0}</p>
                                        <p className="text-[11px] uppercase tracking-wide text-navy/40">Görüntüleme</p>
                                    </div>
                                </div>
                                <div className="mt-5 flex gap-2">
                                    <Link to={`/album/${album.id}`} className="btn-primary flex-1 py-2.5 text-sm">
                                        Galeri
                                    </Link>
                                    <Link to={`/album/${album.id}/edit`} className="btn-secondary flex-1 py-2.5 text-sm">
                                        Düzenle
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
