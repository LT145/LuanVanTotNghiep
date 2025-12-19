"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { getTotalStock } from "@/lib/data"
import type { AllProduct  } from "@/types/product"

interface Props {
  products: AllProduct []
  selectedIds: Set<string>
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>
  onView: (product: AllProduct ) => void
  onEdit: (product: AllProduct ) => void
  onDelete: (product: AllProduct ) => void
}

export default function ProductsGrid({
  products,
  selectedIds,
  setSelectedIds,
  onView,
  onEdit,
  onDelete
}: Props) {
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    newSet.has(id) ? newSet.delete(id) : newSet.add(id)
    setSelectedIds(newSet)
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((p) => {
        const stock = getTotalStock(p.sizeStock)

        return (
          <div key={p.id} className="border rounded-lg overflow-hidden group">
            <div className="relative aspect-square bg-muted">
              <Image src={p.image || "/placeholder.svg"} alt={p.name} fill className="object-cover" />



              {p.salePrice && (
                <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  -{Math.round((1 - p.salePrice / p.price) * 100)}%
                </div>
              )}
            </div>

            <div className="p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium line-clamp-1">{p.name}</p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(p)}>
                      <Eye className="h-4 w-4 mr-2" /> Xem
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(p)}>
                      <Pencil className="h-4 w-4 mr-2" /> Sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(p)}
                      className="text-red-500 focus:text-red-500"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <Badge variant="outline">{p.gender}</Badge>
                <span>{p.subcategory}</span>
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className="font-semibold text-red-500">
                  {(p.salePrice || p.price).toLocaleString()}₫
                </span>

                <span className="text-sm">
                  SL: <b>{stock}</b>
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
