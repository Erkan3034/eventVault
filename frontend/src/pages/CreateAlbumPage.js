import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import QRCode from 'qrcode.react';

const CreateAlbumPage = () => {
    const [form, setForm] = useState({
        title: '',
        event_type_id: '',
        event_date: '',
        event_location: '',
        privacy: 'private',
        description: ''
    });
    const [eventTypes, setEventTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [album, setAlbum] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEventTypes();
    }, []);

    const fetchEventTypes = async() => {
        try {
            const res = await axios.get('/api/v1/albums/event-types/');
            setEventTypes(res.data);
        } catch (err) {
            setEventTypes([]);
        }
    };

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/api/v1/albums/', form);
            setAlbum(res.data);
            toast.success('Albüm başarıyla oluşturuldu!');
        } catch (err) {
            toast.error('Albüm oluşturulamadı.');
        } finally {
            setLoading(false);
        }
    };

    if (album) {
        return ( <
            div className = "max-w-xl mx-auto py-12" >
            <
            h2 className = "text-2xl font-bold mb-4" > Albüm Oluşturuldu! < /h2> <
            p className = "mb-4" > QR kodu davetlilerinizle paylaşabilirsiniz: < /p> <
            div className = "flex flex-col items-center mb-6" >
            <
            QRCode value = { window.location.origin + '/upload/' + album.access_code }
            size = { 200 }
            /> <
            p className = "mt-4 text-sm text-gray-600 break-all" > { window.location.origin + '/upload/' + album.access_code } <
            /p> <
            /div> <
            button className = "bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700"
            onClick = {
                () => navigate(`/album/${album.id}`) } >
            Albüme Git <
            /button> <
            /div>
        );
    }

    return ( <
        div className = "max-w-xl mx-auto py-12" >
        <
        h2 className = "text-2xl font-bold mb-6" > Yeni Albüm Oluştur < /h2> <
        form className = "space-y-6"
        onSubmit = { handleSubmit } >
        <
        div >
        <
        label className = "block text-sm font-medium text-gray-700" > Albüm Başlığı < /label> <
        input type = "text"
        name = "title"
        value = { form.title }
        onChange = { handleChange }
        required className = "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" /
        >
        <
        /div> <
        div >
        <
        label className = "block text-sm font-medium text-gray-700" > Etkinlik Türü < /label> <
        select name = "event_type_id"
        value = { form.event_type_id }
        onChange = { handleChange }
        required className = "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" >
        <
        option value = "" > Seçiniz < /option> {
            eventTypes.map((et) => ( <
                option key = { et.id }
                value = { et.id } > { et.name } < /option>
            ))
        } <
        /select> <
        /div> <
        div >
        <
        label className = "block text-sm font-medium text-gray-700" > Etkinlik Tarihi < /label> <
        input type = "date"
        name = "event_date"
        value = { form.event_date }
        onChange = { handleChange }
        required className = "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" /
        >
        <
        /div> <
        div >
        <
        label className = "block text-sm font-medium text-gray-700" > Etkinlik Lokasyonu < /label> <
        input type = "text"
        name = "event_location"
        value = { form.event_location }
        onChange = { handleChange }
        className = "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" /
        >
        <
        /div> <
        div >
        <
        label className = "block text-sm font-medium text-gray-700" > Açıklama < /label> <
        textarea name = "description"
        value = { form.description }
        onChange = { handleChange }
        rows = { 3 }
        className = "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" /
        >
        <
        /div> <
        div >
        <
        label className = "block text-sm font-medium text-gray-700" > Gizlilik < /label> <
        select name = "privacy"
        value = { form.privacy }
        onChange = { handleChange }
        className = "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" >
        <
        option value = "private" > Özel < /option> <
        option value = "public" > Herkese Açık < /option> <
        /select> <
        /div> <
        button type = "submit"
        disabled = { loading }
        className = "w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50" >
        { loading ? 'Oluşturuluyor...' : 'Albüm Oluştur' } <
        /button> <
        /form> <
        /div>
    );
};

export default CreateAlbumPage;