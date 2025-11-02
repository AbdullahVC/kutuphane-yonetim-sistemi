# 🚀 Vercel Deployment - Hızlı Kılavuz

## ✅ Yapmanız Gerekenler

### 1️⃣ Environment Variables Ekleme (ÇOK ÖNEMLİ!)

Vercel proje sayfasında:
1. **"Environment Variables"** bölümünü genişletin (aşağıya kaydırın)
2. Aşağıdaki 3 değişkeni ekleyin:

#### `DATABASE_URL`
- **Name:** `DATABASE_URL`
- **Value:** Neon database'inizden alacağınız production connection string
  - Neon Dashboard → Project → Connection String → **Pooled** seçin
  - Format: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development (hepsini seçin)

#### `AUTH_SECRET`
- **Name:** `AUTH_SECRET`
- **Value:** Güçlü bir secret key (minimum 32 karakter)
  - Oluşturmak için: https://generate-secret.vercel.app/32
  - Veya terminalde: `openssl rand -base64 32`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development (hepsini seçin)

#### `NODE_ENV`
- **Name:** `NODE_ENV`
- **Value:** `production`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development (hepsini seçin)

**Her değişkeni ekledikten sonra "Save" butonuna tıklayın!**

---

### 2️⃣ Build Ayarları Kontrolü

Vercel otomatik olarak şunları algılayacak:
- ✅ Framework: Next.js
- ✅ Build Command: `vercel-build` (Prisma migration dahil)
- ✅ Install Command: `pnpm install`
- ✅ Root Directory: `./`

**Ekstra bir şey yapmanıza gerek yok, otomatik çalışacak.**

---

### 3️⃣ Deploy Butonuna Basın

Tüm environment variables'ları ekledikten sonra:
1. Sayfanın altındaki **"Deploy"** butonuna tıklayın
2. Build sürecini bekleyin (2-3 dakika sürebilir)
3. Build başarılı olursa, site otomatik olarak açılacak

---

### 4️⃣ İlk Deployment Sonrası - Seed Verileri

Deployment başarılı olduktan sonra, admin kullanıcıyı oluşturmak için:

#### Yöntem 1: Vercel CLI (Önerilen)
```bash
# Terminalde proje klasöründe:
npm i -g vercel
vercel login
vercel link  # Projeyi seçin
vercel env pull .env.production
pnpm db:seed
```

#### Yöntem 2: Neon Console'dan
1. Neon Dashboard → SQL Editor
2. `prisma/seed.ts` dosyasındaki kodları SQL'e çevirip çalıştırın
3. Veya local'de `.env` dosyasını production DATABASE_URL ile güncelleyip `pnpm db:seed` çalıştırın

---

### 5️⃣ Test

1. **Site URL'ine gidin:** `https://YOUR_PROJECT.vercel.app`
2. **Login sayfasına yönlendirilmelisiniz**
3. **Giriş yapın:**
   - Email: `admin@example.com`
   - Password: `admin123`

---

## ❌ Sorun Giderme

### "Environment variable missing" hatası
- Environment Variables'ları eklediniz mi?
- Her birini Production, Preview, Development için seçtiniz mi?
- Save butonuna tıkladınız mı?

### "Database connection error" hatası
- `DATABASE_URL` doğru mu?
- SSL mode var mı? (`?sslmode=require`)
- Neon'da IP restriction açık mı? (0.0.0.0/0)

### "Prisma migration failed" hatası
- `DATABASE_URL` doğru mu?
- Database'e bağlanabiliyor musunuz?
- Migration dosyaları GitHub'a push edildi mi?

### Build başarısız olursa
- Vercel Dashboard → Deployments → Logs'a bakın
- Environment Variables'ları kontrol edin
- GitHub repository'de tüm dosyalar var mı kontrol edin

---

## 📝 Özet Checklist

Deploy etmeden önce:
- [ ] `DATABASE_URL` eklendi (Production, Preview, Development)
- [ ] `AUTH_SECRET` eklendi (Production, Preview, Development)
- [ ] `NODE_ENV=production` eklendi (Production, Preview, Development)
- [ ] GitHub'a tüm değişiklikler push edildi

Deploy sonrası:
- [ ] Build başarılı
- [ ] Seed verileri eklendi (admin kullanıcı)
- [ ] Login sayfası açılıyor
- [ ] Admin credentials ile giriş yapılabiliyor

---

**Başarılar! 🎉**

