"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function formatVND(v: number) {
  return v.toLocaleString("vi-VN") + "₫";
}

export default function BestSellerProducts() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products/best-sellers", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) setProducts(data.data || []);
      })
      .catch(() => setProducts([]));
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-20 bg-secondary">
      <div className="custom-container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Sản Phẩm Bán Chạy</h2>
          <p className="text-lg text-muted-foreground">Những sản phẩm được yêu thích nhất</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((item) => {
            const basePrice = Number(item.basePrice || 0);
            const promo = item.minPromoPrice != null ? Number(item.minPromoPrice) : null;
            const hasPromo = promo != null && promo > 0 && promo < basePrice;

            const href = `/${String(item.category?.gender || "")
              .toLowerCase()}/${item.category?.slug}/${item.slug}`;

            const img = item.images?.find((i: any) => i.isMain)?.url || item.images?.[0]?.url || "/placeholder.png";

            return (
              <Link
                key={item.id}
                href={href}
                onClick={() => window.scrollTo(0, 0)}
                className="bg-background rounded-xl overflow-hidden group cursor-pointer border hover:shadow-md transition-shadow"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={img}
                    alt={item.name}
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {hasPromo && (
                    <div className="absolute top-3 left-3 rounded-full bg-red-600 text-white text-xs font-semibold px-3 py-1">
                      Giảm
                    </div>
                  )}

                  {/* Nếu muốn show soldCount */}
                  {/* <div className="absolute top-3 right-3 rounded-full bg-black/70 text-white text-xs font-semibold px-3 py-1">
                    Đã bán {item.soldCount}
                  </div> */}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{item.name}</h3>

                  {!hasPromo ? (
                    <div className="text-lg font-bold">{formatVND(basePrice)}</div>
                  ) : (
                    <div className="flex items-end gap-2">
                      <div className="text-lg font-bold text-red-600">{formatVND(promo!)}</div>
                      <div className="text-sm text-muted-foreground line-through">{formatVND(basePrice)}</div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
