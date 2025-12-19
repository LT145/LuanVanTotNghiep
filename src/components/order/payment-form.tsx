"use client"

import React, { useState, useEffect } from "react"
import { Wallet, Smartphone, PackageCheck, Lock } from "lucide-react"
import ZalopayQR from "@/components/payment/zalopay"
import { toast } from "sonner"

interface ShippingMini {
  fullName: string
  phone: string
  address: string
  ward?: string
  province?: string
  note?: string
  shippingMethod: "standard" | "express" | string
}

interface PaymentFormProps {
  isLocked?: boolean
  total?: number
  shipping?: ShippingMini
  shippingCost?: number
  onPaymentStatusChange?: (canComplete: boolean) => void   // Cho Checkout biết đã cho phép bấm "Hoàn thành" chưa
  onPaymentMethodChange?: (method: "wallet" | "cod") => void // Cho Checkout biết đang chọn ví hay COD
}

export default function PaymentForm({
  isLocked = false,
  total = 0,
  shipping,
  shippingCost = 0,
  onPaymentStatusChange,
  onPaymentMethodChange,
}: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "cod">("wallet")
  const [walletType, setWalletType] = useState<string | null>(null)
  const [showZaloQR, setShowZaloQR] = useState(false)
  const [isPaid, setIsPaid] = useState(false)

  // 🔁 Báo cho Checkout biết đã thanh toán xong / đặt hàng xong chưa
  useEffect(() => {
    onPaymentStatusChange?.(isPaid)
  }, [isPaid, onPaymentStatusChange])

  // 🔁 Khi đổi phương thức thanh toán
  useEffect(() => {
    onPaymentMethodChange?.(paymentMethod)
    // Đổi phương thức thì reset trạng thái đã thanh toán
    setIsPaid(false)
  }, [paymentMethod, onPaymentMethodChange])

  // ✅ Hàm xử lý sau khi đặt hàng THÀNH CÔNG cho MỌI phương thức
  const handleOrderSuccess = () => {
    setIsPaid(true)

    let countdown = 3

    // Thông báo đầu tiên
    toast.success("Thanh toán thành công!", {
      description: `Chuyển hướng trong ${countdown} giây...`,
      duration: 3500,
    })

    // Cập nhật đếm ngược
    const interval = setInterval(() => {
      countdown -= 1
      if (countdown <= 0) {
        clearInterval(interval)
        return
      }
      toast.success("Thanh toán hoàn tất!", {
        description: `Chuyển hướng trong ${countdown} giây...`,
        duration: 1500,
      })
    }, 1000)

    // Redirect sau 3 giây
    setTimeout(() => {
      window.location.href = "/profile#orders"
    }, 3000)
  }

  // 🧾 Gửi request tạo đơn cho mọi loại thanh toán
  const placeOrder = async (method: "ZALOPAY" | "COD", paymentInfo?: any) => {
    if (!shipping) {
      toast.error("Thiếu thông tin giao hàng.")
      return
    }

    const payload = {
      paymentMethod: method, // "ZALOPAY" | "COD" (khớp enum backend)
      amount: total,
      paymentInfo,
      shipping: {
        fullName: shipping.fullName,
        phone: shipping.phone,
        addressLine: shipping.address,
        wardName: shipping.ward,
        provinceName: shipping.province,
        note: shipping.note,
        method:
          (shipping.shippingMethod === "express"
            ? "express"
            : "standard") as "standard" | "express",
        shippingCost: shippingCost,
      },
    }

    try {
      const r = await fetch("/api/order/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const js = await r.json()

      if (!js.ok) {
        console.error(js)
        toast.error("Đặt hàng thất bại, vui lòng thử lại!")
        return
      }

      // 🔎 Lấy id đơn từ response (tùy backend bạn đang trả kiểu gì)
      const orderId: string | undefined =
        js.orderId ?? js.order?.id ?? js.data?.orderId

      // 🔁 Nếu thanh toán ZALOPAY: sau khi tạo đơn xong → gọi approve
      if (method === "ZALOPAY") {
        if (!orderId) {
          console.warn("Không tìm thấy orderId trong response checkout.")
          toast.error("Thanh toán xong nhưng không tìm thấy mã đơn hàng.")
          return
        }

        try {
          const approveRes = await fetch(`/api/order/${orderId}/approve`, {
            method: "POST",
          })
          const approveJs = await approveRes.json()

          if (!approveJs.ok) {
            console.error("Approve error:", approveJs)
            toast.error(
              "Thanh toán thành công nhưng không thể cập nhật trạng thái đơn. Vui lòng liên hệ cửa hàng."
            )
            return
          }
        } catch (err) {
          console.error("Approve request failed:", err)
          toast.error(
            "Thanh toán thành công nhưng lỗi khi cập nhật trạng thái đơn. Vui lòng liên hệ cửa hàng."
          )
          return
        }
      }

      // ⬇️ Thành công: toast + đếm ngược + redirect
      handleOrderSuccess()
    } catch (err) {
      console.error(err)
      toast.error("Không thể kết nối máy chủ. Vui lòng thử lại!")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-black mb-2">Thanh toán</h2>
        <p className="text-gray-600">Chọn phương thức thanh toán của bạn</p>
        {isLocked && (
          <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg flex items-start gap-3">
            <Lock className="w-5 h-5 text-gray-700 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              Đơn hàng của bạn đã khóa. Bạn không thể chỉnh sửa số lượng hay xóa sản phẩm.
            </p>
          </div>
        )}
      </div>

      {/* Chọn phương thức thanh toán */}
      <div className="space-y-3">
        {[
          { id: "wallet" as const, label: "Ví điện tử", icon: Wallet },
          {
            id: "cod" as const,
            label: "COD - Thanh toán khi nhận hàng",
            icon: PackageCheck,
          },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setPaymentMethod(id)}
            className={`w-full p-4 border-2 rounded-lg text-left flex items-center gap-3 transition ${
              paymentMethod === id
                ? "border-black bg-white"
                : "border-gray-200 hover:border-black"
            }`}
          >
            <input
              type="radio"
              name="payment"
              value={id}
              checked={paymentMethod === id}
              onChange={() => setPaymentMethod(id)}
              className="w-5 h-5 accent-black"
            />
            <Icon className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-black">{label}</span>
          </button>
        ))}
      </div>

      {/* Ví điện tử */}
      {paymentMethod === "wallet" && (
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-4 animate-in fade-in duration-300">
          <p className="text-gray-700 font-medium mb-2">Chọn ví điện tử:</p>

          {/* ZaloPay option */}
          <button
            type="button"
            onClick={() => {
              setWalletType("zalopay")
              setShowZaloQR(true)
              setIsPaid(false) // phải quét QR xong mới cho hoàn thành
            }}
            className={`w-full p-4 border rounded-lg flex items-center justify-between font-medium transition ${
              walletType === "zalopay"
                ? "border-black bg-white shadow-sm"
                : "border-gray-300 hover:border-black"
            }`}
          >
            <span className="bg-sky-100 text-sky-700 px-2 py-1 rounded">
              ZaloPay
            </span>
            {walletType === "zalopay" && (
              <Smartphone className="w-5 h-5 text-black" />
            )}
          </button>

          {/* Modal QR ZaloPay */}
          <ZalopayQR
            open={showZaloQR}
            amount={total ?? 0}
            onClose={() => setShowZaloQR(false)}
            onPaid={async (data) => {
              setShowZaloQR(false)

              // ⬇️ Quét xong QR → tạo đơn + approve
              await placeOrder("ZALOPAY", {
                zp_trans_id: data?.zp_trans_id,
                app_trans_id: data?.app_trans_id,
              })
            }}
          />
        </div>
      )}

      {/* COD */}
      {paymentMethod === "cod" && (
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-3 animate-in fade-in duration-300">
          <p className="text-gray-700 font-medium">
            Bạn sẽ thanh toán tiền mặt khi nhận hàng (COD).
          </p>
          <p className="text-sm text-gray-600">
            Vui lòng kiểm tra lại địa chỉ và thông tin giao hàng trước khi xác nhận.
          </p>

          <button
            type="button"
            onClick={() => placeOrder("COD")}
            className="
              mt-2 w-full h-12 rounded-lg 
              bg-black text-white font-semibold 
              hover:bg-gray-900 transition
            "
          >
            Xác nhận đặt hàng COD
          </button>
        </div>
      )}
    </div>
  )
}
