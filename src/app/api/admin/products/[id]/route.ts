// app/api/admin/products/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { deleteFromCloudinary } from "@/lib/cloudinary";

const prisma = new PrismaClient();

// =======================
// GET PRODUCT DETAIL
// =======================
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        variantColors: {
          include: {
            images: true,
            sizes: true,
          },
        },
      },
    });

    if (!product)
      return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json(product);
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// =======================
// PUT UPDATE PRODUCT
// =======================
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await context.params; // ⭐ ĐÚNG NHẤT

  const body = await req.json();

  const {
    name,
    description,
    price,
    costPrice,
    variantColors,
    removedImages,
    removedColorImages,
  } = body;

  if (!productId) {
    return NextResponse.json(
      { error: "Missing product ID" },
      { status: 400 }
    );
  }

  try {
    // ================================
    // 1. XÓA ẢNH SẢN PHẨM
    // ================================
    if (removedImages?.length) {
      for (const imageId of removedImages) {
        const img = await prisma.productImage.findUnique({
          where: { id: imageId },
        });

        if (img) {
          await deleteFromCloudinary(img.url);
          await prisma.productImage.delete({ where: { id: imageId } });
        }
      }
    }

    // ================================
    // 2. XÓA ẢNH THEO MÀU
    // ================================
    if (removedColorImages?.length) {
      for (const { imageId } of removedColorImages) {
        const img = await prisma.productImage.findUnique({
          where: { id: imageId },
        });

        if (img) {
          await deleteFromCloudinary(img.url);
          await prisma.productImage.delete({ where: { id: imageId } });
        }
      }
    }

    // ================================
    // 3. UPDATE SIZE PRICE
    // ================================
    for (const color of variantColors) {
      for (const size of color.sizes) {
        await prisma.productVariantSize.update({
          where: { id: size.id },
          data: { price: size.price },
        });
      }
    }

    // ================================
    // 4. UPDATE PRODUCT
    // ================================
    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        basePrice: price,
        costPrice,
      },
      include: {
        images: true,
        variantColors: {
          include: {
            images: true,
            sizes: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT PRODUCT ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// =======================
// DELETE PRODUCT
// =======================
// export async function DELETE(
//   req: Request,
//   context: { params: { id: string } }
// ) {
//   const { id } = context.params;

//   try {
//     await prisma.product.delete({
//       where: { id },
//     });

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     console.error("DELETE PRODUCT ERROR:", err);
//     return NextResponse.json(
//       { message: "Xóa thất bại" },
//       { status: 500 }
//     );
//   }
// }
