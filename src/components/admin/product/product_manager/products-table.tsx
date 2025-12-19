"use client"

import Image from "next/image"
import type { Dispatch, SetStateAction } from "react"
import type { AllProduct } from "@/types/product"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { Archive, Eye, Lock, MoreHorizontal, Package, Pencil, Unlock } from "lucide-react"

const genderMap: Record<string, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
  UNISEX: "Unisex",
}

function getTotalStock(stock?: Record<string, number>) {
  if (!stock) return 0
  return Object.values(stock).reduce((sum, qty) => sum + (Number(qty) || 0), 0)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
}

function StatusText({ status }: { status?: string }) {
  if (status === "active") return <span className="text-sm text-foreground">Đang bán</span>
  if (status === "inactive") return <span className="text-sm text-muted-foreground">Đã khóa</span>
  if (status === "outofstock") return <span className="text-sm text-foreground">Hết hàng</span>
  return <span className="text-sm text-muted-foreground">—</span>
}

interface Props {
  products: AllProduct[]
  selectedIds: Set<string>
  setSelectedIds: Dispatch<SetStateAction<Set<string>>>
  onView: (product: AllProduct) => void
  onEdit: (product: AllProduct) => void
  onDelete: (product: AllProduct) => void // bạn đang dùng để khóa/mở khóa
}

export default function ProductsTable({
  products,
  selectedIds,
  setSelectedIds,
  onView,
  onEdit,
  onDelete,
}: Props) {
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (products.length === 0) return new Set()
      if (prev.size === products.length) return new Set()
      return new Set(products.map((p) => p.id))
    })
  }

  const allChecked = products.length > 0 && selectedIds.size === products.length
  const indeterminate = selectedIds.size > 0 && selectedIds.size < products.length

  return (
    <div className="border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-b">
            <TableHead className="w-[44px]">
              <Checkbox
                checked={allChecked ? true : indeterminate ? "indeterminate" : false}
                onCheckedChange={toggleSelectAll}
                aria-label="Chọn tất cả"
              />
            </TableHead>

            <TableHead className="w-[380px] font-medium">Sản phẩm</TableHead>
            <TableHead className="w-[110px] text-center font-medium">Giới tính</TableHead>
            <TableHead className="w-[160px] text-center font-medium">Danh mục</TableHead>
            <TableHead className="w-[420px] font-medium">Kho / Size</TableHead>
            <TableHead className="w-[170px] text-right font-medium">Giá</TableHead>
            <TableHead className="w-[90px] text-center font-medium">Đã bán</TableHead>
            <TableHead className="w-[130px] text-center font-medium">Trạng thái</TableHead>
            <TableHead className="w-[80px]" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="py-16 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Package className="h-8 w-8" />
                  <p className="text-sm">Không tìm thấy sản phẩm</p>
                </div>
              </TableCell>
            </TableRow>
          )}

          {products.map((p) => {
            const isSelected = selectedIds.has(p.id)

            const stock = (p as any)?.sizeStock as Record<string, number> | undefined
            const totalStock = getTotalStock(stock)

            const price = (p as any)?.price ?? 0
            const salePrice = (p as any)?.salePrice as number | undefined

            const soldCount = (p as any)?.soldCount ?? 0
            const status = (p as any)?.status as string | undefined

            const genderLabel = genderMap[(p as any)?.gender] || (p as any)?.gender || "—"
            const categoryLabel = (p as any)?.subcategory || (p as any)?.category || "—"

            return (
              <TableRow key={p.id} className={cn("border-b hover:bg-muted/30", isSelected && "bg-muted/20")}>
                {/* Select */}
                <TableCell className="py-3 align-middle">
                  <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(p.id)} aria-label="Chọn sản phẩm" />
                </TableCell>

                {/* Product */}
                <TableCell className="py-3 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 min-w-[56px] border bg-muted">
                      <Image
                        src={(p as any)?.image || "/placeholder.svg"}
                        alt={(p as any)?.name || "product"}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <button
                        type="button"
                        className="font-medium text-sm line-clamp-2 text-left"
                        onClick={() => onView(p)}
                        title={(p as any)?.name}
                      >
                        {(p as any)?.name}
                      </button>

                      <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                        <span>Kho: {totalStock}</span>
                        {salePrice ? <span>• Đang giảm</span> : null}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Gender */}
                <TableCell className="py-3 text-center align-middle">
                  <span className="text-sm capitalize">{genderLabel}</span>
                </TableCell>

                {/* Category */}
                <TableCell className="py-3 text-center align-middle">
                  <span className="text-sm">{categoryLabel}</span>
                </TableCell>

                {/* Stock / Size (giống block border p-2 của PromotionManager) */}
                <TableCell className="py-3 align-middle">
                  <div className="border p-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium">Tồn kho</span>
                      <span className="text-xs text-muted-foreground">Tổng: {totalStock}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {stock && Object.keys(stock).length > 0 ? (
                        Object.entries(stock).map(([size, qty]) => (
                          <div
                            key={size}
                            className={cn("px-2 py-1 border text-xs", qty === 0 && "opacity-40")}
                          >
                            <span className="font-medium">{size}</span>
                            <span className="text-muted-foreground"> • {qty}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground">Chưa có tồn kho</div>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Price */}
                <TableCell className="py-3 text-right align-middle">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold">{formatCurrency(salePrice ?? price)}</span>
                    {salePrice ? (
                      <span className="text-xs text-muted-foreground line-through">{formatCurrency(price)}</span>
                    ) : null}
                  </div>
                </TableCell>

                {/* Sold */}
                <TableCell className="py-3 text-center align-middle">
                  <span className="text-sm font-medium">{soldCount}</span>
                </TableCell>

                {/* Status (để giống style list: text gọn, không badge pill) */}
                <TableCell className="py-3 text-center align-middle">
                  <StatusText status={status} />
                </TableCell>

                {/* Actions (giống PromotionManager) */}
                <TableCell className="py-3 align-middle">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem onClick={() => onView(p)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Xem chi tiết
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => onEdit(p)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => onDelete(p)}
                        className={cn(
                          (p as any)?.isActive ? "text-red-600 focus:bg-red-50" : "text-emerald-700 focus:bg-emerald-50",
                        )}
                      >
                        {(p as any)?.isActive ? (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Khóa sản phẩm
                          </>
                        ) : (
                          <>
                            <Unlock className="h-4 w-4 mr-2" />
                            Mở khóa sản phẩm
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
