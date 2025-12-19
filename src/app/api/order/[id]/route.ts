import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET /api/order/[id]
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "MISSING_ORDER_ID" },
        { status: 400 }
      )
    }

    // 🟢 Lấy đơn hàng + user + items + product + variantColors.sizes
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            color: true,
            size: true,
            product: {
              select: {
                id: true,
                name: true,
                // 👇 ảnh chính
                images: {
                  where: { isMain: true },
                  select: { url: true },
                  take: 1,
                },
                // 👇 toàn bộ màu + size để xử lý tồn kho ở JS
                variantColors: {
                  select: {
                    id: true,
                    color: true,
                    sizes: {
                      select: {
                        id: true,
                        size: true,
                        stock: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { ok: false, error: "ORDER_NOT_FOUND" },
        { status: 404 }
      )
    }

    // 🧹 Gọn lại dữ liệu trả về + tính tồn kho
    const cleanOrder = {
      id: order.id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      shippingMethod: order.shippingMethod,
      totalAmount: order.totalAmount,
      shippingFee: order.shippingFee,
      createdAt: order.createdAt,

      recipientName: order.recipientName,
      recipientPhone: order.recipientPhone,
      shippingAddress: order.shippingAddress,
      ward: order.ward,
      province: order.province,
      note: order.note,

      user: order.user
        ? {
            id: order.user.id,
            name: order.user.name,
            email: order.user.email,
          }
        : null,

      items: order.items.map((i) => {
        // Tìm đúng màu
        const variantColor = i.product.variantColors.find(
          (vc) =>
            vc.color?.toLowerCase() === (i.color ?? "").toLowerCase()
        )

        // Trong màu đó, tìm đúng size
        const variantSize = variantColor?.sizes.find(
          (s) =>
            s.size?.toLowerCase() === (i.size ?? "").toLowerCase()
        )

        const currentStock =
          typeof variantSize?.stock === "number"
            ? variantSize.stock
            : null

        const stockAfter =
          currentStock != null ? currentStock - i.quantity : null

        return {
          id: i.id,
          quantity: i.quantity,
          price: i.price,
          color: i.color,
          size: i.size,
          product: {
            id: i.product.id,
            name: i.product.name,
            image: i.product.images?.[0]?.url || null,
          },
          // 👇 thêm 2 field tồn kho
          currentStock,
          stockAfter,
        }
      }),
    }

    return NextResponse.json({ ok: true, order: cleanOrder })
  } catch (err) {
    console.error("GET /api/order/[id] error:", err)
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    )
  }
}
