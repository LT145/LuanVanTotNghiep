"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Category {
  id: string;
  name: string;
  gender: string;
  imageUrl?: string | null;
}

export default function AddCategoryForm({
  gender,
  onAdded,
  onSuccess,
}: {
  gender?: string;
  onAdded: (newCategory: Category) => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ==========================
  // 🟦 Tạo Category
  // ==========================
  const handleAdd = async () => {
    if (!gender) return alert("⚠️ Bạn chưa chọn giới tính!");
    if (!name.trim()) return alert("⚠️ Vui lòng nhập tên danh mục!");

    try {
      setLoading(true);

      // 🔥 FormData để gộp ảnh + text
      const form = new FormData();
      form.append("name", name);
      form.append("gender", gender);
      if (image) form.append("file", image);

      const res = await fetch(`/api/categories/${gender}`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        onAdded(data.data);
        onSuccess();
      } else {
        alert(data.message || "❌ Lỗi không xác định");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi khi thêm danh mục");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // 🖼️ Chọn ảnh
  // ==========================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-6 w-full"
    >
      {/* Tên danh mục */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tên danh mục
        </label>
        <Input
          placeholder="VD: Áo thun, Áo khoác..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Upload ảnh */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hình ảnh
        </label>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => document.getElementById("fileInput")?.click()}
            className="flex items-center gap-2"
          >
            <ImagePlus className="w-4 h-4" />
            {image ? "Đổi ảnh" : "Chọn ảnh"}
          </Button>

          <input
            id="fileInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {preview && (
            <motion.img
              src={preview}
              alt="Preview"
              className="w-20 h-20 rounded-lg object-cover border shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}
        </div>
      </div>

      {/* Nút */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onSuccess}>
          Hủy
        </Button>

        <Button
          onClick={handleAdd}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Đang lưu..." : "Lưu danh mục"}
        </Button>
      </div>
    </motion.div>
  );
}
