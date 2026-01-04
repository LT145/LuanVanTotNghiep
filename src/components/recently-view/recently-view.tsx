"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

function formatVND(v: number) {
  return v.toLocaleString("vi-VN") + "₫";
}

export default function RecentlyViewedProducts() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<any[]>([]);

  // ✅ Hooks phải luôn được gọi, không được return sớm trước useEffect
  useEffect(() => {
    // Chỉ fetch khi đã đăng nhập
    if (status !== "authenticated" || !session) return;

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/products/recently-viewed", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          setProducts([]);
          return;
        }

        const data = await res.json();
        if (data?.success) setProducts(data.data || []);
        else setProducts([]);
      } catch (err: any) {
        // Abort thì bỏ qua
        if (err?.name === "AbortError") return;
        setProducts([]);
      }
    })();

    return () => controller.abort();
  }, [status, session]);

  // ✅ Render điều kiện nằm sau hooks
  if (status === "loading") return null;
  if (status !== "authenticated" || !session) return null;
  if (products.length === 0) return null;

  return (
    <section className="py-20 bg-secondary">
      <div className="custom-container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Sản Phẩm Đã Xem Gần Đây</h2>
          <p className="text-lg text-muted-foreground">
            Những sản phẩm bạn đã xem gần đây
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((item) => {
            const basePrice = Number(item.basePrice || 0);
            const promo =
              item.minPromoPrice != null ? Number(item.minPromoPrice) : null;
            const hasPromo =
              promo != null && promo > 0 && promo < basePrice;

            const href = `/${String(item.category?.gender || "")
              .toLowerCase()}/${item.category?.slug}/${item.slug}`;

            const img =
              item.images?.find((i: any) => i.isMain)?.url ||
              item.images?.[0]?.url ||
              "/placeholder.png";

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
                </div>

                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">
                    {item.name}
                  </h3>

                  {!hasPromo ? (
                    <div className="text-lg font-bold">
                      {formatVND(basePrice)}
                    </div>
                  ) : (
                    <div className="flex items-end gap-2">
                      <div className="text-lg font-bold text-red-600">
                        {formatVND(promo!)}
                      </div>
                      <div className="text-sm text-muted-foreground line-through">
                        {formatVND(basePrice)}
                      </div>
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
