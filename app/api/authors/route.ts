import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorSchema } from "@/lib/validations/author";
import { ZodError } from "zod";
import { requireAuthAndTenant } from "@/lib/api-helpers";

export const runtime = "nodejs";

// GET /api/authors → tüm yazarları getir
export async function GET(req: NextRequest) {
  try {
    const { tenant } = await requireAuthAndTenant();

    const authors = await prisma.author.findMany({
      where: { tenantId: tenant.id },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { Books: true, ToBuyBooks: true },
        },
      },
    });

    return NextResponse.json(authors);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata oluştu";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

// POST /api/authors → yeni yazar ekle
export async function POST(req: NextRequest) {
  try {
    const { tenant } = await requireAuthAndTenant();

    const body = await req.json();
    const validated = authorSchema.parse(body);

    const author = await prisma.author.create({
      data: {
        tenantId: tenant.id,
        ...validated,
      },
    });

    return NextResponse.json(author, { status: 201 });
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
