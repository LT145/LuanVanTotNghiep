import { prisma } from "@/lib/prisma";

export async function searchProductsServer(q: string) {
  if (!q.trim()) return [];

  return prisma.product.findMany({
    where: {    
      OR: [
        { name: { contains: q, mode: "insensitive" }, isActive: true },
        { keywords: { has: q.toLowerCase() }, isActive: true },
      ],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      basePrice: true,
      images: {
        select: {
          url: true,
          isMain: true,
        },
      },
      variantColors: true,
    },
  });
}
