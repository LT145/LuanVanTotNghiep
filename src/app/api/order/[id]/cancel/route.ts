import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient, OrderStatus } from "@prisma/client"
import nodemailer from "nodemailer"

const prisma = new PrismaClient()

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> } // ⬅️ Next 15: params là Promise
) {
  try {
    // Lấy id từ params
    const { id } = await context.params

    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { ok: false, error: "Không có quyền thực hiện thao tác này." },
        { status: 401 }
      )
    }

    const { reason } = await req.json()

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { ok: false, error: "Lý do hủy là bắt buộc." },
        { status: 400 }
      )
    }

    // Lấy đầy đủ thông tin order + user + items để gửi mail
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { email: true, name: true },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { ok: false, error: "Không tìm thấy đơn hàng." },
        { status: 404 }
      )
    }

    if (order.status === OrderStatus.COMPLETED) {
      return NextResponse.json(
        {
          ok: false,
          error: "Đơn hàng đã giao thành công, không thể hủy.",
        },
        { status: 400 }
      )
    }

    if (order.status === OrderStatus.CANCELLED) {
      return NextResponse.json(
        {
          ok: false,
          error: "Đơn hàng đã được hủy trước đó.",
        },
        { status: 400 }
      )
    }

    // Cập nhật trạng thái hủy
    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
        cancelReason: reason.trim(),
        // nếu có PaymentStatus thì set ở đây, ví dụ:
        // paymentStatus: PaymentStatus.REFUNDED,
      },
    })

    // ================================
    //  📧 GỬI EMAIL THÔNG BÁO HỦY ĐƠN
    // ================================
    const customerEmail = order.user?.email
    const customerName = order.user?.name || order.recipientName

    if (customerEmail) {
      // định dạng ngày giờ
      const createdAtVN = order.createdAt.toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
      })

      const shortId = order.id.slice(0, 8).toUpperCase()

      const itemsHtml = order.items
        .map((item) => {
          const lineTotal = item.price * item.quantity
          return `
            <tr>
              <td style="padding: 6px 8px; border: 1px solid #ddd;">
                ${item.product.name}
                <div style="font-size:12px; color:#555;">
                  Màu: ${item.color || "-"} • Size: ${item.size || "-"}
                </div>
              </td>
              <td style="padding: 6px 8px; border: 1px solid #ddd; text-align:center;">
                ${item.quantity}
              </td>
              <td style="padding: 6px 8px; border: 1px solid #ddd; text-align:right;">
                ${item.price.toLocaleString("vi-VN")}₫
              </td>
              <td style="padding: 6px 8px; border: 1px solid #ddd; text-align:right;">
                ${lineTotal.toLocaleString("vi-VN")}₫
              </td>
            </tr>
          `
        })
        .join("")

      const subtotal = order.totalAmount - order.shippingFee

      const html = `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width:600px; margin:0 auto; padding:16px; color:#111;">
          <h2 style="font-size:20px; margin-bottom:8px;">Thông báo hủy đơn hàng #${shortId}</h2>
          <p>Xin chào <b>${customerName}</b>,</p>
          <p>
            Rất tiếc, đơn hàng của bạn được đặt vào lúc 
            <b>${createdAtVN}</b> đã được <b>hủy</b> với lý do:
          </p>

          <blockquote style="margin: 12px 0; padding: 10px 12px; background:#fff7f7; border-left:3px solid #f97373; font-style:italic;">
            ${reason.trim()}
          </blockquote>

          <h3 style="margin-top:16px; font-size:16px;">Chi tiết đơn hàng</h3>
          <p style="font-size:14px; color:#444; margin-bottom:6px;">
            Người nhận: <b>${order.recipientName}</b><br/>
            Số điện thoại: <b>${order.recipientPhone}</b><br/>
            Địa chỉ: <b>${order.shippingAddress}, ${order.ward}, ${order.province}</b>
          </p>

          <table style="border-collapse:collapse; width:100%; font-size:14px; margin-top:8px;">
            <thead>
              <tr>
                <th style="padding: 6px 8px; border: 1px solid #ddd; text-align:left;">Sản phẩm</th>
                <th style="padding: 6px 8px; border: 1px solid #ddd; text-align:center;">SL</th>
                <th style="padding: 6px 8px; border: 1px solid #ddd; text-align:right;">Đơn giá</th>
                <th style="padding: 6px 8px; border: 1px solid #ddd; text-align:right;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top:12px; text-align:right; font-size:14px;">
            <div>Tạm tính: <b>${subtotal.toLocaleString("vi-VN")}₫</b></div>
            <div>Phí vận chuyển: <b>${order.shippingFee.toLocaleString("vi-VN")}₫</b></div>
            <div style="margin-top:4px; font-size:16px;">
              Tổng: <b>${order.totalAmount.toLocaleString("vi-VN")}₫</b>
            </div>
          </div>

          <p style="margin-top:16px; font-size:14px; line-height:1.6;">
            Chúng tôi rất xin lỗi vì sự bất tiện này.<br/>
            Rất mong quý khách thông cảm và tiếp tục ủng hộ cửa hàng trong các đơn hàng tiếp theo.
          </p>

          <p style="margin-top:8px; font-size:14px;">
            Trân trọng,<br/>
            <b>Đội ngũ hỗ trợ cửa hàng CHQA</b>
          </p>
        </div>
      `

      try {
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
          to: customerEmail,
          subject: `Thông báo hủy đơn hàng #${shortId}`,
          html,
        })
      } catch (mailErr) {
        console.error("❌ Lỗi gửi email hủy đơn:", mailErr)
        // Không throw để tránh làm fail API, chỉ log
      }
    } else {
      console.warn(
        `⚠ Không tìm thấy email khách hàng cho order ${order.id}, bỏ qua gửi mail.`
      )
    }

    return NextResponse.json({ ok: true, order: updated })
  } catch (err) {
    console.error("Cancel order error:", err)
    return NextResponse.json(
      { ok: false, error: "Lỗi server khi hủy đơn." },
      { status: 500 }
    )
  }
}
