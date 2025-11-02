import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { z } from "zod";

export const runtime = "nodejs";

const updateTenantSchema = z.object({
  name: z.string().min(1, "İsim gerekli").optional(),
  slug: z.string().min(1, "Slug gerekli").regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir").optional(),
  ownerId: z.string().optional().nullable(),
});

// PUT /api/tenants/[id] → Tenant bilgilerini güncelle
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await req.json();
    const validated = updateTenantSchema.parse(body);

    // Check if tenant exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!existingTenant) {
      return NextResponse.json({ error: "Tenant bulunamadı" }, { status: 404 });
    }

    // If slug is being updated, check if it's already taken
    if (validated.slug && validated.slug !== existingTenant.slug) {
      const slugTaken = await prisma.tenant.findUnique({
        where: { slug: validated.slug },
      });

      if (slugTaken) {
        return NextResponse.json(
          { error: "Bu slug zaten kullanılıyor" },
          { status: 400 }
        );
      }
    }

    // If ownerId provided, verify user exists
    if (validated.ownerId !== undefined && validated.ownerId !== null) {
      const owner = await prisma.user.findUnique({
        where: { id: validated.ownerId },
      });

      if (!owner) {
        return NextResponse.json(
          { error: "Owner kullanıcı bulunamadı" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: {
      name?: string;
      slug?: string;
      ownerId?: string | null;
    } = {};

    if (validated.name) updateData.name = validated.name;
    if (validated.slug) updateData.slug = validated.slug;
    if (validated.ownerId !== undefined) updateData.ownerId = validated.ownerId;

    // Update tenant
    const tenant = await prisma.tenant.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            userTenants: true,
            Books: true,
            Authors: true,
          },
        },
      },
    });

    return NextResponse.json(tenant);
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

// DELETE /api/tenants/[id] → Tenant'ı sil
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant bulunamadı" }, { status: 404 });
    }

    // Check if tenant has data (optional - can be removed if cascade delete is desired)
    const [booksCount, authorsCount, usersCount] = await Promise.all([
      prisma.book.count({ where: { tenantId: id } }),
      prisma.author.count({ where: { tenantId: id } }),
      prisma.userTenant.count({ where: { tenantId: id } }),
    ]);

    if (booksCount > 0 || authorsCount > 0 || usersCount > 0) {
      return NextResponse.json(
        {
          error: `Tenant silinemez. ${booksCount} kitap, ${authorsCount} yazar ve ${usersCount} kullanıcı ataması bulunuyor.`,
        },
        { status: 400 }
      );
    }

    // Delete tenant (cascade will handle related records)
    await prisma.tenant.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Tenant silindi" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata oluştu";
    if (message.includes("Unauthorized") || message.includes("Forbidden")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

