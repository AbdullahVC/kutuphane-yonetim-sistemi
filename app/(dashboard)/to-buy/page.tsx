// app/(dashboard)/to-buy/page.tsx
import { prisma } from "@/lib/prisma";
import { ToBuyBook } from "@/app/generated/prisma";

export const dynamic = "force-dynamic"; // liste her yenilendiğinde güncel gelsin

export default async function ToBuyPage() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: "default" } });
  let books: ToBuyBook[] = [];

  if (tenant) {
    books = await prisma.toBuyBook.findMany({
      where: { tenantId: tenant.id },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 200,
    });
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Satın Alınacak Kitaplar</h1>

      {books.length === 0 && (
        <p className="text-zinc-500 text-sm">Henüz alınacak kitap listesi boş.</p>
      )}

      <ul className="space-y-2">
        {books.map((b) => (
          <li key={b.id} className="border rounded-lg p-3 bg-white">
            <div className="font-medium">{b.title}</div>
            <div className="text-sm text-zinc-600">
              {b.genre ?? "-"} • {b.publisher ?? "-"} •{" "}
              {b.volumeCount ? `${b.volumeCount} cilt` : ""}
            </div>
            {b.note && <p className="text-xs text-zinc-500 mt-1">{b.note}</p>}
            <p className="text-xs mt-2">
              <span
                className={`px-2 py-1 rounded-md ${
                  b.status === "bought"
                    ? "bg-green-100 text-green-800"
                    : b.status === "ordered"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}>
                {b.status}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
