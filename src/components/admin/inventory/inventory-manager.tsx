"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import {
  Search,
  Package,
  Warehouse,
  TrendingDown,
  List,
  Grid,
  PlusCircle,
  Pencil,
  MoreHorizontal,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// ==============================
// Types (match API shape)
// ==============================
type ActionType = "ADD" | "SET"

interface InventorySize {
  id: string
  size: string
  price: number
  stock: number
}

interface InventoryVariant {
  id: string // colorVariantId
  color: string
  sizes: InventorySize[]
}

interface InventoryProduct {
  id: string
  name: string
  gender: string
  category: string
  image: string
  basePrice: number
  variants: InventoryVariant[]
}

function sumStock(variant: InventoryVariant) {
  return variant.sizes.reduce((s, x) => s + x.stock, 0)
}
function sumSku(product: InventoryProduct) {
  return product.variants.reduce((s, v) => s + v.sizes.length, 0)
}
function sumProductStock(product: InventoryProduct) {
  return product.variants.reduce((s, v) => s + sumStock(v), 0)
}

export default function InventoryManager() {
  // ==============================
  // Data
  // ==============================
  const [products, setProducts] = useState<InventoryProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5)

  // ==============================
  // Filters / UI
  // ==============================
  const [searchQuery, setSearchQuery] = useState("")
  const [genderFilter, setGenderFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [onlyLowStock, setOnlyLowStock] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  // ==============================
  // Dialog state (Nhập hàng)
  // ==============================
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [selectedSizeId, setSelectedSizeId] = useState<string>("")
  const [actionType, setActionType] = useState<ActionType>("ADD")
  const [quantity, setQuantity] = useState<string>("")
  const [setStockValue, setSetStockValue] = useState<string>("") // when SET

  // ==============================
  // API
  // ==============================
  const fetchInventory = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/inventory", { cache: "no-store" })
      const json = await res.json()
      if (!res.ok || !json?.ok) throw new Error(json?.message || "Fetch inventory failed")

      setProducts(json.data as InventoryProduct[])
      if (typeof json?.meta?.lowStockThreshold === "number") {
        setLowStockThreshold(json.meta.lowStockThreshold)
      }
    } catch (e) {
      console.error(e)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  // ==============================
  // Derived
  // ==============================
  const genders = useMemo(() => Array.from(new Set(products.map((p) => p.gender))), [products])
  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), [products])

  const totalProducts = products.length
  const totalSkus = products.reduce((s, p) => s + sumSku(p), 0)
  const totalStock = products.reduce((s, p) => s + sumProductStock(p), 0)

  const lowStockSkuCount = useMemo(() => {
    let count = 0
    for (const p of products) {
      for (const v of p.variants) {
        for (const s of v.sizes) {
          if (s.stock <= lowStockThreshold) count++
        }
      }
    }
    return count
  }, [products, lowStockThreshold])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchGender = genderFilter === "all" || p.gender === genderFilter
      const matchCategory = categoryFilter === "all" || p.category === categoryFilter

      const matchLow =
        !onlyLowStock ||
        p.variants.some((v) => v.sizes.some((s) => s.stock <= lowStockThreshold))

      return matchSearch && matchGender && matchCategory && matchLow
    })
  }, [products, searchQuery, genderFilter, categoryFilter, onlyLowStock, lowStockThreshold])

  // ==============================
  // Helpers
  // ==============================
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)

  const badgeForStock = (stock: number) => {
    if (stock <= 0) return <Badge variant="destructive">Hết hàng</Badge>
    if (stock <= lowStockThreshold) return <Badge variant="secondary">Sắp hết</Badge>
    return <Badge variant="outline">Ổn</Badge>
  }

  // ==============================
  // Dialog actions
  // ==============================
  const openStockDialog = (product: InventoryProduct, variantIndex = 0, sizeId?: string) => {
    setSelectedProduct(product)
    setSelectedVariantIndex(variantIndex)

    const variant = product.variants[variantIndex]
    const fallbackSizeId = variant?.sizes?.[0]?.id || ""
    setSelectedSizeId(sizeId || fallbackSizeId)

    setActionType("ADD")
    setQuantity("")
    setSetStockValue("")
    setIsDialogOpen(true)
  }

  const submitStock = async () => {
    if (!selectedProduct) return
    const variant = selectedProduct.variants[selectedVariantIndex]
    if (!variant?.id) return
    if (!selectedSizeId) return

    const size = variant.sizes.find((x) => x.id === selectedSizeId)
    if (!size) return

    // Validate
    if (actionType === "ADD") {
      const q = Number.parseInt(quantity, 10)
      if (!Number.isFinite(q) || q <= 0) return
    } else {
      const s = Number.parseInt(setStockValue, 10)
      if (!Number.isFinite(s) || s < 0) return
    }

    try {
      setSaving(true)
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          colorVariantId: variant.id,
          sizeIds: [selectedSizeId],
          quantity: actionType === "ADD" ? Number.parseInt(quantity, 10) : undefined,
          setStock: actionType === "SET" ? Number.parseInt(setStockValue, 10) : undefined,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json?.ok) throw new Error(json?.message || "Update stock failed")

      setIsDialogOpen(false)
      setSelectedProduct(null)
      setQuantity("")
      setSetStockValue("")
      await fetchInventory()
    } catch (e) {
      console.error(e)
      alert("Cập nhật kho thất bại. Kiểm tra console/log.")
    } finally {
      setSaving(false)
    }
  }

  // ==============================
  // UI: List
  // ==============================
  const renderList = () => (
    <div className="border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-b">
            <TableHead className="w-[420px] font-medium">Sản phẩm</TableHead>
            <TableHead className="w-[120px] text-center font-medium">Giới tính</TableHead>
            <TableHead className="w-[160px] text-center font-medium">Danh mục</TableHead>
            <TableHead className="w-[520px] font-medium">Biến thể (Màu / Size / Giá / Tồn)</TableHead>
            <TableHead className="w-[140px] font-medium text-center">Tổng tồn</TableHead>
            <TableHead className="w-[80px]" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={6} className="py-16 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Warehouse className="h-8 w-8" />
                  <p className="text-sm">Đang tải kho...</p>
                </div>
              </TableCell>
            </TableRow>
          )}

          {!loading && filteredProducts.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-16 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Package className="h-8 w-8" />
                  <p className="text-sm">Không tìm thấy sản phẩm</p>
                </div>
              </TableCell>
            </TableRow>
          )}

          {!loading &&
            filteredProducts.map((p) => {
              const total = sumProductStock(p)

              return (
                <TableRow key={p.id} className="border-b hover:bg-muted/30">
                  {/* Product */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 min-w-[56px] border bg-muted">
                        <Image
                          src={p.image || "/placeholder.svg"}
                          alt={p.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm line-clamp-2">{p.name}</p>
                        <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                          <span>SKU: {sumSku(p)}</span>
                          <span>•</span>
                          <span>Giá gốc: {formatCurrency(p.basePrice)}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Gender */}
                  <TableCell className="py-3 text-center">
                    <span className="text-sm capitalize">{p.gender}</span>
                  </TableCell>

                  {/* Category */}
                  <TableCell className="py-3 text-center">
                    <span className="text-sm">{p.category}</span>
                  </TableCell>

                  {/* Variants */}
                  <TableCell className="py-3">
                    <div className="space-y-2">
                      {p.variants.map((v, vidx) => (
                        <div key={v.id} className="border p-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium">{v.color}</span>
                            <span className="text-xs text-muted-foreground">Tồn: {sumStock(v)}</span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {v.sizes.map((s) => {
                              const low = s.stock <= lowStockThreshold
                              return (
                                <div
                                  key={s.id}
                                  className={cn(
                                    "px-2 py-1 border text-xs flex items-center gap-2",
                                    s.stock === 0 && "opacity-60",
                                    low && "bg-muted/40"
                                  )}
                                >
                                  <span className="font-medium">Size {s.size}</span>
                                  <span className="text-muted-foreground">• {formatCurrency(s.price)}</span>
                                  <span className={cn("text-muted-foreground", low && "font-medium")}>
                                    • Tồn: {s.stock}
                                  </span>
                                  {badgeForStock(s.stock)}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => openStockDialog(p, vidx, s.id)}
                                    disabled={saving}
                                  >
                                    <PlusCircle className="h-3 w-3 mr-1" />
                                    Nhập
                                  </Button>
                                </div>
                              )
                            })}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 h-7 text-xs"
                            onClick={() => openStockDialog(p, vidx)}
                            disabled={saving}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Nhập theo màu
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TableCell>

                  {/* Total stock */}
                  <TableCell className="py-3 text-center">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{total}</div>
                      <div className="text-xs text-muted-foreground">tổng tồn</div>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openStockDialog(p, 0)}>
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Nhập hàng
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

  // ==============================
  // UI: Grid
  // ==============================
  const renderGrid = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {loading && (
        <div className="col-span-full py-16 text-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Warehouse className="h-8 w-8" />
            <p className="text-sm">Đang tải kho...</p>
          </div>
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="col-span-full py-16 text-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Package className="h-8 w-8" />
            <p className="text-sm">Không tìm thấy sản phẩm</p>
          </div>
        </div>
      )}

      {!loading &&
        filteredProducts.map((p) => {
          const total = sumProductStock(p)
          const isLow = p.variants.some((v) => v.sizes.some((s) => s.stock <= lowStockThreshold))

          return (
            <Card key={p.id} className="overflow-hidden">
              <div className="relative aspect-square bg-muted">
                <Image src={p.image || "/placeholder.svg"} alt={p.name} fill className="object-cover" />
                {isLow && (
                  <div className="absolute top-2 right-2 bg-foreground text-background px-2 py-1 text-xs font-medium">
                    Sắp hết
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="font-medium text-sm line-clamp-2 mb-2">{p.name}</h3>

                <div className="flex gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
                  <span className="capitalize">{p.gender}</span>
                  <span>•</span>
                  <span>{p.category}</span>
                  <span>•</span>
                  <span>Tồn: {total}</span>
                </div>

                <div className="space-y-2">
                  {p.variants.map((v, vidx) => (
                    <div key={v.id} className="border p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{v.color}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => openStockDialog(p, vidx)}
                          disabled={saving}
                        >
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Nhập
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {v.sizes.map((s) => (
                          <div key={s.id} className="text-xs text-muted-foreground border px-2 py-1">
                            {s.size}: {s.stock}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
    </div>
  )

  const currentVariant = selectedProduct?.variants?.[selectedVariantIndex]
  const currentSize = currentVariant?.sizes?.find((x) => x.id === selectedSizeId)

  // ==============================
  // Main render
  // ==============================
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Kho hàng</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý tồn kho theo Màu / Size và thực hiện nhập hàng (tăng stock)
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tổng sản phẩm</p>
                  <p className="text-xl font-bold">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Warehouse className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tổng SKU</p>
                  <p className="text-xl font-bold">{totalSkus}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <List className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tổng tồn</p>
                  <p className="text-xl font-bold">{totalStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">SKU sắp hết</p>
                  <p className="text-xl font-bold">{lowStockSkuCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả giới tính</SelectItem>
                  {genders.map((g) => (
                    <SelectItem key={g} value={g} className="capitalize">
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-3">
                <Switch checked={onlyLowStock} onCheckedChange={setOnlyLowStock} />
                <div className="space-y-0.5">
                  <Label>Lọc sắp hết</Label>
                  <div className="text-xs text-muted-foreground">
                    ≤ {lowStockThreshold} sp / SKU
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {viewMode === "list" ? renderList() : renderGrid()}

        {/* Dialog: Nhập hàng */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle>Nhập hàng / Cập nhật tồn</DialogTitle>
              <DialogDescription>
                {selectedProduct?.name}
                {currentVariant?.color ? ` — Màu: ${currentVariant.color}` : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Chọn Size */}
              {currentVariant && (
                <div className="space-y-2">
                  <Label>Chọn Size (SKU)</Label>
                  <Select value={selectedSizeId} onValueChange={setSelectedSizeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn size" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentVariant.sizes.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          Size {s.size} • Tồn: {s.stock} • Giá: {formatCurrency(s.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {currentSize && (
                    <div className="text-xs text-muted-foreground">
                      Trạng thái: {currentSize.stock <= 0 ? "Hết hàng" : currentSize.stock <= lowStockThreshold ? "Sắp hết" : "Ổn"}
                    </div>
                  )}
                </div>
              )}

              {/* Action type */}
              <div className="space-y-3">
                <Label>Hành động</Label>
                <RadioGroup value={actionType} onValueChange={(v: ActionType) => setActionType(v)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ADD" id="add" />
                    <Label htmlFor="add" className="font-normal cursor-pointer">
                      Nhập thêm (tăng tồn)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="SET" id="set" />
                    <Label htmlFor="set" className="font-normal cursor-pointer">
                      Đặt tồn chính xác (set stock)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {actionType === "ADD" ? (
                <div className="space-y-2">
                  <Label htmlFor="qty">Số lượng nhập</Label>
                  <Input
                    id="qty"
                    type="number"
                    min={1}
                    placeholder="VD: 10"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="setStock">Tồn kho mới</Label>
                  <Input
                    id="setStock"
                    type="number"
                    min={0}
                    placeholder="VD: 25"
                    value={setStockValue}
                    onChange={(e) => setSetStockValue(e.target.value)}
                  />
                </div>
              )}

              {/* Summary */}
              {currentSize && (
                <div className="rounded-xl border p-3 bg-muted/30 space-y-1 text-sm">
                  <div className="font-medium">Tóm tắt</div>
                  <div className="text-xs text-muted-foreground">
                    Size {currentSize.size} • Giá: {formatCurrency(currentSize.price)}
                  </div>
                  <div className="text-xs text-muted-foreground">Tồn hiện tại: {currentSize.stock}</div>

                  {actionType === "ADD" && quantity && Number.parseInt(quantity, 10) > 0 && (
                    <div className="text-xs">
                      Sau nhập: <span className="font-medium">{currentSize.stock + Number.parseInt(quantity, 10)}</span>
                    </div>
                  )}

                  {actionType === "SET" && setStockValue && Number.parseInt(setStockValue, 10) >= 0 && (
                    <div className="text-xs">
                      Sau set: <span className="font-medium">{Number.parseInt(setStockValue, 10)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                Hủy
              </Button>
              <Button
                onClick={submitStock}
                disabled={
                  saving ||
                  !selectedProduct ||
                  !selectedSizeId ||
                  (actionType === "ADD" && (!quantity || Number.parseInt(quantity, 10) <= 0)) ||
                  (actionType === "SET" && (!setStockValue || Number.parseInt(setStockValue, 10) < 0))
                }
              >
                {saving ? "Đang lưu..." : "Cập nhật kho"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
