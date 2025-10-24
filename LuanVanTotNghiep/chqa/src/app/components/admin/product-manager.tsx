"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import AddProductDialog from "./product.add-dialog";

type MainCategory = {
  id: number;
  name: string;
};

type SubCategory = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  price: number;
};

export default function ProductManager() {
  const [loading, setLoading] = useState(true);
  const [mains, setMains] = useState<MainCategory[]>([]);
  const [subs, setSubs] = useState<Record<number, SubCategory[]>>({});
  const [products, setProducts] = useState<Record<number, Product[]>>({});
  const [openMainId, setOpenMainId] = useState<number | null>(null);
  const [openSubId, setOpenSubId] = useState<number | null>(null);


  // 🌀 Lấy danh mục chính
  const fetchMains = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setMains(data.data || []);
  };

  // 🌀 Lấy sub category theo main
  const fetchSubs = async (mainId: number) => {
    const res = await fetch(`/api/categories/${mainId}/subcategories`);
    const data = await res.json();
    setSubs((prev) => ({ ...prev, [mainId]: data.data || [] }));
  };

  // 🌀 Lấy sản phẩm theo sub category
  const fetchProducts = async (subId: number) => {
    const res = await fetch(`/api/subcategories/${subId}/products`);
    const data = await res.json();
    setProducts((prev) => ({ ...prev, [subId]: data.data || [] }));
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchMains();
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-center text-gray-500 mt-10">Đang tải danh mục...</p>;

  return (
    <div className="relative rounded-xl border bg-white p-6 shadow-sm min-h-[70vh]">
      {/* Thanh tiêu đề */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📦 Quản lý sản phẩm</h2>
        <AddProductDialog />
      </div>

      {/* Danh sách danh mục chính */}
      <div className="space-y-4">
        {mains.map((main) => (
          <div key={main.id} className="border rounded-lg">
            {/* Hàng danh mục chính */}
            <div
              onClick={async () => {
                const newOpen = openMainId === main.id ? null : main.id;
                setOpenMainId(newOpen);
                if (newOpen && !subs[main.id]) await fetchSubs(main.id);
              }}
              className="flex justify-between items-center px-4 py-3 cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
            >
              <span className="font-semibold text-gray-800">{main.name}</span>
              <span className="text-gray-500">{openMainId === main.id ? "▲" : "▼"}</span>
            </div>

            {/* Danh sách Sub Category */}
            {openMainId === main.id && subs[main.id] && (
              <div className="pl-6 pr-4 pb-4 space-y-2 bg-gray-50 border-t">
                {subs[main.id].map((sub) => (
                  <div key={sub.id} className="border rounded-md">
                    <div
                      onClick={async () => {
                        const newSubOpen = openSubId === sub.id ? null : sub.id;
                        setOpenSubId(newSubOpen);
                        if (newSubOpen && !products[sub.id]) await fetchProducts(sub.id);
                      }}
                      className="flex justify-between items-center px-3 py-2 cursor-pointer bg-white hover:bg-gray-100"
                    >
                      <span className="text-gray-700">{sub.name}</span>
                      <span className="text-gray-400 text-sm">
                        {openSubId === sub.id ? "▲" : "▼"}
                      </span>
                    </div>

                    {/* Danh sách sản phẩm */}
                    {openSubId === sub.id && products[sub.id] && (
                      <ul className="pl-6 py-2 text-sm text-gray-600 space-y-1">
                        {products[sub.id].length > 0 ? (
                          products[sub.id].map((p) => (
                            <li key={p.id} className="flex justify-between border-b py-1">
                              <span>{p.name}</span>
                              <span className="text-gray-500">{p.price.toLocaleString()}₫</span>
                            </li>
                          ))
                        ) : (
                          <li className="italic text-gray-400">Chưa có sản phẩm nào</li>
                        )}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Gợi ý nếu chưa có danh mục */}
      {mains.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          Chưa có danh mục nào. Hãy tạo danh mục trước khi thêm sản phẩm.
        </p>
      )}
    </div>
  );
}
