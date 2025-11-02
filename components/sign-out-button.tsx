"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <Button type="button" variant="destructive" onClick={handleSignOut}>
      <LogOut className="mr-2 h-4 w-4" />
      Çıkış Yap
    </Button>
  );
}

