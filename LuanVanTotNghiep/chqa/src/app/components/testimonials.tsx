"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { useState, useEffect } from "react"

const testimonials = [
  {
    id: 1,
    name: "Nguyễn Thị Mai",
    rating: 5,
    comment: "Chất lượng sản phẩm tuyệt vời, thiết kế rất đẹp và hiện đại. Tôi rất hài lòng với lần mua hàng này!",
    location: "Hà Nội",
  },
  {
    id: 2,
    name: "Trần Văn Hùng",
    rating: 5,
    comment: "Dịch vụ chăm sóc khách hàng tốt, giao hàng nhanh. Sẽ tiếp tục ủng hộ shop!",
    location: "TP. Hồ Chí Minh",
  },
  {
    id: 3,
    name: "Lê Thị Hương",
    rating: 5,
    comment: "Mẫu mã đa dạng, giá cả hợp lý. Rất đáng để mua sắm tại đây.",
    location: "Đà Nẵng",
  },
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleIndexChange = (newIndex: number) => {
    if (newIndex === currentIndex) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex(newIndex)
      setIsAnimating(false)
    }, 300)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      handleIndexChange((currentIndex + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [currentIndex])

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in-down">
          <h2 className="text-4xl font-bold mb-4 text-balance">Khách Hàng Nói Gì Về Chúng Tôi</h2>
          <p className="text-lg text-muted-foreground text-pretty">Những đánh giá chân thực từ khách hàng</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card
            className={`bg-card transition-all duration-300 ${
              isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
          >
            <CardContent className="p-8">
              <div className="flex gap-1 mb-4 justify-center">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-primary text-primary animate-scale-in"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
              <p className="text-xl text-center mb-6 leading-relaxed text-pretty">
                "{testimonials[currentIndex].comment}"
              </p>
              <div className="text-center">
                <p className="font-semibold text-card-foreground">{testimonials[currentIndex].name}</p>
                <p className="text-sm text-muted-foreground">{testimonials[currentIndex].location}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => handleIndexChange(index)}
                className={`h-2 rounded-full transition-all duration-300 hover:scale-110 ${
                  index === currentIndex ? "w-8 bg-primary" : "w-2 bg-border hover:bg-primary/50"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
