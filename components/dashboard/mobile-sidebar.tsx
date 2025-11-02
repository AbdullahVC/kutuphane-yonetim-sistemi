"use client";

import { useState, useEffect } from "react";
import { NavLink } from "@/components/dashboard/nav-link";
import { Button } from "@/components/ui/button";
import { BookOpen, ShoppingCart, Home, Users, Settings, Shield, Building2, Menu, X } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

interface MobileSidebarProps {
  admin: boolean;
}

export function MobileSidebar({ admin }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-background">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          lg:hidden fixed inset-y-0 left-0 z-50 w-64 border-r bg-background transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b px-6">
            <h1 className="text-xl font-semibold">Kütüphane Yönetimi</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            <NavLink href="/" icon={<Home className="h-5 w-5" />} onClick={() => setIsOpen(false)}>
              Ana Sayfa
            </NavLink>
            {!admin && (
              <>
                <NavLink href="/books" icon={<BookOpen className="h-5 w-5" />} onClick={() => setIsOpen(false)}>
                  Kitaplar
                </NavLink>
                <NavLink href="/authors" icon={<Users className="h-5 w-5" />} onClick={() => setIsOpen(false)}>
                  Yazarlar
                </NavLink>
                <NavLink href="/to-buy" icon={<ShoppingCart className="h-5 w-5" />} onClick={() => setIsOpen(false)}>
                  Satın Alınacaklar
                </NavLink>
              </>
            )}
            <NavLink href="/settings" icon={<Settings className="h-5 w-5" />} onClick={() => setIsOpen(false)}>
              Ayarlar
            </NavLink>
            {admin && (
              <>
                <NavLink href="/admin/users" icon={<Shield className="h-5 w-5" />} onClick={() => setIsOpen(false)}>
                  Kullanıcı Yönetimi
                </NavLink>
                <NavLink href="/admin/tenants" icon={<Building2 className="h-5 w-5" />} onClick={() => setIsOpen(false)}>
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
    </>
  );
}

