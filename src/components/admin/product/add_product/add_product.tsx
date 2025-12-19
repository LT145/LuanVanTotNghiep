"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import ProductBasicInfo from "./components/ProductBasicInfo";
import ProductCategorySelector from "./components/ProductCategorySelector";
import ProductImages from "./components/ProductImages";
import ProductVariants from "./components/ProductVariants";

interface ColorSize {
  size: string;
  price: number | "";
  stock: number | "";
}

interface ColorVariant {
  color: string;
  image?: File | null;
  sizes: ColorSize[];
}

interface GalleryImage {
  file: File;
}

interface ProductFormData {
  name: string;
  material: string;
  costPrice: number;
  basePrice: number;
  isActive: boolean;
  mainCategoryId: string;
  subCategoryId?: string;
  mainImage: File | null;
  gallery: GalleryImage[];
  colorVariants: ColorVariant[];
  description: string;
}

export default function AddProductForm() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    material: "",
    costPrice: 0,
    basePrice: 0,
    isActive: true,
    mainCategoryId: "",
    subCategoryId: "",
    mainImage: null,
    gallery: [],
    colorVariants: [],
    description: "",
  });

  const handleChange = useCallback((data: Partial<ProductFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  // ================= SUBMIT ====================
  const handleSubmit = async () => {
    const {
      name,
      material,
      costPrice,
      basePrice,
      isActive,
      mainCategoryId,
      subCategoryId,
      mainImage,
      gallery,
      colorVariants,
      description,
    } = formData;

    // VALIDATION
    if (!name.trim() || !basePrice || !costPrice) {
      alert("⚠️ Vui lòng nhập đầy đủ thông tin sản phẩm và giá hợp lệ!");
      return;
    }

    if (!mainCategoryId || !subCategoryId) {
      alert("⚠️ Vui lòng chọn đối tượng và danh mục!");
      return;
    }

    if (!mainImage) {
      alert("⚠️ Vui lòng chọn ảnh đại diện cho sản phẩm!");
      return;
    }

    const invalidVariant = colorVariants.some((c) => {
      if (!c.color.trim()) return true;
      return c.sizes.some(
        (s) => !s.size.trim() || s.price === "" || s.stock === ""
      );
    });

    if (invalidVariant) {
      alert("⚠️ Vui lòng điền đầy đủ thông tin biến thể (màu, size, giá, kho)!");
      return;
    }

    // Submit
    try {
      setLoading(true);

      let finalDescription = description || "";

      // replace local images inside description
      const imgTags = Array.from(
        finalDescription.matchAll(/<img[^>]+src="([^">]+)"/g)
      ).map((m) => m[1]);

      const localImages = imgTags.filter(
        (src) => src.startsWith("blob:") || src.startsWith("data:")
      );

      for (const src of localImages) {
        const res = await fetch(src);
        const blob = await res.blob();
        const file = new File([blob], "desc-image.png", { type: blob.type });
        const uploadForm = new FormData();
        uploadForm.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadForm,
        });

        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.url) {
          finalDescription = finalDescription.replace(src, uploadData.url);
        }
      }

      // Build FormData
      const productForm = new FormData();
      productForm.append("name", name);
      productForm.append("material", material || "");
      productForm.append("costPrice", String(costPrice));
      productForm.append("basePrice", String(basePrice));
      productForm.append("isActive", String(isActive));
      productForm.append("mainCategoryId", mainCategoryId);
      if (subCategoryId) productForm.append("subCategoryId", subCategoryId);
      productForm.append("description", finalDescription);

      if (mainImage) productForm.append("mainImage", mainImage);
      gallery.forEach((img) => productForm.append("galleryImages", img.file));

      if (colorVariants?.length) {
        productForm.append("colorVariants", JSON.stringify(colorVariants));
        colorVariants.forEach((c, i) => {
          if (c.image) productForm.append(`colorImage_${i}`, c.image);
        });
      }

      const res = await fetch("/api/products", {
        method: "POST",
        body: productForm,
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Sản phẩm đã được lưu thành công!");

        // reset form
        setFormData({
          name: "",
          material: "",
          costPrice: 0,
          basePrice: 0,
          isActive: true,
          mainCategoryId: "",
          subCategoryId: "",
          mainImage: null,
          gallery: [],
          colorVariants: [],
          description: "",
        });
      } else {
        alert("❌ Lỗi khi lưu sản phẩm!");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Có lỗi khi upload hoặc lưu sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  // ===========================================================
  // UI BẮT ĐẦU Ở ĐÂY — KHÔNG CÒN DIALOG NỮA
  // ===========================================================

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Plus className="w-5 h-5" /> Thêm sản phẩm mới
      </h2>

      <div className="space-y-6">
        <ProductBasicInfo onChange={handleChange} />
        <ProductCategorySelector onChange={handleChange} />
        <ProductImages onChange={handleChange} />
        <ProductVariants
          basePrice={Number(formData.basePrice)}
          onChange={(data) =>
            handleChange({ colorVariants: data.colorVariants })
          }
        />

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-11 text-base"
        >
          {loading ? "Đang lưu..." : "💾 Lưu sản phẩm"}
        </Button>
      </div>
    </div>
  );
}
