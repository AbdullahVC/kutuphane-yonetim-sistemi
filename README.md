# 📚 Kütüphane Yönetim Sistemi

Modern, multi-tenant kütüphane yönetim sistemi. Kitaplar, yazarlar ve satın alınacak kitapları yönetmek için kapsamlı bir çözüm.

## ✨ Özellikler

- 🔐 **Kullanıcı Kimlik Doğrulama**: NextAuth.js ile güvenli giriş
- 🏢 **Multi-Tenant Yapı**: Her kütüphane bağımsız çalışır
- 👥 **Kullanıcı Yönetimi**: Admin paneli ile kullanıcı ve tenant yönetimi
- 📖 **Kitap Yönetimi**: Kitap ekleme, düzenleme, silme
- ✍️ **Yazar Yönetimi**: Detaylı yazar bilgileri
- 🛒 **Satın Alma Listesi**: Alınacak kitapları takip etme
- 📊 **Dashboard**: İstatistikler ve özet bilgiler
- 🎨 **Modern UI**: Tailwind CSS ve shadcn/ui ile modern tasarım

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 18+
- pnpm (veya npm/yarn)
- PostgreSQL veritabanı (Neon, Supabase, vb.)

### Yerel Kurulum

1. **Repository'yi klonlayın**
```bash
git clone https://github.com/KULLANICI_ADI/kutuphane-yonetim-sistemi.git
cd kutuphane-yonetim-sistemi
```

2. **Bağımlılıkları yükleyin**
```bash
pnpm install
```

3. **Environment variables ayarlayın**
```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:
```env
DATABASE_URL=postgresql://user:password@host:port/database
AUTH_SECRET=your-secret-key-here
NODE_ENV=development
```

4. **Database migration'ları çalıştırın**
```bash
npx prisma migrate deploy
npx prisma generate
```

5. **Seed verileri ekleyin (opsiyonel)**
```bash
pnpm db:seed
```

6. **Development server'ı başlatın**
```bash
pnpm dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

### Varsayılan Giriş Bilgileri

Seed sonrası:
- **Email**: `admin@example.com`
- **Password**: `admin123`

**⚠️ Production'da mutlaka şifreyi değiştirin!**

## 📦 Deployment

Detaylı deployment rehberi için [DEPLOYMENT.md](./DEPLOYMENT.md) dosyasına bakın.

### Vercel'e Deploy

1. GitHub'a push edin
2. Vercel'e import edin
3. Environment variables ekleyin:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `NODE_ENV=production`
4. Deploy!

## 🏗️ Proje Yapısı

```
├── app/
│   ├── (dashboard)/      # Dashboard sayfaları
│   │   ├── admin/        # Admin paneli
│   │   ├── books/        # Kitap yönetimi
│   │   ├── authors/      # Yazar yönetimi
│   │   └── to-buy/       # Satın alma listesi
│   ├── api/              # API routes
│   └── login/            # Login sayfası
├── components/           # React component'leri
├── lib/                  # Utility fonksiyonları
├── prisma/               # Prisma schema ve migrations
└── public/               # Static dosyalar
```

## 🔧 Teknolojiler

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js v5
- **UI**: Tailwind CSS, shadcn/ui
- **Validation**: Zod
- **Language**: TypeScript

## 👥 Kullanıcı Rolleri

### Admin
- Tüm kullanıcıları yönetebilir
- Tenant (kütüphane) oluşturabilir ve yönetebilir
- Kullanıcılara tenant atayabilir
- Rolleri değiştirebilir

### Member
- Kendi tenant'ındaki kitapları yönetebilir
- Yazarlar ekleyebilir/düzenleyebilir
- Satın alma listesini yönetebilir

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📧 İletişim

Sorularınız için issue açabilirsiniz.

---

**Made with ❤️ for library management**
