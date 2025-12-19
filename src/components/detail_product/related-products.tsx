"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"

type PromoSize = { price: number }
type Promotion = { sizes?: PromoSize[] }

type RelatedProduct = {
  id: string
  slug: string
  name: string
  basePrice: number
  images?: { url: string; isMain?: boolean }[]
  promotions?: Promotion[] // ✅ cần API include
}

function formatVND(v: number) {
  return new Intl.NumberFormat("vi-VN").format(v) + "₫"
}

function getMinPromoPrice(p: RelatedProduct) {
  const prices =
    p.promotions?.flatMap((pm) => (pm.sizes || []).map((s) => Number(s.price))).filter((x) => Number.isFinite(x) && x > 0) || []
  return prices.length ? Math.min(...prices) : null
}

export default function RelatedProducts({ slug }: { slug: string }) {
  const [products, setProducts] = useState<RelatedProduct[]>([])

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/products/slug/${slug}/related`)
      const json = await res.json()
      if (json?.success) setProducts(json.data as RelatedProduct[])
    }
    if (slug) load()
  }, [slug])

  if (products.length === 0) return null

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Sản phẩm tương tự</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {products.map((p) => {
          const img =
            p.images?.find((i: any) => i.isMain)?.url ||
            p.images?.[0]?.url ||
            "/no-image.png"

          const minPromo = getMinPromoPrice(p)
          const hasSale = minPromo != null && minPromo > 0 && minPromo < Number(p.basePrice || 0)

          return (
            <Link
              href={`/product/${p.slug}`}
              key={p.id}
              className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-background"
            >
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                <Image
                  src={img}
                  alt={p.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {hasSale && (
                  <div className="absolute top-3 left-3 rounded-full bg-red-600 text-white text-xs font-semibold px-3 py-1">
                    Sale
                  </div>
                )}
              </div>

              <div className="p-3">
                <h3 className="font-semibold mb-2 line-clamp-2">{p.name}</h3>

                {hasSale ? (
                  <div className="flex items-end gap-2">
                    <p className="font-bold text-red-600">{formatVND(minPromo!)}</p>
                    <p className="text-sm text-muted-foreground line-through">{formatVND(Number(p.basePrice || 0))}</p>
                  </div>
                ) : (
                  <p className="font-bold text-primary">{formatVND(Number(p.basePrice || 0))}</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
