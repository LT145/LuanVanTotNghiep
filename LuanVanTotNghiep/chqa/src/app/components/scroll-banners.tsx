"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronDown } from "lucide-react"

const bannersByCategory = {
  male: [
    {
      id: 1,
      title: "Bộ Sưu Tập Nam 2024",
      subtitle: "Mạnh mẽ - Lịch lãm - Phong cách",
      description: "Khám phá những thiết kế nam tính với chất liệu cao cấp",
      image: "/spring-fashion-collection-vibrant-colors-vietnames.jpg",
      cta: "Khám Phá Ngay",
    },
    {
      id: 2,
      title: "Thời Trang Công Sở Nam",
      subtitle: "Chuyên nghiệp - Lịch lãm - Sang trọng",
      description: "Nâng tầm phong cách công sở với những bộ vest thanh lịch",
      image: "/professional-office-fashion-elegant-business-attir.jpg",
      cta: "Mua Sắm Ngay",
    },
    {
      id: 3,
      title: "Streetwear Nam",
      subtitle: "Cá tính - Năng động - Hiện đại",
      description: "Thể hiện bản thân với phong cách đường phố độc đáo",
      image: "/streetwear-fashion-urban-style-trendy-clothing.jpg",
      cta: "Xem Bộ Sưu Tập",
    },
  ],
  female: [
    {
      id: 1,
      title: "Bộ Sưu Tập Nữ 2024",
      subtitle: "Duyên dáng - Quyến rũ - Thanh lịch",
      description: "Tôn vinh vẻ đẹp phụ nữ với những thiết kế tinh tế",
      image: "/spring-fashion-collection-vibrant-colors-vietnames.jpg",
      cta: "Khám Phá Ngay",
    },
    {
      id: 2,
      title: "Thời Trang Công Sở Nữ",
      subtitle: "Sang trọng - Tự tin - Chuyên nghiệp",
      description: "Tỏa sáng nơi công sở với phong cách hiện đại",
      image: "/professional-office-fashion-elegant-business-attir.jpg",
      cta: "Mua Sắm Ngay",
    },
    {
      id: 3,
      title: "Phong Cách Trẻ Trung",
      subtitle: "Năng động - Cá tính - Thời thượng",
      description: "Khẳng định phong cách riêng với những thiết kế độc đáo",
      image: "/streetwear-fashion-urban-style-trendy-clothing.jpg",
      cta: "Xem Bộ Sưu Tập",
    },
  ],
  kids: [
    {
      id: 1,
      title: "Bộ Sưu Tập Trẻ Em 2024",
      subtitle: "Vui tươi - Năng động - Đáng yêu",
      description: "Trang phục thoải mái cho bé yêu vui chơi cả ngày",
      image: "/spring-fashion-collection-vibrant-colors-vietnames.jpg",
      cta: "Khám Phá Ngay",
    },
    {
      id: 2,
      title: "Thời Trang Học Đường",
      subtitle: "Lịch sự - Thoải mái - Bền đẹp",
      description: "Đồng phục và trang phục đi học cho bé",
      image: "/professional-office-fashion-elegant-business-attir.jpg",
      cta: "Mua Sắm Ngay",
    },
    {
      id: 3,
      title: "Phong Cách Năng Động",
      subtitle: "Thoải mái - An toàn - Đáng yêu",
      description: "Trang phục thể thao và dạo phố cho trẻ em",
      image: "/streetwear-fashion-urban-style-trendy-clothing.jpg",
      cta: "Xem Bộ Sưu Tập",
    },
  ],
}

interface ScrollBannersProps {
  category: "male" | "female" | "kids"
}

export function ScrollBanners({ category }: ScrollBannersProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const banners = bannersByCategory[category]

  return (
    <section
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth relative"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style jsx>{`
        section::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className="banner-slide h-screen snap-start snap-always flex items-center justify-center relative overflow-hidden"
        >
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${banner.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />
          </div>

          <div className="container mx-auto px-4 z-10 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <div className="animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
                <p className="text-primary text-lg md:text-xl font-semibold mb-4 tracking-wide">{banner.subtitle}</p>
              </div>

              <div className="animate-fade-in-up" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
                <h2 className="text-5xl md:text-7xl font-bold mb-6 text-balance">{banner.title}</h2>
              </div>

              <div className="animate-fade-in-up" style={{ animationDelay: "0.6s", animationFillMode: "both" }}>
                <p className="text-xl md:text-2xl mb-10 text-pretty leading-relaxed text-white/90">
                  {banner.description}
                </p>
              </div>

              <div className="animate-fade-in-up" style={{ animationDelay: "0.8s", animationFillMode: "both" }}>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 group hover:scale-105 transition-all shadow-lg hover:shadow-xl"
                >
                  {banner.cta}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {banners.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index ? "w-8 bg-primary shadow-lg shadow-primary/50" : "w-2 bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          {index === 0 && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 animate-bounce">
              <ChevronDown className="h-8 w-8 text-white/70" />
            </div>
          )}
        </div>
      ))}
    </section>
  )
}
