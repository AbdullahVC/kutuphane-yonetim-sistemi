import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { z } from "zod";

export const runtime = "nodejs";

const createTenantSchema = z.object({
  name: z.string().min(1, "İsim gerekli"),
  slug: z.string().min(1, "Slug gerekli").regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
  ownerId: z.string().optional(),
});

// GET /api/tenants → Tüm tenant'ları getir (sadece admin)
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            userTenants: true,
            Books: true,
            Authors: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tenants);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata oluştu";
    if (message.includes("Unauthorized") || message.includes("Forbidden")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

// POST /api/tenants → Yeni tenant oluştur
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const validated = createTenantSchema.parse(body);

    // Check if slug already exists
    const existing = await prisma.tenant.findUnique({
      where: { slug: validated.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bu slug zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // If ownerId provided, verify user exists
    if (validated.ownerId) {
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

    const tenant = await prisma.tenant.create({
      data: {
        name: validated.name,
        slug: validated.slug,
        ownerId: validated.ownerId || null,
      },
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

    return NextResponse.json(tenant, { status: 201 });
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

