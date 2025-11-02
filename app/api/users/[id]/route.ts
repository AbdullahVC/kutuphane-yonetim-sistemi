import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

const updateUserSchema = z.object({
  email: z.string().email("Geçerli bir email adresi giriniz").optional(),
  username: z.string().optional().nullable(),
  name: z.string().optional(),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır").optional(),
});

const assignTenantSchema = z.object({
  tenantId: z.string(),
  role: z.enum(["admin", "member"]),
});

// PUT /api/users/[id] → Kullanıcı bilgilerini güncelle
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await req.json();
    const validated = updateUserSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    // If email is being updated, check if it's already taken
    if (validated.email && validated.email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: validated.email },
      });

      if (emailTaken) {
        return NextResponse.json(
          { error: "Bu email adresi zaten kullanılıyor" },
          { status: 400 }
        );
      }
    }

    // If username is being updated, check if it's already taken
    if (validated.username !== undefined && validated.username !== existingUser.username) {
      if (validated.username) {
        const usernameTaken = await prisma.user.findUnique({
          where: { username: validated.username },
        });

        if (usernameTaken) {
          return NextResponse.json(
            { error: "Bu kullanıcı adı zaten kullanılıyor" },
            { status: 400 }
          );
        }
      }
    }

    // Prepare update data
    const updateData: {
      email?: string;
      username?: string | null;
      name?: string;
      password?: string;
    } = {};

    if (validated.email) updateData.email = validated.email;
    if (validated.username !== undefined) {
      // If username is empty string, set to null; otherwise use the value
      updateData.username = validated.username && validated.username.trim() !== "" 
        ? validated.username.trim() 
        : null;
    }
    if (validated.name !== undefined) {
      updateData.name = validated.name || undefined;
    }
    if (validated.password) {
      updateData.password = await bcrypt.hash(validated.password, 10);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        userTenants: {
          include: {
            tenant: true,
          },
        },
      },
    });

    return NextResponse.json(user);
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

// DELETE /api/users/[id] → Kullanıcıyı sil
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Kullanıcı silindi" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata oluştu";
    if (message.includes("Unauthorized") || message.includes("Forbidden")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

