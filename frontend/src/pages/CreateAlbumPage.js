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
        privacy: 'private', // Default to 'private'
        description: ''
    });
    const [eventTypes, setEventTypes] = useState([]);
    const [loading, setLoading] = useState(true); // Initial loading state for fetching event types
    const [album, setAlbum] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const initializePage = async() => {
            await fetchEventTypes();
            setLoading(false); // Set loading to false after event types are fetched
        };
        initializePage();
    }, []);

    const fetchEventTypes = async() => {
        try {
            const res = await axios.get('/api/v1/albums/event-types/');
            const data = res.data;
            setEventTypes(Array.isArray(data) ? data : (data.results || []));
        } catch (err) {
            console.error('Error fetching event types:', err);
            toast.error('Etkinlik türleri yüklenirken bir hata oluştu.');
            setEventTypes([]); // Ensure eventTypes is an empty array on error
        }
    };

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        setLoading(true); // Set loading for form submission
        try {
            const res = await axios.post('/api/v1/albums/', form);
            setAlbum(res.data);
            toast.success('Albüm başarıyla oluşturuldu!');
        } catch (err) {
            console.error('Error creating album:', err); // Log the full error for debugging
            // Display a more specific error message if available from the API
            const errorMessage = err.response?.data?.message
                || (typeof err.response?.data === 'object'
                    ? Object.values(err.response.data).flat().join(' ')
                    : null)
                || 'Albüm oluşturulamadı. Lütfen tekrar deneyin.';
            toast.error(errorMessage);
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    // Show loading spinner while fetching event types initially
    if (loading && !album) {
        return ( <
            div className = "min-h-screen bg-gray-50 flex items-center justify-center" >
            <
            div className = "animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" > < /div> <
            /div>
        );
    }

    if (album) {
        return ( <
            div className = "max-w-xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-white shadow-lg rounded-lg" >
            <
            h2 className = "text-2xl font-bold mb-4 text-center text-gray-900" > Albüm Oluşturuldu! < /h2> <
            p className = "mb-6 text-center text-gray-700" > QR kodu davetlilerinizle paylaşabilir veya albüme gidebilirsiniz: < /p> <
            div className = "flex flex-col items-center mb-6 p-4 border border-gray-200 rounded-md bg-gray-50" >
            <
            QRCode value = { window.location.origin + '/upload/' + album.access_code }
            size = { 200 }
            level = "H" // High error correction for better scannability
            className = "p-2 bg-white rounded-md shadow" /
            >
            <
            p className = "mt-4 text-sm text-gray-600 break-all text-center" >
            <
            span className = "font-medium" > Yükleme Bağlantısı: < /span> <br / > { window.location.origin }
            /upload/ { album.access_code } <
            /p> <
            /div> <
            div className = "flex justify-center" >
            <
            button className = "bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick = {
                () => navigate(`/album/${album.id}`) } >
            Albüme Git <
            /button> <
            /div> <
            /div>
        );
    }

    return ( <
        div className = "max-w-xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-white shadow-lg rounded-lg" >
        <
        h2 className = "text-2xl font-bold mb-6 text-center text-gray-900" > Yeni Albüm Oluştur < /h2> <
        form className = "space-y-6"
        onSubmit = { handleSubmit } >
        <
        div >
        <
        label htmlFor = "title"
        className = "block text-sm font-medium text-gray-700" > Albüm Başlığı < /label> <
        input type = "text"
        id = "title"
        name = "title"
        value = { form.title }
        onChange = { handleChange }
        required className = "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm" /
        >
        <
        /div> <
        div >
        <
        label htmlFor = "event_type_id"
        className = "block text-sm font-medium text-gray-700" > Etkinlik Türü < /label> <
        select id = "event_type_id"
        name = "event_type_id"
        value = { form.event_type_id }
        onChange = { handleChange }
        required className = "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white" >
        <
        option value = "" > Seçiniz < /option> {
            eventTypes.map((et) => ( <
                option key = { et.id }
                value = { et.id } > { et.name_tr || et.name } < /option>
            ))
        } <
        /select> <
        /div> <
        div >
        <
        label htmlFor = "event_date"
        className = "block text-sm font-medium text-gray-700" > Etkinlik Tarihi < /label> <
        input type = "date"
        id = "event_date"
        name = "event_date"
        value = { form.event_date }
        onChange = { handleChange }
        required className = "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm" / >
        <
        /div> <
        div >
        <
        label htmlFor = "event_location"
        className = "block text-sm font-medium text-gray-700" > Etkinlik Lokasyonu < /label> <
        input type = "text"
        id = "event_location"
        name = "event_location"
        value = { form.event_location }
        onChange = { handleChange }
        className = "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm" / >
        <
        /div> <
        div >
        <
        label htmlFor = "description"
        className = "block text-sm font-medium text-gray-700" > Açıklama < /label> <
        textarea id = "description"
        name = "description"
        value = { form.description }
        onChange = { handleChange }
        rows = { 3 }
        className = "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm" /
        >
        <
        /div> <
        div >
        <
        label htmlFor = "privacy"
        className = "block text-sm font-medium text-gray-700" > Gizlilik < /label> <
        select id = "privacy"
        name = "privacy"
        value = { form.privacy }
        onChange = { handleChange }
        className = "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white" >
        <
        option value = "private" > Özel < /option> <
        option value = "public" > Herkese Açık < /option> <
        /select> <
        /div> <
        button type = "submit"
        disabled = { loading } // Disable during both initial data fetch and form submission
        className = "w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" >
        { loading ? 'Oluşturuluyor...' : 'Albüm Oluştur' } <
        /button> <
        /form> <
        /div>
    );
};

export default CreateAlbumPage;