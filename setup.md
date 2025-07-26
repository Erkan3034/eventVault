# EventVault Setup Guide

Bu proje EventVault - Etkinlik Bazlı Dijital Albümler Platformu'nun kurulum rehberidir.

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+ (opsiyonel, SQLite kullanılabilir)

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd wedding-memories
```

### 2. Backend Kurulumu

#### Sanal Ortam Oluşturun
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

#### Bağımlılıkları Yükleyin
```bash
pip install -r requirements.txt
```

#### Ortam Dosyasını Oluşturun
```bash
# env.example dosyasını .env olarak kopyalayın
copy env.example .env  # Windows
cp env.example .env    # macOS/Linux
```

#### Veritabanını Oluşturun
```bash
# SQLite kullanmak için .env dosyasında USE_SQLITE=True olduğundan emin olun
python manage.py makemigrations
python manage.py migrate
```

#### Süper Kullanıcı Oluşturun
```bash
python manage.py createsuperuser
```

#### Başlangıç Verilerini Yükleyin (Opsiyonel)
```bash
# Etkinlik türlerini oluşturun
python manage.py shell
```

Python shell'de:
```python
from apps.albums.models import EventType

event_types = [
    {'name': 'Wedding', 'name_tr': 'Düğün', 'icon': 'heart', 'color': '#ff6b9d'},
    {'name': 'Birthday', 'name_tr': 'Doğum Günü', 'icon': 'cake', 'color': '#feca57'},
    {'name': 'Graduation', 'name_tr': 'Mezuniyet', 'icon': 'graduation-cap', 'color': '#48cae4'},
    {'name': 'Engagement', 'name_tr': 'Nişan', 'icon': 'ring', 'color': '#ff9ff3'},
    {'name': 'Anniversary', 'name_tr': 'Yıldönümü', 'icon': 'calendar', 'color': '#54a0ff'},
    {'name': 'Baby Shower', 'name_tr': 'Baby Shower', 'icon': 'baby', 'color': '#5f27cd'},
    {'name': 'Corporate Event', 'name_tr': 'Kurumsal Etkinlik', 'icon': 'building', 'color': '#00d2d3'},
]

for event_data in event_types:
    EventType.objects.get_or_create(**event_data)

exit()
```

#### Backend Sunucusunu Başlatın
```bash
python manage.py runserver
```

Backend artık http://localhost:8000 adresinde çalışıyor.

### 3. Frontend Kurulumu

Yeni bir terminal açın:

```bash
cd frontend
npm install
npm start
```

Frontend artık http://localhost:3000 adresinde çalışıyor.

## 📁 Proje Yapısı

```
wedding-memories/
├── backend/                 # Django Rest Framework backend
│   ├── eventvault/         # Ana Django projesi
│   ├── apps/               # Django uygulamaları
│   │   ├── authentication/ # Kullanıcı yönetimi
│   │   ├── albums/         # Albüm yönetimi
│   │   ├── uploads/        # Dosya yükleme
│   │   └── notifications/  # Bildirimler
│   ├── requirements.txt
│   └── manage.py
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Yeniden kullanılabilir bileşenler
│   │   ├── pages/         # Sayfa bileşenleri
│   │   ├── contexts/      # React Context'ler
│   │   ├── hooks/         # Custom hook'lar
│   │   ├── services/      # API servisleri
│   │   └── utils/         # Yardımcı fonksiyonlar
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🔧 Geliştirme

### Backend API Endpoints

- **Authentication:**
  - `POST /api/v1/auth/register/` - Kullanıcı kaydı
  - `POST /api/v1/auth/login/` - Giriş yapma
  - `POST /api/v1/auth/logout/` - Çıkış yapma

- **Albums:**
  - `GET /api/v1/albums/` - Albümleri listele
  - `POST /api/v1/albums/` - Yeni albüm oluştur
  - `GET /api/v1/albums/{id}/` - Albüm detayları
  - `GET /api/v1/albums/{id}/qr/` - QR kod

- **Uploads:**
  - `POST /api/v1/uploads/{access_code}/` - Dosya yükle

### Frontend Sayfa Yapısı

- `/` - Ana sayfa
- `/login` - Giriş sayfası
- `/register` - Kayıt sayfası
- `/dashboard` - Kullanıcı paneli
- `/create-album` - Albüm oluşturma
- `/album/{id}` - Albüm görüntüleme
- `/upload/{accessCode}` - Dosya yükleme (anonim)

## 🎯 Özellikler

### MVP Özellikleri
- [x] Kullanıcı kayıt/giriş sistemi
- [x] Albüm oluşturma
- [x] QR kod oluşturma
- [ ] Anonim dosya yükleme
- [ ] E-posta bildirimleri
- [ ] Admin panel

### Gelecek Özellikler
- Mobil uygulama
- AI destekli içerik moderasyonu
- Otomatik video kolaj
- Premium temalar
- Sosyal medya entegrasyonu

## 🚀 Deployment

### Backend (Heroku/Render)
```bash
# Heroku deployment
heroku create eventvault-api
heroku addons:create heroku-postgresql:mini
git push heroku main
heroku run python manage.py migrate
```

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🆘 Sorun Giderme

### Yaygın Sorunlar

1. **CORS Hatası**: Backend settings.py'de CORS_ALLOWED_ORIGINS kontrol edin
2. **Database Hatası**: Migrations çalıştırıldığından emin olun
3. **Static Files**: `python manage.py collectstatic` çalıştırın
4. **Node Modules**: `rm -rf node_modules && npm install` deneyin

### Loglara Bakma
```bash
# Backend logs
python manage.py runserver --verbosity=2

# Frontend logs
npm start
```

## 📞 İletişim

Sorularınız için:
- GitHub Issues
- Email: support@eventvault.com 