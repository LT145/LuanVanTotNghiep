import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        // 🟦 Địa chỉ
        addresses: true,

        // 🟦 Sản phẩm yêu thích
        favorites: {
          include: {
            product: {
              include: {
                images: true,
                category: true,
                variantColors: { include: { sizes: true, images: true } }
              }
            }
          }
        },

        // 🟦 Đơn hàng
        orders: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    images: true,
                    category: true,
                    variantColors: {
                      include: {
                        sizes: true,
                        images: true,
                      }
                    }
                  }
                }
              }
            }
          }
        },

      },
    })

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("❌ Lỗi khi lấy thông tin user:", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}
