import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { verifyOtp } from "@/lib/otp-store"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { name, email, password, gender, birthDate, otp } = await req.json()

    if (!verifyOtp(email, otp)) {
      return NextResponse.json({
        success: false,
        message: "Mã OTP không hợp lệ hoặc đã hết hạn.",
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        gender,
        birthDate: new Date(birthDate),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Tài khoản đã được xác thực và đăng ký thành công.",
    })
  } catch (error) {
    console.error("❌ Lỗi verify-otp:", error)
    return NextResponse.json({ success: false, message: "Lỗi máy chủ." }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
