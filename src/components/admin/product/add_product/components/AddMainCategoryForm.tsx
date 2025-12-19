"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";

export default function AddMainCategoryForm({ onAdded }: { onAdded: () => void }) {
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
      } else alert(data.message || "❌ Lỗi khi thêm đối tượng");
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2  gap-3 mt-2  ">
      <Input
        placeholder="Tên đối tượng (VD: Nam, Nữ, Trẻ em...)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className=" gap-2 justify-between ">
        <DialogClose asChild>
          <Button variant="outline">Hủy</Button>
        </DialogClose>
        <Button onClick={handleAdd} disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu đối tượng"}
        </Button>
      </div>
    </div>
  );
}
