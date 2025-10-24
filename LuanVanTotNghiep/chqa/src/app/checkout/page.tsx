"use client"

import { Header } from "@/components/header/header"
import { Footer } from "@/components/footer"
import { CheckoutForm } from "@/components/checkout-form"
import { useCart } from "@/lib/cart-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"

export default function CheckoutPage() {
  const { cart } = useCart()
  const router = useRouter()

  useEffect(() => {
    if (cart.length === 0) {
      router.push("/male")
    }
  }, [cart, router])

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
          <Link
            href="/male"
            className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Thanh toán</h1>
          <CheckoutForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
