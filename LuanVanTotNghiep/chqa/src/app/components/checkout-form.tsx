"use client"

import type React from "react"

import { useState } from "react"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CreditCard, Wallet, MapPin, Phone, Mail, User } from "lucide-react"

export function CheckoutForm() {
  const { cart, getTotalPrice, clearCart } = useCart()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    note: "",
    paymentMethod: "cod",
  })

  const shippingFee = getTotalPrice() >= 500000 ? 0 : 30000
  const totalAmount = getTotalPrice() + shippingFee

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Store order in localStorage
    const order = {
      id: `ORD${Date.now()}`,
      date: new Date().toISOString(),
      items: cart,
      customer: formData,
      subtotal: getTotalPrice(),
      shippingFee,
      total: totalAmount,
      status: "pending",
    }

    const orders = JSON.parse(localStorage.getItem("orders") || "[]")
    orders.push(order)
    localStorage.setItem("orders", JSON.stringify(orders))

    clearCart()
    router.push(`/order-success?orderId=${order.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Forms */}
      <div className="lg:col-span-2 space-y-6">
        {/* Shipping Information */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Thông tin giao hàng</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="fullName" className="text-gray-700 font-semibold mb-2 block">
                Họ và tên *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="pl-10 h-12"
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-700 font-semibold mb-2 block">
                Email *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="pl-10 h-12"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone" className="text-gray-700 font-semibold mb-2 block">
                Số điện thoại *
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="pl-10 h-12"
                  placeholder="0123456789"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address" className="text-gray-700 font-semibold mb-2 block">
                Địa chỉ *
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="h-12"
                placeholder="Số nhà, tên đường"
              />
            </div>
            <div>
              <Label htmlFor="ward" className="text-gray-700 font-semibold mb-2 block">
                Phường/Xã *
              </Label>
              <Input
                id="ward"
                name="ward"
                value={formData.ward}
                onChange={handleInputChange}
                required
                className="h-12"
                placeholder="Phường 1"
              />
            </div>
            <div>
              <Label htmlFor="district" className="text-gray-700 font-semibold mb-2 block">
                Quận/Huyện *
              </Label>
              <Input
                id="district"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                required
                className="h-12"
                placeholder="Quận 1"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="city" className="text-gray-700 font-semibold mb-2 block">
                Tỉnh/Thành phố *
              </Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="h-12"
                placeholder="Hồ Chí Minh"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="note" className="text-gray-700 font-semibold mb-2 block">
                Ghi chú (tùy chọn)
              </Label>
              <textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay địa điểm giao hàng cụ thể hơn"
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-6">
            <Wallet className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Phương thức thanh toán</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-emerald-600 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={formData.paymentMethod === "cod"}
                onChange={handleInputChange}
                className="w-5 h-5 text-emerald-600"
              />
              <Wallet className="w-6 h-6 text-gray-600" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Thanh toán khi nhận hàng (COD)</div>
                <div className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</div>
              </div>
            </label>
            <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-emerald-600 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="bank"
                checked={formData.paymentMethod === "bank"}
                onChange={handleInputChange}
                className="w-5 h-5 text-emerald-600"
              />
              <CreditCard className="w-6 h-6 text-gray-600" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Chuyển khoản ngân hàng</div>
                <div className="text-sm text-gray-500">Chuyển khoản qua ngân hàng hoặc ví điện tử</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Right Column - Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl p-6 shadow-md sticky top-24">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Đơn hàng</h2>
          <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
            {cart.map((item, index) => (
              <div
                key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}-${index}`}
                className="flex gap-3"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.product.image || "/placeholder.svg"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {item.quantity}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{item.product.name}</h3>
                  <p className="text-xs text-gray-500">
                    {item.selectedColor} / {item.selectedSize}
                  </p>
                  <p className="text-sm font-bold text-emerald-600">
                    {(item.product.price * item.quantity).toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Tạm tính:</span>
              <span className="font-semibold">{getTotalPrice().toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Phí vận chuyển:</span>
              <span className="font-semibold">
                {shippingFee === 0 ? (
                  <span className="text-emerald-600">Miễn phí</span>
                ) : (
                  `${shippingFee.toLocaleString("vi-VN")}đ`
                )}
              </span>
            </div>
            {getTotalPrice() < 500000 && (
              <div className="text-xs text-gray-500 bg-emerald-50 p-2 rounded">
                Mua thêm {(500000 - getTotalPrice()).toLocaleString("vi-VN")}đ để được miễn phí vận chuyển
              </div>
            )}
            <div className="border-t pt-3 flex justify-between text-xl font-bold">
              <span>Tổng cộng:</span>
              <span className="text-emerald-600">{totalAmount.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isProcessing}
            className="w-full h-12 mt-6 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 rounded-xl"
          >
            {isProcessing ? "Đang xử lý..." : "Đặt hàng"}
          </Button>

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Bảo mật thông tin thanh toán</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Đổi trả miễn phí trong 7 ngày</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
