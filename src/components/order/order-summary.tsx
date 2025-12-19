"use client"

import { TrendingUp, Truck, ShieldCheck } from "lucide-react"

interface OrderSummaryProps {
  subtotal: number
  tax: number
  total: number
  shippingCost: number
  currentStep: number
}

export default function OrderSummary({
  subtotal,
  tax,
  total,
  shippingCost,
  currentStep,
}: OrderSummaryProps) {
  return (
    <div className="sticky top-32 space-y-6">
      {/* 🧾 Summary Card */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-black">Tóm tắt đơn hàng</h3>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tạm tính</span>
            <span className="text-black font-medium">
              {subtotal.toLocaleString("vi-VN")}₫
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Vận chuyển</span>
            <span
              className={`font-medium ${
                shippingCost === 0 ? "text-green-600" : "text-black"
              }`}
            >
              {shippingCost === 0
                ? "Chưa chọn"
                : `${shippingCost.toLocaleString("vi-VN")}₫`}
            </span>
          </div>

          {/* 💤 Tạm ẩn phần thuế (chưa dùng)
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Thuế (10%)</span>
            <span className="text-black font-medium">
              {tax.toLocaleString("vi-VN")}₫
            </span>
          </div>
          */}

          <div className="border-t border-gray-300 pt-3 flex justify-between">
            <span className="font-semibold text-black">Tổng cộng</span>
            <span className="text-xl font-bold text-black">
              {total.toLocaleString("vi-VN")}₫
            </span>
          </div>
        </div>
      </div>

      {/* 🚚 Benefits */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Truck className="w-5 h-5 text-black mt-1" />
          <div>
            <p className="font-medium text-black text-sm">Giao hàng nhanh</p>
            <p className="text-xs text-gray-600">Trong 1–2 ngày làm việc</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-black mt-1" />
          <div>
            <p className="font-medium text-black text-sm">Bảo mật 100%</p>
            <p className="text-xs text-gray-600">Thông tin được mã hóa</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-black mt-1" />
          <div>
            <p className="font-medium text-black text-sm">Hoàn tiền 30 ngày</p>
            <p className="text-xs text-gray-600">Nếu không hài lòng</p>
          </div>
        </div>
      </div>

      {/* 🎟️ Discount Code */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-black">
          Mã giảm giá (Tùy chọn)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập mã giảm giá"
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
          />
          <button className="px-4 py-2.5 font-medium text-white bg-black rounded-lg hover:bg-gray-900 transition-all">
            Áp dụng
          </button>
        </div>
      </div>

      {/* 📜 Info Text */}
      <p className="text-xs text-gray-500 leading-relaxed">
        Bằng cách hoàn tất đơn hàng, bạn đồng ý với các điều khoản dịch vụ và
        chính sách bảo mật của chúng tôi.
      </p>
    </div>
  )
}
