// app/admin/products/page.tsx
import ProductManager from "@/components/admin/product-manager";

export const dynamic = "force-dynamic"; // luôn fetch mới

export default function AdminProductsPage() {
  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">👑 Quản lý sản phẩm</h1>
      <ProductManager />
    </main>
  );
}
