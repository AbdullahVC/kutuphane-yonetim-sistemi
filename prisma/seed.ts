import { PrismaClient } from "../app/generated/prisma"; // client'ı senin output yoluna göre aldık

const prisma = new PrismaClient();

async function main() {
  // 1) Tenant ekle
  const tenant = await prisma.tenant.upsert({
    where: { slug: "default" },
    update: {},
    create: { slug: "default", name: "Medrese Kütüphanesi" },
  });

  // 2) Author ekle
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

  // 3) Book ekle
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

  // 4) Satın alınacak kitap ekle
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
