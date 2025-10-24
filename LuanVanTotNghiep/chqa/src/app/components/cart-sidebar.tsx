"use client"

import { useCart } from "@/lib/cart-context"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { X, Minus, Plus, ShoppingBag } from "lucide-react"

export function CartSidebar() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart()

  if (!isCartOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Giỏ hàng</h2>
            <span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full text-sm font-semibold">
              {getTotalItems()}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)} className="hover:bg-gray-100">
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-24 h-24 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Giỏ hàng trống</h3>
              <p className="text-gray-500 mb-6">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
              <Button onClick={() => setIsCartOpen(false)} className="bg-emerald-600 hover:bg-emerald-700">
                Tiếp tục mua sắm
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}-${index}`}
                  className="flex gap-4 bg-gray-50 rounded-lg p-4"
                >
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product.image || "/placeholder.svg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{item.product.name}</h3>
                    <div className="text-sm text-gray-600 mb-2">
                      <span>Màu: {item.selectedColor}</span>
                      <span className="mx-2">•</span>
                      <span>Size: {item.selectedSize}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-emerald-600">
                        {item.product.price.toLocaleString("vi-VN")}đ
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity - 1)
                          }
                          className="w-8 h-8 rounded-md border border-gray-300 hover:border-emerald-600 hover:text-emerald-600 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity + 1)
                          }
                          className="w-8 h-8 rounded-md border border-gray-300 hover:border-emerald-600 hover:text-emerald-600 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-gray-700">Tạm tính:</span>
              <span className="text-2xl font-bold text-gray-900">{getTotalPrice().toLocaleString("vi-VN")}đ</span>
            </div>
            <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
              <Button className="w-full h-12 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 rounded-xl">
                Thanh toán
              </Button>
            </Link>
            <Button variant="outline" onClick={() => setIsCartOpen(false)} className="w-full h-12 rounded-xl border-2">
              Tiếp tục mua sắm
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
