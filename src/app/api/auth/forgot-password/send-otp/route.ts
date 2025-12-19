import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { PrismaClient } from "@prisma/client"
import { setOtp } from "@/lib/otp-store"

const prisma = new PrismaClient()

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, code: "INVALID_EMAIL", message: "Email không hợp lệ." },
        { status: 400 }
      )
    }

    // ✅ Quên mật khẩu: bắt buộc email phải TỒN TẠI
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, status: true },
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          code: "EMAIL_NOT_FOUND",
          message: "Email chưa đăng ký tài khoản.",
        },
        { status: 404 }
      )
    }

    if (user.status === "BLOCKED") {
      return NextResponse.json(
        {
          success: false,
          code: "ACCOUNT_BLOCKED",
          message: "Tài khoản đã bị khóa. Vui lòng liên hệ admin.",
        },
        { status: 403 }
      )
    }

    const otp = generateOtp()
    setOtp(email, otp)

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: `"Web Shop" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Mã OTP đặt lại mật khẩu",
      html: `
        <div style="font-family:sans-serif;">
          <h2>🔐 Quên mật khẩu</h2>
          <p>Mã OTP đặt lại mật khẩu của bạn là:</p>
          <h1 style="font-size:28px; letter-spacing:4px;">${otp}</h1>
          <p>Mã sẽ hết hạn sau <b>10 phút</b>.</p>
          <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true, message: "OTP đã được gửi đến email." })
  } catch (error) {
    console.error("❌ Lỗi send OTP forgot-password:", error)
    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_ERROR",
        message: "Máy chủ gặp lỗi khi gửi OTP. Vui lòng thử lại sau.",
      },
      { status: 500 }
    )
  }
}
