import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id)
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" })

    const { productId } = await req.json()
    const userId = session.user.id

    if (!productId)
      return NextResponse.json({ success: false, message: "Thiếu productId" }, { status: 400 })

    const existing = await prisma.favorite.findFirst({
      where: { userId, productId },
    })

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } })
      return NextResponse.json({ success: true, action: "removed" })
    }

    await prisma.favorite.create({ data: { userId, productId } })
    return NextResponse.json({ success: true, action: "added" })
  } catch (error) {
    console.error("Lỗi toggle favorite:", error)
    return NextResponse.json({ success: false, message: "Lỗi server" }, { status: 500 })
  }
}
