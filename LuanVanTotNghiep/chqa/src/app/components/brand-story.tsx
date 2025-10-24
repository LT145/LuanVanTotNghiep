"use client"

import { useEffect, useRef, useState } from "react"

export function BrandStory() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
            }`}
          >
            <div className="relative group">
              <img
                src="/vietnamese-traditional-fabric-patterns-and-modern-.jpg"
                alt="Brand Story"
                className="rounded-lg shadow-lg w-full transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>

          <div>
            <h2
              className={`text-4xl font-bold mb-6 text-balance transition-all duration-1000 delay-200 ${
                isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
              }`}
            >
              Câu Chuyện Của Chúng Tôi
            </h2>
            <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
              <p
                className={`text-pretty transition-all duration-1000 delay-300 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
                }`}
              >
                Được thành lập với niềm đam mê về thời trang Việt Nam, chúng tôi mang đến những sản phẩm kết hợp hoàn
                hảo giữa nét đẹp truyền thống và phong cách hiện đại.
              </p>
              <p
                className={`text-pretty transition-all duration-1000 delay-500 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
                }`}
              >
                Mỗi sản phẩm được chúng tôi chọn lọc kỹ lưỡng, từ chất liệu cao cấp đến thiết kế tinh tế, nhằm mang lại
                sự tự tin và phong cách riêng cho mỗi khách hàng.
              </p>
              <p
                className={`text-pretty transition-all duration-1000 delay-700 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
                }`}
              >
                Chúng tôi tin rằng thời trang không chỉ là trang phục, mà là cách bạn thể hiện bản thân và tạo nên dấu
                ấn riêng trong cuộc sống.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
