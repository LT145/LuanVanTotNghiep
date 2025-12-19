import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { setOtp } from "@/lib/otp-store"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Tạo random OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    // ❌ Không có email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, code: "INVALID_EMAIL", message: "Email không hợp lệ." },
        { status: 400 }
      )
    }

    // ❌ Check email đã tồn tại
    const exist = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (exist) {
      return NextResponse.json(
        {
          success: false,
          code: "EMAIL_EXISTS",
          message: "Email đã được sử dụng. Vui lòng đăng nhập.",
        },
        { status: 409 } // conflict
      )
    }

    // 📌 Tạo OTP
    const otp = generateOtp()
    setOtp(email, otp)

    // 📌 Gửi email OTP
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
      subject: "Mã OTP đăng ký tài khoản",
      html: `
        <div style="font-family:sans-serif;">
          <h2>🔐 Xác thực tài khoản</h2>
          <p>Mã OTP của bạn là:</p>
          <h1 style="font-size:28px; letter-spacing:4px;">${otp}</h1>
          <p>Mã sẽ hết hạn sau <b>10 phút</b>.</p>
          <p>Vui lòng không chia sẻ mã này cho ai khác.</p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: "OTP đã được gửi đến email.",
    })
  } catch (error) {
    console.error("❌ Lỗi gửi OTP:", error)

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
