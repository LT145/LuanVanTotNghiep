"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image"; // ✅ dùng next/image thay cho img

// 🧩 Kiểu dữ liệu cho biến thể
export interface SizeVariant {
  id: number;
  size: string;
  price: number | "";
  stock: number | "";
}

export interface ColorVariant {
  id: number;
  color: string;
  image?: File | null;
  preview?: string | null;
  isDefault?: boolean;
  sizes: SizeVariant[];
}

// 🧩 Props
interface ProductVariantsProps {
  onChange: (data: { colorVariants: ColorVariant[]; samePrice: boolean }) => void;
  basePrice: number;
}

export default function ProductVariants({ onChange, basePrice }: ProductVariantsProps) {
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);
  const [samePrice, setSamePrice] = useState(true);

  // ✅ Có 1 màu mặc định
  useEffect(() => {
    if (colorVariants.length === 0) {
      setColorVariants([
        {
          id: Date.now(),
          color: "",
          isDefault: true,
          image: null,
          preview: null,
          sizes: [{ id: Date.now() + 1, size: "", price: basePrice, stock: 0 }],
        },
      ]);
    }
  }, [colorVariants.length, basePrice]); // ✅ thêm basePrice để fix warning

  // ✅ Đồng bộ dữ liệu ra ngoài
useEffect(() => {
  onChange({ colorVariants, samePrice });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [colorVariants, samePrice]);


  // ✅ Khi bật “Đồng giá”, tự cập nhật giá = basePrice
  useEffect(() => {
    if (samePrice) {
      setColorVariants((prev) =>
        prev.map((c) => ({
          ...c,
          sizes: c.sizes.map((s) => ({ ...s, price: basePrice })),
        }))
      );
    }
  }, [basePrice, samePrice]); // ✅ thêm basePrice để fix warning

  // ➕ Thêm màu
  const addColorVariant = () => {
    setColorVariants((prev) => [
      ...prev,
      {
        id: Date.now(),
        color: "",
        image: null,
        preview: null,
        isDefault: false,
        sizes: [{ id: Date.now() + 1, size: "", price: basePrice, stock: 0 }],
      },
    ]);
  };

  // ❌ Xóa màu (giữ lại màu mặc định)
  const removeColorVariant = (colorId: number) => {
    setColorVariants((prev) => prev.filter((c) => c.id !== colorId || c.isDefault));
  };

  // ➕ Thêm size
  const addSizeVariant = (colorId: number) => {
    setColorVariants((prev) =>
      prev.map((c) =>
        c.id === colorId
          ? {
              ...c,
              sizes: [
                ...c.sizes,
                { id: Date.now(), size: "", price: samePrice ? basePrice : 0, stock: 0 },
              ],
            }
          : c
      )
    );
  };

  // ❌ Xóa size
  const removeSizeVariant = (colorId: number, sizeId: number) => {
    setColorVariants((prev) =>
      prev.map((c) =>
        c.id === colorId ? { ...c, sizes: c.sizes.filter((s) => s.id !== sizeId) } : c
      )
    );
  };

  // 🔄 Cập nhật trường màu hoặc ảnh
  const updateColorField = (
    colorId: number,
    key: keyof Pick<ColorVariant, "color" | "image" | "preview">,
    value: string | File | null
  ) => {
    setColorVariants((prev) =>
      prev.map((c) => (c.id === colorId ? { ...c, [key]: value } : c))
    );
  };

  // 🔄 Cập nhật size
  const updateSizeField = (
    colorId: number,
    sizeId: number,
    key: keyof SizeVariant,
    value: string | number | ""
  ) => {
    setColorVariants((prev) =>
      prev.map((c) =>
        c.id === colorId
          ? { ...c, sizes: c.sizes.map((s) => (s.id === sizeId ? { ...s, [key]: value } : s)) }
          : c
      )
    );
  };

  return (
    <div className="space-y-5">
      {/* === Header === */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-lg">🎨 Biến thể sản phẩm</h3>
        <Button variant="outline" size="sm" onClick={addColorVariant}>
          + Thêm màu khác
        </Button>
      </div>

      {/* ✅ Công tắc đồng giá */}
      <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border">
        <Label className="font-medium text-gray-700">Đồng giá bán theo giá cơ bản</Label>
        <Switch checked={samePrice} onCheckedChange={setSamePrice} />
      </div>

      {/* === Danh sách biến thể màu === */}
      {colorVariants.map((c, index) => (
        <div
          key={c.id}
          className={`border rounded-lg p-4 space-y-4 ${
            c.isDefault ? "bg-gray-50 border-gray-300" : "bg-white"
          }`}
        >
          {/* Tiêu đề */}
          <h4 className="font-semibold text-gray-700">
            {c.isDefault ? "🎨 Màu mặc định (Ảnh đại diện)" : `Màu #${index}`}
          </h4>

          {/* Tên màu + ảnh */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Label className="text-sm text-gray-600 mb-1 block">Tên màu</Label>
              <Input
                placeholder={c.isDefault ? "VD: Trắng, Đen..." : "VD: Đỏ, Xanh navy..."}
                value={c.color}
                onChange={(e) => updateColorField(c.id, "color", e.target.value)}
              />
            </div>

            {!c.isDefault && (
              <>
                <div className="flex flex-col items-center justify-center gap-1">
                  <Label className="text-sm text-gray-600">Ảnh màu</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById(`color-img-${c.id}`)?.click()}
                  >
                    <ImagePlus className="h-4 w-4 mr-1" /> Ảnh
                  </Button>
                  <input
                    id={`color-img-${c.id}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const preview = URL.createObjectURL(file);
                        updateColorField(c.id, "image", file);
                        updateColorField(c.id, "preview", preview);
                      }
                    }}
                  />
                </div>

                {c.preview && (
                  <div className="relative w-12 h-12">
                    <Image
                      src={c.preview}
                      alt="Preview"
                      fill
                      className="rounded border object-cover"
                    />
                  </div>
                )}
              </>
            )}

            {!c.isDefault && (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => removeColorVariant(c.id)}
                title="Xóa màu này"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* === Danh sách size === */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-700">
              Danh sách size cho {c.color || (c.isDefault ? "màu mặc định" : `(Màu ${index})`)}
            </Label>

            {/* Header cột */}
            <div
              className={`grid text-xs font-semibold text-gray-500 px-1 ${
                samePrice ? "grid-cols-3" : "grid-cols-4"
              }`}
            >
              <span>Size</span>
              {!samePrice && <span>Giá bán</span>}
              <span>Kho</span>
              <span>Xóa</span>
            </div>

            {/* Dòng dữ liệu */}
            {c.sizes.map((s) => (
              <div
                key={s.id}
                className={`grid gap-2 items-center ${
                  samePrice ? "grid-cols-3" : "grid-cols-4"
                }`}
              >
                <Input
                  placeholder="S, M, L..."
                  value={s.size}
                  onChange={(e) => updateSizeField(c.id, s.id, "size", e.target.value)}
                />

                {!samePrice && (
                  <Input
                    type="number"
                    placeholder="₫ Giá"
                    value={s.price === 0 ? "" : s.price}
                    onChange={(e) =>
                      updateSizeField(
                        c.id,
                        s.id,
                        "price",
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  />
                )}

                {/* Kho */}
                <Input
                  type="number"
                  placeholder="Tồn kho"
                  value={s.stock === 0 ? "" : s.stock}
                  onChange={(e) =>
                    updateSizeField(
                      c.id,
                      s.id,
                      "stock",
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />

                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeSizeVariant(c.id, s.id)}
                  title="Xóa size này"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={() => addSizeVariant(c.id)}>
            + Thêm size
          </Button>
        </div>
      ))}
    </div>
  );
}
