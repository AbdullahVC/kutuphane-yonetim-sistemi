"use client";

import { useEffect, useState } from "react";
import { BookForm } from "@/components/books/book-form";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { Book } from "@/app/generated/prisma";
import type { Author } from "@/app/generated/prisma";

async function getBooks(): Promise<Book[]> {
  const res = await fetch("/api/books", { cache: "no-store" });
  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = "/login";
      return [];
    }
    throw new Error("Failed to fetch books");
  }
  return res.json();
}

async function getAuthors(): Promise<Author[]> {
  const res = await fetch("/api/authors", { cache: "no-store" });
  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = "/login";
      return [];
    }
    throw new Error("Failed to fetch authors");
  }
  return res.json();
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [booksData, authorsData] = await Promise.all([getBooks(), getAuthors()]);
      setBooks(booksData);
      setAuthors(authorsData);
    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kitabı silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silme işlemi başarısız");
      loadData();
    } catch (error) {
      alert("Kitap silinirken bir hata oluştu");
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingBook(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kitaplar</h1>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Kitaplar</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Tüm kitapları görüntüleyin ve yönetin.</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kitap
        </Button>
      </div>

      {books.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">Henüz kitap eklenmemiş.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium">Kitap Adı</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Yazar</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Tür</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Yayınevi</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Konum</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book: any) => (
                    <tr key={book.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{book.title}</div>
                        {book.note && (
                          <div className="text-xs text-muted-foreground mt-1">{book.note}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {book.Author ? (
                          <div>
                            {book.Author.name}
                            {book.Author.nickname && (
                              <span className="text-muted-foreground ml-1">
                                ({book.Author.nickname})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {book.genre ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {book.publisher ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {book.library || book.shelf || book.number ? (
                          <div>
                            {book.library && <div>{book.library}</div>}
                            {(book.shelf || book.number) && (
                              <div className="text-xs">
                                {book.shelf && <span>Raf: {book.shelf}</span>}
                                {book.shelf && book.number && " • "}
                                {book.number && <span>No: {book.number}</span>}
                              </div>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(book)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(book.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {books.map((book: any) => (
              <div
                key={book.id}
                className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{book.title}</h3>
                    {book.Author && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {book.Author.name}
                        {book.Author.nickname && ` (${book.Author.nickname})`}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(book)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(book.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {book.note && (
                  <p className="text-sm text-muted-foreground">{book.note}</p>
                )}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {book.genre && (
                    <div>
                      <span className="text-muted-foreground">Tür:</span> {book.genre}
                    </div>
                  )}
                  {book.publisher && (
                    <div>
                      <span className="text-muted-foreground">Yayınevi:</span> {book.publisher}
                    </div>
                  )}
                  {(book.library || book.shelf || book.number) && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Konum:</span>{" "}
                      {book.library || ""} {book.shelf ? `Raf: ${book.shelf}` : ""}{" "}
                      {book.number ? `No: ${book.number}` : ""}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <BookForm
        open={formOpen}
        onOpenChange={handleFormClose}
        book={editingBook}
        authors={authors}
        onSuccess={() => {
          loadData();
          handleFormClose();
        }}
      />
    </div>
  );
}
