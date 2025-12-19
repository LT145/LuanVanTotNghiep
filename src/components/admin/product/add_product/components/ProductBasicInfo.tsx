"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEditor, EditorContent } from "@tiptap/react";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontSize } from "@/lib/tiptap/FontSize";
import Image from "@tiptap/extension-image";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Paragraph from "@tiptap/extension-paragraph";
import Document from "@tiptap/extension-document";
import Text from "@tiptap/extension-text";
import TextAlign from "@tiptap/extension-text-align";
import { Label } from "@/components/ui/label";
interface BasicInfoData {
  name: string;
  costPrice: number;
  basePrice: number;
  description: string;
}

export default function ProductBasicInfo({
  onChange,
}: {
  onChange: (data: BasicInfoData) => void;
}) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const [name, setName] = useState("");
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [basePrice, setBasePrice] = useState<number | "">("");
  const [description, setDescription] = useState("");

  // ✅ Tiptap editor setup
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Strike,
      ListItem,
      BulletList,
      OrderedList,
      TextStyle,
      FontSize,
      Image,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => setDescription(editor.getHTML()),
  });

  // ✅ Gửi dữ liệu về component cha
useEffect(() => {
  const timeout = setTimeout(() => {
    onChange({
      name,
      costPrice: costPrice === "" ? 0 : Number(costPrice),
      basePrice: basePrice === "" ? 0 : Number(basePrice),
      description,
    });
  }, 300); // chỉ gọi sau 0.3s khi user dừng nhập

  return () => clearTimeout(timeout);
}, [name, costPrice, basePrice, description, onChange]);


  // 🖼️ Thêm ảnh vào editor
  const handleInsertImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const localUrl = URL.createObjectURL(file);
      editor?.chain().focus().setImage({ src: localUrl }).run();
    };
    input.click();
  };

  if (!isClient) return null;

  return (
    <div className="space-y-5">
      {/* 🏷️ Tên sản phẩm */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-1 block">
          Tên sản phẩm <span className="text-red-500">*</span>
        </Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên sản phẩm..."
        />
      </div>

      {/* 📝 Mô tả sản phẩm */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-1 block">
          Mô tả sản phẩm
        </Label>

        {/* Toolbar */}
{/* Toolbar đầy đủ */}
{editor && (
  <>
    <div className="flex flex-wrap gap-2 mb-2 items-center">
      {/* 🔤 Đậm / nghiêng / gạch */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        B
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        I
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        S
      </Button>

      {/* 📋 Danh sách */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        •
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1.
      </Button>

      {/* 🖼️ Chèn ảnh */}
      <Button variant="outline" size="sm" onClick={handleInsertImage}>
        🖼️
      </Button>

      {/* 📏 Căn lề */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        ⬅️
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        ⬆️
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        ➡️
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        🧱
      </Button>

      {/* 🔠 Thay đổi cỡ chữ */}
      <select
        className="border rounded px-2 py-1 text-sm"
        defaultValue="16px"
        onChange={(e) =>
          editor
            .chain()
            .focus()
            .setMark("textStyle", { fontSize: e.target.value })
            .run()
        }
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

    <div className="border rounded-md p-2 min-h-[180px]">
      <EditorContent editor={editor} />
    </div>
  </>
)}

      </div>

      {/* 💰 Giá nhập & Giá bán */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
  {/* --- Giá nhập --- */}
  {/* --- Giá nhập --- */}
<div>
  <Label className="text-sm font-medium text-gray-700 mb-1 block">
    Giá nhập (₫) <span className="text-red-500">*</span>
  </Label>
  <Input
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    value={costPrice === "" ? "" : Number(costPrice).toLocaleString("en-US")}
    onChange={(e) => {
      // ✅ Chỉ giữ lại ký tự số
      const raw = e.target.value.replace(/[^0-9]/g, "");
      setCostPrice(raw === "" ? "" : Number(raw));
    }}
    placeholder="Nhập giá nhập..."
  />
</div>

{/* --- Giá bán --- */}
<div>
  <Label className="text-sm font-medium text-gray-700 mb-1 block">
    Giá bán (₫) <span className="text-red-500">*</span>
  </Label>
  <Input
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    value={basePrice === "" ? "" : Number(basePrice).toLocaleString("en-US")}
    onChange={(e) => {
      // ✅ Chỉ giữ ký tự số
      const raw = e.target.value.replace(/[^0-9]/g, "");
      setBasePrice(raw === "" ? "" : Number(raw));
    }}
    placeholder="Nhập giá bán..."
  />
</div>

</div>
    </div>
  );
}
