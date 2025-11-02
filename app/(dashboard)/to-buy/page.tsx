"use client";

import { useEffect, useState } from "react";
import { ToBuyForm } from "@/components/to-buy/to-buy-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Select } from "@/components/ui/select";
import type { ToBuyBook } from "@/app/generated/prisma";
import type { Author } from "@/app/generated/prisma";

async function getToBuyBooks(): Promise<ToBuyBook[]> {
  const res = await fetch("/api/to-buy", { cache: "no-store" });
  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = "/login";
      return [];
    }
    throw new Error("Failed to fetch to-buy books");
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

export default function ToBuyPage() {
  const [books, setBooks] = useState<ToBuyBook[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<ToBuyBook | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [booksData, authorsData] = await Promise.all([getToBuyBooks(), getAuthors()]);
      setBooks(booksData);
      setAuthors(authorsData);
    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/to-buy/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silme işlemi başarısız");
      loadData();
    } catch (error) {
      alert("Kayıt silinirken bir hata oluştu");
    }
  };

  const handleEdit = (book: ToBuyBook) => {
    setEditingBook(book);
    setFormOpen(true);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/to-buy/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Durum güncellenemedi");
      loadData();
    } catch (error) {
      alert("Durum güncellenirken bir hata oluştu");
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingBook(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Satın Alınacak Kitaplar</h1>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Satın Alınacak Kitaplar</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Satın alma listesini görüntüleyin ve yönetin.</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Ekle
        </Button>
      </div>

      {books.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">Henüz alınacak kitap listesi boş.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book: any) => (
            <Card key={book.id}>
              <CardContent className="p-4">
                <div className="font-semibold">{book.title}</div>
                {book.Author && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    {book.Author.name}
                    {book.Author.nickname && ` (${book.Author.nickname})`}
                  </div>
                )}
                <div className="mt-2 text-sm text-muted-foreground">
                  {book.genre ?? "-"} • {book.publisher ?? "-"}
                  {book.volumeCount ? ` • ${book.volumeCount} cilt` : ""}
                </div>
                {book.note && (
                  <p className="mt-2 text-xs text-muted-foreground">{book.note}</p>
                )}
                <div className="mt-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      book.status === "bought"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : book.status === "ordered"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : book.status === "dismissed"
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                    }`}>
                    {book.status === "pending"
                      ? "Bekliyor"
                      : book.status === "ordered"
                        ? "Sipariş Edildi"
                        : book.status === "bought"
                          ? "Alındı"
                          : "İptal"}
                  </span>
                </div>
                <div className="mt-3">
                  <Select
                    value={book.status}
                    onChange={(e) => handleStatusChange(book.id, e.target.value)}
                    className="w-full text-xs">
                    <option value="pending">Bekliyor</option>
                    <option value="ordered">Sipariş Edildi</option>
                    <option value="bought">Alındı</option>
                    <option value="dismissed">İptal</option>
                  </Select>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(book)}
                    className="flex-1">
                    <Edit className="mr-2 h-4 w-4" />
                    Düzenle
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(book.id)}
                    className="flex-1">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Sil
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ToBuyForm
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
