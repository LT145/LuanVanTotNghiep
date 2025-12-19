// app/search/page.tsx

import { ProductHeader } from "@/components/list_product/product-header";
import { ProductGrid } from "@/components/list_product/product-grid";
import { searchProductsServer } from "@/lib/api/server/search";

export default async function SearchPage({ searchParams }: any) {
  const params = await searchParams;   // ⭐ UNWRAP PROMISE

  const q = params.q || "";

  const products = await searchProductsServer(q);

  return (
    <>
      <ProductHeader
        gender="search"
        categoryName={`Kết quả cho "${q}"`}
        productCount={products.length}
      />

      <ProductGrid
        products={products}
        gender="search"
        category="search-result"
      />
    </>
  );
}
