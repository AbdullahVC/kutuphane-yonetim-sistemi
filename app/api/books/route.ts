// app/api/books/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookSchema } from "@/lib/validations/book";
import { ZodError } from "zod";
import { requireAuthAndTenant } from "@/lib/api-helpers";

export const runtime = "nodejs";

// GET /api/books → son eklenen 100 kitabı getir (Author relation ile)
export async function GET() {
  try {
    const { tenant } = await requireAuthAndTenant();

  const data = await prisma.book.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    take: 100,
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

  return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata oluştu";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

// POST /api/books → yeni kitap ekle
export async function POST(req: NextRequest) {
  try {
    const { tenant } = await requireAuthAndTenant();

  const body = await req.json();
    const validated = bookSchema.parse(body);

  const created = await prisma.book.create({
    data: {
      tenantId: tenant.id,
        ...validated,
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
