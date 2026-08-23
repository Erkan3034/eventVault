import React, { useEffect, useState } from 'react';
import PageLoader from '../components/PageLoader';

const AdminPanelPage = () => {
    const [albums, setAlbums] = useState([]);
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setAlbums([
            { id: 1, title: 'Düğün Albümü', owner: 'admin', status: 'active' },
            { id: 2, title: 'Mezuniyet', owner: 'user1', status: 'completed' },
        ]);
        setUsers([
            { id: 1, name: 'admin', email: 'admin@example.com' },
            { id: 2, name: 'user1', email: 'user1@example.com' },
        ]);
        setReports([
            { id: 1, upload: 'IMG_1234.jpg', reason: 'Uygunsuz içerik', status: 'pending' },
        ]);
        setLoading(false);
    }, []);

    if (loading) return <PageLoader />;

    const Table = ({ columns, rows, render }) => (
        <div className="card overflow-hidden">
            <table className="min-w-full text-left text-sm">
                <thead className="bg-cream-dark/60 text-[11px] uppercase tracking-[0.14em] text-navy/50">
                    <tr>
                        {columns.map((col) => (
                            <th key={col} className="px-4 py-3 font-medium">{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-cream-dark text-navy/80">
                    {rows.map(render)}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="page">
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold-dark">Yönetim</p>
            <h1 className="mt-2 font-display text-4xl text-navy">Admin paneli</h1>
            <p className="mt-2 text-sm text-navy/50">Örnek veriler — gerçek API henüz bağlı değil.</p>

            <section className="mt-10">
                <h2 className="mb-3 font-display text-2xl text-navy">Albümler</h2>
                <Table
                    columns={['Başlık', 'Sahibi', 'Durum']}
                    rows={albums}
                    render={(album) => (
                        <tr key={album.id}>
                            <td className="px-4 py-3">{album.title}</td>
                            <td className="px-4 py-3">{album.owner}</td>
                            <td className="px-4 py-3">{album.status}</td>
                        </tr>
                    )}
                />
            </section>

            <section className="mt-10">
                <h2 className="mb-3 font-display text-2xl text-navy">Kullanıcılar</h2>
                <Table
                    columns={['Ad', 'E-posta']}
                    rows={users}
                    render={(user) => (
                        <tr key={user.id}>
                            <td className="px-4 py-3">{user.name}</td>
                            <td className="px-4 py-3">{user.email}</td>
                        </tr>
                    )}
                />
            </section>

            <section className="mt-10">
                <h2 className="mb-3 font-display text-2xl text-navy">Raporlar</h2>
                <Table
                    columns={['Dosya', 'Sebep', 'Durum']}
                    rows={reports}
                    render={(report) => (
                        <tr key={report.id}>
                            <td className="px-4 py-3">{report.upload}</td>
                            <td className="px-4 py-3">{report.reason}</td>
                            <td className="px-4 py-3">{report.status}</td>
                        </tr>
                    )}
                />
            </section>
        </div>
    );
};

export default AdminPanelPage;
