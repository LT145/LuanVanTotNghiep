"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import {
  Search,
  Package,
  TrendingUp,
  DollarSign,
  List,
  Grid,
  Tag,
  PlusCircle,
  Trash2,
  MoreHorizontal,
  Pencil,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// ==============================
// Types (match API shape)
// ==============================
type PromoItem = { price: number; startDate: string; endDate: string }

interface ProductSize {
  id: string // sizeId
  size: string
  inventory: number
  price?: number
}

interface ProductVariant {
  id: string // colorVariantId
  color: string
  sizes: ProductSize[]
  promotions?: {
    [sizeLabel: string]: PromoItem
  }
}

interface Product {
  id: string // productId
  name: string
  gender: string
  category: string
  image: string
  variants: ProductVariant[]
  basePrice: number
  sold: number
  status: string
}

function getTotalInventory(variant: ProductVariant) {
  return variant.sizes.reduce((sum, s) => sum + s.inventory, 0)
}

export default function PromotionManager() {
  // ==============================
  // Data
  // ==============================
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // ==============================
  // Filters/UI
  // ==============================
  const [searchQuery, setSearchQuery] = useState("")
  const [genderFilter, setGenderFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [promoFilter, setPromoFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  // ==============================
  // Dialog state
  // ==============================
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [promotionType, setPromotionType] = useState<"all" | "specific">("all")
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]) // sizeLabel[] (S, M, L)
  const [promotionPrice, setPromotionPrice] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // ==============================
  // API
  // ==============================
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/promotions", { cache: "no-store" })
      const json = await res.json()
      if (!res.ok || !json?.ok) throw new Error(json?.message || "Fetch failed")
      setProducts(json.data as Product[])
    } catch (e) {
      console.error(e)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // ==============================
  // Derived
  // ==============================
  const genders = useMemo(() => Array.from(new Set(products.map((p) => p.gender))), [products])
  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), [products])

  const totalProducts = products.length
  const productsWithPromotion = products.filter((p) =>
    p.variants.some((v) => v.promotions && Object.keys(v.promotions).length > 0),
  ).length

  const totalValue = products.reduce((sum, p) => {
    const variantTotal = p.variants.reduce((vSum, v) => {
      const sizeTotal = v.sizes.reduce((sSum, s) => sSum + (s.price || p.basePrice) * s.inventory, 0)
      return vSum + sizeTotal
    }, 0)
    return sum + variantTotal
  }, 0)

  const filteredProducts = products.filter((product) => {
    const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchGender = genderFilter === "all" || product.gender === genderFilter
    const matchCategory = categoryFilter === "all" || product.category === categoryFilter
    const hasPromotion = product.variants.some((v) => v.promotions && Object.keys(v.promotions).length > 0)
    const matchPromo =
      promoFilter === "all" ||
      (promoFilter === "with-promo" && hasPromotion) ||
      (promoFilter === "no-promo" && !hasPromotion)

    return matchSearch && matchGender && matchCategory && matchPromo
  })

  // ==============================
  // Helpers
  // ==============================
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const getPromotionStatus = (promotion: PromoItem | undefined) => {
    if (!promotion) return null
    const now = new Date()
    const start = new Date(promotion.startDate)
    const end = new Date(promotion.endDate)
    if (now < start) return "upcoming"
    if (now > end) return "expired"
    return "active"
  }

  // ==============================
  // Dialog actions
  // ==============================
  const openAddPromotion = (product: Product, variantIndex = 0) => {
    setSelectedProduct(product)
    setSelectedVariantIndex(variantIndex)
    setPromotionType("all")
    setSelectedSizes([])
    setPromotionPrice("")
    setStartDate("")
    setEndDate("")
    setIsDialogOpen(true)
  }

  const savePromotion = async () => {
    if (!selectedProduct || !promotionPrice || !startDate || !endDate) return
    const price = Number.parseFloat(promotionPrice)
    if (!Number.isFinite(price) || price <= 0) return

    const variant = selectedProduct.variants[selectedVariantIndex]
    if (!variant?.id) return

    // map selectedSizes (label) -> sizeIds
    const sizeIds =
      promotionType === "specific"
        ? selectedSizes.map((label) => variant.sizes.find((x) => x.size === label)?.id).filter(Boolean)
        : undefined

    try {
      setSaving(true)
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          colorVariantId: variant.id,
          promotionType,
          sizeIds,
          promotionPrice: price,
          startDate,
          endDate,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json?.ok) throw new Error(json?.message || "Save promotion failed")

      setIsDialogOpen(false)
      setSelectedProduct(null)
      setSelectedSizes([])
      setPromotionPrice("")
      setStartDate("")
      setEndDate("")

      await fetchProducts()
    } catch (e) {
      console.error(e)
      // bạn có thể thay bằng toast
      alert("Lưu khuyến mãi thất bại. Kiểm tra console/log.")
    } finally {
      setSaving(false)
    }
  }

  const removePromotion = async (productId: string, variantIndex: number, sizeLabel?: string) => {
    const product = products.find((p) => p.id === productId)
    const variant = product?.variants?.[variantIndex]
    if (!variant?.id) return

    const sizeId = sizeLabel ? variant.sizes.find((s) => s.size === sizeLabel)?.id : undefined

    try {
      setSaving(true)
      const res = await fetch("/api/admin/promotions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          colorVariantId: variant.id,
          ...(sizeId ? { sizeId } : {}),
        }),
      })
      const json = await res.json()
      if (!res.ok || !json?.ok) throw new Error(json?.message || "Remove promotion failed")

      await fetchProducts()
    } catch (e) {
      console.error(e)
      alert("Xóa khuyến mãi thất bại. Kiểm tra console/log.")
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
            <TableHead className="w-[380px] font-medium">Sản phẩm</TableHead>
            <TableHead className="w-[100px] text-center font-medium">Giới tính</TableHead>
            <TableHead className="w-[140px] text-center font-medium">Danh mục</TableHead>
            <TableHead className="w-[420px] font-medium">Màu / Size</TableHead>
            <TableHead className="w-[240px] font-medium">Khuyến mãi</TableHead>
            <TableHead className="w-[80px]" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={6} className="py-16 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Package className="h-8 w-8" />
                  <p className="text-sm">Đang tải...</p>
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
            filteredProducts.map((product) => {
              const hasPromotion = product.variants.some((v) => v.promotions && Object.keys(v.promotions).length > 0)
              const totalInv = product.variants.reduce((sum, v) => sum + getTotalInventory(v), 0)

              return (
                <TableRow key={product.id} className="border-b hover:bg-muted/30">
                  {/* Product */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 min-w-[56px] border bg-muted">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm line-clamp-2">{product.name}</p>
                        <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                          <span>Kho: {totalInv}</span>
                          {hasPromotion && <span>• KM</span>}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Gender */}
                  <TableCell className="py-3 text-center">
                    <span className="text-sm capitalize">{product.gender}</span>
                  </TableCell>

                  {/* Category */}
                  <TableCell className="py-3 text-center">
                    <span className="text-sm">{product.category}</span>
                  </TableCell>

                  {/* Color / Size / Stock */}
                  <TableCell className="py-3">
                    <div className="space-y-2">
                      {product.variants.map((v, idx) => {
                        const vInv = getTotalInventory(v)
                        return (
                          <div key={v.id} className="border p-2">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-medium">{v.color}</span>
                              <span className="text-xs text-muted-foreground">Kho: {vInv}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {v.sizes.map((s) => {
                                const qty = s.inventory
                                const base = s.price || product.basePrice
                                return (
                                  <div key={s.id} className={cn("px-2 py-1 border text-xs", qty === 0 && "opacity-40")}>
                                    <span className="font-medium">{s.size}</span>
                                    <span className="text-muted-foreground"> • {formatCurrency(base)}</span>
                                    <span className="text-muted-foreground"> • {qty}</span>
                                  </div>
                                )
                              })}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-1.5 h-7 text-xs"
                              onClick={() => openAddPromotion(product, idx)}
                              disabled={saving}
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Sửa KM
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </TableCell>

                  {/* Promotions */}
                  <TableCell className="py-3">
                    <div className="space-y-2">
                      {product.variants.map((v, idx) => {
                        const keys = Object.keys(v.promotions || {})
                        const has = keys.length > 0

                        return (
                          <div key={v.id} className="border p-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium">{v.color}</span>
                              {has && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() => removePromotion(product.id, idx)}
                                  disabled={saving}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>

                            {!has ? (
                              <div className="text-xs text-muted-foreground">Chưa có</div>
                            ) : (
                              <div className="space-y-1">
                                {keys.map((sizeLabel) => {
                                  const promo = v.promotions?.[sizeLabel]
                                  const status = getPromotionStatus(promo)
                                  if (!promo) return null

                                  return (
                                    <div key={sizeLabel} className="border-l-2 border-foreground pl-2 py-1">
                                      <div className="text-xs">
                                        <span className="font-medium">{sizeLabel}</span>
                                        <span className="text-muted-foreground"> • {formatCurrency(promo.price)}</span>
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                                      </div>
                                      {status && (
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                          {status === "active" && "Đang áp dụng"}
                                          {status === "upcoming" && "Sắp diễn ra"}
                                          {status === "expired" && "Đã hết hạn"}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
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
                        <DropdownMenuItem onClick={() => openAddPromotion(product)}>
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Thêm KM
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
            <Package className="h-8 w-8" />
            <p className="text-sm">Đang tải...</p>
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
        filteredProducts.map((product) => {
          const hasPromotion = product.variants.some((v) => v.promotions && Object.keys(v.promotions).length > 0)
          const totalInv = product.variants.reduce((sum, v) => sum + getTotalInventory(v), 0)

          return (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative aspect-square bg-muted">
                <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                {hasPromotion && (
                  <div className="absolute top-2 right-2 bg-foreground text-background px-2 py-1 text-xs font-medium">
                    KM
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="font-medium text-sm line-clamp-2 mb-2">{product.name}</h3>

                <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                  <span>{product.gender}</span>
                  <span>•</span>
                  <span>{product.category}</span>
                  <span>•</span>
                  <span>Kho: {totalInv}</span>
                </div>

                <div className="space-y-2">
                  {product.variants.map((v, idx) => {
                    const keys = Object.keys(v.promotions || {})
                    const has = keys.length > 0

                    return (
                      <div key={v.id} className="border p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">{v.color}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => openAddPromotion(product, idx)}
                            disabled={saving}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>

                        {has ? (
                          <div className="text-xs text-muted-foreground">{keys.length} KM đang áp dụng</div>
                        ) : (
                          <div className="text-xs text-muted-foreground">Chưa có KM</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
    </div>
  )

  // ==============================
  // Main render
  // ==============================
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Quản lý khuyến mãi</h1>
            <p className="text-sm text-muted-foreground mt-1">Quản lý giá khuyến mãi cho sản phẩm</p>
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
                <Tag className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Có khuyến mãi</p>
                  <p className="text-xl font-bold">{productsWithPromotion}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Giá trị tồn kho</p>
                  <p className="text-xl font-bold">{formatCurrency(totalValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Đang hiển thị</p>
                  <p className="text-xl font-bold">{filteredProducts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="relative">
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

              <Select value={promoFilter} onValueChange={setPromoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Khuyến mãi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="with-promo">Có KM</SelectItem>
                  <SelectItem value="no-promo">Chưa có KM</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
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

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle>Thêm giá khuyến mãi</DialogTitle>
              <DialogDescription>
                Sản phẩm: {selectedProduct?.name} - Màu: {selectedProduct?.variants[selectedVariantIndex]?.color}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <Label>Áp dụng khuyến mãi cho</Label>
                <RadioGroup
                  value={promotionType}
                  onValueChange={(value: "all" | "specific") => {
                    setPromotionType(value)
                    if (value === "all") setSelectedSizes([])
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="font-normal cursor-pointer">
                      Toàn bộ sizes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="specific" id="specific" />
                    <Label htmlFor="specific" className="font-normal cursor-pointer">
                      Chọn size cụ thể
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {promotionType === "specific" && selectedProduct && (
                <div className="space-y-3 border rounded-xl p-3 bg-muted/30">
                  <Label>Chọn sizes áp dụng khuyến mãi</Label>
                  <div className="space-y-2">
                    {selectedProduct.variants[selectedVariantIndex].sizes.map((s) => (
                      <div key={s.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`size-${s.id}`}
                          checked={selectedSizes.includes(s.size)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedSizes((prev) => [...prev, s.size])
                            else setSelectedSizes((prev) => prev.filter((x) => x !== s.size))
                          }}
                        />
                        <Label htmlFor={`size-${s.id}`} className="font-normal cursor-pointer flex items-center gap-2">
                          <span className="font-medium">Size {s.size}</span>
                          <span className="text-muted-foreground">
                            - Giá: {formatCurrency(s.price || selectedProduct.basePrice)}
                          </span>
                          <span className="text-muted-foreground">- Tồn: {s.inventory}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="promotion-price">Giá khuyến mãi (₫)</Label>
                <Input
                  id="promotion-price"
                  type="number"
                  placeholder="Nhập giá khuyến mãi"
                  value={promotionPrice}
                  onChange={(e) => setPromotionPrice(e.target.value)}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-date">Ngày bắt đầu</Label>
                <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">Ngày kết thúc</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>

              {promotionPrice && selectedProduct && Number.parseFloat(promotionPrice) > 0 && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl space-y-2">
                  <p className="text-sm font-medium text-foreground">Tóm tắt khuyến mãi:</p>

                  {promotionType === "all" ? (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Áp dụng cho tất cả sizes</p>
                      {selectedProduct.variants[selectedVariantIndex].sizes.map((s) => {
                        const originalPrice = s.price || selectedProduct.basePrice
                        const discount = originalPrice - Number.parseFloat(promotionPrice)
                        const discountPercent = ((discount / originalPrice) * 100).toFixed(0)

                        return (
                          <div key={s.id} className="text-sm">
                            <span className="font-medium">Size {s.size}:</span>
                            <span className="text-emerald-600 dark:text-emerald-400 ml-2">
                              Giảm {formatCurrency(discount)} ({discountPercent}%)
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Áp dụng cho {selectedSizes.length} size: {selectedSizes.join(", ")}
                      </p>

                      {selectedSizes.map((size) => {
                        const sizeData = selectedProduct.variants[selectedVariantIndex].sizes.find(
                          (s) => s.size === size,
                        )
                        if (!sizeData) return null

                        const originalPrice = sizeData.price || selectedProduct.basePrice
                        const discount = originalPrice - Number.parseFloat(promotionPrice)
                        const discountPercent = ((discount / originalPrice) * 100).toFixed(0)

                        return (
                          <div key={sizeData.id} className="text-sm">
                            <span className="font-medium">Size {size}:</span>
                            <span className="text-emerald-600 dark:text-emerald-400 ml-2">
                              Giảm {formatCurrency(discount)} ({discountPercent}%)
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {startDate && endDate && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Từ {formatDate(startDate)} đến {formatDate(endDate)}
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                Hủy
              </Button>
              <Button
                onClick={savePromotion}
                disabled={
                  saving ||
                  !promotionPrice ||
                  Number.parseFloat(promotionPrice) <= 0 ||
                  !startDate ||
                  !endDate ||
                  (promotionType === "specific" && selectedSizes.length === 0)
                }
              >
                {saving ? "Đang lưu..." : "Lưu khuyến mãi"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
