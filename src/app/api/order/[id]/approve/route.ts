import { NextResponse } from "next/server"
import { PrismaClient, OrderStatus } from "@prisma/client"
import nodemailer from "nodemailer"

const prisma = new PrismaClient()

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const orderId =  (await params).id

  try {
    // 🔹 Lấy đơn + user + items để gửi email
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { email: true, name: true },
        },
        items: {
          include: { product: true },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { ok: false, error: "ORDER_NOT_FOUND" },
        { status: 404 }
      )
    }

    // Có thể chặn một số trạng thái
    if (order.status === OrderStatus.CANCELLED) {
      return NextResponse.json(
        { ok: false, error: "ORDER_ALREADY_CANCELLED" },
        { status: 400 }
      )
    }

    if (order.status === OrderStatus.COMPLETED) {
      return NextResponse.json(
        { ok: false, error: "ORDER_ALREADY_COMPLETED" },
        { status: 400 }
      )
    }

    // 🧮 Trừ tồn kho cho từng sản phẩm
    for (const it of order.items) {
      if (it.color && it.size) {
        const colorVariant = await prisma.productVariantColor.findFirst({
          where: { productId: it.productId, color: it.color },
          select: { id: true },
        })

        if (!colorVariant) {
          return NextResponse.json(
            {
              ok: false,
              error: `Không tìm thấy màu ${it.color} cho sản phẩm ${it.product.name}`,
            },
            { status: 400 }
          )
        }

        const updated = await prisma.productVariantSize.updateMany({
          where: {
            colorVariantId: colorVariant.id,
            size: it.size,
            stock: { gte: it.quantity },
          },
          data: { stock: { decrement: it.quantity } },
        })

        if (updated.count === 0) {
          return NextResponse.json(
            {
              ok: false,
              error: `Hết hàng ${it.product.name} - ${it.color}/${it.size}`,
            },
            { status: 409 }
          )
        }
      }
    }

    // ✅ Cập nhật trạng thái đơn hàng sang PROCESSING
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PROCESSING },
    })

    // ================================
    // 📧 GỬI EMAIL XÁC NHẬN ĐƠN HÀNG
    // ================================
    const customerEmail = order.user?.email
    const customerName = order.user?.name || order.recipientName

    if (customerEmail) {
      const createdAtVN = order.createdAt.toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
      })

      const shortId = order.id.slice(0, 8).toUpperCase()

      const shippingMethodLabel =
        order.shippingMethod === "EXPRESS" ? "Giao nhanh" : "Giao thường"

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
          <h2 style="font-size:20px; margin-bottom:8px;">Xác nhận đơn hàng #${shortId}</h2>
          <p>Xin chào <b>${customerName}</b>,</p>
          <p>
            Đơn hàng của bạn đặt lúc <b>${createdAtVN}</b> đã được 
            <b>xác nhận</b> và chuyển sang trạng thái <b>Đang xử lý</b>.
          </p>

          <h3 style="margin-top:16px; font-size:16px;">Thông tin giao hàng</h3>
          <p style="font-size:14px; color:#444; margin-bottom:6px;">
            Người nhận: <b>${order.recipientName}</b><br/>
            Số điện thoại: <b>${order.recipientPhone}</b><br/>
            Địa chỉ: <b>${order.shippingAddress}, ${order.ward}, ${order.province}</b><br/>
            Hình thức giao: <b>${shippingMethodLabel}</b>
          </p>

          <h3 style="margin-top:16px; font-size:16px;">Chi tiết đơn hàng</h3>
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
            Chúng tôi sẽ sớm chuẩn bị và bàn giao đơn hàng cho đơn vị vận chuyển.<br/>
            Cảm ơn bạn đã mua sắm tại cửa hàng CHQA!
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
          subject: `Đơn hàng #${shortId} đã được xác nhận`,
          html,
        })
      } catch (mailErr) {
        console.error("❌ Lỗi gửi email xác nhận đơn:", mailErr)
        // Không throw để tránh làm fail API
      }
    } else {
      console.warn(
        `⚠ Không có email khách hàng cho order ${order.id}, bỏ qua gửi mail xác nhận.`
      )
    }

    return NextResponse.json({ ok: true, order: updatedOrder })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    )
  }
}
