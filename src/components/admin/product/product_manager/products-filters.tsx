"use client"

import { Dispatch, SetStateAction } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select"
import { Search, X, List, LayoutGrid } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type ViewMode = "table" | "grid"

interface ProductsFiltersProps {
  search: string
  setSearch: Dispatch<SetStateAction<string>>
  genderFilter: string
  setGenderFilter: Dispatch<SetStateAction<string>>
  subcategoryFilter: string
  setSubcategoryFilter: Dispatch<SetStateAction<string>>
  statusFilter: string
  setStatusFilter: Dispatch<SetStateAction<string>>
  priceFilter: string
  setPriceFilter: Dispatch<SetStateAction<string>>
  viewMode: ViewMode
  setViewMode: Dispatch<SetStateAction<ViewMode>>

  genderOptions: string[]
  subcategoryOptions: string[]
  statusOptions: string[]
}

// Map label cho đẹp
const genderLabel: Record<string, string> = {
  nam: "Nam",
  nu: "Nữ",
  unisex: "Unisex",
}

const statusLabel: Record<string, string> = {
  active: "Đang bán",
  inactive: "Tạm ẩn",
  outofstock: "Hết hàng",
}

export default function ProductsFilters({
  search,
  setSearch,
  genderFilter,
  setGenderFilter,
  subcategoryFilter,
  setSubcategoryFilter,
  statusFilter,
  setStatusFilter,
  priceFilter,
  setPriceFilter,
  viewMode,
  setViewMode,
  genderOptions,
  subcategoryOptions,
  statusOptions,
}: ProductsFiltersProps) {
  const clearFilters = () => {
    setSearch("")
    setGenderFilter("all")
    setSubcategoryFilter("all")
    setStatusFilter("all")
    setPriceFilter("all")
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm tên, SKU, danh mục..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {/* GENDER DYNAMIC */}
            <Select
              value={genderFilter}
              onValueChange={(value) => setGenderFilter(value)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Đối tượng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {genderOptions.map((g) => (
                  <SelectItem key={g} value={g}>
                    {genderLabel[g] ?? g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* DANH MỤC DYNAMIC */}
            <Select
              value={subcategoryFilter}
              onValueChange={(value) => setSubcategoryFilter(value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {subcategoryOptions.map((cate) => (
                  <SelectItem key={cate} value={cate}>
                    {cate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* TRẠNG THÁI DYNAMIC */}
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {statusOptions.map((st) => (
                  <SelectItem key={st} value={st}>
                    {statusLabel[st] ?? st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Giá (giữ static) */}
            <Select
              value={priceFilter}
              onValueChange={(value) => setPriceFilter(value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Giá" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="under200">Dưới 200K</SelectItem>
                <SelectItem value="200to500">200K - 500K</SelectItem>
                <SelectItem value="over500">Trên 500K</SelectItem>
              </SelectContent>
            </Select>

            {(search || genderFilter !== "all" || statusFilter !== "all") && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" /> Xóa lọc
              </Button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>

            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
