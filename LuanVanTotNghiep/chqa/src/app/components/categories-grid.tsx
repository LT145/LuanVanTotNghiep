"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

type Category = {
  id: string
  name: string
  image: string
  description: string
}

const maleCategories: Category[] = [
  {
    id: "ao-thun",
    name: "Áo Thun",
    image: "/male-tshirt-category.jpg",
    description: "Áo thun nam phong cách trẻ trung",
  },
  { id: "ao-so-mi", name: "Áo Sơ Mi", image: "/male-shirt-category.jpg", description: "Áo sơ mi nam lịch sự" },
  { id: "quan-jean", name: "Quần Jean", image: "/male-jeans-category.jpg", description: "Quần jean nam thời trang" },
  { id: "ao-khoac", name: "Áo Khoác", image: "/male-jacket-category.jpg", description: "Áo khoác nam phong cách" },
  { id: "quan-short", name: "Quần Short", image: "/male-shorts-category.jpg", description: "Quần short nam năng động" },
  { id: "ao-hoodie", name: "Áo Hoodie", image: "/male-hoodie-category.jpg", description: "Áo hoodie nam streetwear" },
]

const femaleCategories: Category[] = [
  { id: "ao-thun", name: "Áo Thun", image: "/female-tshirt-category.jpg", description: "Áo thun nữ thời trang" },
  { id: "vay", name: "Váy", image: "/female-dress-category.jpg", description: "Váy nữ duyên dáng" },
  { id: "quan-jean", name: "Quần Jean", image: "/female-jeans-category.jpg", description: "Quần jean nữ trendy" },
  { id: "ao-khoac", name: "Áo Khoác", image: "/female-jacket-category.jpg", description: "Áo khoác nữ sang trọng" },
  { id: "chan-vay", name: "Chân Váy", image: "/female-skirt-category.jpg", description: "Chân váy nữ xinh xắn" },
  { id: "ao-croptop", name: "Áo Croptop", image: "/female-croptop-category.jpg", description: "Áo croptop nữ cá tính" },
]

const kidsCategories: Category[] = [
  { id: "ao-thun", name: "Áo Thun", image: "/kids-tshirt-category.jpg", description: "Áo thun trẻ em đáng yêu" },
  {
    id: "quan-short",
    name: "Quần Short",
    image: "/kids-shorts-category.jpg",
    description: "Quần short trẻ em thoải mái",
  },
  { id: "vay", name: "Váy", image: "/kids-dress-category.jpg", description: "Váy trẻ em xinh xắn" },
  { id: "ao-khoac", name: "Áo Khoác", image: "/kids-jacket-category.jpg", description: "Áo khoác trẻ em ấm áp" },
  { id: "bo-do", name: "Bộ Đồ", image: "/kids-set-category.jpg", description: "Bộ đồ trẻ em dễ thương" },
  { id: "ao-hoodie", name: "Áo Hoodie", image: "/kids-hoodie-category.jpg", description: "Áo hoodie trẻ em năng động" },
]

export function CategoriesGrid({ type }: { type: "male" | "female" | "kids" }) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const categories = type === "male" ? maleCategories : type === "female" ? femaleCategories : kidsCategories
  const typeLabel = type === "male" ? "Nam" : type === "female" ? "Nữ" : "Trẻ Em"

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
  }, [])

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-emerald-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Danh Mục {typeLabel}</h2>
          <p className="text-lg text-gray-600">Khám phá bộ sưu tập thời trang {typeLabel.toLowerCase()} đa dạng</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div
              key={category.id}
              ref={(el) => {
                itemRefs.current[index] = el
              }}
              className={`transition-all duration-700 ${
                visibleItems.has(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Link
                href={`/${type}/${category.id}`}
                className="group block relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="aspect-[4/5] relative">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-200">{category.description}</p>
                  <div className="mt-4 flex items-center text-emerald-400 font-semibold">
                    <span>Xem thêm</span>
                    <svg
                      className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
