import { isAdmin, getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const admin = await isAdmin();

  if (!user) {
    redirect("/login");
  }

  if (!admin) {
    redirect("/?error=admin_required");
  }

  return <>{children}</>;
}

