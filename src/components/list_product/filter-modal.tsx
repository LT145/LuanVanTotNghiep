"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

const sizes = [
  "12-18M",
  "24/XS",
  "24",
  "43-44",
  "44-45",
  "25",
  "27",
  "60CMX60CM",
  "3XL",
  "24X24X10CM",
  "0-3M",
  "3-6M",
  "6-9M",
  "9-12M",
  "18-24M",
  "717",
  "45",
  "100ML",
]

const colors = [
  { name: "Đen", value: "black" },
  { name: "Trắng", value: "white" },
  { name: "Xám", value: "gray" },
  { name: "Xanh Navy", value: "navy" },
  { name: "Nâu", value: "brown" },
  { name: "Be", value: "beige" },
]

interface FilterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FilterModal({ open, onOpenChange }: FilterModalProps) {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 2000000])
  const [activeTab, setActiveTab] = useState("color")

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]))
  }

  const toggleColor = (color: string) => {
    setSelectedColors((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]))
  }

  const clearAll = () => {
    setSelectedSizes([])
    setSelectedColors([])
    setPriceRange([0, 2000000])
  }

  const getColorTabLabel = () => {
    if (selectedColors.length === 0) return "Màu"
    if (selectedColors.length === 1) {
      const color = colors.find((c) => c.value === selectedColors[0])
      return color?.name || "Màu"
    }
    return `Màu (${selectedColors.length})`
  }

  const getSizeTabLabel = () => {
    if (selectedSizes.length === 0) return "Kích cỡ"
    if (selectedSizes.length === 1) return selectedSizes[0]
    return `Kích cỡ (${selectedSizes.length})`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Bộ lọc</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="color">{getColorTabLabel()}</TabsTrigger>
            <TabsTrigger value="size">{getSizeTabLabel()}</TabsTrigger>
            <TabsTrigger value="price">Giá</TabsTrigger>
          </TabsList>

          <TabsContent value="color" className="mt-6">
            <div className="grid grid-cols-3 gap-3">
              {colors.map((color) => (
                <Button
                  key={color.value}
                  variant={selectedColors.includes(color.value) ? "default" : "outline"}
                  className="h-14 text-sm font-medium"
                  onClick={() => toggleColor(color.value)}
                >
                  {color.name}
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="size" className="mt-6">
            <div className="grid grid-cols-6 gap-3">
              {sizes.map((size) => (
                <Button
                  key={size}
                  variant={selectedSizes.includes(size) ? "default" : "outline"}
                  className="h-14 text-sm font-medium"
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="price" className="mt-6">
            <div className="space-y-6 px-2">
              <div>
                <label className="text-sm font-medium mb-4 block">
                  Giá: {priceRange[0].toLocaleString("vi-VN")} ₫ - {priceRange[1].toLocaleString("vi-VN")} ₫
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={2000000}
                  step={50000}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>0 ₫</span>
                <span>2,000,000 ₫</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-row gap-3 sm:gap-3">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={clearAll}>
            Xoá hết
          </Button>
          <Button className="flex-1 bg-black text-white hover:bg-black/90" onClick={() => onOpenChange(false)}>
            Xem kết quả (152)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
