import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorUpdateSchema } from "@/lib/validations/author";
import { ZodError } from "zod";
import { requireAuthAndTenant } from "@/lib/api-helpers";

export const runtime = "nodejs";

// GET /api/authors/[id] → tek yazar getir
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { tenant } = await requireAuthAndTenant();

    const author = await prisma.author.findFirst({
      where: { id, tenantId: tenant.id },
      include: {
        Books: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        ToBuyBooks: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { Books: true, ToBuyBooks: true },
        },
      },
    });

    if (!author) {
      return NextResponse.json({ error: "Yazar bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(author);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Bir hata oluştu" },
      { status: 401 }
    );
  }
}

// PUT /api/authors/[id] → yazar güncelle
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { tenant } = await requireAuthAndTenant();

    const body = await req.json();
    const validated = authorUpdateSchema.parse(body);

    const author = await prisma.author.findFirst({
      where: { id, tenantId: tenant.id },
    });

    if (!author) {
      return NextResponse.json({ error: "Yazar bulunamadı" }, { status: 404 });
    }

    const updated = await prisma.author.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(updated);
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

// DELETE /api/authors/[id] → yazar sil
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { tenant } = await requireAuthAndTenant();

    const author = await prisma.author.findFirst({
      where: { id, tenantId: tenant.id },
    });

    if (!author) {
      return NextResponse.json({ error: "Yazar bulunamadı" }, { status: 404 });
    }

    await prisma.author.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Yazar silindi" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Bir hata oluştu" },
      { status: 401 }
    );
  }
}
