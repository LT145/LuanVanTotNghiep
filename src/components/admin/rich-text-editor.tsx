"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { FontSize } from "@/lib/tiptap/FontSize"; // bạn đã có file này
import { Button } from "@/components/ui/button";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({ value, onChange }: Props) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

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
      FontSize,
      Image.configure({ inline: false }),
      TextAlign.configure({
        types: ["paragraph", "heading"],
      }),
    ],
    content: "",
    immediatelyRender: false, // chống SSR mismatch

    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // sync value khi edit sản phẩm khác
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!isClient || !editor) return null;

  // -----------------------------
  // 🖼️ Thêm ảnh local
  // -----------------------------
  const handleInsertImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const url = URL.createObjectURL(file);
      editor.chain().focus().setImage({ src: url }).run();
    };

    input.click();
  };

  return (
    <div className="border rounded-md bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-2 border-b bg-muted/40">

        {/* B / I / S */}
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="h-8 w-8 font-bold"
        >
          B
        </Button>

        <Button
          type="button"
          size="icon"
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="h-8 w-8 italic"
        >
          I
        </Button>

        <Button
          type="button"
          size="icon"
          variant={editor.isActive("strike") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className="h-8 w-8 line-through"
        >
          S
        </Button>

        <div className="w-px h-6 bg-border" />

        {/* Bullet / ordered list */}
        <Button
          size="icon"
          variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="h-8 w-8"
        >
          •
        </Button>

        <Button
          size="icon"
          variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="h-8 w-8 text-xs"
        >
          1.
        </Button>

        <div className="w-px h-6 bg-border" />

        {/* ALIGN */}
        <Button
          size="icon"
          variant={editor.isActive({ textAlign: "left" }) ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className="h-8 w-8 text-xs"
        >
          L
        </Button>

        <Button
          size="icon"
          variant={editor.isActive({ textAlign: "center" }) ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className="h-8 w-8 text-xs"
        >
          C
        </Button>

        <Button
          size="icon"
          variant={editor.isActive({ textAlign: "right" }) ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className="h-8 w-8 text-xs"
        >
          R
        </Button>

        <Button
          size="icon"
          variant={editor.isActive({ textAlign: "justify" }) ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className="h-8 w-8 text-xs"
        >
          J
        </Button>

        <div className="w-px h-6 bg-border" />

        {/* FONT SIZE */}
        <select
          className="border rounded px-2 h-8 text-sm"
          defaultValue="16px"
          onChange={(e) =>
            editor
              .chain()
              .focus()
              .setMark("textStyle", { fontSize: e.target.value })
              .run()
          }
        >
          <option value="12px">12</option>
          <option value="14px">14</option>
          <option value="16px">16</option>
          <option value="18px">18</option>
          <option value="20px">20</option>
          <option value="24px">24</option>
          <option value="28px">28</option>
        </select>

        {/* ADD IMAGE */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleInsertImage}
          className="h-8 px-2 text-xs"
        >
          🖼️ Thêm ảnh
        </Button>
      </div>

      {/* CONTENT */}
      <div className="p-2 max-h-[300px] overflow-y-auto">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none min-h-[160px]"
        />
      </div>
    </div>
  );
}
