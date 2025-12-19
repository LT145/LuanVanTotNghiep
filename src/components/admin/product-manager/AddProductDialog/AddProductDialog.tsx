"use client";

import { useCallback, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

export default function AddProductDialog() {
  const [open, setOpen] = useState(false);
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
        setOpen(false);

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Trigger: dùng thẳng trong file */}
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Thêm sản phẩm
        </Button>
      </DialogTrigger>

      {/* CONTENT: luôn nằm chính giữa, không bị lệch */}
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl center fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <DialogHeader>
          <DialogTitle>🛍️ Thêm sản phẩm mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-3">
          <ProductBasicInfo onChange={handleChange} />
          <ProductCategorySelector onChange={handleChange} />
          <ProductImages onChange={handleChange} />
          <ProductVariants
            basePrice={Number(formData.basePrice)}
            onChange={(data) =>
              handleChange({ colorVariants: data.colorVariants })
            }
          />

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Đang lưu..." : "💾 Lưu sản phẩm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
