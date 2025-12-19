import crypto from "crypto"
import { NextResponse } from "next/server"

type CreateBody = {
  amount: number
  appUserId: string // id user trong hệ thống của bạn
  description?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateBody
    const app_id = Number(process.env.ZALO_APP_ID)
    // const key1 = process.env.ZALO_KEY1!
    const key1 = "9phuAOYhan4urywHTh0ndEXiV3pKHr5Q"
    const endpoint = process.env.ZALO_ENDPOINT ?? "https://sb-openapi.zalopay.vn"

    const amount = Math.max(1000, Math.floor(body.amount)) // ZaloPay yêu cầu >= 1.000đ
    const app_time = Date.now()
    // app_trans_id format gợi ý: yymmdd_random (theo guideline ZaloPay)
    const date = new Date()
    const yymmdd = `${String(date.getFullYear()).slice(-2)}${String(date.getMonth() + 1).padStart(2, "0")}${String(
      date.getDate()
    ).padStart(2, "0")}`
    const app_trans_id = `${yymmdd}_${Math.floor(Math.random() * 1000000)}`
    const app_user = body.appUserId || "guest"

    const embed_data = JSON.stringify({ redirecturl: "https://your-domain.com/checkout/success" })
    const item = JSON.stringify([]) // liệt kê cart nếu muốn

    // MAC theo tài liệu v2: HMAC_SHA256(key1, app_id|app_trans_id|app_user|amount|app_time|embed_data|item)
    const dataToSign = [app_id, app_trans_id, app_user, amount, app_time, embed_data, item].join("|")
    const mac = crypto.createHmac("sha256", key1).update(dataToSign).digest("hex")

    const payload = {
      app_id,
      app_user,
      app_time,
      amount,
      app_trans_id,
      embed_data,
      item,
      description: body.description || `Thanh toan don hang #${app_trans_id}`,
      bank_code: "", // để trống cho QR
      callback_url: process.env.ZALO_CALLBACK_URL, // nếu bạn xử lý webhook
      mac,
    }

    // Gọi endpoint create
    const res = await fetch(`${endpoint}/v2/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // @ts-ignore
      cache: "no-store",
    })

    const json = await res.json()

    // ZaloPay thường trả: return_code, return_message, order_url, qr_code, zp_trans_token, ...
    if (json.return_code !== 1) {
      return NextResponse.json({ ok: false, error: json }, { status: 400 })
    }

    // Trả về cho FE những gì cần hiển thị
    return NextResponse.json({
      ok: true,
      app_trans_id,
      amount,
      order_url: json.order_url,
      qr_code_url: json.qr_code, // nếu có
      zp_trans_token: json.zp_trans_token,
      expire_at: Date.now() + 3 * 60 * 1000, // giả định 3 phút
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "internal_error" }, { status: 500 })
  }
}
