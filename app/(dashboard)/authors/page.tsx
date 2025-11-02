"use client";

import { useEffect, useState } from "react";
import { AuthorForm } from "@/components/authors/author-form";
import { Button } from "@/components/ui/button";
import { Plus, User, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Author } from "@/app/generated/prisma";

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

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const authorsData = await getAuthors();
      setAuthors(authorsData);
    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yazarı silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/authors/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silme işlemi başarısız");
      loadData();
    } catch (error) {
      alert("Yazar silinirken bir hata oluştu");
    }
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingAuthor(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yazarlar</h1>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Yazarlar</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Yazarları görüntüleyin ve yönetin.</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Yazar
        </Button>
      </div>

      {authors.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Henüz yazar eklenmemiş.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium">İsim</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Menşe</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Yaşam</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Mezhep</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Kitaplar</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {authors.map((author: any) => (
                    <tr key={author.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{author.name}</div>
                        {author.nickname && (
                          <div className="text-sm text-muted-foreground mt-1">
                            ({author.nickname})
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {author.origin ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {author.birthDate || author.deathDate ? (
                          <div>
                            {author.birthDate ?? "?"} - {author.deathDate ?? "?"}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {author.fiqhMadhhab ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {author._count?.Books || 0} kitap
                        {author._count?.ToBuyBooks ? `, ${author._count.ToBuyBooks} alınacak` : ""}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/authors/${author.id}`}>Detay</Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(author)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(author.id)}>
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
            {authors.map((author: any) => (
              <div
                key={author.id}
                className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{author.name}</h3>
                    {author.nickname && (
                      <p className="text-sm text-muted-foreground mt-1">
                        ({author.nickname})
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/authors/${author.id}`}>Detay</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(author)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(author.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {author.origin && (
                    <div>
                      <span className="text-muted-foreground">Menşe:</span> {author.origin}
                    </div>
                  )}
                  {(author.birthDate || author.deathDate) && (
                    <div>
                      <span className="text-muted-foreground">Yaşam:</span>{" "}
                      {author.birthDate ?? "?"} - {author.deathDate ?? "?"}
                    </div>
                  )}
                  {author.fiqhMadhhab && (
                    <div>
                      <span className="text-muted-foreground">Mezhep:</span> {author.fiqhMadhhab}
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Kitaplar:</span>{" "}
                    {author._count?.Books || 0} kitap
                    {author._count?.ToBuyBooks ? `, ${author._count.ToBuyBooks} alınacak` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AuthorForm
        open={formOpen}
        onOpenChange={handleFormClose}
        author={editingAuthor}
        onSuccess={() => {
          loadData();
          handleFormClose();
        }}
      />
    </div>
  );
}
