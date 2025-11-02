import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      userTenants: {
        include: {
          tenant: true,
        },
      },
    },
  });

  return user;
}

export async function getCurrentTenant(tenantSlug?: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  // If tenantSlug provided, get that specific tenant
  if (tenantSlug) {
    const userTenant = user.userTenants.find(
      (ut) => ut.tenant.slug === tenantSlug
    );
    return userTenant?.tenant || null;
  }

  // Otherwise, try to get from session or default to first tenant
  // TODO: Store active tenant in session
  return user.userTenants[0]?.tenant || null;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  if (!user) return false;
  
  // System admin: specific emails are always admins (super admin)
  // This allows system admins to access admin panel without being tied to tenants
  const SYSTEM_ADMIN_EMAILS = [
    "admin@example.com",
    // Add more system admin emails here if needed
  ];
  
  if (SYSTEM_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return true;
  }
  
  // Check if user is admin in any tenant
  return user.userTenants.some((ut) => ut.role === "admin");
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    throw new Error("Forbidden: Admin access required");
  }
  
  return user;
}

