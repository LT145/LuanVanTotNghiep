"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import Link from "next/link";

const colorMap: Record<string, string> = {
  đen: "bg-black",
  đỏ: "bg-red-500",
  trắng: "bg-white border",
  vàng: "bg-yellow-400",
  tím: "bg-purple-500",
  nâu: "bg-amber-700",
  be: "bg-amber-100",
  xám: "bg-gray-400",
  ghi: "bg-gray-400",
  default: "bg-gray-300",
};

export function ProductCard({
  product,
  gender,
  category,
}: {
  product: any;
  gender: string;
  category: string;
}) {
  const [hover, setHover] = useState(false);
  const [hoverColor, setHoverColor] = useState<string | null>(null);
const hasSale =
  typeof product.salePrice === "number" &&
  product.salePrice > 0 &&
  product.salePrice < product.price

  return (
    <Link href={`/${gender}/${category}/${product.slug}`} className="block h-full">
      <Card
        className="
          group overflow-hidden shadow-sm hover:shadow-md 
          transition-shadow border border-border
          flex flex-col h-full
          cursor-pointer
        "
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => {
          setHover(false);
          setHoverColor(null);
        }}
      >
        {/* IMAGE (fixed ratio 4:5 cho đồng đều) */}
        <div className="relative w-full aspect-8/10 overflow-hidden bg-gray-100">
          <div
            className={`
              flex w-[200%] h-full 
              transition-transform duration-500 ease-out
              ${hover ? "-translate-x-1/2" : "translate-x-0"}
            `}
          >
            {/* Main Image */}
            <div className="relative w-1/2 h-full">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="100%"
              />
            </div>

            {/* Preview Image */}
            <div className="relative w-1/2 h-full">
              <Image
                src={product.preview || product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="100%"
              />
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col p-3 md:p-4 flex-1">
          {/* NAME */}
          <h3 className="text-sm md:text-base font-semibold mb-2 line-clamp-2 min-h-[42px]">
            {product.name}
          </h3>

          {/* COLORS */}
          <div className="flex gap-2 mb-3">
            {product.colors.map((c: string, i: number) => {
              const normalized = c.toLowerCase();
              const bgClass = colorMap[normalized] || colorMap.default;

              return (
                <div
                  key={i}
                  className={`
                    w-4 h-4 md:w-5 md:h-5 rounded-full border ${bgClass}
                    relative cursor-pointer
                  `}
                  onMouseEnter={() => setHoverColor(c)}
                  onMouseLeave={() => setHoverColor(null)}
                >
                  {/* Tooltip */}
                  {hoverColor === c && (
                    <div
                      className="
                        absolute -top-9 left-1/2 -translate-x-1/2
                        bg-black text-white text-xs py-1.5 px-3
                        rounded-lg shadow-lg
                        whitespace-nowrap pointer-events-none z-20
                      "
                    >
                      {c}
                      <div
                        className="
                          absolute left-1/2 -bottom-1 -translate-x-1/2
                          w-0 h-0 border-l-6 border-r-6 border-t-6
                          border-l-transparent border-r-transparent border-t-black
                        "
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* PRICE (luôn ở cuối) */}
<div className="mt-auto">
  {hasSale ? (
    <div className="flex items-end gap-2">
      <div className="text-base md:text-lg font-bold">
        {product.salePrice.toLocaleString("vi-VN")} ₫
      </div>
      <div className="text-xs md:text-sm text-muted-foreground line-through">
        {product.price.toLocaleString("vi-VN")} ₫
      </div>
    </div>
  ) : (
    <div className="text-base md:text-lg font-bold">
      {product.price.toLocaleString("vi-VN")} ₫
    </div>
  )}
</div>
        </div>
      </Card>
    </Link>
  );
}
