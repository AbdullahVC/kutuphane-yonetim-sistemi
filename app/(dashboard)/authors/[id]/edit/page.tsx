"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthorForm } from "@/components/authors/author-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Author } from "@/app/generated/prisma";

async function getAuthor(id: string): Promise<Author | null> {
  const res = await fetch(`/api/authors/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default function EditAuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorId, setAuthorId] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id }) => {
      setAuthorId(id);
      loadAuthor(id);
    });
  }, [params]);

  const loadAuthor = async (id: string) => {
    setLoading(true);
    try {
      const authorData = await getAuthor(id);
      if (!authorData) {
        router.push("/authors");
        return;
      }
      setAuthor(authorData);
    } catch (error) {
      console.error("Yazar yüklenirken hata:", error);
      router.push("/authors");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/authors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Link>
        </Button>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (!author) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href={`/authors/${authorId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Yazar Düzenle</h1>
      </div>

      <AuthorForm
        open={true}
        onOpenChange={(open) => {
          if (!open) {
            router.push(`/authors/${authorId}`);
          }
        }}
        author={author}
        onSuccess={() => {
          router.push(`/authors/${authorId}`);
        }}
      />
    </div>
  );
}

