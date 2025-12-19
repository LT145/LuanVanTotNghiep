"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import Image from "next/image";

// ✅ Kiểu dữ liệu gallery ảnh
interface GalleryImage {
  id: number;
  file: File;
  preview: string;
}

// ✅ Props của component
interface ProductImagesProps {
  onChange: (data: { mainImage: File | null; gallery: GalleryImage[] }) => void;
}

export default function ProductImages({ onChange }: ProductImagesProps) {
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // 🔄 Gửi thay đổi ra ngoài
useEffect(() => {
  onChange({ mainImage, gallery });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [mainImage, gallery]);


  const addGalleryImages = (files: FileList | null) => {
    if (!files) return;
    const newImgs: GalleryImage[] = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setGallery((prev) => [...prev, ...newImgs]);
  };

  const removeGalleryImage = (id: number) => {
    setGallery((imgs) => imgs.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-3">
      {/* Ảnh đại diện */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Ảnh đại diện sản phẩm
        </label>
        <Button
          type="button"
          variant="outline"
          onClick={() => mainInputRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4 mr-2" /> Chọn ảnh đại diện
        </Button>
        <input
          ref={mainInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setMainImage(file);
              setMainPreview(URL.createObjectURL(file));
            }
          }}
        />
        {mainPreview && (
          <div className="mt-2 w-24 h-24 relative">
            <Image
              src={mainPreview}
              alt="main preview"
              fill
              className="object-cover rounded border"
            />
          </div>
        )}
      </div>

      {/* Gallery */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Ảnh khác (gallery)
        </label>
        <Button
          type="button"
          variant="outline"
          onClick={() => galleryInputRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4 mr-2" /> Thêm ảnh gallery
        </Button>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addGalleryImages(e.target.files)}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {gallery.map((img) => (
            <div key={img.id} className="relative w-20 h-20">
              <Image
                src={img.preview}
                alt="gallery preview"
                fill
                className="rounded object-cover border"
              />
              <button
                onClick={() => removeGalleryImage(img.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow"
                title="Xoá"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
 