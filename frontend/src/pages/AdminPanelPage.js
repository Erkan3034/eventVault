import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPanelPage = () => {
    const [albums, setAlbums] = useState([]);
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async() => {
        setLoading(true);
        try {
            // TODO: Replace with actual API endpoints
            setAlbums([
                { id: 1, title: 'Düğün Albümü', owner: 'admin', status: 'active' },
                { id: 2, title: 'Mezuniyet', owner: 'user1', status: 'completed' }
            ]);
            setUsers([
                { id: 1, name: 'admin', email: 'admin@example.com' },
                { id: 2, name: 'user1', email: 'user1@example.com' }
            ]);
            setReports([
                { id: 1, upload: 'IMG_1234.jpg', reason: 'Uygunsuz içerik', status: 'pending' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className = "min-h-screen flex items-center justify-center" > Yükleniyor... < /div>;
    }

    return ( <
        div className = "max-w-5xl mx-auto py-12" >
        <
        h2 className = "text-2xl font-bold mb-8" > Admin Paneli < /h2> <
        div className = "mb-8" >
        <
        h3 className = "text-lg font-semibold mb-2" > Albümler < /h3> <
        table className = "min-w-full bg-white border rounded" >
        <
        thead >
        <
        tr >
        <
        th className = "px-4 py-2 border" > Başlık < /th> <
        th className = "px-4 py-2 border" > Sahibi < /th> <
        th className = "px-4 py-2 border" > Durum < /th> <
        /tr> <
        /thead> <
        tbody > {
            albums.map(album => ( <
                tr key = { album.id }
                className = "border-t" >
                <
                td className = "px-4 py-2 border" > { album.title } < /td> <
                td className = "px-4 py-2 border" > { album.owner } < /td> <
                td className = "px-4 py-2 border" > { album.status } < /td> <
                /tr>
            ))
        } <
        /tbody> <
        /table> <
        /div> <
        div className = "mb-8" >
        <
        h3 className = "text-lg font-semibold mb-2" > Kullanıcılar < /h3> <
        table className = "min-w-full bg-white border rounded" >
        <
        thead >
        <
        tr >
        <
        th className = "px-4 py-2 border" > Ad < /th> <
        th className = "px-4 py-2 border" > E - posta < /th> <
        /tr> <
        /thead> <
        tbody > {
            users.map(user => ( <
                tr key = { user.id }
                className = "border-t" >
                <
                td className = "px-4 py-2 border" > { user.name } < /td> <
                td className = "px-4 py-2 border" > { user.email } < /td> <
                /tr>
            ))
        } <
        /tbody> <
        /table> <
        /div> <
        div >
        <
        h3 className = "text-lg font-semibold mb-2" > Raporlanan İçerikler < /h3> <
        table className = "min-w-full bg-white border rounded" >
        <
        thead >
        <
        tr >
        <
        th className = "px-4 py-2 border" > Dosya < /th> <
        th className = "px-4 py-2 border" > Sebep < /th> <
        th className = "px-4 py-2 border" > Durum < /th> <
        /tr> <
        /thead> <
        tbody > {
            reports.map(report => ( <
                tr key = { report.id }
                className = "border-t" >
                <
                td className = "px-4 py-2 border" > { report.upload } < /td> <
                td className = "px-4 py-2 border" > { report.reason } < /td> <
                td className = "px-4 py-2 border" > { report.status } < /td> <
                /tr>
            ))
        } <
        /tbody> <
        /table> <
        /div> <
        /div>
    );
};

export default AdminPanelPage;