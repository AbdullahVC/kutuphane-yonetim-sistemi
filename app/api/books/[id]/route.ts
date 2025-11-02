import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookUpdateSchema } from "@/lib/validations/book";
import { ZodError } from "zod";
import { requireAuthAndTenant } from "@/lib/api-helpers";

export const runtime = "nodejs";

// GET /api/books/[id] → tek kitap getir
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { tenant } = await requireAuthAndTenant();

    const book = await prisma.book.findFirst({
      where: { id, tenantId: tenant.id },
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

    if (!book) {
      return NextResponse.json({ error: "Kitap bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Bir hata oluştu" },
      { status: 401 }
    );
  }
}

// PUT /api/books/[id] → kitap güncelle
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { tenant } = await requireAuthAndTenant();

    const body = await req.json();
    const validated = bookUpdateSchema.parse(body);

    const book = await prisma.book.findFirst({
      where: { id, tenantId: tenant.id },
    });

    if (!book) {
      return NextResponse.json({ error: "Kitap bulunamadı" }, { status: 404 });
    }

    const updated = await prisma.book.update({
      where: { id },
      data: validated,
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

// DELETE /api/books/[id] → kitap sil
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { tenant } = await requireAuthAndTenant();

    const book = await prisma.book.findFirst({
      where: { id, tenantId: tenant.id },
    });

    if (!book) {
      return NextResponse.json({ error: "Kitap bulunamadı" }, { status: 404 });
    }

    await prisma.book.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Kitap silindi" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Bir hata oluştu" },
      { status: 401 }
    );
  }
}
