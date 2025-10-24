import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET /api/subcategories/:id/products
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const subId = Number(params.id);
  if (!subId) return NextResponse.json({ success: false, message: "subId không hợp lệ" }, { status: 400 });

  const products = await prisma.product.findMany({
    where: { subCategoryId: subId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, price: true, stock: true },
  });

  return NextResponse.json({ success: true, data: products });
}
