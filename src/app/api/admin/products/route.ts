// app/api/admin/products/route.ts
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        // ----- fields của Product -----
        id: true,
        name: true,
        basePrice: true,
        costPrice: true,
        isActive: true,
        createdAt: true,
        categoryId: true,
        soldCount: true,
        // ----- Category (cho gender + tên danh mục) -----
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
            gender: true,
          },
        },

        // ----- Ảnh sản phẩm -----
        images: {
          select: {
            id: true,
            url: true,
            isMain: true,
            productId: true,
            variantColorId: true,
            createdAt: true,
          },
        },

        // ----- Biến thể màu / size -----
        variantColors: {
          select: {
            id: true,
            color: true,
            productId: true,
            createdAt: true,
            sizes: {
              select: {
                id: true,
                size: true,
                price: true,
                stock: true,
                colorVariantId: true,
                createdAt: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(products)
  } catch (err) {
    console.error("GET /api/admin/products error:", err)
    return NextResponse.json(
      { message: "Không thể tải danh sách sản phẩm" },
      { status: 500 }
    )
  }
}
