// app/api/books/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET /api/books  → son eklenen 100 kitabı getir
export async function GET() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: "default" } });
  if (!tenant) return NextResponse.json([], { status: 200 });

  const data = await prisma.book.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(data);
}

// POST /api/books  → body: { title, authorId?, genre?, publisher?, volumeCount?, library?, shelf?, number?, note? }
export async function POST(req: NextRequest) {
  const tenant = await prisma.tenant.findUnique({ where: { slug: "default" } });
  if (!tenant) return NextResponse.json({ error: "Tenant yok" }, { status: 400 });

  const body = await req.json();
  if (!body?.title) {
    return NextResponse.json({ error: "title zorunlu" }, { status: 400 });
  }

  const created = await prisma.book.create({
    data: {
      tenantId: tenant.id,
      title: body.title,
      authorId: body.authorId ?? null,
      genre: body.genre ?? null,
      publisher: body.publisher ?? null,
      volumeCount: body.volumeCount ?? null,
      library: body.library ?? null,
      shelf: body.shelf ?? null,
      number: body.number ?? null,
      note: body.note ?? null,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
