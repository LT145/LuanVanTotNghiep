"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Edit2,
  Trash2,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddProductDialog from "../product-manager/AddProductDialog/AddProductDialog";

// =======================
// TYPE DEFINITIONS
// =======================
type ProductVariantSize = {
  id: string;
  size: string;
  stock: number;
  price: number;
};

type ProductVariantColor = {
  id: string;
  color: string;
  sizes: ProductVariantSize[];
};

type Product = {
  id: string;
  name: string;
  costPrice: number;
  basePrice: number;
  sold: number;
  totalStock: number;
  mainImage: string | null;
  variants: ProductVariantColor[];
};

type SubCategory = {
  id: string;
  name: string;
};

type Category = {
  id: string;
  name: string;
  children: SubCategory[];
};

// =======================
// COMPONENT
// =======================
export default function ProductManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  const [expandedSubs, setExpandedSubs] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock">("name");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({});
  const itemsPerPage = 10;

  // 🌀 Lấy danh mục & sản phẩm ban đầu
  useEffect(() => {
    const fetchAll = async () => {
      // 1️⃣ Lấy danh mục cha
      const res = await fetch("/api/categories");
      const data = await res.json();
      const cats: Category[] = data.data || [];
      setCategories(cats);

      // 2️⃣ Lấy sản phẩm của tất cả subcategories
      const allProducts: Record<string, Product[]> = {};

      await Promise.all(
        cats.flatMap((main: Category) =>
          main.children.map(async (sub: SubCategory) => {
            const res2 = await fetch(
              `/api/categories/subcategories/${sub.id}/products`
            );
            const data2 = await res2.json();
            const mapped: Product[] = (data2.data || []).map((p: Product) => ({
              ...p,
              totalStock:
                p.variants
                  ?.flatMap((c: ProductVariantColor) =>
                    c.sizes.map((s: ProductVariantSize) => s.stock)
                  )
                  .reduce((a, b) => a + b, 0) ?? 0,
            }));
            allProducts[sub.id] = mapped;
          })
        )
      );

      setProducts(allProducts);
      setExpandedSubs([]); // không mở sub nào khi load
    };

    fetchAll();
  }, []);

  // 🌀 Lấy sản phẩm theo danh mục con
  const fetchProducts = async (subId: string) => {
    const res = await fetch(`/api/categories/subcategories/${subId}/products`);
    const data = await res.json();
    const mapped: Product[] = (data.data || []).map((p: Product) => ({
      ...p,
      basePrice: p.basePrice ?? p.costPrice ?? 0,
      totalStock:
        p.variants
          ?.flatMap((c: ProductVariantColor) =>
            c.sizes.map((s: ProductVariantSize) => s.stock)
          )
          .reduce((a, b) => a + b, 0) ?? 0,
    }));
    setProducts((prev) => ({ ...prev, [subId]: mapped }));
  };

  const toggleSub = async (subId: string) => {
    const opened = expandedSubs.includes(subId);
    if (opened) {
      setExpandedSubs(expandedSubs.filter((id) => id !== subId));
    } else {
      setExpandedSubs([...expandedSubs, subId]);
      if (!products[subId]) await fetchProducts(subId);
    }
  };

  const getFilteredSorted = (items: Product[]) => {
    const filtered = items.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    filtered.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return a.basePrice - b.basePrice;
      if (sortBy === "stock") return b.totalStock - a.totalStock;
      return 0;
    });
    return filtered;
  };

  const paginate = (items: Product[], key: string) => {
    const filtered = getFilteredSorted(items);
    const page = currentPage[key] || 1;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return {
      items: filtered.slice(start, end),
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
      currentPage: page,
    };
  };

  // =======================
  // RENDER
  // =======================
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
          <p className="text-gray-500 mt-1">Quản lý theo danh mục</p>
        </div>
        <AddProductDialog />
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Tìm sản phẩm..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "name" | "price" | "stock")}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium hover:border-gray-400"
        >
          <option value="name">Sắp xếp: Tên A-Z</option>
          <option value="price">Sắp xếp: Giá thấp → cao</option>
          <option value="stock">Sắp xếp: Tồn kho cao → thấp</option>
        </select>
      </div>

      {/* Danh mục */}
      {categories.map((main) => (
        <div key={main.id} className="border rounded-lg">
          <div className="bg-gray-100 font-semibold px-5 py-3 border-b">
            {main.name}
          </div>
          {main.children?.map((sub) => {
            const isExpanded = expandedSubs.includes(sub.id);
            const { items, total, totalPages, currentPage: page } = paginate(
              products[sub.id] || [],
              sub.id
            );

            return (
              <div key={sub.id}>
                <button
                  onClick={() => toggleSub(sub.id)}
                  className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100"
                >
                  <h3 className="font-semibold">{sub.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{total} sản phẩm</span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-5 border-t bg-white">
                    {items.length === 0 ? (
                      <p className="text-gray-400 italic text-center py-4">
                        Chưa có sản phẩm
                      </p>
                    ) : (
                      <>
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-3 py-2">Sản phẩm</th>
                              <th className="text-right px-3 py-2">Giá nhập</th>
                              <th className="text-right px-3 py-2">Giá bán</th>
                              <th className="text-right px-3 py-2">Tồn</th>
                              <th className="text-center px-3 py-2">Chi tiết</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((p) => (
                              <tr key={p.id} className="border-b hover:bg-gray-50">
                                <td className="px-3 py-2 flex items-center gap-3">
                                  {p.mainImage ? (
                                    <div className="relative w-10 h-10">
                                      <Image
                                        src={p.mainImage}
                                        alt={p.name}
                                        fill
                                        className="rounded object-cover"
                                        sizes="40px"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded text-xs text-gray-400">
                                      no img
                                    </div>
                                  )}
                                  <span>{p.name}</span>
                                </td>
                                <td className="text-right px-3 py-2">
                                  ₫{p.costPrice.toLocaleString()}
                                </td>
                                <td className="text-right px-3 py-2 font-semibold">
                                  ₫{p.basePrice.toLocaleString()}
                                </td>
                                <td className="text-right px-3 py-2">
                                  {p.totalStock}
                                </td>
                                <td className="text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedProduct(p)}
                                  >
                                    Chi tiết
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {totalPages > 1 && (
                          <div className="flex justify-between items-center pt-4">
                            <span className="text-sm text-gray-500">
                              Trang {page}/{totalPages}
                            </span>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() =>
                                  setCurrentPage((prev) => ({
                                    ...prev,
                                    [sub.id]: Math.max(1, page - 1),
                                  }))
                                }
                              >
                                <ChevronLeft size={16} /> Trước
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={page === totalPages}
                                onClick={() =>
                                  setCurrentPage((prev) => ({
                                    ...prev,
                                    [sub.id]: Math.min(totalPages, page + 1),
                                  }))
                                }
                              >
                                Sau <ChevronRight size={16} />
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Modal Chi tiết */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-white">
              <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Giá nhập</p>
                  <p className="text-lg font-bold">
                    ₫{selectedProduct.costPrice.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Giá bán</p>
                  <p className="text-lg font-bold">
                    ₫{selectedProduct.basePrice.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Tồn</p>
                  <p className="text-lg font-bold">{selectedProduct.totalStock}</p>
                </div>
              </div>

              {selectedProduct.variants.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Biến thể</h3>
                  {selectedProduct.variants.map((color) => (
                    <div key={color.id} className="border p-3 rounded mb-3">
                      <h4 className="font-semibold mb-1">Màu: {color.color}</h4>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="text-left px-2 py-1">Size</th>
                            <th className="text-right px-2 py-1">Tồn</th>
                            <th className="text-right px-2 py-1">Giá</th>
                          </tr>
                        </thead>
                        <tbody>
                          {color.sizes.map((s) => (
                            <tr key={s.id} className="border-b">
                              <td className="px-2 py-1">{s.size}</td>
                              <td className="px-2 py-1 text-right">{s.stock}</td>
                              <td className="px-2 py-1 text-right">
                                ₫{s.price.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1 gap-1">
                  <Edit2 size={18} /> Chỉnh sửa
                </Button>
                <Button variant="destructive" className="flex-1 gap-1">
                  <Trash2 size={18} /> Xóa
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
