import React from 'react';

const AboutPage = () => {
    return ( <
        div className = "max-w-4xl mx-auto py-12" >
        <
        h2 className = "text-3xl font-bold mb-8" > Hakkımızda < /h2> <
        div className = "prose max-w-none" >
        <
        p className = "text-lg mb-6" >
        EventVault, etkinliklerinizde çekilen fotoğraf, video ve ses dosyalarını kolayca toplamak için tasarlanmış modern bir dijital albüm platformudur. <
        /p> <
        h3 className = "text-xl font-semibold mb-4" > Misyonumuz < /h3> <
        p className = "mb-6" >
        Özel anlarınızı kaybetmemek ve sevdiklerinizle paylaşmak için güvenli, kullanıcı dostu ve yenilikçi çözümler sunmak. <
        /p> <
        h3 className = "text-xl font-semibold mb-4" > Özellikler < /h3> <
        ul className = "list-disc pl-6 mb-6" >
        <
        li > QR kod ile kolay paylaşım < /li> <
        li > Anonim dosya yükleme < /li> <
        li > Çoklu medya desteği < /li> <
        li > Güvenli ve özel albümler < /li> <
        li > İşbirlikçi yönetim < /li> <
        /ul> <
        h3 className = "text-xl font-semibold mb-4" > İletişim < /h3> <
        p className = "mb-4" >
        Sorularınız için: < a href = "mailto:info@eventvault.com"
        className = "text-blue-600" > info @eventvault.com < /a> <
        /p> <
        /div> <
        /div>
    );
};

export default AboutPage;