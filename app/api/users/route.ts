import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

const createUserSchema = z.object({
  email: z.string().email("Geçerli bir email adresi giriniz"),
  username: z.string().optional(),
  name: z.string().optional(),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  tenantId: z.string().optional(),
  role: z.enum(["admin", "member"]).default("member"),
});

// GET /api/users → Tüm kullanıcıları getir
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      include: {
        userTenants: {
          include: {
            tenant: true,
          },
        },
        _count: {
          select: {
            userTenants: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata oluştu";
    if (message.includes("Unauthorized") || message.includes("Forbidden")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

// POST /api/users → Yeni kullanıcı oluştur
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const validated = createUserSchema.parse(body);

    // Check if user already exists (by email)
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Check if username already exists (if provided)
    if (validated.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: validated.username },
      });

      if (existingUsername) {
        return NextResponse.json(
          { error: "Bu kullanıcı adı zaten kullanılıyor" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Prepare user data
    const userData: {
      email: string;
      username?: string | null;
      name?: string | null;
      password: string;
    } = {
      email: validated.email,
      password: hashedPassword,
    };

    // Only include username if provided and not empty
    if (validated.username && validated.username.trim() !== "") {
      userData.username = validated.username.trim();
    }

    // Only include name if provided
    if (validated.name) {
      userData.name = validated.name;
    }

    // Create user
    const user = await prisma.user.create({
      data: userData,
    });

    // If tenantId provided, assign user to tenant
    if (validated.tenantId) {
      await prisma.userTenant.create({
        data: {
          userId: user.id,
          tenantId: validated.tenantId,
          role: validated.role,
        },
      });
    }

    // Fetch user with relations
    const userWithTenants = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        userTenants: {
          include: {
            tenant: true,
          },
        },
      },
    });

    return NextResponse.json(userWithTenants, { status: 201 });
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

