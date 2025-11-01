// app/api/to-buy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET /api/to-buy  → durum/öncelik sıralı liste
export async function GET() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: "default" } });
  if (!tenant) return NextResponse.json([], { status: 200 });

  const items = await prisma.toBuyBook.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    take: 200,
  });

  return NextResponse.json(items);
}

// POST /api/to-buy  → body: { title, authorId?, genre?, publisher?, volumeCount?, note?, status? }
export async function POST(req: NextRequest) {
  const tenant = await prisma.tenant.findUnique({ where: { slug: "default" } });
  if (!tenant) return NextResponse.json({ error: "Tenant yok" }, { status: 400 });

  const body = await req.json();
  if (!body?.title) {
    return NextResponse.json({ error: "title zorunlu" }, { status: 400 });
  }

  const created = await prisma.toBuyBook.create({
    data: {
      tenantId: tenant.id,
      title: body.title,
      authorId: body.authorId ?? null,
      genre: body.genre ?? null,
      publisher: body.publisher ?? null,
      volumeCount: body.volumeCount ?? null,
      note: body.note ?? null,
      status: body.status ?? "pending",
    },
  });

  return NextResponse.json(created, { status: 201 });
}
