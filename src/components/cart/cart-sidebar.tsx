"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/lib/cart-context"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { X, ShoppingBag, Plus, Minus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function CartSidebar() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
    updateQuantity,
  } = useCart()

  const [iconPos, setIconPos] = useState<{ x: number; y: number } | null>(null)

  // 🧭 Lấy vị trí thật của icon giỏ hàng khi mở
  useEffect(() => {
    const icon = document.getElementById("cart-icon")
    if (icon) {
      const rect = icon.getBoundingClientRect()
      setIconPos({
        x: rect.right - 24, // dịch nhẹ để căn đúng mép
        y: rect.top + 24,
      })
    }
  }, [isCartOpen])

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay nền mờ */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Sidebar phóng từ icon */}
          <motion.div
            key="sidebar"
            initial={{
              opacity: 0,
              scale: 0.4,
              x: iconPos ? iconPos.x - window.innerWidth : "50%",
              y: iconPos ? iconPos.y - window.innerHeight / 2 : "-50%",
              transformOrigin: "top right",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
              y: 0,
              transition: {
                duration: 0.5,
                type: "spring",
                damping: 18,
                stiffness: 140,
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.5,
              x: iconPos ? iconPos.x - window.innerWidth : "50%",
              y: iconPos ? iconPos.y - window.innerHeight / 2 : "-50%",
              transition: {
                duration: 0.4,
                ease: "easeInOut",
              },
            }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col rounded-tl-3xl rounded-bl-3xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-gray-900">Giỏ hàng</h2>
                <motion.span
                  key={getTotalItems()}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm font-semibold"
                >
                  {getTotalItems()}
                </motion.span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartOpen(false)}
                className="hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Nội dung giỏ hàng */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <ShoppingBag className="w-24 h-24 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Giỏ hàng trống
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Hãy thêm sản phẩm vào giỏ hàng của bạn.
                  </p>
                  <Button
                    onClick={() => setIsCartOpen(false)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Tiếp tục mua sắm
                  </Button>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.25 }}
                      className="flex gap-4 bg-gray-50 rounded-lg p-4 relative"
                    >
                      {/* Ảnh sản phẩm */}
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Thông tin sản phẩm */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {item.name}
                        </h3>
                        <div className="text-sm text-gray-600 mb-2">
                          <span>Màu: {item.selectedColor}</span>
                          <span className="mx-2">•</span>
                          <span>Size: {item.selectedSize}</span>
                        </div>

                        {/* Số lượng + giá */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="border-gray-300 hover:border-gray-400"
                              onClick={() =>
                                updateQuantity(item.id!, item.quantity - 1)
                              }
                            >
                              <Minus className="w-4 h-4" />
                            </Button>

                            <motion.span
                              key={item.quantity}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.25 }}
                              className="w-8 text-center font-semibold"
                            >
                              {item.quantity}
                            </motion.span>

                            <Button
                              size="icon"
                              variant="outline"
                              className="border-gray-300 hover:border-gray-400"
                              onClick={() =>
                                updateQuantity(item.id!, item.quantity + 1)
                              }
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          <span className="text-lg font-bold text-primary">
                            {(item.price * item.quantity).toLocaleString(
                              "vi-VN"
                            )}
                            ₫
                          </span>

                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => removeFromCart(item.id!)}
                            className="border-gray-300 hover:border-red-500 hover:text-red-500"
                            title="Xóa sản phẩm"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <motion.div
                key="footer"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t p-6 space-y-4"
              >
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold text-gray-700">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {getTotalPrice().toLocaleString("vi-VN")}₫
                  </span>
                </div>

                <Link href="/order" onClick={() => setIsCartOpen(false)}>
                  <Button className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 rounded-xl">
                    Thanh toán
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  onClick={() => {
                    clearCart()
                    setIsCartOpen(false)
                  }}
                  className="w-full h-12 rounded-xl border-2"
                >
                  Xóa giỏ hàng
                </Button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
