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
import type { Author } from "@/app/generated/prisma";

interface AuthorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  author?: Author | null;
  onSuccess: () => void;
}

export function AuthorForm({ open, onOpenChange, author, onSuccess }: AuthorFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    origin: "",
    birthDate: "",
    deathDate: "",
    birthPlace: "",
    deathPlace: "",
    officialDuties: "",
    fiqhMadhhab: "",
    aqidahMadhhab: "",
    famousWorks: "",
    teachers: "",
    students: "",
    statusInTabakat: "",
    expertiseAreas: "",
    importantNotes: "",
  });

  useEffect(() => {
    if (author) {
      setFormData({
        name: author.name || "",
        nickname: author.nickname || "",
        origin: author.origin || "",
        birthDate: author.birthDate || "",
        deathDate: author.deathDate || "",
        birthPlace: author.birthPlace || "",
        deathPlace: author.deathPlace || "",
        officialDuties: author.officialDuties || "",
        fiqhMadhhab: author.fiqhMadhhab || "",
        aqidahMadhhab: author.aqidahMadhhab || "",
        famousWorks: author.famousWorks || "",
        teachers: author.teachers || "",
        students: author.students || "",
        statusInTabakat: author.statusInTabakat || "",
        expertiseAreas: author.expertiseAreas || "",
        importantNotes: author.importantNotes || "",
      });
    } else {
      setFormData({
        name: "",
        nickname: "",
        origin: "",
        birthDate: "",
        deathDate: "",
        birthPlace: "",
        deathPlace: "",
        officialDuties: "",
        fiqhMadhhab: "",
        aqidahMadhhab: "",
        famousWorks: "",
        teachers: "",
        students: "",
        statusInTabakat: "",
        expertiseAreas: "",
        importantNotes: "",
      });
    }
  }, [author, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: Record<string, string | null> = {};
      Object.entries(formData).forEach(([key, value]) => {
        payload[key] = value || null;
      });

      const url = author ? `/api/authors/${author.id}` : "/api/authors";
      const method = author ? "PUT" : "POST";

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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{author ? "Yazar Düzenle" : "Yeni Yazar Ekle"}</DialogTitle>
          <DialogDescription>
            {author ? "Yazar bilgilerini güncelleyin" : "Yeni bir yazar ekleyin"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">İsim *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="nickname">Lakap</Label>
              <Input
                id="nickname"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="origin">Menşe</Label>
            <Input
              id="origin"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="birthDate">Doğum Tarihi</Label>
              <Input
                id="birthDate"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                placeholder="Örn: 1058"
              />
            </div>
            <div>
              <Label htmlFor="deathDate">Ölüm Tarihi</Label>
              <Input
                id="deathDate"
                value={formData.deathDate}
                onChange={(e) => setFormData({ ...formData, deathDate: e.target.value })}
                placeholder="Örn: 1111"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="birthPlace">Doğum Yeri</Label>
              <Input
                id="birthPlace"
                value={formData.birthPlace}
                onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="deathPlace">Ölüm Yeri</Label>
              <Input
                id="deathPlace"
                value={formData.deathPlace}
                onChange={(e) => setFormData({ ...formData, deathPlace: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="officialDuties">Resmi Görevler</Label>
            <Input
              id="officialDuties"
              value={formData.officialDuties}
              onChange={(e) => setFormData({ ...formData, officialDuties: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fiqhMadhhab">Fıkıh Mezhebi</Label>
              <Input
                id="fiqhMadhhab"
                value={formData.fiqhMadhhab}
                onChange={(e) => setFormData({ ...formData, fiqhMadhhab: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="aqidahMadhhab">Akide Mezhebi</Label>
              <Input
                id="aqidahMadhhab"
                value={formData.aqidahMadhhab}
                onChange={(e) => setFormData({ ...formData, aqidahMadhhab: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="famousWorks">Ünlü Eserler</Label>
            <Input
              id="famousWorks"
              value={formData.famousWorks}
              onChange={(e) => setFormData({ ...formData, famousWorks: e.target.value })}
              placeholder="Virgülle ayırarak yazın"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="teachers">Hocaları</Label>
              <Input
                id="teachers"
                value={formData.teachers}
                onChange={(e) => setFormData({ ...formData, teachers: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="students">Öğrencileri</Label>
              <Input
                id="students"
                value={formData.students}
                onChange={(e) => setFormData({ ...formData, students: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="statusInTabakat">Tabakat'taki Durumu</Label>
            <Input
              id="statusInTabakat"
              value={formData.statusInTabakat}
              onChange={(e) => setFormData({ ...formData, statusInTabakat: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="expertiseAreas">Uzmanlık Alanları</Label>
            <Input
              id="expertiseAreas"
              value={formData.expertiseAreas}
              onChange={(e) => setFormData({ ...formData, expertiseAreas: e.target.value })}
              placeholder="Virgülle ayırarak yazın"
            />
          </div>

          <div>
            <Label htmlFor="importantNotes">Önemli Notlar</Label>
            <Input
              id="importantNotes"
              value={formData.importantNotes}
              onChange={(e) => setFormData({ ...formData, importantNotes: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : author ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

