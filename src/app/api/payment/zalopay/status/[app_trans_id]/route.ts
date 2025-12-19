import crypto from "crypto"
import { NextResponse } from "next/server"
import qs from "qs"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ app_trans_id: string }> }
) {
  try {
    const { app_trans_id } = await params

    const endpoint = process.env.ZALO_ENDPOINT ?? "https://sb-openapi.zalopay.vn"
    const app_id = process.env.ZALO_APP_ID || "553" // sandbox ID
    const key1 = process.env.ZALO_KEY1 || "9phuAOYhan4urywHTh0ndEXiV3pKHr5Q"

    if (!app_id || !key1) {
      throw new Error("Missing ZALO_APP_ID or ZALO_KEY1 in .env")
    }

    // 🔐 Tạo MAC theo đúng tài liệu
    const data = `${app_id}|${app_trans_id}|${key1}`
    const mac = crypto.createHmac("sha256", key1).update(data).digest("hex")

    // 🔧 Tạo body theo form-urlencoded
    const body = qs.stringify({ app_id, app_trans_id, mac })

    const res = await fetch(`${endpoint}/v2/query`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    })

    const json = await res.json()
    console.log("🔍 Query response:", json)

    return NextResponse.json({ ok: true, data: json })
  } catch (e: any) {
    console.error("❌ Query error:", e)
    return NextResponse.json({ ok: false, error: e.message || "internal_error" }, { status: 500 })
  }
}
