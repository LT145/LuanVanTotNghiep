"use client";

import { useEffect, useState } from "react";
import AddProductDialog from "./AddProductDialog/AddProductDialog";
import Image from "next/image";

type MainCategory = {
  id: string;
  name: string;
};

type SubCategory = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  mainImage?: string | null;
};

export default function ProductManager() {
  const [loading, setLoading] = useState(true);

  // Danh sách category cha
  const [mains, setMains] = useState<MainCategory[]>([]);

  // Mỗi mainCategoryId -> danh sách subCategories
  const [subs, setSubs] = useState<Record<string, SubCategory[]>>({});

  // Mỗi subCategoryId -> danh sách products
  const [products, setProducts] = useState<Record<string, Product[]>>({});

  // ID đang mở
  const [openMainId, setOpenMainId] = useState<string | null>(null);
  const [openSubId, setOpenSubId] = useState<string | null>(null);

  // 🌀 Lấy danh mục chính
  const fetchMains = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();

    // data.data mong đợi phải là [{ id: string, name: string }, ...]
    setMains(data.data || []);
  };

  // 🌀 Lấy sub category theo main
  const fetchSubs = async (mainId: string) => {
    const res = await fetch(`/api/categories/${mainId}/subcategories`);
    const data = await res.json();

    // data.data mong đợi phải là [{ id: string, name: string }, ...]
    setSubs((prev) => ({
      ...prev,
      [mainId]: data.data || [],
    }));
  };

  // 🌀 Lấy sản phẩm theo sub category
  const fetchProducts = async (subId: string) => {
    const res = await fetch(`/api/categories/subcategories/${subId}/products`);
    const data = await res.json();

    // API backend mình đã viết trả về:
    // { success: true, data: [ { id, name, price, mainImage }, ... ] }
    setProducts((prev) => ({
      ...prev,
      [subId]: data.data || [],
    }));
  };

  // Load danh mục chính khi vào trang
  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchMains();
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500 mt-10">Đang tải danh mục...</p>;
  }

  return (
    <div className="relative rounded-xl border bg-white p-6 shadow-sm min-h-[70vh]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 top-50">
        <h2 className="text-2xl font-bold text-gray-800">📦 Quản lý sản phẩm</h2>
        <AddProductDialog  />
      </div>

      {/* Danh sách MainCategory */}
      <div className="space-y-4">
        {mains.map((main) => (
          <div key={main.id} className="border rounded-lg">
            {/* Hàng danh mục chính */}
            <div
              onClick={async () => {
                const newOpen = openMainId === main.id ? null : main.id;
                setOpenMainId(newOpen);

                // Nếu vừa mở và chưa fetch subcategories thì fetch
                if (newOpen && !subs[main.id]) {
                  await fetchSubs(main.id);
                }

                // Khi đóng main category thì đóng luôn sub đang mở
                if (!newOpen) {
                  setOpenSubId(null);
                }
              }}
              className="flex justify-between items-center px-4 py-3 cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
            >
              <span className="font-semibold text-gray-800">{main.name}</span>
              <span className="text-gray-500">{openMainId === main.id ? "▲" : "▼"}</span>
            </div>

            {/* Danh sách SubCategory */}
            {openMainId === main.id && subs[main.id] && (
              <div className="pl-6 pr-4 pb-4 space-y-2 bg-gray-50 border-t">
                {subs[main.id].length > 0 ? (
                  subs[main.id].map((sub) => (
                    <div key={sub.id} className="border rounded-md">
                      <div
                        onClick={async () => {
                          const newSubOpen = openSubId === sub.id ? null : sub.id;
                          setOpenSubId(newSubOpen);

                          // nếu vừa mở và chưa fetch products thì fetch
                          if (newSubOpen && !products[sub.id]) {
                            await fetchProducts(sub.id);
                          }
                        }}
                        className="flex justify-between items-center px-3 py-2 cursor-pointer bg-white hover:bg-gray-100"
                      >
                        <span className="text-gray-700">{sub.name}</span>
                        <span className="text-gray-400 text-sm">
                          {openSubId === sub.id ? "▲" : "▼"}
                        </span>
                      </div>

                      {/* Danh sách sản phẩm của subcategory */}
                      {openSubId === sub.id && products[sub.id] && (
                        <ul className="pl-6 py-2 text-sm text-gray-600 space-y-2">
                          {products[sub.id].length > 0 ? (
                            products[sub.id].map((p) => (
                              <li
                                key={p.id}
                                className="flex justify-between items-center border-b pb-2 last:border-b-0"
                              >
                                <div className="flex items-center gap-2">
                                  {p.mainImage ? (
                                    <div className="relative w-8 h-8">
                                      <Image
                                        src={p.mainImage}
                                        alt={p.name}
                                        fill
                                        className="rounded object-cover border"
                                        sizes="32px"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 rounded border bg-gray-100 text-[10px] flex items-center justify-center text-gray-400 italic">
                                      no img
                                    </div>
                                  )}
                                  <span className="text-gray-700">{p.name}</span>
                                </div>


                                <span className="text-gray-500 whitespace-nowrap">
                                  {p.price.toLocaleString()}₫
                                </span>
                              </li>
                            ))
                          ) : (
                            <li className="italic text-gray-400">
                              Chưa có sản phẩm nào
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="italic text-gray-400 text-sm pl-2">
                    Chưa có danh mục con
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Nếu chưa có danh mục chính */}
      {mains.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          Chưa có danh mục nào. Hãy tạo danh mục trước khi thêm sản phẩm.
        </p>
      )}
    </div>
  );
}
