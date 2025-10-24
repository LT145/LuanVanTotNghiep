"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import type { Product } from "@/lib/products-data"

export function ProductGrid({ products }: { products: Product[] }) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers = itemRefs.current.map((ref, index) => {
      if (!ref) return null

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleItems((prev) => new Set(prev).add(index))
            }
          })
        },
        { threshold: 0.1 },
      )

      observer.observe(ref)
      return observer
    })

    return () => {
      observers.forEach((observer) => observer?.disconnect())
    }
  }, [products])

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-500">Chưa có sản phẩm trong danh mục này</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <div
          key={product.id}
          ref={(el) => {
            itemRefs.current[index] = el
          }}
          className={`transition-all duration-700 ${
            visibleItems.has(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: `${index * 50}ms` }}
        >
          <Link
            href={`/${product.type}/${product.category}/${product.id}`}
            className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
          >
            <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {product.originalPrice && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
                </div>
                <span className="text-sm text-gray-400">({product.reviews})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-emerald-600">{product.price.toLocaleString("vi-VN")}đ</span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {product.originalPrice.toLocaleString("vi-VN")}đ
                  </span>
                )}
              </div>
              <div className="mt-3 flex gap-1">
                {product.colors.slice(0, 4).map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-gray-200"
                    style={{
                      background:
                        color === "Đen"
                          ? "#000"
                          : color === "Trắng"
                            ? "#fff"
                            : color === "Xám"
                              ? "#9ca3af"
                              : color === "Xanh Navy"
                                ? "#1e3a8a"
                                : color === "Hồng"
                                  ? "#ec4899"
                                  : color === "Be"
                                    ? "#d4a574"
                                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  />
                ))}
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}
