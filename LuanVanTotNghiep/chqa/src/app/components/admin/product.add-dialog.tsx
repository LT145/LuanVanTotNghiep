"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandEmpty,
} from "@/components/ui/command";
import { ChevronsUpDown, Plus, Trash2, ImagePlus } from "lucide-react";

// TipTap (Rich Text)
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontSize } from "@/lib/tiptap/FontSize";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Paragraph from "@tiptap/extension-paragraph";
import Document from "@tiptap/extension-document";
import Text from "@tiptap/extension-text";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
// ===== Types =====
type MainCategory = { id: number; name: string };
type SubCategory = { id: number; name: string; mainCategoryId: number };

type SizeVariant = {
  id: number; // FE-only
  size: string;
  price: number | "";
  stock: number | "";
};

type ColorVariant = {
  id: number; // FE-only
  color: string;
  image?: File | null;
  preview?: string | null;
  sizes: SizeVariant[];
};

type GalleryImage = { id: number; file: File; preview: string };

export default function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🧩 Danh mục
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedMain, setSelectedMain] = useState<MainCategory | null>(null);
  const [selectedSub, setSelectedSub] = useState<SubCategory | null>(null);
  const [openMainPopover, setOpenMainPopover] = useState(false);
  const [openSubPopover, setOpenSubPopover] = useState(false);

  // 🧾 Thông tin sản phẩm
  const [name, setName] = useState("");
  const [description, setDescription] = useState(""); // HTML từ TipTap
  const [brand, setBrand] = useState("");
  const [material, setMaterial] = useState("");
  const [basePrice, setBasePrice] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);

  // 🖼️ Ảnh đại diện
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const mainInputRef = useRef<HTMLInputElement>(null);

  // 🖼️ Ảnh gallery
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // 🎨 Biến thể MÀU → SIZE
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);

  // ======= Fetch danh mục =======
  const fetchMainCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    if (data.success) setMainCategories(data.data);
  };

  const fetchSubCategories = async (mainId: number) => {
    const res = await fetch(`/api/categories/${mainId}/subcategories`);
    const data = await res.json();
    if (data.success) setSubCategories(data.data);
  };

  useEffect(() => {
    if (open) fetchMainCategories();
  }, [open]);

  // ======= Gallery handlers =======
  const addGalleryImages = (files: FileList | null) => {
    if (!files) return;
    const newImgs = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setGallery((prev) => [...prev, ...newImgs]);
  };
  const removeGalleryImage = (id: number) => setGallery((imgs) => imgs.filter((i) => i.id !== id));

  // ======= Color/Size handlers =======
  const addColorVariant = () => {
    setColorVariants((prev) => [
      ...prev,
      {
        id: Date.now(),
        color: "",
        image: null,
        preview: null,
        sizes: [
          { id: Date.now() + 1, size: "", price: basePrice === "" ? "" : Number(basePrice), stock: 0 },
        ],
      },
    ]);
  };

  const removeColorVariant = (colorId: number) => {
    setColorVariants((prev) => prev.filter((c) => c.id !== colorId));
  };

  const addSizeVariant = (colorId: number) => {
    setColorVariants((prev) =>
      prev.map((c) =>
        c.id === colorId
          ? {
              ...c,
              sizes: [
                ...c.sizes,
                { id: Date.now(), size: "", price: basePrice === "" ? "" : Number(basePrice), stock: 0 },
              ],
            }
          : c
      )
    );
  };

  const removeSizeVariant = (colorId: number, sizeId: number) => {
    setColorVariants((prev) =>
      prev.map((c) => (c.id === colorId ? { ...c, sizes: c.sizes.filter((s) => s.id !== sizeId) } : c))
    );
  };

  const updateColorField = (colorId: number, key: "color" | "image" | "preview", value: any) => {
    setColorVariants((prev) => prev.map((c) => (c.id === colorId ? { ...c, [key]: value } : c)));
  };

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

  // ======= TipTap (SSR-safe) =======
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

const editor = useEditor({
  extensions: [
    // ✅ Tự build StarterKit không có textStyle
    Document,
    Paragraph,
    Text,
    Bold,
    Italic,
    Strike,
    ListItem,
    BulletList,
    OrderedList,

    // ✅ Sau đó thêm TextStyle + FontSize
    TextStyle,
    FontSize,
    Image,
  ],
  content: description || "",
  onUpdate: ({ editor }) => setDescription(editor.getHTML()),
  immediatelyRender: false,
});







  // Upload ảnh và chèn vào TipTap
  const handleInsertImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data?.success && data?.url) {
        editor?.chain().focus().setImage({ src: data.url }).run();
      } else {
        alert("❌ Lỗi upload ảnh");
      }
    };
    input.click();
  };

  // ======= Submit =======
const handleSubmit = async () => {
  if (!name || !selectedMain || !basePrice) {
    alert("⚠️ Vui lòng nhập đủ thông tin bắt buộc!");
    return;
  }

  try {
    setLoading(true);

    let finalDescription = description;

    // 🖼️ 1️⃣ Tìm ảnh local trong nội dung mô tả (blob hoặc base64)
    const imgTags = Array.from(
      description.matchAll(/<img[^>]+src="([^">]+)"/g)
    ).map((m) => m[1]);

    const localImages = imgTags.filter(
      (src) => src.startsWith("blob:") || src.startsWith("data:")
    );

    // 🖼️ 2️⃣ Upload từng ảnh lên Cloudinary nếu là local
    for (const src of localImages) {
      const res = await fetch(src);
      const blob = await res.blob();
      const file = new File([blob], "description-image.png", { type: blob.type });

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await uploadRes.json();
      if (data.success && data.url) {
        // 🧩 3️⃣ Thay src local bằng Cloudinary URL
        finalDescription = finalDescription.replace(src, data.url);
      }
    }

    // 🧾 4️⃣ Gửi toàn bộ dữ liệu sản phẩm (đã thay URL ảnh)
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", finalDescription); // 🧠 đã có ảnh thật
    formData.append("brand", brand);
    formData.append("material", material);
    formData.append("basePrice", String(basePrice));
    formData.append("isActive", String(isActive));
    formData.append("mainCategoryId", String(selectedMain.id));
    if (selectedSub) formData.append("subCategoryId", String(selectedSub.id));

    // Các ảnh khác
    if (mainImage) formData.append("mainImage", mainImage);
    gallery.forEach((g) => formData.append("galleryImages", g.file));
    formData.append("colorVariants", JSON.stringify(colorVariants));
    colorVariants.forEach((c, i) => {
      if (c.image) formData.append(`colorImage_${i}`, c.image);
    });

    // Gửi đến API sản phẩm
    const res = await fetch("/api/products", { method: "POST", body: formData });
    const result = await res.json();

    if (result.success) {
      alert("✅ Sản phẩm đã được lưu và ảnh mô tả đã upload lên Cloudinary!");
      setOpen(false);
    } else {
      alert("❌ Lỗi khi lưu sản phẩm");
    }
  } catch (err) {
    console.error(err);
    alert("❌ Lỗi khi upload ảnh hoặc lưu sản phẩm");
  } finally {
    setLoading(false);
  }
};


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Thêm sản phẩm
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>🛍️ Thêm sản phẩm mới</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 mt-3">
          {/* 🧾 Thông tin cơ bản */}
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên sản phẩm *" />

          {/* 📝 Mô tả sản phẩm (TipTap RichText) */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Mô tả sản phẩm</label>
            {/* Toolbar đơn giản */}
            {isClient && (
              <div className="flex flex-wrap gap-2 mb-2">
                <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleBold().run()}>B</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleItalic().run()}>I</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleStrike().run()}>S</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleBulletList().run()}>• List</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1. List</Button>
                <Button type="button" variant="outline" size="sm" onClick={handleInsertImage}>🖼️ Ảnh</Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = prompt("Nhập link:");
                    if (url) editor?.chain().focus().setLink({ href: url }).run();
                  }}
                >
                  🔗 Link
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}>Clear</Button>
                {isClient && (
  <div className="flex flex-wrap gap-2 mb-2 items-center">
    {/* Các nút khác */}
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => editor?.chain().focus().toggleBold().run()}
    >
      B
    </Button>
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => editor?.chain().focus().toggleItalic().run()}
    >
      I
    </Button>

    {/* 🔠 Dropdown chọn cỡ chữ */}
    <select
      className="border rounded px-2 py-1 text-sm"
      onChange={(e) => editor?.chain().focus().setMark("textStyle", { fontSize: e.target.value }).run()}
      defaultValue="16px"
    >
      <option value="12px">12px</option>
      <option value="14px">14px</option>
      <option value="16px">16px</option>
      <option value="18px">18px</option>
      <option value="20px">20px</option>
      <option value="24px">24px</option>
      <option value="28px">28px</option>
    </select>
  </div>
)}

              </div>
            )}
            <div className="border rounded-md p-2 min-h-[180px]">
              {editor && <EditorContent editor={editor} />}
            </div>
          </div>

          <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Thương hiệu" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="Chất liệu (VD: Cotton)" />
            <Input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Giá cơ bản (₫) *" />
          </div>

          {/* 👥 Danh mục */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* ===== ĐỐI TƯỢNG ===== */}
            <div className="flex w-full items-center gap-2">
              {/* Popover chọn đối tượng */}
              <div className="flex-1">
                <Popover open={openMainPopover} onOpenChange={setOpenMainPopover}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-between w-full">
                      {selectedMain ? selectedMain.name : "Chọn đối tượng *"}
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Tìm đối tượng..." />
                      <CommandGroup>
                        {mainCategories.map((m) => (
                          <CommandItem
                            key={m.id}
                            onSelect={() => {
                              setSelectedMain(m);
                              setSelectedSub(null);
                              fetchSubCategories(m.id);
                              setOpenMainPopover(false);
                            }}
                          >
                            {m.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Nút thêm đối tượng */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" title="Thêm đối tượng mới">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>➕ Thêm đối tượng mới</DialogTitle>
                  </DialogHeader>
                  <AddMainCategoryForm onAdded={fetchMainCategories} />
                </DialogContent>
              </Dialog>
            </div>

            {/* ===== DANH MỤC PHỤ ===== */}
            <div className="flex w-full items-center gap-2">
              {/* Popover chọn danh mục */}
              <div className="flex-1">
                <Popover open={openSubPopover} onOpenChange={setOpenSubPopover}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-between w-full" disabled={!selectedMain}>
                      {selectedSub ? selectedSub.name : "Chọn danh mục"}
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Tìm danh mục..." />
                      <CommandEmpty>Không có danh mục</CommandEmpty>
                      <CommandGroup>
                        {subCategories
                          .filter((s) => s.mainCategoryId === selectedMain?.id)
                          .map((s) => (
                            <CommandItem
                              key={s.id}
                              onSelect={() => {
                                setSelectedSub(s);
                                setOpenSubPopover(false);
                              }}
                            >
                              {s.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Nút thêm danh mục */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" disabled={!selectedMain} title="Thêm danh mục con">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>➕ Thêm danh mục mới</DialogTitle>
                  </DialogHeader>
                  <AddSubCategoryForm mainCategoryId={selectedMain?.id} onAdded={() => fetchSubCategories(selectedMain!.id)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* 🖼️ Ảnh đại diện */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Ảnh đại diện sản phẩm</label>
            <Button type="button" variant="outline" onClick={() => mainInputRef.current?.click()}>
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
              <img src={mainPreview} alt="main preview" className="mt-2 w-24 h-24 object-cover rounded border" />
            )}
          </div>

          {/* 🖼️ Ảnh gallery */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Ảnh khác (gallery)</label>
            <Button type="button" variant="outline" onClick={() => galleryInputRef.current?.click()}>
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
                <div key={img.id} className="relative">
                  <img src={img.preview} className="w-20 h-20 rounded object-cover border" alt="" />
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

          {/* 🎨 Biến thể Màu & Size */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-800">Biến thể (Màu → nhiều Size)</h3>
              <Button variant="outline" size="sm" onClick={addColorVariant}>+ Thêm màu</Button>
            </div>

            {colorVariants.map((c, colorIndex) => (
              <div key={c.id} className="border rounded-lg p-3 mb-3">
                {/* Hàng màu + ảnh */}
                <div className="flex items-center gap-2 mb-3">
                  <Input placeholder="Tên màu (VD: Đỏ, Navy...)" value={c.color} onChange={(e) => updateColorField(c.id, "color", e.target.value)} />
                  <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById(`color-img-${c.id}`)?.click()}>
                    <ImagePlus className="h-4 w-4 mr-1" /> Ảnh màu
                  </Button>
                  <input id={`color-img-${c.id}`} type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const preview = URL.createObjectURL(file);
                      updateColorField(c.id, "image", file);
                      updateColorField(c.id, "preview", preview);
                    }
                  }} />
                  {c.preview && (<img src={c.preview} alt="" className="w-10 h-10 object-cover rounded border" />)}
                  <Button variant="destructive" size="icon" onClick={() => removeColorVariant(c.id)} title="Xoá màu">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Bảng size */}
                <div className="space-y-2">
                  {c.sizes.map((s) => (
                    <div key={s.id} className="grid grid-cols-4 gap-2 items-center">
                      <Input placeholder="Size (VD: S, M, L, 39, 40...)" value={s.size} onChange={(e) => updateSizeField(c.id, s.id, "size", e.target.value)} />
                      <Input type="number" placeholder="Giá" value={s.price} onChange={(e) => updateSizeField(c.id, s.id, "price", e.target.value === "" ? "" : Number(e.target.value))} />
                      <Input type="number" placeholder="Kho" value={s.stock} onChange={(e) => updateSizeField(c.id, s.id, "stock", e.target.value === "" ? "" : Number(e.target.value))} />
                      <Button variant="destructive" size="icon" onClick={() => removeSizeVariant(c.id, s.id)} title="Xoá size">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-2">
                  <Button variant="outline" size="sm" onClick={() => addSizeVariant(c.id)}>+ Thêm size</Button>
                </div>

                {/* Lưu ý index ảnh màu cho backend */}
                <input type="hidden" value={colorIndex} readOnly />
              </div>
            ))}
          </div>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu sản phẩm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ====== Dialog nội bộ: Thêm MainCategory & SubCategory ======
function AddMainCategoryForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return alert("Vui lòng nhập tên đối tượng!");
    try {
      setLoading(true);
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Thêm đối tượng thành công!");
        onAdded();
        setName("");
      } else {
        alert(data.message || "❌ Lỗi khi thêm đối tượng");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 mt-2">
      <Input placeholder="Tên đối tượng (VD: Nam, Nữ, Trẻ em...)" value={name} onChange={(e) => setName(e.target.value)} />
      <Button onClick={handleAdd} disabled={loading}>
        {loading ? "Đang lưu..." : "Lưu đối tượng"}
      </Button>
    </div>
  );
}

function AddSubCategoryForm({ mainCategoryId, onAdded }: { mainCategoryId?: number; onAdded: () => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!mainCategoryId) return alert("⚠️ Chưa chọn đối tượng cha!");
    if (!name.trim()) return alert("Vui lòng nhập tên danh mục!");
    try {
      setLoading(true);
      const res = await fetch(`/api/categories/${mainCategoryId}/subcategories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Thêm danh mục thành công!");
        onAdded();
        setName("");
      } else {
        alert(data.message || "❌ Lỗi khi thêm danh mục");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 mt-2">
      <Input placeholder="Tên danh mục (VD: Áo, Quần, Giày...)" value={name} onChange={(e) => setName(e.target.value)} />
      <Button onClick={handleAdd} disabled={loading}>
        {loading ? "Đang lưu..." : "Lưu danh mục"}
      </Button>
    </div>
  );
}
