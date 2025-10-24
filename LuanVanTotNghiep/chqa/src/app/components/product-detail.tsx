"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/products-data"
import { ShoppingCart, Heart, Share2, Star, ChevronLeft } from "lucide-react"
import { useCart } from "@/lib/cart-context"

export function ProductDetail({ product }: { product: Product }) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [selectedSize, setSelectedSize] = useState(product.sizes[0])
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)

  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart({
      product,
      selectedColor,
      selectedSize,
      quantity,
    })
  }

  const colorMap: Record<string, string> = {
    Đen: "#000000",
    Trắng: "#FFFFFF",
    Xám: "#9CA3AF",
    "Xanh Navy": "#1E3A8A",
    Hồng: "#EC4899",
    Be: "#D4A574",
    "Xanh Nhạt": "#93C5FD",
    "Xanh Đậm": "#1E40AF",
    Đỏ: "#DC2626",
    "Xanh Rêu": "#4B5563",
    "Nhiều màu": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "Hoa Nhí": "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    "Xanh/Trắng": "linear-gradient(90deg, #3B82F6 50%, #FFFFFF 50%)",
    "Đen/Trắng": "linear-gradient(90deg, #000000 50%, #FFFFFF 50%)",
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link
          href={`/${product.type}/${product.category}`}
          className="inline-flex items-center text-gray-600 hover:text-emerald-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Quay lại danh sách
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-[3/4] relative rounded-2xl overflow-hidden bg-gray-100 shadow-xl">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {product.originalPrice && (
              <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}% GIẢM
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-lg font-semibold text-gray-700">{product.rating}</span>
              </div>
              <span className="text-gray-500">({product.reviews} đánh giá)</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-4 pb-6 border-b">
            <span className="text-4xl font-bold text-emerald-600">{product.price.toLocaleString("vi-VN")}đ</span>
            {product.originalPrice && (
              <span className="text-2xl text-gray-400 line-through">
                {product.originalPrice.toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>

          {/* Description */}
          <div className="pb-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả sản phẩm</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Color Selection */}
          <div className="pb-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Màu sắc: <span className="text-emerald-600">{selectedColor}</span>
            </h3>
            <div className="flex gap-3">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-12 h-12 rounded-full border-2 transition-all ${
                    selectedColor === color
                      ? "border-emerald-600 ring-4 ring-emerald-100 scale-110"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  style={{
                    background: colorMap[color] || "#E5E7EB",
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="pb-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Kích thước: <span className="text-emerald-600">{selectedSize}</span>
            </h3>
            <div className="flex gap-3">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-6 py-3 rounded-lg border-2 font-semibold transition-all ${
                    selectedSize === size
                      ? "border-emerald-600 bg-emerald-50 text-emerald-600"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="pb-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Số lượng</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-emerald-600 hover:text-emerald-600 font-bold text-xl transition-colors"
              >
                -
              </button>
              <span className="text-2xl font-semibold w-16 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-emerald-600 hover:text-emerald-600 font-bold text-xl transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Button
              onClick={handleAddToCart}
              className="w-full h-14 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Thêm vào giỏ hàng
            </Button>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsFavorite(!isFavorite)}
                variant="outline"
                className={`flex-1 h-12 rounded-xl border-2 transition-all ${
                  isFavorite
                    ? "border-red-500 text-red-500 bg-red-50"
                    : "border-gray-300 hover:border-red-500 hover:text-red-500"
                }`}
              >
                <Heart className={`w-5 h-5 mr-2 ${isFavorite ? "fill-red-500" : ""}`} />
                Yêu thích
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl border-2 border-gray-300 hover:border-emerald-600 hover:text-emerald-600 transition-all bg-transparent"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Chia sẻ
              </Button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Miễn phí vận chuyển cho đơn hàng trên 500.000đ</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Đổi trả trong vòng 7 ngày</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Thanh toán khi nhận hàng</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
