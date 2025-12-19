import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: true, canReview: false });
  }

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ success: false, message: "Missing productId" });
  }

  // ---------------------------------------------------------
  // 🔥 KIỂM TRA USER ĐÃ MUA SẢN PHẨM HAY CHƯA
  // ---------------------------------------------------------
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId: session.user.id,
        status: "COMPLETED",
      },
    },
  });

  // ---------------------------------------------------------
  // 🔥 KIỂM TRA ĐÃ REVIEW CHƯA
  // ---------------------------------------------------------
  const existing = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId,
      },
    },
  });

  return NextResponse.json({
    success: true,
    canReview: !!hasPurchased && !existing,
    hasPurchased: !!hasPurchased,
    alreadyReviewed: !!existing,
  });
}
