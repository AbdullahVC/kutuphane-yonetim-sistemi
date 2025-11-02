import { getCurrentUser, getCurrentTenant } from "@/lib/auth-helpers";

export async function getTenantForRequest(tenantSlug?: string) {
  const tenant = await getCurrentTenant(tenantSlug);
  if (!tenant) {
    throw new Error("Tenant bulunamadı");
  }
  return tenant;
}

export async function requireAuthAndTenant(tenantSlug?: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const tenant = await getCurrentTenant(tenantSlug);
  if (!tenant) {
    throw new Error("Tenant bulunamadı veya erişim izniniz yok");
  }

  return { user, tenant };
}

