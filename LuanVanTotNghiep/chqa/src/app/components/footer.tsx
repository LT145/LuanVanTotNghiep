"use client"

import Link from "next/link"
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function Footer() {
  const [isVisible, setIsVisible] = useState(false)
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (footerRef.current) {
      observer.observe(footerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <footer ref={footerRef} className="bg-card border-t overflow-hidden">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h3 className="text-xl font-bold mb-4 text-primary">THỜI TRANG</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Mang đến phong cách thời trang hiện đại và chất lượng cao cho người Việt.
            </p>
          </div>

          <div
            className={`transition-all duration-700 delay-150 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h4 className="font-semibold mb-4 text-card-foreground">Danh Mục</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/nam"
                  className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block"
                >
                  Thời Trang Nam
                </Link>
              </li>
              <li>
                <Link
                  href="/nu"
                  className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block"
                >
                  Thời Trang Nữ
                </Link>
              </li>
              <li>
                <Link
                  href="/tre-em"
                  className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block"
                >
                  Thời Trang Trẻ Em
                </Link>
              </li>
              <li>
                <Link
                  href="/sale"
                  className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block"
                >
                  Khuyến Mãi
                </Link>
              </li>
            </ul>
          </div>

          <div
            className={`transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h4 className="font-semibold mb-4 text-card-foreground">Hỗ Trợ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block"
                >
                  Về Chúng Tôi
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block"
                >
                  Chính Sách Giao Hàng
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block"
                >
                  Đổi Trả Hàng
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block"
                >
                  Liên Hệ
                </Link>
              </li>
            </ul>
          </div>

          <div
            className={`transition-all duration-700 delay-500 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h4 className="font-semibold mb-4 text-card-foreground">Liên Hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <MapPin className="h-4 w-4 text-primary" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4 text-primary" />
                <span>0123 456 789</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@thoitrang.vn</span>
              </li>
            </ul>
            <div className="flex gap-4 mt-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-all hover:scale-125 hover:-translate-y-1"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-all hover:scale-125 hover:-translate-y-1"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div
          className={`border-t mt-8 pt-8 text-center text-sm text-muted-foreground transition-all duration-700 delay-700 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <p>&copy; 2025 Thời Trang. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}
