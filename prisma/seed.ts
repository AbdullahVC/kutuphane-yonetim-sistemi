import { PrismaClient } from "../app/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1) User ekle (admin)
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const user = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      username: "admin",
    },
    create: {
      email: "admin@example.com",
      username: "admin",
      name: "Admin Kullanıcı",
      password: hashedPassword,
    },
  });

  // 2) Tenant ekle
  const tenant = await prisma.tenant.upsert({
    where: { slug: "default" },
    update: {},
    create: {
      slug: "default",
      name: "Medrese Kütüphanesi",
      ownerId: user.id,
    },
  });

  // 3) User-Tenant ilişkisi
  await prisma.userTenant.upsert({
    where: {
      userId_tenantId: {
        userId: user.id,
        tenantId: tenant.id,
      },
    },
    update: { role: "admin" },
    create: {
      userId: user.id,
      tenantId: tenant.id,
      role: "admin",
    },
  });

  // 4) Author ekle
  const author = await prisma.author.create({
    data: {
      tenantId: tenant.id,
      name: "İmam Gazali",
      nickname: "Hüccetü’l-İslam",
      origin: "Tus (Horasan)",
      birthDate: "1058",
      deathDate: "1111",
      fiqhMadhhab: "Şafii",
      aqidahMadhhab: "Eşari",
      famousWorks: "İhya-u Ulumiddin, El-Munkız mine'd-dalal",
      expertiseAreas: "Tasavvuf, Fıkıh, Kelam",
    },
  });

  // 5) Book ekle
  await prisma.book.create({
    data: {
      tenantId: tenant.id,
      title: "İhya-u Ulumiddin",
      authorId: author.id,
      genre: "Tasavvuf",
      publisher: "Daru'l-Minhac",
      volumeCount: 4,
      library: "Ana Kitaplık",
      shelf: "B",
      number: "B-12",
      note: "Tam takım mevcut",
    },
  });

  // 6) Satın alınacak kitap ekle
  await prisma.toBuyBook.create({
    data: {
      tenantId: tenant.id,
      title: "Mizanu’l-Amel",
      authorId: author.id,
      genre: "Ahlak",
      publisher: "Daru’l-Kalem",
      volumeCount: 1,
      note: "Yok, satın alınacak",
    },
  });
}

main()
  .then(() => console.log("Seed işlemi tamamlandı."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
