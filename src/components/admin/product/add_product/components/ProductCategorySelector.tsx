"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandGroup, CommandItem, CommandEmpty } from "@/components/ui/command";
import { ChevronsUpDown, Plus } from "lucide-react";
import AddMainCategoryForm from "./AddMainCategoryForm";
import AddCategoryForm from "./AddCategoryForm";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// 🧩 Định nghĩa kiểu Category
interface Category {
  id: string | number;
  name: string;
  imageUrl?: string | null;
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
  gallery: { file: File }[];
  colorVariants: {
    color: string;
    image?: File | null;
    sizes: { size: string; price: number; stock: number }[];
  }[];
  description: string;
}
// 🧩 Props type
interface ProductCategorySelectorProps {
  onChange: (data: Partial<ProductFormData>) => void;
}


export default function ProductCategorySelector({ onChange }: ProductCategorySelectorProps) {
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [selectedMain, setSelectedMain] = useState<Category | null>(null);
  const [selectedSub, setSelectedSub] = useState<Category | null>(null);
  const [openMainPopover, setOpenMainPopover] = useState(false);
  const [openSubPopover, setOpenSubPopover] = useState(false);
  const [openAddSub, setOpenAddSub] = useState(false);

  // 📦 Lấy danh mục chính
  const fetchMainCategories = async () => {
    const res = await fetch("/api/gender");
    const data = await res.json();
    
    if (data.success) setMainCategories(data.data as Category[]);
  };

  // 📦 Lấy danh mục phụ
  const fetchSubCategories = async (gender: string | number) => {
    const res = await fetch(`/api/categories/${gender}`);
    const data = await res.json();
    if (data.success) setSubCategories(data.data as Category[]);
  };

  useEffect(() => {
    fetchMainCategories();
  }, []);

  // 🔄 Truyền dữ liệu về cha
useEffect(() => {
  const timeout = setTimeout(() => {
    const mainId = selectedMain?.id?.toString() || "";
    const subId = selectedSub?.id?.toString() || "";

    // 🔒 Chỉ gọi onChange khi thực sự có thay đổi
    onChange({
      mainCategoryId: mainId,
      subCategoryId: subId,
    });
  }, 300); // debounce nhẹ để tránh loop khi dialog re-render

  return () => clearTimeout(timeout);
  // ❗ Loại bỏ `onChange` khỏi dependency để tránh loop
}, [selectedMain, selectedSub]);


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* ========== Cột trái: ĐỐI TƯỢNG ========== */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Đối tượng</label>
        <div className="flex w-full items-center gap-2">
          <Popover open={openMainPopover} onOpenChange={setOpenMainPopover}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-between flex-1">
                {selectedMain ? selectedMain.name : "Chọn Giới Tính *"}
                <ChevronsUpDown className="h-4 w-4 opacity-50 " />
              </Button>
            </PopoverTrigger>
<PopoverContent
  side="bottom"
  align="start"
  className="z-[9999] p-0 bg-white border shadow-lg focus-visible:outline-none focus:outline-none "
>
  <Command>

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

          {/* Nút + thêm đối tượng */}
          {/* <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" variant="outline" className="shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>➕ Thêm đối tượng</DialogTitle>
              </DialogHeader>
              <AddMainCategoryForm onAdded={fetchMainCategories} />
            </DialogContent>
          </Dialog> */}
        </div>
      </div>

      {/* ========== Cột phải: DANH MỤC PHỤ ========== */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Danh mục</label>
        <div className="flex w-full items-center gap-2">
          <Popover open={openSubPopover} onOpenChange={setOpenSubPopover}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-between flex-1"
                disabled={!selectedMain}
              >
                {selectedSub ? selectedSub.name : "Chọn danh mục"}
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent   className="z-[9999] p-0 bg-white border shadow-lg focus-visible:outline-none focus:outline-none">
              <Command>
                <CommandInput placeholder="Tìm danh mục..."   className="focus:outline-none focus:ring-0 focus-visible:ring-0 shadow-none"/>
                <CommandEmpty>Không có danh mục</CommandEmpty>
                <CommandGroup>
                  {subCategories.map((s) => (
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

          {/* Nút + thêm danh mục */}
          <Dialog open={openAddSub} onOpenChange={setOpenAddSub}>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="shrink-0"
                disabled={!selectedMain}
                onClick={() => setOpenAddSub(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>➕ Thêm danh mục</DialogTitle>
              </DialogHeader>

              <AddCategoryForm
                gender={selectedMain?.id?.toString() || ""}

                onAdded={(newCat) => {
                  setSubCategories((prev) => [...prev, newCat]);
                  setSelectedSub(newCat);
                }}
                onSuccess={() => setOpenAddSub(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
