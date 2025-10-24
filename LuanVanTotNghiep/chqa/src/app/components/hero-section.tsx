import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url(/placeholder.svg?height=600&width=1920&query=fashionable+Vietnamese+model+wearing+modern+clothing+in+elegant+studio)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
      </div>

      <div className="container mx-auto px-4 z-10 text-white">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">Phong Cách Việt Nam Hiện Đại</h1>
          <p className="text-xl md:text-2xl mb-8 text-pretty leading-relaxed">
            Khám phá bộ sưu tập thời trang mới nhất, kết hợp giữa truyền thống và xu hướng đương đại
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Mua Sắm Ngay
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur border-white text-white hover:bg-white/20"
            >
              Xem Bộ Sưu Tập
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
