import React from 'react';
import { Link } from 'react-router-dom';
import {
    CameraIcon,
    QrCodeIcon,
    CloudArrowUpIcon,
    HeartIcon,
    UsersIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const features = [
    {
        icon: QrCodeIcon,
        title: 'QR ile paylaşım',
        description: 'Albümünüze özel bir kod oluşturun. Misafirler kamerayı açıp yüklemeye başlar.',
    },
    {
        icon: CloudArrowUpIcon,
        title: 'Kayıtsız yükleme',
        description: 'Davetliler hesap açmadan fotoğraf, video ve ses bırakabilir.',
    },
    {
        icon: ShieldCheckIcon,
        title: 'Sakin ve özel',
        description: 'Albüm gizliliği sizin elinizde. İstediğinizde kapatır, arşivlersiniz.',
    },
    {
        icon: UsersIcon,
        title: 'Birlikte yönetin',
        description: 'Aile ve yakınlarınızla albüm yönetimini paylaşabilirsiniz.',
    },
    {
        icon: HeartIcon,
        title: 'Notlar ve tepkiler',
        description: 'Her yüklemenin altına bir satır bırakın; anı kendi sesini taşısın.',
    },
    {
        icon: CameraIcon,
        title: 'Tüm medya',
        description: 'Fotoğraf, video, ses ve kısa mesajlar tek galeride toplanır.',
    },
];

const eventTypes = ['Düğün', 'Nişan', 'Doğum günü', 'Mezuniyet', 'Yıldönümü', 'Baby shower'];

const steps = [
    { n: '01', title: 'Albüm oluşturun', text: 'Etkinlik bilgilerini girin. QR kod ve yükleme bağlantısı hazır olur.' },
    { n: '02', title: 'Davet edin', text: 'Kodu masaya koyun veya bağlantıyı paylaşın. Misafirler kayıt olmaz.' },
    { n: '03', title: 'Toplayın', text: 'Galeride gezin, notları okuyun, anıları güvenle saklayın.' },
];

const HomePage = () => {
    const { isAuthenticated } = useAuth();
    const primaryTo = isAuthenticated ? '/create-album' : '/register';
    const primaryLabel = isAuthenticated ? 'Albüm oluştur' : 'Ücretsiz başla';

    return (
        <div>
            <section className="relative overflow-hidden bg-navy text-cream">
                <div className="pointer-events-none absolute inset-0 opacity-40" style={{
                    background: 'radial-gradient(ellipse at 20% 0%, rgba(196,160,95,0.28), transparent 50%)',
                }} />
                <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
                    <p className="mb-6 text-[11px] uppercase tracking-[0.28em] text-gold">Dijital etkinlik albümü</p>
                    <h1 className="max-w-3xl font-display text-5xl leading-[1.05] text-cream md:text-7xl">
                        Anılar dağılmasın,<br />bir albümde toplansın.
                    </h1>
                    <p className="mt-7 max-w-xl text-lg leading-relaxed text-cream/70">
                        QR kod ile misafirlerinizin fotoğraf ve videolarını toplayın. Düğün masasında, mezuniyet sahnesinde, doğum günü sofrasında.
                    </p>
                    <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                        <Link to={primaryTo} className="btn-primary px-8 py-3.5 text-base">
                            {primaryLabel}
                        </Link>
                        {!isAuthenticated && (
                            <Link to="/login" className="btn border-2 border-cream/30 px-8 py-3.5 text-cream hover:bg-cream/10">
                                Giriş yap
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            <section className="py-20 md:py-24">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-gold-dark">Neden EventVault</p>
                        <h2 className="section-title mt-3">Sakin, net, kalıcı</h2>
                        <div className="gold-divider" />
                        <p className="section-subtitle mx-auto">
                            Etkinlikte çekilen her kare tek yerde kalsın diye tasarlandı. Kalabalık değil, düzenli.
                        </p>
                    </div>
                    <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => (
                            <div key={feature.title} className="card p-7">
                                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-cream-dark text-gold-dark">
                                    <feature.icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-display text-2xl text-navy">{feature.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-navy/60">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-y border-cream-dark bg-white py-20">
                <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-gold-dark">Her özel gün</p>
                    <h2 className="section-title mt-3">Düğünden mezuniyete</h2>
                    <div className="gold-divider" />
                    <div className="mt-10 flex flex-wrap justify-center gap-3">
                        {eventTypes.map((name) => (
                            <span key={name} className="rounded-full border border-cream-dark bg-cream px-5 py-2 text-sm text-navy">
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 md:py-24">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-gold-dark">Nasıl çalışır</p>
                        <h2 className="section-title mt-3">Üç adım</h2>
                        <div className="gold-divider" />
                    </div>
                    <div className="mt-14 grid gap-10 md:grid-cols-3">
                        {steps.map((step) => (
                            <div key={step.n}>
                                <p className="font-display text-4xl text-gold">{step.n}</p>
                                <h3 className="mt-3 font-display text-2xl text-navy">{step.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-navy/60">{step.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-navy py-20 text-center text-cream">
                <div className="mx-auto max-w-2xl px-4">
                    <h2 className="font-display text-4xl md:text-5xl">İlk albümünüzü açın</h2>
                    <p className="mt-4 text-cream/65">
                        Hesap ücretsiz. QR kodunuz dakikalar içinde hazır.
                    </p>
                    <Link to={primaryTo} className="btn-primary mt-8 inline-flex px-8 py-3.5">
                        {primaryLabel}
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
