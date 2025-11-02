import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { z } from "zod";

export const runtime = "nodejs";

const assignTenantSchema = z.object({
  tenantId: z.string(),
  role: z.enum(["admin", "member"]),
});

// POST /api/users/[id]/tenants → Kullanıcıyı tenant'a ata
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await requireAdmin();

    // Handle both Promise and direct params (Next.js 15 compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const userId = resolvedParams.id;

    const body = await req.json();
    const validated = assignTenantSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: validated.tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant bulunamadı" }, { status: 404 });
    }

    // Check if assignment already exists
    const existing = await prisma.userTenant.findUnique({
      where: {
        userId_tenantId: {
          userId: userId,
          tenantId: validated.tenantId,
        },
      },
    });

    if (existing) {
      // Update existing assignment
      const userTenant = await prisma.userTenant.update({
        where: { id: existing.id },
        data: { role: validated.role },
        include: {
          tenant: true,
        },
      });
      return NextResponse.json(userTenant);
    }

    // Create new assignment
    const userTenant = await prisma.userTenant.create({
      data: {
        userId: userId,
        tenantId: validated.tenantId,
        role: validated.role,
      },
      include: {
        tenant: true,
      },
    });

    return NextResponse.json(userTenant, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation hatası", details: error.issues },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : "Bir hata oluştu";
    if (message.includes("Unauthorized") || message.includes("Forbidden")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/users/[id]/tenants/[tenantId] → Kullanıcıyı tenant'tan çıkar
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await requireAdmin();

    // Handle both Promise and direct params (Next.js 15 compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const userId = resolvedParams.id;

    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId parametresi gerekli" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "userId parametresi gerekli" },
        { status: 400 }
      );
    }

    const userTenant = await prisma.userTenant.findUnique({
      where: {
        userId_tenantId: {
          userId: userId,
          tenantId: tenantId,
        },
      },
    });

    if (!userTenant) {
      return NextResponse.json(
        { error: "Tenant ataması bulunamadı" },
        { status: 404 }
      );
    }

    await prisma.userTenant.delete({
      where: { id: userTenant.id },
    });

    return NextResponse.json({ message: "Tenant ataması kaldırıldı" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata oluştu";
    if (message.includes("Unauthorized") || message.includes("Forbidden")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

