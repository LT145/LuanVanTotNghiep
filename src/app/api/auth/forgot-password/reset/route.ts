import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { verifyOtp } from "@/lib/otp-store"

const prisma = new PrismaClient()

function isStrongPassword(pw: string) {
  return pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)
}

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, code: "INVALID_EMAIL", message: "Email không hợp lệ." },
        { status: 400 }
      )
    }

    if (!otp || typeof otp !== "string") {
      return NextResponse.json(
        { success: false, code: "INVALID_OTP", message: "OTP không hợp lệ." },
        { status: 400 }
      )
    }

    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { success: false, code: "INVALID_PASSWORD", message: "Mật khẩu không hợp lệ." },
        { status: 400 }
      )
    }

    if (!isStrongPassword(newPassword)) {
      return NextResponse.json(
        {
          success: false,
          code: "WEAK_PASSWORD",
          message: "Mật khẩu chưa đủ mạnh (>=8 ký tự, 1 chữ hoa, 1 chữ số).",
        },
        { status: 400 }
      )
    }

    // ✅ check user tồn tại
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, status: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, code: "EMAIL_NOT_FOUND", message: "Email chưa đăng ký tài khoản." },
        { status: 404 }
      )
    }

    if (user.status === "BLOCKED") {
      return NextResponse.json(
        { success: false, code: "ACCOUNT_BLOCKED", message: "Tài khoản đã bị khóa." },
        { status: 403 }
      )
    }

    // ✅ verify OTP (cần có trong otp-store)
    const ok = verifyOtp(email, otp)
    if (!ok) {
      return NextResponse.json(
        { success: false, code: "OTP_INVALID", message: "OTP sai hoặc đã hết hạn." },
        { status: 400 }
      )
    }

    const hashed = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { email },
      data: { password: hashed },
    })

    return NextResponse.json({ success: true, message: "Đổi mật khẩu thành công." })
  } catch (error) {
    console.error("❌ Lỗi reset password:", error)
    return NextResponse.json(
      { success: false, code: "INTERNAL_ERROR", message: "Máy chủ gặp lỗi. Vui lòng thử lại." },
      { status: 500 }
    )
  }
}
