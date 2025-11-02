import { NavLink } from "@/components/dashboard/nav-link";
import { BookOpen, ShoppingCart, Home, Users, Settings, Shield, Building2 } from "lucide-react";
import { isAdmin } from "@/lib/auth-helpers";
import { SignOutButton } from "@/components/sign-out-button";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await isAdmin();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <MobileSidebar admin={admin} />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:border-r lg:bg-background">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <h1 className="text-xl font-semibold">Kütüphane Yönetimi</h1>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            <NavLink href="/" icon={<Home className="h-5 w-5" />}>
              Ana Sayfa
            </NavLink>
            {!admin && (
              <>
                <NavLink href="/books" icon={<BookOpen className="h-5 w-5" />}>
                  Kitaplar
                </NavLink>
                <NavLink href="/authors" icon={<Users className="h-5 w-5" />}>
                  Yazarlar
                </NavLink>
                <NavLink href="/to-buy" icon={<ShoppingCart className="h-5 w-5" />}>
                  Satın Alınacaklar
                </NavLink>
              </>
            )}
            <NavLink href="/settings" icon={<Settings className="h-5 w-5" />}>
              Ayarlar
            </NavLink>
            {admin && (
              <>
                <NavLink href="/admin/users" icon={<Shield className="h-5 w-5" />}>
                  Kullanıcı Yönetimi
                </NavLink>
                <NavLink href="/admin/tenants" icon={<Building2 className="h-5 w-5" />}>
                  Tenant Yönetimi
                </NavLink>
              </>
            )}
          </nav>
          <div className="p-4 border-t">
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="container mx-auto p-4 sm:p-6 pt-16 lg:pt-6">{children}</div>
      </main>
    </div>
  );
}

