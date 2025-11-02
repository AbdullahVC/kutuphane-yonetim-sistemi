# 📦 Deployment Guide - Kütüphane Yönetim Sistemi

Bu rehber, projeyi **Vercel**'e deploy etmek için gereken tüm adımları içerir.

## 📋 Ön Gereksinimler

1. **Vercel Hesabı**: [vercel.com](https://vercel.com) üzerinden ücretsiz hesap oluşturun
2. **GitHub/GitLab/Bitbucket Hesabı**: Projeyi kaynak kod yönetimi için hazırlayın
3. **Neon Database** (veya başka bir PostgreSQL veritabanı): Production veritabanı
4. **Node.js 18+**: Yerel test için (opsiyonel)

---

## 🚀 Adım Adım Deployment

### 1️⃣ GitHub'a Push Etme

```bash
# Eğer henüz git repository oluşturmadıysanız:
git init
git add .
git commit -m "Initial commit - Library Management System"

# GitHub'da yeni bir repository oluşturun, sonra:
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
git branch -M main
git push -u origin main
```

### 2️⃣ Vercel'e Proje Ekleme

1. [Vercel Dashboard](https://vercel.com/dashboard) → **Add New Project**
2. GitHub repository'nizi seçin veya import edin
3. **Import Project** butonuna tıklayın

### 3️⃣ Environment Variables (Çok Önemli!)

Vercel proje ayarlarında şu environment variable'ları ekleyin:

#### **Zorunlu Variables:**

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
AUTH_SECRET=your-very-long-random-secret-key-minimum-32-characters
NODE_ENV=production
```

**`DATABASE_URL` Nasıl Bulunur?**

- Neon: Dashboard → Project → Connection String (Pooled)
- Format: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`

**`AUTH_SECRET` Nasıl Oluşturulur?**

- Yerel terminalde: `openssl rand -base64 32`
- Veya: [generate-secret.vercel.app](https://generate-secret.vercel.app/32)
- Minimum 32 karakter olmalı

#### **Vercel'de Environment Variable Ekleme:**

1. Project Settings → **Environment Variables**
2. Her bir variable için:
   - **Name**: `DATABASE_URL`, `AUTH_SECRET`, `NODE_ENV`
   - **Value**: Değerini girin
   - **Environment**: Production, Preview, Development (hepsini seçin)
3. **Save** butonuna tıklayın

### 4️⃣ Build Ayarları

Vercel otomatik olarak Next.js projesini algılayacaktır. Aşağıdaki ayarları kontrol edin:

**Project Settings → General:**

- **Framework Preset**: Next.js
- **Build Command**: `pnpm build` (veya `npm run build`)
- **Output Directory**: `.next`
- **Install Command**: `pnpm install` (veya `npm install`)
- **Node.js Version**: 18.x veya 20.x

**Project Settings → Build & Development Settings:**

- **Root Directory**: `./` (boş bırakın)
- **Install Command**: `pnpm install --frozen-lockfile`
- **Build Command**: `pnpm build`

### 5️⃣ Prisma Migration ve Seed

Vercel'de build sırasında Prisma client generate edilecek. Ancak migration ve seed için **Vercel Post-Deploy Hook** veya manuel çalıştırmanız gerekir.

#### **Seçenek 1: Vercel CLI ile (Önerilen)**

```bash
# Vercel CLI kurulumu
npm i -g vercel

# Login
vercel login

# Projeyi link et
vercel link

# Environment variable'ları set et (yerel .env dosyasından)
vercel env pull .env.production

# Migration çalıştır
npx prisma migrate deploy

# Seed çalıştır (sadece ilk deployment için)
npx prisma db seed
```

#### **Seçenek 2: package.json Post-Deploy Script (Otomatik)**

`package.json`'a ekleyin:

```json
{
  "scripts": {
    "postbuild": "prisma generate && prisma migrate deploy",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

### 6️⃣ Build Command Güncellemesi

Vercel'de build command'i şu şekilde güncelleyin:

```
prisma generate && prisma migrate deploy && next build
```

**Veya** `package.json`'da:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postbuild": "prisma migrate deploy"
  }
}
```

### 7️⃣ İlk Deployment

1. Vercel'de **Deploy** butonuna tıklayın
2. Build loglarını izleyin
3. Hata varsa, Environment Variables'ları kontrol edin

### 8️⃣ Seed Verileri Ekleme (İlk Deployment Sonrası)

Production database'e seed verileri eklemek için:

```bash
# Vercel CLI ile
vercel env pull .env.production
npx prisma db seed

# Veya Neon Console'dan direkt bağlanıp çalıştırın
```

---

## ✅ Deployment Sonrası Kontroller

### 1. **Login Testi**

- Site URL'ine gidin: `https://YOUR_PROJECT.vercel.app`
- `/login` sayfasına yönlendirilmeli
- Admin credentials ile giriş yapın:
  - Email: `admin@example.com`
  - Password: `admin123` (seed'den)

### 2. **Admin Panel Kontrolü**

- `/admin/users` - Kullanıcı yönetimi
- `/admin/tenants` - Tenant yönetimi

### 3. **Database Bağlantısı**

- Herhangi bir sayfada veri çekilip çekilmediğini kontrol edin
- Admin panelde kullanıcı/tenant listesi görünüyorsa başarılı

---

## 🔧 Sorun Giderme

### ❌ "Database connection error"

- `DATABASE_URL` doğru mu kontrol edin
- SSL mode gerekli (`?sslmode=require`)
- Neon'da IP whitelist açık olmalı (0.0.0.0/0)

### ❌ "AUTH_SECRET is missing"

- Environment Variables'da `AUTH_SECRET` ekli mi?
- Production, Preview, Development için hepsinde var mı?
- Redeploy yapın (Settings → Redeploy)

### ❌ "Prisma Client not found"

- Build command'de `prisma generate` var mı?
- `package.json`'da `prisma` dependency var mı?

### ❌ "Migration failed"

- Database bağlantısı çalışıyor mu?
- Migration dosyaları `prisma/migrations` klasöründe mi?
- `prisma migrate deploy` komutunu manuel çalıştırın

---

## 🌐 Custom Domain Ekleme (Opsiyonel)

1. Vercel Project Settings → **Domains**
2. **Add Domain** → Domain adınızı girin
3. DNS ayarlarını yapın (Vercel size talimat verecek)
4. SSL otomatik olarak kurulacak

---

## 🔐 Güvenlik Notları

1. **Production Password Değiştirin**
   - İlk login'de admin password'ü değiştirin
   - `/admin/users` → Edit → Change Password

2. **AUTH_SECRET Güvenliği**
   - Production'da güçlü bir secret kullanın
   - Asla GitHub'a commit etmeyin

3. **Database Güvenliği**
   - Neon'da IP restriction açık bırakın (Vercel dinamik IP kullanır)
   - Database password'ü güçlü tutun

---

## 📊 Monitoring ve Logs

- **Vercel Dashboard → Deployments**: Deployment geçmişi
- **Vercel Dashboard → Functions**: API route logları
- **Neon Dashboard**: Database query logları

---

## 🎉 Başarılı Deployment Checklist

- [ ] GitHub'a push edildi
- [ ] Vercel'e import edildi
- [ ] Environment Variables eklendi (DATABASE_URL, AUTH_SECRET, NODE_ENV)
- [ ] Build başarılı
- [ ] Migration çalıştırıldı
- [ ] Seed verileri eklendi
- [ ] Login çalışıyor
- [ ] Admin panel erişilebilir
- [ ] Database bağlantısı çalışıyor

---

## 📞 Destek

Sorun yaşarsanız:

1. Vercel build logs'u kontrol edin
2. Environment Variables'ları doğrulayın
3. Database bağlantısını test edin
4. Prisma migration durumunu kontrol edin

**İyi deploymentlar! 🚀**
