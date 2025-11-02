import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toBuyBookUpdateSchema } from "@/lib/validations/to-buy";
import { ZodError } from "zod";
import { requireAuthAndTenant } from "@/lib/api-helpers";

export const runtime = "nodejs";

// GET /api/to-buy/[id] → tek satın alınacak kitap getir
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { tenant } = await requireAuthAndTenant();

    const item = await prisma.toBuyBook.findFirst({
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

    if (!item) {
      return NextResponse.json(
        { error: "Satın alınacak kitap bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Bir hata oluştu" },
      { status: 401 }
    );
  }
}

// PUT /api/to-buy/[id] → satın alınacak kitap güncelle
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { tenant } = await requireAuthAndTenant();

    const body = await req.json();
    const validated = toBuyBookUpdateSchema.parse(body);

    const item = await prisma.toBuyBook.findFirst({
      where: { id, tenantId: tenant.id },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Satın alınacak kitap bulunamadı" },
        { status: 404 }
      );
    }

    const updated = await prisma.toBuyBook.update({
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

// DELETE /api/to-buy/[id] → satın alınacak kitap sil
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { tenant } = await requireAuthAndTenant();

    const item = await prisma.toBuyBook.findFirst({
      where: { id, tenantId: tenant.id },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Satın alınacak kitap bulunamadı" },
        { status: 404 }
      );
    }

    await prisma.toBuyBook.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Satın alınacak kitap silindi" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Bir hata oluştu" },
      { status: 401 }
    );
  }
}
