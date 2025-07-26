import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                toast.success('Başarıyla giriş yapıldı!');
                navigate('/dashboard');
            } else {
                toast.error(result.error || 'Giriş başarısız');
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return ( <
        div className = "min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8" >
        <
        div className = "sm:mx-auto sm:w-full sm:max-w-md" >
        <
        div className = "flex justify-center" >
        <
        div className = "w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center" >
        <
        span className = "text-white font-bold text-xl" > E < /span> <
        /div> <
        /div> <
        h2 className = "mt-6 text-center text-3xl font-extrabold text-gray-900" >
        Hesabınıza giriş yapın <
        /h2> <
        p className = "mt-2 text-center text-sm text-gray-600" >
        Veya { ' ' } <
        Link to = "/register"
        className = "font-medium text-blue-600 hover:text-blue-500" >
        yeni hesap oluşturun <
        /Link> <
        /p> <
        /div>

        <
        div className = "mt-8 sm:mx-auto sm:w-full sm:max-w-md" >
        <
        div className = "bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10" >
        <
        form className = "space-y-6"
        onSubmit = { handleSubmit } >
        <
        div >
        <
        label htmlFor = "email"
        className = "block text-sm font-medium text-gray-700" >
        E - posta adresi <
        /label> <
        div className = "mt-1" >
        <
        input id = "email"
        name = "email"
        type = "email"
        autoComplete = "email"
        required value = { formData.email }
        onChange = { handleChange }
        className = "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder = "ornek@email.com" /
        >
        <
        /div> <
        /div>

        <
        div >
        <
        label htmlFor = "password"
        className = "block text-sm font-medium text-gray-700" >
        Şifre <
        /label> <
        div className = "mt-1" >
        <
        input id = "password"
        name = "password"
        type = "password"
        autoComplete = "current-password"
        required value = { formData.password }
        onChange = { handleChange }
        className = "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder = "••••••••" /
        >
        <
        /div> <
        /div>

        <
        div className = "flex items-center justify-between" >
        <
        div className = "flex items-center" >
        <
        input id = "remember-me"
        name = "remember-me"
        type = "checkbox"
        className = "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" /
        >
        <
        label htmlFor = "remember-me"
        className = "ml-2 block text-sm text-gray-900" >
        Beni hatırla <
        /label> <
        /div>

        <
        div className = "text-sm" >
        <
        a href = "#"
        className = "font-medium text-blue-600 hover:text-blue-500" >
        Şifrenizi mi unuttunuz ?
        <
        /a> <
        /div> <
        /div>

        <
        div >
        <
        button type = "submit"
        disabled = { loading }
        className = "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" >
        { loading ? 'Giriş yapılıyor...' : 'Giriş Yap' } <
        /button> <
        /div> <
        /form>

        <
        div className = "mt-6" >
        <
        div className = "relative" >
        <
        div className = "absolute inset-0 flex items-center" >
        <
        div className = "w-full border-t border-gray-300" / >
        <
        /div> <
        div className = "relative flex justify-center text-sm" >
        <
        span className = "px-2 bg-white text-gray-500" > Veya < /span> <
        /div> <
        /div>

        <
        div className = "mt-6 grid grid-cols-2 gap-3" >
        <
        div >
        <
        a href = "#"
        className = "w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50" >
        <
        span className = "sr-only" > Google ile giriş yap < /span> <
        svg className = "w-5 h-5"
        viewBox = "0 0 24 24" >
        <
        path fill = "currentColor"
        d = "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /
        >
        <
        path fill = "currentColor"
        d = "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /
        >
        <
        path fill = "currentColor"
        d = "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /
        >
        <
        path fill = "currentColor"
        d = "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /
        >
        <
        /svg> <
        /a> <
        /div>

        <
        div >
        <
        a href = "#"
        className = "w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50" >
        <
        span className = "sr-only" > Facebook ile giriş yap < /span> <
        svg className = "w-5 h-5"
        fill = "currentColor"
        viewBox = "0 0 20 20" >
        <
        path fillRule = "evenodd"
        d = "M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
        clipRule = "evenodd" /
        >
        <
        /svg> <
        /a> <
        /div> <
        /div> <
        /div> <
        /div> <
        /div> <
        /div>
    );
};

export default LoginPage;