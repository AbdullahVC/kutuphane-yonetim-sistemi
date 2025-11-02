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
import { Plus, Edit, Trash2, UserPlus } from "lucide-react";

interface User {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  createdAt: string;
  userTenants: Array<{
    id: string;
    role: "admin" | "member";
    tenant: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
}

async function getUsers(): Promise<User[]> {
  const res = await fetch("/api/users", { cache: "no-store" });
  if (!res.ok) {
    if (res.status === 403 || res.status === 401) {
      window.location.href = "/login";
      return [];
    }
    throw new Error("Failed to fetch users");
  }
  return res.json();
}

async function getTenants(): Promise<Tenant[]> {
  const res = await fetch("/api/tenants", { cache: "no-store" });
  if (!res.ok) {
    if (res.status === 403 || res.status === 401) {
      return [];
    }
    throw new Error("Failed to fetch tenants");
  }
  return res.json();
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [tenantFormOpen, setTenantFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    name: "",
    password: "",
    tenantId: "",
    role: "member" as "admin" | "member",
  });
  const [tenantFormData, setTenantFormData] = useState({
    tenantId: "",
    role: "member" as "admin" | "member",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, tenantsData] = await Promise.all([
        getUsers(),
        getTenants(),
      ]);
      setUsers(usersData);
      setTenants(tenantsData);
    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Kullanıcı oluşturulamadı");
        return;
      }

      loadData();
      setFormOpen(false);
      setFormData({
        email: "",
        username: "",
        name: "",
        password: "",
        tenantId: "",
        role: "member",
      });
    } catch (error) {
      alert("Bir hata oluştu");
    }
  };

  const handleAssignTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/users/${selectedUser.id}/tenants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tenantFormData),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Tenant ataması yapılamadı");
        return;
      }

      loadData();
      setTenantFormOpen(false);
      setSelectedUser(null);
      setTenantFormData({ tenantId: "", role: "member" });
    } catch (error) {
      alert("Bir hata oluştu");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Kullanıcı silinemedi");
        return;
      }
      loadData();
    } catch (error) {
      alert("Bir hata oluştu");
    }
  };

  const handleRemoveTenant = async (userId: string, tenantId: string) => {
    if (!confirm("Bu tenant atamasını kaldırmak istediğinize emin misiniz?"))
      return;

    try {
      const res = await fetch(
        `/api/users/${userId}/tenants?tenantId=${tenantId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Tenant ataması kaldırılamadı");
        return;
      }
      loadData();
    } catch (error) {
      alert("Bir hata oluştu");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kullanıcı Yönetimi</h1>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Kullanıcı Yönetimi</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Sistemdeki tüm kullanıcıları görüntüleyin ve yönetin.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kullanıcı
        </Button>
      </div>

      {users.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">Henüz kullanıcı eklenmemiş.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Kullanıcı Adı</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">İsim</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Tenant'lar</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Kayıt Tarihi</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{user.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {user.username || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {user.name || "-"}
                      </td>
                      <td className="px-4 py-3">
                        {user.userTenants.length === 0 ? (
                          <span className="text-sm text-muted-foreground">-</span>
                        ) : (
                          <div className="space-y-1">
                            {user.userTenants.map((ut) => (
                              <div
                                key={ut.id}
                                className="flex items-center gap-2 text-sm">
                                <span className="font-medium">{ut.tenant.name}</span>
                                <span
                                  className={`rounded px-2 py-0.5 text-xs ${
                                    ut.role === "admin"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  }`}>
                                  {ut.role === "admin" ? "Yönetici" : "Üye"}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() =>
                                    handleRemoveTenant(user.id, ut.tenant.id)
                                  }>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setTenantFormOpen(true);
                            }}>
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}>
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
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{user.email}</h3>
                    {user.username && (
                      <p className="text-sm text-muted-foreground mt-1">@{user.username}</p>
                    )}
                    {user.name && (
                      <p className="text-sm text-muted-foreground mt-1">{user.name}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setTenantFormOpen(true);
                      }}>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {user.userTenants.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Tenant'lar:</p>
                    {user.userTenants.map((ut) => (
                      <div
                        key={ut.id}
                        className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{ut.tenant.name}</span>
                        <span
                          className={`rounded px-2 py-0.5 text-xs ${
                            ut.role === "admin"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          }`}>
                          {ut.role === "admin" ? "Yönetici" : "Üye"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleRemoveTenant(user.id, ut.tenant.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  Kayıt: {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create User Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Kullanıcı Oluştur</DialogTitle>
            <DialogDescription>
              Yeni bir kullanıcı hesabı oluşturun ve isteğe bağlı olarak bir tenant'a
              atayın.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Kullanıcı Adı (Opsiyonel)</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="kullanici_adi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">İsim</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre *</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenantId">Tenant (Opsiyonel)</Label>
                <Select
                  id="tenantId"
                  value={formData.tenantId}
                  onChange={(e) =>
                    setFormData({ ...formData, tenantId: e.target.value })
                  }>
                  <option value="">Tenant seçme</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </Select>
              </div>
              {formData.tenantId && (
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select
                    id="role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as "admin" | "member",
                      })
                    }>
                    <option value="member">Üye</option>
                    <option value="admin">Yönetici</option>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                İptal
              </Button>
              <Button type="submit">Oluştur</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Tenant Dialog */}
      <Dialog open={tenantFormOpen} onOpenChange={setTenantFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tenant Ata</DialogTitle>
            <DialogDescription>
              {selectedUser?.email} kullanıcısına tenant ataması yapın.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignTenant}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tenantId">Tenant *</Label>
                <Select
                  id="tenantId"
                  value={tenantFormData.tenantId}
                  onChange={(e) =>
                    setTenantFormData({ ...tenantFormData, tenantId: e.target.value })
                  }
                  required>
                  <option value="">Tenant seçin</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol *</Label>
                <Select
                  id="role"
                  value={tenantFormData.role}
                  onChange={(e) =>
                    setTenantFormData({
                      ...tenantFormData,
                      role: e.target.value as "admin" | "member",
                    })
                  }
                  required>
                  <option value="member">Üye</option>
                  <option value="admin">Yönetici</option>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setTenantFormOpen(false)}>
                İptal
              </Button>
              <Button type="submit">Ata</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

