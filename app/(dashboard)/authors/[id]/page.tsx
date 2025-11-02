import { getCurrentTenant } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getAuthor(id: string) {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  const author = await prisma.author.findFirst({
    where: { id, tenantId: tenant.id },
    include: {
      Books: {
        take: 20,
        orderBy: { createdAt: "desc" },
      },
      ToBuyBooks: {
        take: 20,
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { Books: true, ToBuyBooks: true },
      },
    },
  });

  return author;
}

export default async function AuthorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const author = await getAuthor(id);

  if (!author) {
    notFound();
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
          <Link href="/authors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {author.name}
            {author.nickname && (
              <span className="text-base sm:text-lg font-normal text-muted-foreground ml-2">
                ({author.nickname})
              </span>
            )}
          </h1>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href={`/authors/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Düzenle
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Genel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {author.origin && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Menşe:</span>
                <p className="mt-1">{author.origin}</p>
              </div>
            )}
            {(author.birthDate || author.deathDate) && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Yaşam:</span>
                <p className="mt-1">
                  {author.birthDate ?? "?"} - {author.deathDate ?? "?"}
                </p>
              </div>
            )}
            {(author.birthPlace || author.deathPlace) && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Yer:</span>
                <p className="mt-1">
                  {author.birthPlace && `Doğum: ${author.birthPlace}`}
                  {author.birthPlace && author.deathPlace && " • "}
                  {author.deathPlace && `Ölüm: ${author.deathPlace}`}
                </p>
              </div>
            )}
            {author.officialDuties && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Resmi Görevler:</span>
                <p className="mt-1">{author.officialDuties}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mezhep Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {author.fiqhMadhhab && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Fıkıh Mezhebi:</span>
                <p className="mt-1">{author.fiqhMadhhab}</p>
              </div>
            )}
            {author.aqidahMadhhab && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Akide Mezhebi:</span>
                <p className="mt-1">{author.aqidahMadhhab}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {author.famousWorks && (
          <Card>
            <CardHeader>
              <CardTitle>Ünlü Eserler</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{author.famousWorks}</p>
            </CardContent>
          </Card>
        )}

        {(author.teachers || author.students) && (
          <Card>
            <CardHeader>
              <CardTitle>İlim Silsilesi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {author.teachers && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Hocaları:</span>
                  <p className="mt-1 whitespace-pre-line">{author.teachers}</p>
                </div>
              )}
              {author.students && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Öğrencileri:</span>
                  <p className="mt-1 whitespace-pre-line">{author.students}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {author.expertiseAreas && (
          <Card>
            <CardHeader>
              <CardTitle>Uzmanlık Alanları</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{author.expertiseAreas}</p>
            </CardContent>
          </Card>
        )}

        {author.statusInTabakat && (
          <Card>
            <CardHeader>
              <CardTitle>Tabakat'taki Durumu</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{author.statusInTabakat}</p>
            </CardContent>
          </Card>
        )}

        {author.importantNotes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Önemli Notlar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{author.importantNotes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Kitaplar ({author._count.Books})
              <CardDescription>
                Bu yazara ait {author._count.Books} kitap kayıtlı
              </CardDescription>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {author.Books.length === 0 ? (
              <p className="text-sm text-muted-foreground">Henüz kitap eklenmemiş.</p>
            ) : (
              <div className="space-y-2">
                {author.Books.map((book) => (
                  <div key={book.id} className="border rounded-lg p-3">
                    <div className="font-medium">{book.title}</div>
                    {book.genre && (
                      <div className="text-sm text-muted-foreground">{book.genre}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Satın Alınacak Kitaplar ({author._count.ToBuyBooks})
              <CardDescription>
                Bu yazara ait {author._count.ToBuyBooks} satın alınacak kitap kayıtlı
              </CardDescription>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {author.ToBuyBooks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Henüz satın alınacak kitap eklenmemiş.</p>
            ) : (
              <div className="space-y-2">
                {author.ToBuyBooks.map((book) => (
                  <div key={book.id} className="border rounded-lg p-3">
                    <div className="font-medium">{book.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {book.genre && `${book.genre} • `}
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          book.status === "bought"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : book.status === "ordered"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              : book.status === "dismissed"
                                ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}>
                        {book.status === "pending"
                          ? "Bekliyor"
                          : book.status === "ordered"
                            ? "Sipariş Edildi"
                            : book.status === "bought"
                              ? "Alındı"
                              : "İptal"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

