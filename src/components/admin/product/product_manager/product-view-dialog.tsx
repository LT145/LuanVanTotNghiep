"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import type { AllProduct  } from "@/types/product"

// 👉 Tính tổng tồn kho từ sizeStock
function getTotalStock(stock: Record<string, number>) {
  return Object.values(stock).reduce((sum, qty) => sum + (qty || 0), 0)
}

// 👉 Format tiền VND
function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value)
}

interface Props {
  product: AllProduct  | null
  onClose: () => void
}

export default function ProductViewDialog({ product, onClose }: Props) {
  const open = !!product

  const sizes = product ? Object.keys(product.sizeStock) : []

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        // khi dialog bị đóng (isOpen = false) thì gọi onClose
        if (!isOpen) onClose()
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {product && (
          <>
            <DialogHeader>
              <DialogTitle>Chi tiết sản phẩm</DialogTitle>
              <DialogDescription>
                Thông tin đầy đủ của sản phẩm
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Ảnh + info cơ bản */}
              <div className="flex gap-4">
                <div className="relative h-32 w-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold">{product.name}</h3>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{product.subcategory}</Badge>
                    <Badge variant="outline" className="capitalize">
                      {product.gender}
                    </Badge>
                    <Badge variant="outline">{product.status}</Badge>
                    <Badge variant="outline">
                      {/* Đã bán: {product.soldCount} */}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Giá */}
              <div>
                <p className="text-sm text-muted-foreground">Giá</p>
                <div className="flex items-baseline gap-2">
                  <p className="font-semibold text-lg">
                    {formatCurrency(product.salePrice ?? product.price)}
                  </p>
                  {product.salePrice && (
                    <p className="text-sm text-muted-foreground line-through">
                      {formatCurrency(product.price)}
                    </p>
                  )}
                </div>
              </div>

              {/* Tồn kho theo size */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Tồn kho theo size
                </p>

                {sizes.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    Chưa có dữ liệu size
                  </p>
                ) : (
                  <div className="grid grid-cols-6 gap-2">
                    {sizes.map((size) => (
                      <div
                        key={size}
                        className="p-2 rounded border text-center bg-background"
                      >
                        <p className="font-semibold uppercase text-xs text-muted-foreground">
                          {size}
                        </p>
                        <p className="text-base font-bold">
                          {product.sizeStock[size] || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tổng tồn kho */}
              <p className="text-sm text-muted-foreground">
                Tổng tồn kho:{" "}
                <span className="font-semibold">
                  {getTotalStock(product.sizeStock)}
                </span>
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
