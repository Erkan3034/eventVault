import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const ProfilePage = () => {
    const { user, updateProfile } = useAuth();
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await updateProfile(form);
            if (result.success) {
                toast.success('Profil güncellendi!');
            } else {
                toast.error(result.error || 'Güncelleme başarısız');
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div className = "min-h-screen flex items-center justify-center" > Yükleniyor... < /div>;
    }

    return ( <
        div className = "max-w-2xl mx-auto py-12" >
        <
        h2 className = "text-2xl font-bold mb-8" > Profil < /h2> <
        div className = "bg-white shadow rounded-lg p-6" >
        <
        form onSubmit = { handleSubmit }
        className = "space-y-6" >
        <
        div className = "grid grid-cols-1 md:grid-cols-2 gap-6" >
        <
        div >
        <
        label className = "block text-sm font-medium text-gray-700" > Ad < /label> <
        input type = "text"
        name = "first_name"
        value = { form.first_name }
        onChange = { handleChange }
        className = "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" /
        >
        <
        /div> <
        div >
        <
        label className = "block text-sm font-medium text-gray-700" > Soyad < /label> <
        input type = "text"
        name = "last_name"
        value = { form.last_name }
        onChange = { handleChange }
        className = "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" /
        >
        <
        /div> <
        /div> <
        div >
        <
        label className = "block text-sm font-medium text-gray-700" > E - posta < /label> <
        input type = "email"
        name = "email"
        value = { form.email }
        onChange = { handleChange }
        className = "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" /
        >
        <
        /div> <
        div >
        <
        label className = "block text-sm font-medium text-gray-700" > Telefon < /label> <
        input type = "tel"
        name = "phone"
        value = { form.phone }
        onChange = { handleChange }
        className = "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" /
        >
        <
        /div> <
        button type = "submit"
        disabled = { loading }
        className = "w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50" >
        { loading ? 'Güncelleniyor...' : 'Güncelle' } <
        /button> <
        /form> <
        /div> <
        /div>
    );
};

export default ProfilePage;