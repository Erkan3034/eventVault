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
import HeroScene, { PHOTOS } from '../components/HeroScene';

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

const moments = [
    { name: 'Düğün', image: PHOTOS.wedding },
    { name: 'Nişan', image: PHOTOS.rings },
    { name: 'Masa & davet', image: PHOTOS.table },
    { name: 'Kutlama', image: PHOTOS.dinner },
    { name: 'Çift', image: PHOTOS.couple },
    { name: 'Doğum günü', image: PHOTOS.cake },
];

const steps = [
    {
        n: '01',
        title: 'Albüm oluşturun',
        text: 'Etkinlik bilgilerini girin. QR kod ve yükleme bağlantısı hazır olur.',
        image: PHOTOS.table,
    },
    {
        n: '02',
        title: 'Masaya koyun',
        text: 'Kodu paylaşın. Misafirler kayıt olmadan fotoğraf bırakır.',
        image: PHOTOS.rings,
    },
    {
        n: '03',
        title: 'Galeride toplayın',
        text: 'Notları okuyun, kareler arasında gezinin, anıları saklayın.',
        image: PHOTOS.couple,
    },
];

const HomePage = () => {
    const { isAuthenticated } = useAuth();
    const primaryTo = isAuthenticated ? '/create-album' : '/register';
    const primaryLabel = isAuthenticated ? 'Albüm oluştur' : 'Ücretsiz başla';

    return (
        <div>
            <section className="relative overflow-hidden bg-navy text-cream">
                <div
                    className="pointer-events-none absolute inset-0 opacity-40"
                    style={{
                        background: 'radial-gradient(ellipse at 20% 0%, rgba(196,160,95,0.28), transparent 50%)',
                    }}
                />
                <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
                    <div className="reveal">
                        <p className="mb-6 text-[11px] uppercase tracking-[0.28em] text-gold">Dijital etkinlik albümü</p>
                        <h1 className="max-w-xl font-display text-5xl leading-[1.05] text-cream md:text-6xl xl:text-7xl">
                            Anılar dağılmasın,<br />bir albümde toplansın.
                        </h1>
                        <p className="mt-7 max-w-md text-lg leading-relaxed text-cream/70">
                            QR kod masada, telefonlarda kamera açık. Misafirleriniz kayıt olmadan fotoğraf ve video bırakır.
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
                        <p className="mt-8 text-sm text-cream/45">
                            Düğün · kına · cinsiyet partisi · after party · kurumsal
                        </p>
                    </div>
                    <div className="reveal" style={{ animationDelay: '120ms' }}>
                        <HeroScene />
                    </div>
                </div>
            </section>

            <section className="border-b border-cream-dark bg-white py-8">
                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 text-center sm:grid-cols-3 sm:px-6 lg:px-8">
                    <div>
                        <p className="font-display text-2xl text-navy">QR okutun</p>
                        <p className="mt-1 text-sm text-navy/50">Masadaki kod albümü açar</p>
                    </div>
                    <div>
                        <p className="font-display text-2xl text-navy">Anı bırakın</p>
                        <p className="mt-1 text-sm text-navy/50">Hesap gerekmez</p>
                    </div>
                    <div>
                        <p className="font-display text-2xl text-navy">Tek yerde kalır</p>
                        <p className="mt-1 text-sm text-navy/50">Galeri size aittir</p>
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
                            <div key={feature.title} className="card p-7 transition duration-300 hover:-translate-y-1 hover:shadow-navy">
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
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-gold-dark">Her özel gün</p>
                        <h2 className="section-title mt-3">Düğünden kutlamaya</h2>
                        <div className="gold-divider" />
                    </div>
                    <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3">
                        {moments.map((moment) => (
                            <figure key={moment.name} className="group relative overflow-hidden rounded-2xl">
                                <img
                                    src={moment.image}
                                    alt={moment.name}
                                    className="photo-grade h-44 w-full object-cover transition duration-700 group-hover:scale-105 md:h-56"
                                />
                                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent px-4 pb-3 pt-10 font-display text-xl text-cream">
                                    {moment.name}
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                    <p className="mt-8 text-center text-sm text-navy/45">
                        Kına, after party, cinsiyet partisi, sünnet, kurumsal lansman, iftar ve daha fazlası albüm türlerinde.
                    </p>
                </div>
            </section>

            <section className="py-20 md:py-24">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-gold-dark">Nasıl çalışır</p>
                        <h2 className="section-title mt-3">Üç adım</h2>
                        <div className="gold-divider" />
                    </div>
                    <div className="mt-14 grid gap-6 md:grid-cols-3">
                        {steps.map((step) => (
                            <article key={step.n} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-cream-dark">
                                <div className="relative h-40 overflow-hidden">
                                    <img src={step.image} alt="" className="photo-grade h-full w-full object-cover" />
                                    <span className="absolute left-4 top-4 font-display text-3xl text-cream">{step.n}</span>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-display text-2xl text-navy">{step.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-navy/60">{step.text}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden py-24 text-center text-cream">
                <img
                    src={PHOTOS.dinner}
                    alt=""
                    className="photo-grade absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-navy/80" />
                <div className="relative mx-auto max-w-2xl px-4">
                    <h2 className="font-display text-4xl md:text-5xl">İlk albümünüzü açın</h2>
                    <p className="mt-4 text-cream/70">
                        Hesap ücretsiz. QR kodunuz dakikalar içinde masada olabilir.
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
