"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Package, Truck, Home } from "lucide-react"

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get("orderId")
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    if (!orderId) {
      router.push("/male")
      return
    }

    const orders = JSON.parse(localStorage.getItem("orders") || "[]")
    const foundOrder = orders.find((o: any) => o.id === orderId)

    if (foundOrder) {
      setOrder(foundOrder)
    } else {
      router.push("/male")
    }
  }, [orderId, router])

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
            <p className="text-lg text-gray-600">Cảm ơn bạn đã mua hàng tại cửa hàng chúng tôi</p>
          </div>

          {/* Order Info */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
                <p className="font-bold text-gray-900">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng tiền</p>
                <p className="font-bold text-emerald-600 text-xl">{order.total.toLocaleString("vi-VN")}đ</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Địa chỉ giao hàng</p>
              <p className="font-semibold text-gray-900">
                {order.customer.address}, {order.customer.ward}, {order.customer.district}, {order.customer.city}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-4">Trạng thái đơn hàng</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Đơn hàng đã được đặt</p>
                  <p className="text-sm text-gray-500">Chúng tôi đã nhận được đơn hàng của bạn</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-400">Đang chuẩn bị hàng</p>
                  <p className="text-sm text-gray-400">Đơn hàng đang được đóng gói</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-400">Đang giao hàng</p>
                  <p className="text-sm text-gray-400">Đơn hàng đang trên đường giao đến bạn</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/male" className="block">
              <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-lg font-semibold">
                <Home className="w-5 h-5 mr-2" />
                Tiếp tục mua sắm
              </Button>
            </Link>
            <p className="text-center text-sm text-gray-600">
              Chúng tôi đã gửi email xác nhận đến <span className="font-semibold">{order.customer.email}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  )
}
