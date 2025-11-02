"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import type { ToBuyBook } from "@/app/generated/prisma";
import type { Author } from "@/app/generated/prisma";

interface ToBuyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book?: ToBuyBook | null;
  authors: Author[];
  onSuccess: () => void;
}

export function ToBuyForm({ open, onOpenChange, book, authors, onSuccess }: ToBuyFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    authorId: "",
    genre: "",
    publisher: "",
    volumeCount: "",
    note: "",
    status: "pending" as "pending" | "ordered" | "bought" | "dismissed",
  });

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || "",
        authorId: book.authorId || "",
        genre: book.genre || "",
        publisher: book.publisher || "",
        volumeCount: book.volumeCount?.toString() || "",
        note: book.note || "",
        status: book.status || "pending",
      });
    } else {
      setFormData({
        title: "",
        authorId: "",
        genre: "",
        publisher: "",
        volumeCount: "",
        note: "",
        status: "pending",
      });
    }
  }, [book, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        authorId: formData.authorId || null,
        volumeCount: formData.volumeCount ? parseInt(formData.volumeCount) : null,
      };

      const url = book ? `/api/to-buy/${book.id}` : "/api/to-buy";
      const method = book ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Bir hata oluştu");
        return;
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      alert("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {book ? "Satın Alınacak Kitap Düzenle" : "Yeni Satın Alınacak Kitap Ekle"}
          </DialogTitle>
          <DialogDescription>
            {book
              ? "Satın alınacak kitap bilgilerini güncelleyin"
              : "Yeni bir satın alınacak kitap ekleyin"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Başlık *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="authorId">Yazar</Label>
            <Select
              id="authorId"
              value={formData.authorId}
              onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
            >
              <option value="">Yazar seçin</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name} {author.nickname ? `(${author.nickname})` : ""}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="genre">Tür</Label>
              <Input
                id="genre"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="publisher">Yayınevi</Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="volumeCount">Cilt Sayısı</Label>
            <Input
              id="volumeCount"
              type="number"
              min="1"
              value={formData.volumeCount}
              onChange={(e) => setFormData({ ...formData, volumeCount: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="status">Durum</Label>
            <Select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as "pending" | "ordered" | "bought" | "dismissed",
                })
              }
            >
              <option value="pending">Bekliyor</option>
              <option value="ordered">Sipariş Edildi</option>
              <option value="bought">Alındı</option>
              <option value="dismissed">İptal</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="note">Not</Label>
            <Input
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : book ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

