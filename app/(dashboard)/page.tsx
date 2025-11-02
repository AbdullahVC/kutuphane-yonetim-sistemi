import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, ShoppingCart, CheckCircle, Shield, Building2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser, getCurrentTenant, isAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function ErrorMessage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  if (!params?.error) return null;

  if (params.error === "admin_required") {
    return (
      <Card className="border-destructive bg-destructive/10 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Admin Erişimi Gerekli
          </CardTitle>
          <CardDescription>
            Bu sayfaya erişmek için en az bir tenant'ta admin rolünüz olmalı.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Admin paneline erişmek için:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Mevcut bir admin kullanıcısı tarafından bir tenant'a admin rolüyle atanmanız gerekiyor</li>
            <li>Veya seed script'i çalıştırılarak admin kullanıcısı oluşturulmalı</li>
          </ol>
          <Button asChild variant="outline">
            <Link href="/settings">Ayarlar'a Git</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  const admin = await isAdmin();
  const tenant = await getCurrentTenant();

  return (
    <>
      <Suspense fallback={null}>
        <ErrorMessage searchParams={searchParams} />
      </Suspense>

      {/* Admin için özel ana sayfa */}
      {admin ? await (async () => {
          const [usersCount, tenantsCount] = await Promise.all([
            prisma.user.count(),
            prisma.tenant.count(),
          ]);

          return (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Paneli</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Sistem yönetimi ve kontrol</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Kullanıcılar
                    </CardTitle>
                    <CardDescription>Toplam kullanıcı sayısı</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">{usersCount}</div>
                    <Button asChild className="w-full">
                      <Link href="/admin/users">
                        <Shield className="mr-2 h-4 w-4" />
                        Kullanıcıları Yönet
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Tenant'lar
                    </CardTitle>
                    <CardDescription>Toplam kütüphane sayısı</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">{tenantsCount}</div>
                    <Button asChild className="w-full">
                      <Link href="/admin/tenants">
                        <Building2 className="mr-2 h-4 w-4" />
                        Tenant'ları Yönet
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        })() : !tenant ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Hoş Geldiniz</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Henüz bir tenant'a atanmamışsınız.</p>
          </div>
        </div>
      ) : await (async () => {
  const [booksCount, authorsCount, toBuyCount, pendingCount, orderedCount, boughtCount] =
            await Promise.all([
          prisma.book.count({ where: { tenantId: tenant.id } }),
          prisma.author.count({ where: { tenantId: tenant.id } }),
          prisma.toBuyBook.count({ where: { tenantId: tenant.id } }),
          prisma.toBuyBook.count({ where: { tenantId: tenant.id, status: "pending" } }),
          prisma.toBuyBook.count({ where: { tenantId: tenant.id, status: "ordered" } }),
          prisma.toBuyBook.count({ where: { tenantId: tenant.id, status: "bought" } }),
            ]);

  return (
    <div className="space-y-6">
              <div className="mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Ana Sayfa</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Kütüphane yönetim sistemine hoş geldiniz.</p>
      </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kitap</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{booksCount}</div>
            <p className="text-xs text-muted-foreground">Kayıtlı kitap sayısı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yazarlar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{authorsCount}</div>
            <p className="text-xs text-muted-foreground">Kayıtlı yazar sayısı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satın Alınacak</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toBuyCount}</div>
            <p className="text-xs text-muted-foreground">
              {pendingCount} bekliyor, {orderedCount} sipariş, {boughtCount} alındı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Satın alınmayı bekleyen kitap</p>
          </CardContent>
        </Card>
      </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Hızlı Erişim</CardTitle>
                    <CardDescription className="mt-1">Kütüphane yönetim sayfalarına hızlı erişim</CardDescription>
          </CardHeader>
                  <CardContent className="space-y-2 pt-0">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/books">
                <BookOpen className="mr-2 h-4 w-4" />
                Kitapları Görüntüle
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/to-buy">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Satın Alınacak Kitaplar
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
          );
        })()}
    </>
  );
}
