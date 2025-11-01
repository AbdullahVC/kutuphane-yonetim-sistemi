import { Book } from "@/app/generated/prisma";
// app/(dashboard)/books/page.tsx
async function getBooks(): Promise<Book[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/books`, {
    cache: "no-store",
  });
  return res.json();
}

export default async function BooksPage() {
  const books = await getBooks();
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Kitaplar</h1>
      <ul className="space-y-2">
        {books.map((b: Book) => (
          <li key={b.id} className="border rounded-lg p-3 bg-white">
            <div className="font-medium">{b.title}</div>
            <div className="text-sm text-zinc-600">
              {b.genre ?? "-"} • {b.publisher ?? "-"} • {b.library ?? "-"} {b.shelf ?? ""}{" "}
              {b.number ?? ""}
            </div>
            {b.note && <p className="text-xs text-zinc-500 mt-1">{b.note}</p>}
          </li>
        ))}
      </ul>
    </main>
  );
}
