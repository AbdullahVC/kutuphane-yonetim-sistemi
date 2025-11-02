"use client";

import { useEffect, useState } from "react";
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
import { Plus, Edit, Trash2, Building2 } from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  ownerId: string | null;
  createdAt: string;
  _count: {
    userTenants: number;
    Books: number;
    Authors: number;
  };
}

interface User {
  id: string;
  email: string;
  name: string | null;
}

async function getTenants(): Promise<Tenant[]> {
  const res = await fetch("/api/tenants", { cache: "no-store" });
  if (!res.ok) {
    if (res.status === 403 || res.status === 401) {
      window.location.href = "/login";
      return [];
    }
    throw new Error("Failed to fetch tenants");
  }
  return res.json();
}

async function getUsers(): Promise<User[]> {
  const res = await fetch("/api/users", { cache: "no-store" });
  if (!res.ok) {
    if (res.status === 403 || res.status === 401) {
      return [];
    }
    throw new Error("Failed to fetch users");
  }
  return res.json();
}

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    ownerId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tenantsData, usersData] = await Promise.all([
        getTenants(),
        getUsers(),
      ]);
      setTenants(tenantsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          ownerId: formData.ownerId || undefined,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Tenant oluşturulamadı");
        return;
      }

      loadData();
      setFormOpen(false);
      setFormData({ name: "", slug: "", ownerId: "" });
      setEditingTenant(null);
    } catch (error) {
      alert("Bir hata oluştu");
    }
  };

  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    try {
      const res = await fetch(`/api/tenants/${editingTenant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          ownerId: formData.ownerId || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Tenant güncellenemedi");
        return;
      }

      loadData();
      setFormOpen(false);
      setFormData({ name: "", slug: "", ownerId: "" });
      setEditingTenant(null);
    } catch (error) {
      alert("Bir hata oluştu");
    }
  };

  const handleDeleteTenant = async (id: string) => {
    if (!confirm("Bu tenant'ı silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/tenants/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Tenant silinemedi");
        return;
      }
      loadData();
    } catch (error) {
      alert("Bir hata oluştu");
    }
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      slug: tenant.slug,
      ownerId: tenant.ownerId || "",
    });
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingTenant(null);
    setFormData({ name: "", slug: "", ownerId: "" });
  };

  // Convert to slug format
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: editingTenant
        ? formData.slug
        : name
            .toLowerCase()
            .replace(/ğ/g, "g")
            .replace(/ü/g, "u")
            .replace(/ş/g, "s")
            .replace(/ı/g, "i")
            .replace(/ö/g, "o")
            .replace(/ç/g, "c")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, ""),
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenant Yönetimi</h1>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tenant Yönetimi</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Sistemdeki tüm kütüphaneleri (tenant'ları) görüntüleyin ve yönetin.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Tenant
        </Button>
      </div>

      {tenants.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Henüz tenant eklenmemiş.</p>
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
                    <th className="px-4 py-3 text-left text-sm font-medium">Slug</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Owner</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">İstatistikler</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Oluşturma Tarihi</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{tenant.name}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {tenant.slug}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {tenant.ownerId
                          ? users.find((u) => u.id === tenant.ownerId)?.email || "-"
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        <div className="space-y-1">
                          <div>{tenant._count.userTenants} kullanıcı</div>
                          <div>{tenant._count.Books} kitap</div>
                          <div>{tenant._count.Authors} yazar</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(tenant.createdAt).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(tenant)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteTenant(tenant.id)}>
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
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{tenant.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{tenant.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(tenant)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTenant(tenant.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {tenant.ownerId && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Owner:</span>{" "}
                      {users.find((u) => u.id === tenant.ownerId)?.email || "-"}
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Kullanıcı:</span>{" "}
                    {tenant._count.userTenants}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Kitap:</span> {tenant._count.Books}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Yazar:</span> {tenant._count.Authors}
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    Oluşturma: {new Date(tenant.createdAt).toLocaleDateString("tr-TR")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create/Edit Tenant Dialog */}
      <Dialog open={formOpen} onOpenChange={handleFormClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTenant ? "Tenant Düzenle" : "Yeni Tenant Oluştur"}
            </DialogTitle>
            <DialogDescription>
              {editingTenant
                ? "Tenant bilgilerini güncelleyin"
                : "Yeni bir kütüphane (tenant) oluşturun"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingTenant ? handleUpdateTenant : handleCreateTenant}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">İsim *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Medrese Kütüphanesi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="medrese-kutuphanesi"
                  pattern="[a-z0-9-]+"
                  title="Sadece küçük harf, rakam ve tire"
                />
                <p className="text-xs text-muted-foreground">
                  URL'de kullanılacak benzersiz tanımlayıcı (sadece küçük harf, rakam ve tire)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerId">Owner (Opsiyonel)</Label>
                <Select
                  id="ownerId"
                  value={formData.ownerId}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerId: e.target.value })
                  }>
                  <option value="">Owner seçme</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.email} {user.name && `(${user.name})`}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleFormClose}>
                İptal
              </Button>
              <Button type="submit">
                {editingTenant ? "Güncelle" : "Oluştur"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

