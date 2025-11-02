import { getCurrentUser } from "@/lib/auth-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profil Ayarları</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Hesap bilgilerinizi görüntüleyin ve yönetin.</p>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Kullanıcı Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="mt-1 text-sm">{user.email}</p>
            </div>
            {user.username && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Kullanıcı Adı</label>
                <p className="mt-1 text-sm">@{user.username}</p>
              </div>
            )}
            {user.name && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">İsim</label>
                <p className="mt-1 text-sm">{user.name}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Üyelik Tarihi</label>
              <p className="mt-1 text-sm">
                {new Date(user.createdAt).toLocaleDateString("tr-TR")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tenant'lar</CardTitle>
            <CardDescription>Erişim yetkiniz olan kütüphaneler</CardDescription>
          </CardHeader>
          <CardContent>
            {user.userTenants.length === 0 ? (
              <p className="text-sm text-muted-foreground">Henüz tenant'a atanmamışsınız.</p>
            ) : (
              <div className="space-y-2">
                {user.userTenants.map((ut) => (
                  <div
                    key={ut.id}
                    className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{ut.tenant.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {ut.role === "admin" ? "Yönetici" : "Üye"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Çıkış Yap</CardTitle>
          <CardDescription>Hesabınızdan güvenli bir şekilde çıkış yapın</CardDescription>
        </CardHeader>
        <CardContent>
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  );
}
