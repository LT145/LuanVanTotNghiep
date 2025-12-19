"use client"

import { useEffect, useState, useCallback } from "react"
import { ChevronRight, Check } from "lucide-react"
import OrderSummary from "@/components/order/order-summary"
import ShippingInfo from "@/components/order/shipping-info"
import PaymentForm from "@/components/order/payment-form"
import OrderReview from "@/components/order/order-review"

interface CartItem {
  id: string
  price: number
  quantity: number
  color: string
  size: string
  product: { id: string; name: string; images: { url: string; isMain: boolean }[] }
}

interface ShippingInfoData {
  fullName: string
  email: string
  phone: string
  address: string
  ward: string
  wardName: string
  district: string
  province: string
  provinceName: string
  note: string
  shippingMethod: "standard" | "express" | string
}

export default function CheckoutPage() {
  // ===============================
  // 🛒 State
  // ===============================
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [shippingCost, setShippingCost] = useState(0)
  const [canComplete, setCanComplete] = useState(false)
  const [payMethodUI, setPayMethodUI] = useState<"wallet" | "cod">("wallet")

  // 🧾 Dữ liệu giao hàng
  const [shippingInfo, setShippingInfo] = useState<ShippingInfoData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    ward: "",
    wardName: "",
    district: "",
    province: "",
    provinceName: "",
    note: "",
    shippingMethod: "standard",
  })

  const steps = ["Xem lại", "Giao hàng", "Thanh toán"]

  // ===============================
  // 💰 Tính tiền
  // ===============================
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const total = subtotal + shippingCost

  // ===============================
  // 🧭 Load giỏ hàng
  // ===============================
  useEffect(() => {
    const loadCart = async () => {
      try {
        const res = await fetch("/api/cart", { cache: "no-store" })
        const js = await res.json()
        setItems(js.items || [])
      } catch (err) {
        console.error("Error loading cart:", err)
      } finally {
        setLoading(false)
      }
    }
    loadCart()
  }, [])

  // ===============================
  // 🧾 Đặt hàng COD
  // ===============================
  const finalizeCOD = useCallback(async () => {
    console.log("📦 GỬI DỮ LIỆU ĐẶT HÀNG:", shippingInfo)

    const payload = {
      paymentMethod: "COD",
      amount: total,
      shipping: {
        fullName: shippingInfo.fullName,
        phone: shippingInfo.phone,
        addressLine: shippingInfo.address,
        wardName: shippingInfo.wardName || shippingInfo.ward,
        provinceName: shippingInfo.provinceName || shippingInfo.province,
        note: shippingInfo.note,
        method: shippingInfo.shippingMethod === "express" ? "express" : "standard",
        shippingCost,
      },
    }

    try {
      const res = await fetch("/api/order/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const js = await res.json()
      if (!js.ok) {
        alert("❌ Đặt hàng thất bại: " + (js.error || "Lỗi không xác định"))
        return
      }

      alert("✅ Đặt hàng COD thành công!")
      window.location.href = `/orders/${js.orderId}`
    } catch (err) {
      console.error("❌ Lỗi đặt hàng:", err)
      alert("Không thể đặt hàng, vui lòng thử lại.")
    }
  }, [shippingInfo, shippingCost, total])

  // ===============================
  // 🪜 Chuyển bước
  // ===============================
  const handleNextStep = async () => {
    if (currentStep === 2) {
      if (!canComplete) return
      if (payMethodUI === "cod") await finalizeCOD()
      return
    }
    setCurrentStep((s) => s + 1)
  }

  const handlePrevStep = () => setCurrentStep((s) => Math.max(0, s - 1))

  // ===============================
  // 🧩 Render
  // ===============================
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 py-10 text-center">
        <h1 className="text-3xl font-bold uppercase">Thanh Toán</h1>
      </div>

      {/* Nội dung */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentStep(i)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    i <= currentStep ? "bg-black text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
                </button>
                <span
                  className={`ml-3 text-sm ${
                    i <= currentStep ? "text-black" : "text-gray-400"
                  }`}
                >
                  {step}
                </span>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 mx-4 h-0.5 ${
                      i < currentStep ? "bg-black" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái */}
          <div className="lg:col-span-2">
            {currentStep === 0 && <OrderReview items={items} loading={loading} />}

            {currentStep === 1 && (
              <ShippingInfo
                formData={shippingInfo}
                onFormChange={setShippingInfo}
                onShippingCostChange={setShippingCost}
              />
            )}

            {currentStep === 2 && (
              <PaymentForm
                total={total}
                shipping={{
                  fullName: shippingInfo.fullName,
                  phone: shippingInfo.phone,
                  address: shippingInfo.address,
                  ward: shippingInfo.wardName || shippingInfo.ward,
                  province: shippingInfo.provinceName || shippingInfo.province,
                  note: shippingInfo.note,
                  shippingMethod: shippingInfo.shippingMethod,
                }}
                shippingCost={shippingCost}
                isLocked={true}
                onPaymentStatusChange={setCanComplete}
                onPaymentMethodChange={setPayMethodUI}
              />
            )}

            {/* Buttons */}
            <div className="mt-12 flex gap-4">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className="px-8 py-3 border border-gray-300 rounded-lg hover:border-black"
              >
                Quay lại
              </button>

              <button
                onClick={handleNextStep}
                disabled={currentStep === 2 && !canComplete}
                className={`ml-auto px-8 py-3 font-medium text-white rounded-lg flex items-center gap-2 ${
                  currentStep === 2 && !canComplete
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black hover:bg-gray-900"
                }`}
              >
                {currentStep === 2 ? "Hoàn thành" : "Tiếp tục"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cột phải */}
          <div className="lg:col-span-1">
            <OrderSummary
              subtotal={subtotal}
              tax={0}
              total={total}
              shippingCost={shippingCost}
              currentStep={currentStep}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
