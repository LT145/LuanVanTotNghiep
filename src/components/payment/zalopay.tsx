"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import QRCode from "react-qr-code"

interface Props {
  open: boolean
  amount?: number
  onClose: () => void
  onPaid?: (info: any) => void
  initialTimeoutSec?: number
}

function fmt(n: number) {
  return n.toLocaleString("vi-VN") + "₫"
}

export default function ZalopayQR({
  open,
  amount,
  onClose,
  onPaid,
  initialTimeoutSec = 180,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<{
    app_trans_id: string
    order_url?: string
    qr_code_url?: string
    expire_at?: number
  } | null>(null)

  const [secondsLeft, setSecondsLeft] = useState(initialTimeoutSec)
  const pollRef = useRef<any>(null)

  const expired = secondsLeft <= 0
  const countdownStr = useMemo(() => {
    const m = Math.floor(secondsLeft / 60)
    const s = secondsLeft % 60
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }, [secondsLeft])

  const startCountdown = () => {
    setSecondsLeft(initialTimeoutSec)
  }

  const clearPoll = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  const startPoll = (app_trans_id: string) => {
    clearPoll()
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/payment/zalopay/status/${app_trans_id}`, { cache: "no-store" })
        const js = await r.json()
        if (!js.ok) return
        const { data } = js
        // Theo tài liệu: return_code === 1 => success
        if (data?.return_code === 1) {
          clearPoll()
          onPaid?.(data)
        }
      } catch {}
    }, 3000)
  }

  const resetOrder = async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch("/api/payment/zalopay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, appUserId: "user-id-demo" }),
      })
      const js = await r.json()
      if (!js.ok) throw new Error(js.error?.return_message || "create_failed")
      setOrder({
        app_trans_id: js.app_trans_id,
        order_url: js.order_url,
        qr_code_url: js.qr_code_url,
        expire_at: js.expire_at,
      })
      startCountdown()
      startPoll(js.app_trans_id)
    } catch (e: any) {
      setError(e?.message || "Tạo đơn thất bại")
    } finally {
      setLoading(false)
    }
  }

  // khi mở modal → tạo đơn ngay
  useEffect(() => {
    if (!open) return
    resetOrder()
    return () => {
      clearPoll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // tick countdown mỗi giây
  useEffect(() => {
    if (!open) return
    if (expired) return
    const t = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => clearInterval(t)
  }, [open, expired])

  // Hết hạn → dừng poll
  useEffect(() => {
    if (expired) clearPoll()
  }, [expired])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-[980px] bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: QR + Amount + Timer */}
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white rounded-md p-2 border border-gray-200 min-h-[300px] flex items-center justify-center">
              {loading && <div className="text-sm text-gray-600">Đang tạo đơn ZaloPay…</div>}

              {!loading && error && (
                <div className="text-sm text-red-600">Lỗi: {error}</div>
              )}

              {!loading && !error && order && (
                <>
                  {/* 1) Nếu server trả sẵn qr_code_url (ảnh) */}
                  {order.qr_code_url ? (
                    // eslint-disable-next-line @next/next/no-img-element

<div className="flex justify-center mb-4">
  <QRCode
    value={order.qr_code_url}  // ✅ đây là chuỗi QR gốc (dạng 00020101...)
    size={220}                   // kích thước QR

  />
</div>
                    
                  ) : order.order_url ? (
                    // 2) Không có ảnh → tự render QR từ order_url (deep link)
                    <QRCode value={order.order_url} size={280} />
                  ) : (
                    <div className="text-sm text-gray-600">Không nhận được QR/URL</div>
                  )}
                </>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">Thanh toán bằng</p>
              <h3 className="text-2xl font-bold text-black mt-1">ZaloPay</h3>
            </div>

            <div className="mt-1 text-center">
              <p className="text-sm text-gray-600">Số tiền</p>
              <p className="text-2xl font-semibold text-black">{fmt(amount ?? 0)}</p>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <div className={`px-3 py-1 rounded-md ${expired ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-800"}`}>
                <span className="text-xs">Thời gian còn</span>
                <div className="text-sm font-medium">{countdownStr}</div>
              </div>
              <button
                onClick={resetOrder}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                type="button"
                disabled={loading}
              >
                {loading ? "Đang tạo..." : "Reset mã mới"}
              </button>
            </div>

            {expired && <p className="text-xs text-red-600 mt-2">Mã đã hết hạn — bấm “Reset mã mới”.</p>}
          </div>

          {/* RIGHT: Guide */}
          <div className="flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-semibold mb-2">Hướng dẫn</h4>
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                <li>Mở ZaloPay trên điện thoại.</li>
                <li>Chọn Quét mã và quét QR trên màn hình.</li>
                <li>Xác nhận số tiền và hoàn tất thanh toán.</li>
              </ol>

              {order?.app_trans_id && (
                <div className="mt-4 text-xs text-gray-500">
                  <div>
                    <span className="font-medium text-gray-700">Mã giao dịch:</span>{" "}
                    <span className="font-mono">{order.app_trans_id}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-3 bg-white border border-gray-300 rounded-lg"
                type="button"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
