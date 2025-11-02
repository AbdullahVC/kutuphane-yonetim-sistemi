// app/api/to-buy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toBuyBookSchema } from "@/lib/validations/to-buy";
import { ZodError } from "zod";
import { requireAuthAndTenant } from "@/lib/api-helpers";

export const runtime = "nodejs";

// GET /api/to-buy → durum/öncelik sıralı liste (Author relation ile)
export async function GET(req: NextRequest) {
  try {
    const { tenant } = await requireAuthAndTenant();

    const items = await prisma.toBuyBook.findMany({
      where: { tenantId: tenant.id },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 200,
      include: {
        Author: {
          select: {
            id: true,
            name: true,
            nickname: true,
          },
        },
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Bir hata oluştu" },
      { status: 401 }
    );
  }
}

// POST /api/to-buy → yeni satın alınacak kitap ekle
export async function POST(req: NextRequest) {
  try {
    const { tenant } = await requireAuthAndTenant();

    const body = await req.json();
    const validated = toBuyBookSchema.parse(body);

    const created = await prisma.toBuyBook.create({
      data: {
        tenantId: tenant.id,
        ...validated,
        status: validated.status ?? "pending",
      },
      include: {
        Author: {
          select: {
            id: true,
            name: true,
            nickname: true,
          },
        },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation hatası", details: error.issues },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : "Bir hata oluştu";
    if (message === "Unauthorized" || message.includes("Tenant")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
