import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
    'text/plain', 'application/pdf'
];

const UploadPage = () => {
    const { accessCode } = useParams();
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [uploaderName, setUploaderName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef();

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && !allowedTypes.includes(selected.type)) {
            toast.error('Desteklenmeyen dosya türü!');
            fileInputRef.current.value = '';
            return;
        }
        setFile(selected);
    };

    const handleSubmit = async(e) => {
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
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(true);
            setFile(null);
            setMessage('');
            setUploaderName('');
            fileInputRef.current.value = '';
            toast.success('Dosya başarıyla yüklendi!');
        } catch (err) {
            toast.error('Yükleme başarısız.');
        } finally {
            setUploading(false);
        }
    };

    if (success) {
        return ( <
            div className = "max-w-md mx-auto py-12 text-center" >
            <
            h2 className = "text-2xl font-bold mb-4" > Teşekkürler! < /h2> <
            p className = "mb-4" > Dosyanız başarıyla yüklendi.Albüm sahibi tarafından onaylandığında yayınlanacaktır. < /p> <
            button className = "bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700"
            onClick = {
                () => setSuccess(false) } >
            Yeni Dosya Yükle <
            /button> <
            /div>
        );
    }

    return ( <
        div className = "max-w-md mx-auto py-12" >
        <
        h2 className = "text-2xl font-bold mb-6" > Dosya Yükle < /h2> <
        form className = "space-y-6"
        onSubmit = { handleSubmit } >
        <
        div >
        <
        label className = "block text-sm font-medium text-gray-700" > Adınız(isteğe bağlı) < /label> <
        input type = "text"
        name = "uploader_name"
        value = { uploaderName }
        onChange = { e => setUploaderName(e.target.value) }
        className = "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder = "Adınız" /
        >
        <
        /div> <
        div >
        <
        label className = "block text-sm font-medium text-gray-700" > Dosya < /label> <
        input type = "file"
        accept = { allowedTypes.join(',') }
        onChange = { handleFileChange }
        ref = { fileInputRef }
        className = "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        required /
        >
        <
        /div> <
        div >
        <
        label className = "block text-sm font-medium text-gray-700" > Mesaj(isteğe bağlı) < /label> <
        textarea name = "message"
        value = { message }
        onChange = { e => setMessage(e.target.value) }
        rows = { 3 }
        className = "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder = "Bir mesaj bırakabilirsiniz..." /
        >
        <
        /div> <
        button type = "submit"
        disabled = { uploading }
        className = "w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50" >
        { uploading ? 'Yükleniyor...' : 'Yükle' } <
        /button> <
        /form> <
        /div>
    );
};

export default UploadPage;