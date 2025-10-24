"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const productsByCategory = {
  male: [
    {
      id: 1,
      name: "Áo Sơ Mi Nam Cao Cấp",
      price: "450.000đ",
      image: "/patterned-shirt-youth-fashion.jpg",
      category: "Nam",
    },
    {
      id: 2,
      name: "Quần Âu Nam Lịch Lãm",
      price: "580.000đ",
      image: "/cargo-pants-streetwear-trendy.jpg",
      category: "Nam",
    },
    {
      id: 3,
      name: "Áo Khoác Bomber Nam",
      price: "720.000đ",
      image: "/bomber-jacket-youth-style.jpg",
      category: "Nam",
    },
    {
      id: 4,
      name: "Áo Thun Oversized Nam",
      price: "320.000đ",
      image: "/trendy-oversized-tshirt-streetwear-style.jpg",
      category: "Nam",
    },
    {
      id: 5,
      name: "Hoodie Nam Phong Cách",
      price: "580.000đ",
      image: "/graphic-hoodie-youth-fashion.jpg",
      category: "Nam",
    },
    {
      id: 6,
      name: "Quần Jean Nam Rách",
      price: "550.000đ",
      image: "/ripped-jeans-trendy-style.jpg",
      category: "Nam",
    },
    {
      id: 7,
      name: "Quần Cargo Nam",
      price: "650.000đ",
      image: "/cargo-pants-streetwear-trendy.jpg",
      category: "Nam",
    },
    {
      id: 8,
      name: "Áo Polo Nam Cao Cấp",
      price: "380.000đ",
      image: "/patterned-shirt-youth-fashion.jpg",
      category: "Nam",
    },
  ],
  female: [
    {
      id: 1,
      name: "Áo Croptop Nữ Thời Trang",
      price: "280.000đ",
      image: "/trendy-crop-top-youth-fashion.jpg",
      category: "Nữ",
    },
    {
      id: 2,
      name: "Váy Denim Trẻ Trung",
      price: "480.000đ",
      image: "/denim-skirt-youth-style.jpg",
      category: "Nữ",
    },
    {
      id: 3,
      name: "Áo Sơ Mi Nữ Họa Tiết",
      price: "420.000đ",
      image: "/patterned-shirt-youth-fashion.jpg",
      category: "Nữ",
    },
    {
      id: 4,
      name: "Quần Jean Nữ Skinny",
      price: "550.000đ",
      image: "/ripped-jeans-trendy-style.jpg",
      category: "Nữ",
    },
    {
      id: 5,
      name: "Hoodie Nữ Oversized",
      price: "580.000đ",
      image: "/graphic-hoodie-youth-fashion.jpg",
      category: "Nữ",
    },
    {
      id: 6,
      name: "Áo Thun Nữ Basic",
      price: "250.000đ",
      image: "/trendy-oversized-tshirt-streetwear-style.jpg",
      category: "Nữ",
    },
    {
      id: 7,
      name: "Áo Khoác Nữ Bomber",
      price: "680.000đ",
      image: "/bomber-jacket-youth-style.jpg",
      category: "Nữ",
    },
    {
      id: 8,
      name: "Quần Cargo Nữ Unisex",
      price: "620.000đ",
      image: "/cargo-pants-streetwear-trendy.jpg",
      category: "Nữ",
    },
  ],
  kids: [
    {
      id: 1,
      name: "Áo Thun Trẻ Em Họa Tiết",
      price: "180.000đ",
      image: "/trendy-oversized-tshirt-streetwear-style.jpg",
      category: "Trẻ Em",
    },
    {
      id: 2,
      name: "Quần Jean Trẻ Em",
      price: "280.000đ",
      image: "/ripped-jeans-trendy-style.jpg",
      category: "Trẻ Em",
    },
    {
      id: 3,
      name: "Áo Khoác Trẻ Em",
      price: "380.000đ",
      image: "/bomber-jacket-youth-style.jpg",
      category: "Trẻ Em",
    },
    {
      id: 4,
      name: "Hoodie Trẻ Em Đáng Yêu",
      price: "320.000đ",
      image: "/graphic-hoodie-youth-fashion.jpg",
      category: "Trẻ Em",
    },
    {
      id: 5,
      name: "Váy Bé Gái Xinh Xắn",
      price: "250.000đ",
      image: "/denim-skirt-youth-style.jpg",
      category: "Trẻ Em",
    },
    {
      id: 6,
      name: "Áo Sơ Mi Bé Trai",
      price: "220.000đ",
      image: "/patterned-shirt-youth-fashion.jpg",
      category: "Trẻ Em",
    },
    {
      id: 7,
      name: "Quần Cargo Trẻ Em",
      price: "300.000đ",
      image: "/cargo-pants-streetwear-trendy.jpg",
      category: "Trẻ Em",
    },
    {
      id: 8,
      name: "Áo Croptop Bé Gái",
      price: "180.000đ",
      image: "/trendy-crop-top-youth-fashion.jpg",
      category: "Trẻ Em",
    },
  ],
}

interface FeaturedProductsProps {
  category: "male" | "female" | "kids"
}

export function FeaturedProducts({ category }: FeaturedProductsProps) {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)
  const products = productsByCategory[category]

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number.parseInt(entry.target.getAttribute("data-index") || "0")
            setVisibleCards((prev) => new Set(prev).add(index))
          }
        })
      },
      { threshold: 0.2 },
    )

    return () => observerRef.current?.disconnect()
  }, [])

  const cardRef = (el: HTMLDivElement | null, index: number) => {
    if (el && observerRef.current) {
      observerRef.current.observe(el)
    }
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl font-bold mb-4 text-balance">Sản Phẩm Nổi Bật</h2>
          <p className="text-lg text-muted-foreground text-pretty">Những món đồ được yêu thích nhất trong mùa này</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <Card
              key={product.id}
              ref={(el) => cardRef(el, index)}
              data-index={index}
              className={`group overflow-hidden hover:shadow-xl transition-all duration-500 ${
                visibleCards.has(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden aspect-[3/4]">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Button
                    size="icon"
                    className="absolute bottom-4 right-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-primary hover:bg-primary/90 shadow-lg"
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-2 p-4">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">{product.category}</span>
                <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-primary">{product.price}</p>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <Button size="lg" variant="outline" className="hover:scale-105 transition-transform bg-transparent">
            Xem Tất Cả Sản Phẩm
          </Button>
        </div>
      </div>
    </section>
  )
}
