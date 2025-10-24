import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, code: 400, message: "Thiếu thông tin cần thiết." },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { success: false, code: 409, message: "Email đã tồn tại." },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      code: 201,
      message: "Đăng ký thành công.",
      data: user,
    })
  } catch (error) {
    console.error("❌ Register error:", error)
    return NextResponse.json(
      { success: false, code: 500, message: "Lỗi máy chủ." },
      { status: 500 }
    )
  }
}
