import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    CameraIcon,
    QrCodeIcon,
    CloudArrowUpIcon,
    HeartIcon,
    UsersIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const HomePage = () => {
    const { isAuthenticated } = useAuth();

    const features = [{
            icon: QrCodeIcon,
            title: 'QR Kod ile Kolay Paylaşım',
            description: 'Albümünüz için özel QR kod oluşturun ve misafirlerinizle kolayca paylaşın.',
        },
        {
            icon: CloudArrowUpIcon,
            title: 'Anonim Dosya Yükleme',
            description: 'Misafirleriniz kayıt olmadan fotoğraf, video ve ses dosyalarını yükleyebilir.',
        },
        {
            icon: ShieldCheckIcon,
            title: 'Güvenli ve Özel',
            description: 'Albümleriniz şifre korumalı ve sadece sizin kontrolünüzde.',
        },
        {
            icon: UsersIcon,
            title: 'İşbirlikçi Yönetim',
            description: 'Aileniz ve arkadaşlarınızla albüm yönetimini paylaşın.',
        },
        {
            icon: HeartIcon,
            title: 'Beğeni ve Yorumlar',
            description: 'Yüklenen içerikler için beğeni ve yorum sistemi.',
        },
        {
            icon: CameraIcon,
            title: 'Çoklu Medya Desteği',
            description: 'Fotoğraf, video, ses ve metin mesajları desteklenir.',
        },
    ];

    const eventTypes = [
        { name: 'Düğün', color: 'bg-pink-500', icon: '💒' },
        { name: 'Doğum Günü', color: 'bg-yellow-500', icon: '🎂' },
        { name: 'Mezuniyet', color: 'bg-blue-500', icon: '🎓' },
        { name: 'Nişan', color: 'bg-purple-500', icon: '💍' },
        { name: 'Yıldönümü', color: 'bg-red-500', icon: '💕' },
        { name: 'Baby Shower', color: 'bg-green-500', icon: '👶' },
    ];

    return ( <
        div className = "min-h-screen" > { /* Hero Section */ } <
        section className = "relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white" >
        <
        div className = "absolute inset-0 bg-black opacity-20" / >
        <
        div className = "relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24" >
        <
        div className = "text-center" >
        <
        h1 className = "text-4xl md:text-6xl font-bold mb-6" >
        Etkinlik Anılarınızı { ' ' } <
        span className = "block text-yellow-300" >
        Dijital Albümde Toplayın <
        /span> <
        /h1> <
        p className = "text-xl md:text-2xl mb-8 max-w-3xl mx-auto" >
        QR kod ile misafirlerinizin fotoğraf, video ve ses dosyalarını kolayca toplayın.Düğün, doğum günü, mezuniyet ve daha fazlası için. <
        /p> <
        div className = "flex flex-col sm:flex-row gap-4 justify-center" > {
            isAuthenticated ? ( <
                Link to = "/create-album"
                className = "bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors" >
                Albüm Oluştur <
                /Link>
            ) : ( <
                >
                <
                Link to = "/register"
                className = "bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors" >
                Ücretsiz Başla <
                /Link> <
                Link to = "/login"
                className = "border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors" >
                Giriş Yap <
                /Link> <
                />
            )
        } <
        /div> <
        /div> <
        /div> <
        /section>

        { /* Features Section */ } <
        section className = "py-20 bg-gray-50" >
        <
        div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" >
        <
        div className = "text-center mb-16" >
        <
        h2 className = "text-3xl md:text-4xl font-bold text-gray-900 mb-4" >
        Neden EventVault ?
        <
        /h2> <
        p className = "text-xl text-gray-600 max-w-3xl mx-auto" >
        Etkinliklerinizde çekilen tüm anıları tek bir yerde toplamak için tasarlanmış modern ve kullanıcı dostu platform. <
        /p> <
        /div>

        <
        div className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" > {
            features.map((feature, index) => ( <
                div key = { index }
                className = "bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow" >
                <
                div className = "w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6" >
                <
                feature.icon className = "w-6 h-6 text-blue-600" / >
                <
                /div> <
                h3 className = "text-xl font-semibold text-gray-900 mb-4" > { feature.title } <
                /h3> <
                p className = "text-gray-600" > { feature.description } < /p> <
                /div>
            ))
        } <
        /div> <
        /div> <
        /section>

        { /* Event Types Section */ } <
        section className = "py-20 bg-white" >
        <
        div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" >
        <
        div className = "text-center mb-16" >
        <
        h2 className = "text-3xl md:text-4xl font-bold text-gray-900 mb-4" >
        Her Etkinlik İçin <
        /h2> <
        p className = "text-xl text-gray-600" >
        Düğünden doğum gününe, mezuniyetten yıldönümüne kadar tüm özel anlarınız için. <
        /p> <
        /div>

        <
        div className = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6" > {
            eventTypes.map((event, index) => ( <
                div key = { index }
                className = "text-center group cursor-pointer" >
                <
                div className = { `w-16 h-16 ${event.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform` } >
                <
                span className = "text-2xl" > { event.icon } < /span> <
                /div> <
                h3 className = "font-semibold text-gray-900" > { event.name } < /h3> <
                /div>
            ))
        } <
        /div> <
        /div> <
        /section>

        { /* How It Works Section */ } <
        section className = "py-20 bg-gray-50" >
        <
        div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" >
        <
        div className = "text-center mb-16" >
        <
        h2 className = "text-3xl md:text-4xl font-bold text-gray-900 mb-4" >
        Nasıl Çalışır ?
        <
        /h2> <
        p className = "text-xl text-gray-600" >
        3 basit adımda etkinlik albümünüzü oluşturun <
        /p> <
        /div>

        <
        div className = "grid grid-cols-1 md:grid-cols-3 gap-8" >
        <
        div className = "text-center" >
        <
        div className = "w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold" >
        1 <
        /div> <
        h3 className = "text-xl font-semibold text-gray-900 mb-4" >
        Albüm Oluşturun <
        /h3> <
        p className = "text-gray-600" >
        Etkinlik bilgilerinizi girin ve albümünüzü oluşturun.Otomatik olarak QR kod ve yükleme linki oluşturulur. <
        /p> <
        /div>

        <
        div className = "text-center" >
        <
        div className = "w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold" >
        2 <
        /div> <
        h3 className = "text-xl font-semibold text-gray-900 mb-4" >
        Paylaşın <
        /h3> <
        p className = "text-gray-600" >
        QR kodu veya linki misafirlerinizle paylaşın.Onlar kayıt olmadan dosyalarını yükleyebilir. <
        /p> <
        /div>

        <
        div className = "text-center" >
        <
        div className = "w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold" >
        3 <
        /div> <
        h3 className = "text-xl font-semibold text-gray-900 mb-4" >
        Toplayın <
        /h3> <
        p className = "text-gray-600" >
        Yüklenen tüm dosyaları görüntüleyin, indirin ve anılarınızı güvenle saklayın. <
        /p> <
        /div> <
        /div> <
        /div> <
        /section>

        { /* CTA Section */ } <
        section className = "py-20 bg-blue-600 text-white" >
        <
        div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" >
        <
        h2 className = "text-3xl md:text-4xl font-bold mb-6" >
        Hemen Başlayın <
        /h2> <
        p className = "text-xl mb-8 max-w-2xl mx-auto" >
        Etkinlik anılarınızı dijital albümde toplamaya başlayın.Ücretsiz hesap oluşturun ve ilk albümünüzü hemen oluşturun. <
        /p> <
        Link to = { isAuthenticated ? '/create-album' : '/register' }
        className = "bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-block" >
        { isAuthenticated ? 'Albüm Oluştur' : 'Ücretsiz Başla' } <
        /Link> <
        /div> <
        /section> <
        /div>
    );
};

export default HomePage;