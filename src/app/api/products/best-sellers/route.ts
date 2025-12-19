import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    // 1) Best sellers trước
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { soldCount: "desc" },
      take: 8,
      select: {
        id: true,
        slug: true,
        name: true,
        basePrice: true,
        soldCount: true,
        images: {
          // bạn đang filter isMain nên thường chỉ có 1 ảnh
          where: { isMain: true },
          select: { url: true, isMain: true },
        },
        category: {
          select: { slug: true, gender: true },
        },
      },
    });

    const ids = products.map((p) => p.id);
    if (ids.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 2) Lấy tất cả PromotionSize đang active thuộc các productIds này
    //    PromotionSize -> Promotion -> ProductVariantColor -> Product (lọc theo productId)
    const promoSizes = await prisma.promotionSize.findMany({
      where: {
        promotion: {
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now },
          colorVariant: {
            productId: { in: ids },
            product: { isActive: true },
          },
        },
      },
      select: {
        price: true,
        promotion: {
          select: {
            colorVariant: { select: { productId: true } },
          },
        },
      },
    });

    // 3) Gom min price theo productId
    const minMap = new Map<string, number>();
    for (const ps of promoSizes) {
      const productId = ps.promotion.colorVariant.productId;
      const price = Number(ps.price || 0);
      if (!price || price <= 0) continue;

      const cur = minMap.get(productId);
      if (cur == null || price < cur) minMap.set(productId, price);
    }

    // 4) Attach minPromoPrice + hasPromotion
    const data = products.map((p) => {
      const minPromoPrice = minMap.get(p.id) ?? null;
      const hasPromotion = minPromoPrice != null && minPromoPrice > 0 && minPromoPrice < Number(p.basePrice || 0);

      return {
        ...p,
        minPromoPrice,
        hasPromotion,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("❌ GET /api/products/best-sellers error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
