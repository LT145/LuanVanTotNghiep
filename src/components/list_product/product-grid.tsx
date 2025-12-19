"use client";

import { ProductCard } from "./product-card";

export function ProductGrid({
  products,
  gender,
  category
}: {
  products: any[];
  gender: string;
  category: string;
}) {
  return (
    <div className="custom-container mx-auto px-4 py-6">
      <div
        className="
          grid
          grid-cols-2 
          md:grid-cols-3
          xl:grid-cols-4
          gap-5
        "
      >
        {products.map((p) => {
          const imageArray = Array.isArray(p.images) ? p.images : [];
          const mainImage =
            imageArray.find((i: any) => i.isMain)?.url ||
            p.images?.main ||
            p.images?.url ||
            "/no-image.png";

          const previewImage =
            imageArray[0]?.url ||
            p.images?.preview ||
            mainImage;

          const colors = Array.isArray(p.variantColors)
            ? p.variantColors.map((v: any) => v.color?.toLowerCase?.() || "")
            : [];
const basePrice = Number(p.basePrice || 0)
const minPromoPrice = p.minPromoPrice != null ? Number(p.minPromoPrice) : null

const salePrice =
  minPromoPrice != null && minPromoPrice > 0 && minPromoPrice < basePrice ? minPromoPrice : null

          return (
<ProductCard
  key={p.id}
  gender={gender}
  category={category}
  product={{
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: basePrice,
    salePrice, // ✅
    image: mainImage,
    preview: previewImage,
    colors,
  }}
/>
          );
        })}
      </div>
    </div>
  );
}
