# EventVault - Etkinlik Bazlı Dijital Albümler Platformu

EventVault, kullanıcıların özel etkinliklerinde (düğün, nişan, mezuniyet, parti vb.) çekilen fotoğraf, video, ses ve yazılı mesajların belirli bir albüme QR kod aracılığıyla yüklenmesini sağlayan bir platformdur.

## 🚀 Özellikler

- **Etkinlik Albümleri**: Düğün, nişan, mezuniyet gibi özel etkinlikler için dijital albümler
- **QR Kod Desteği**: Misafirlerin kolayca dosya yükleyebilmesi için QR kod oluşturma
- **Anonim Yükleme**: Misafirler kayıt olmadan dosya yükleyebilir
- **Çoklu Medya Desteği**: Fotoğraf, video, ses ve metin mesajları
- **İçerik Moderasyonu**: AI destekli uygunsuz içerik filtreleme
- **E-posta Bildirimleri**: Yeni yüklemeler için otomatik bildirimler
- **Admin Panel**: İçerik yönetimi ve istatistikler

## 🛠 Teknoloji Stack

### Backend
- **Framework**: Django Rest Framework (Python)
- **Database**: PostgreSQL
- **Authentication**: JWT + Refresh Token
- **File Storage**: AWS S3 (geliştirme için local storage)
- **Content Moderation**: Google Cloud Vision API
- **Email**: SMTP/Mailgun

### Frontend
- **Framework**: React.js
- **Styling**: TailwindCSS
- **QR Code**: qrcode.react
- **State Management**: Context API
- **Forms**: React Hook Form
- **Notifications**: React Toastify

## 📁 Proje Yapısı

```
wedding-memories/
├── backend/                 # Django Rest Framework backend
│   ├── eventvault/         # Main Django project
│   ├── apps/               # Django apps
│   ├── requirements.txt    # Python dependencies
│   └── manage.py
├── frontend/               # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
├── docker-compose.yml      # Development environment
└── README.md
```

## 🚀 Kurulum

### Gereksinimler
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

### Backend Kurulum
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Kurulum
```bash
cd frontend
npm install
npm start
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Giriş yapma
- `POST /api/auth/logout` - Çıkış yapma

### Albums
- `POST /api/albums/` - Albüm oluşturma
- `GET /api/albums/:id/` - Albüm detayları
- `GET /api/albums/user/:userId/` - Kullanıcının albümleri
- `PATCH /api/albums/:id/` - Albüm güncelleme
- `DELETE /api/albums/:id/` - Albüm silme

### File Upload
- `POST /api/upload/:albumId/` - Dosya yükleme
- `GET /api/albums/:id/qr/` - QR kod oluşturma

## 🎯 MVP Özellikleri

- [x] Proje yapısı kurulumu
- [ ] Kullanıcı kayıt/giriş sistemi
- [ ] Albüm oluşturma ve yönetimi
- [ ] QR kod oluşturma
- [ ] Anonim dosya yükleme
- [ ] E-posta bildirimleri
- [ ] Temel admin panel

## 📱 Gelecek Özellikler

- Mobil uygulama
- AI destekli otomatik video kolaj
- Premium temalar
- Sosyal medya entegrasyonu
- Gelişmiş istatistikler

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. 

### Geliştiriciler 
Erkan Turgut | (https://github.com/Erkan3034)
