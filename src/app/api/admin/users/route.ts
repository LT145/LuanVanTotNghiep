import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Prisma } from "@prisma/client"

// ============================================
// ✔ 1. Định nghĩa include để Prisma hiểu đầy đủ quan hệ
// ============================================
const userInclude = Prisma.validator<Prisma.UserInclude>()({
  addresses: true,
  orders: {
    select: {
      id: true,
      totalAmount: true,
      shippingFee: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
      deliveredAt: true,
    },
  },
  reviews: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
})

// Loại trả về của user
type AdminUserType = Prisma.UserGetPayload<{ include: typeof userInclude }>

// ============================================
// ✔ 2. GET /api/admin/users
// ============================================
export async function GET() {
  try {
    // 🔐 Check quyền admin
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // 🧲 Lấy danh sách user
    const users: AdminUserType[] = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: userInclude,
    })

    // ============================================
    // ✔ 3. Xử lý dữ liệu trả về
    // ============================================
    const result = users.map((u) => {
      const completedOrders = u.orders.filter(
        (o) => o.paymentStatus === "PAID" && o.status !== "CANCELLED"
      )

      const totalSpent = completedOrders.reduce(
        (sum, o) => sum + (o.totalAmount ?? 0) + (o.shippingFee ?? 0),
        0
      )

      const lastOrder = completedOrders.reduce<
        null | AdminUserType["orders"][0]
      >((latest, o) => {
        if (!latest) return o
        const latestDate = latest.deliveredAt ?? latest.createdAt
        const currentDate = o.deliveredAt ?? o.createdAt
        return currentDate > latestDate ? o : latest
      }, null)

      const lastPurchaseAt = lastOrder
        ? (lastOrder.deliveredAt ?? lastOrder.createdAt)
        : null

return {
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  gender: u.gender,
  birthDate: u.birthDate,
  createdAt: u.createdAt,

  totalOrders: u.orders.length,
  totalCompletedOrders: completedOrders.length,
  totalSpent,
  lastPurchaseAt,

  status: u.status,

  addresses: u.addresses,

  orders: u.orders, // 👈 BẮT BUỘC PHẢI CÓ

  reviews: u.reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    content: r.content,
    images: r.images,
    isApproved: r.isApproved,
    adminReply: r.adminReply,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    product: r.product,
  })),
}

    })

    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    console.error("GET /api/admin/users error:", err)
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    )
  }
}
