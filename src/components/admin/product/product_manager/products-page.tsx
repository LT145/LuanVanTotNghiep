"use client"

import { useState, useMemo, useEffect } from "react"
import { fetchAdminProducts } from "@/lib/api/admin/all_product"
import type {
  AllProduct,
  AllProductVariantColor,
  AllProductVariantSize,
  AllProductImage,
} from "@/types/product"

// ===============================
// 🔢 TÍNH TỔNG TỒN KHO
// ===============================
// 🔢 TÍNH TỔNG TỒN KHO
function getTotalStock(stock: Record<string, number>) {
  return Object.values(stock).reduce((s, n) => s + n, 0)
}

// 🔁 MAPPER Prisma Product → AllProduct (UI)
function mapPrismaProduct(p: any): AllProduct {
  const sizeStock: Record<string, number> = {}

  // gom tồn kho theo size
  p.variantColors?.forEach((color: any) => {
    color.sizes.forEach((s: any) => {
      const key = (s.size || "").toUpperCase()
      sizeStock[key] = (sizeStock[key] || 0) + s.stock
    })
  })

  const totalStock = getTotalStock(sizeStock)

  // gender UI
  let gender: AllProduct["gender"] = "Unisex"
  if (p.category?.gender === "MALE") gender = "Nam"
  if (p.category?.gender === "FEMALE") gender = "Nữ"

  // status UI
  let status: AllProduct["status"] = "active"
  if (!p.isActive) status = "inactive"
  else if (totalStock === 0) status = "outofstock"

  // chọn ảnh chính
  const mainImg: string =
    p.images?.find((i: any) => i.isMain)?.url ||
    p.images?.[0]?.url ||
    "/placeholder.svg"

  // map variantColors
  const variantColors: AllProductVariantColor[] =
    p.variantColors?.map(
      (c: any): AllProductVariantColor => ({
        id: c.id,
        color: c.color,
        productId: c.productId,
        createdAt: c.createdAt,
        sizes:
          c.sizes?.map(
            (s: any): AllProductVariantSize => ({
              id: s.id,
              size: s.size,
              price: Number(s.price),
              stock: s.stock,
              colorVariantId: s.colorVariantId,
              createdAt: s.createdAt,
            }),
          ) ?? [],
      }),
    ) ?? []

  // map images
  const images: AllProductImage[] =
    p.images?.map(
      (img: any): AllProductImage => ({
        id: img.id,
        url: img.url,
        isMain: img.isMain,
        productId: img.productId,
        variantColorId: img.variantColorId,
        createdAt: img.createdAt,
      }),
    ) ?? []

  return {
    // raw
    id: p.id,
    name: p.name,
    basePrice: Number(p.basePrice || 0),
    costPrice: Number(p.costPrice || 0),
    isActive: !!p.isActive,
    createdAt: p.createdAt,
    categoryId: p.categoryId,
    category: p.category
      ? {
          id: p.category.id,
          name: p.category.name,
          slug: p.category.slug,
          imageUrl: p.category.imageUrl,
          gender: p.category.gender,
        }
      : undefined,
      description:"",
    images,
    variantColors,
    soldCount: p.soldCount,

    // UI
    image: mainImg,
    gender,
    subcategory: p.category?.name || "Chưa phân loại",
    price: Number(p.basePrice || 0),
    salePrice: null,        // sẽ chỉnh trong dialog edit nếu có KM
    sizeStock,
    status,
  }
}


// ==========================================
// UI IMPORT
// ==========================================
import ProductsHeader from "./products-header"
import ProductsStats from "./products-stats"
import ProductsFilters from "./products-filters"
import ProductsTable from "./products-table"
import ProductsGrid from "./products-grid"
import ProductsPagination from "./products-pagination"
import ProductViewDialog from "./product-view-dialog"
import ProductEditDialog from "./product-edit-dialog"

export default function AllProductsPage() {
  const [products, setProducts] = useState<AllProduct []>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [genderFilter, setGenderFilter] = useState("all")
  const [subcategoryFilter, setSubcategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")

  const [sortField, setSortField] = useState<"createdAt" | "name" | "price" | "stock">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [viewProduct, setViewProduct] = useState<AllProduct  | null>(null)
  const [editProduct, setEditProduct] = useState<AllProduct  | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<AllProduct  | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  // ===================
  // OPTIONS CHO FILTER
  // ===================

  const genderOptions = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      if (p.gender) set.add(p.gender)
    })
    return Array.from(set)
  }, [products])

  const subcategoryOptions = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      if (p.subcategory) set.add(p.subcategory)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, "vi"))
  }, [products])

  const statusOptions = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      if (p.status) set.add(p.status)
    })
    return Array.from(set)
  }, [products])

  // ===================
  // LOAD DATA FROM API
  // ===================
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const raw = await fetchAdminProducts()
        const mapped: AllProduct [] = raw.map(mapPrismaProduct)
        setProducts(mapped)
      } catch (err) {
        console.error(err)
        setError("Không thể tải sản phẩm")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ===================
  // FILTER + SORT
  // ===================
  const filteredProducts = useMemo(() => {
    let rs = [...products]

    // search theo tên & danh mục
    if (search) {
      const s = search.toLowerCase()
      rs = rs.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.subcategory.toLowerCase().includes(s),
      )
    }

    if (genderFilter !== "all") rs = rs.filter((p) => p.gender === genderFilter)
    if (subcategoryFilter !== "all")
      rs = rs.filter((p) => p.subcategory === subcategoryFilter)
    if (statusFilter !== "all") rs = rs.filter((p) => p.status === statusFilter)

    if (priceFilter !== "all") {
      rs = rs.filter((p) => {
        const price = p.salePrice ?? p.price
        if (priceFilter === "under200") return price < 200000
        if (priceFilter === "200to500") return price >= 200000 && price <= 500000
        if (priceFilter === "over500") return price > 500000
        return true
      })
    }

    // sort
    rs.sort((a, b) => {
      let cmp = 0

      if (sortField === "name") {
        cmp = a.name.localeCompare(b.name)
      }

      if (sortField === "price") {
        cmp = (a.salePrice ?? a.price) - (b.salePrice ?? b.price)
      }

      if (sortField === "stock") {
        cmp = getTotalStock(a.sizeStock) - getTotalStock(b.sizeStock)
      }

      if (sortField === "createdAt") {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }

      return sortOrder === "asc" ? cmp : -cmp
    })

    return rs
  }, [
    products,
    search,
    genderFilter,
    subcategoryFilter,
    statusFilter,
    priceFilter,
    sortField,
    sortOrder,
  ])

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredProducts.slice(start, start + pageSize)
  }, [filteredProducts, currentPage, pageSize])

  // STATS
  const stats = useMemo(() => {
    const total = products.length
    const active = products.filter((p) => p.status === "active").length
    const outofstock = products.filter((p) => p.status === "outofstock").length
    const totalValue = products.reduce(
      (sum, p) => sum + p.price * getTotalStock(p.sizeStock),
      0,
    )
    return { total, active, outofstock, totalValue }
  }, [products])

  // ===================
  // UI LOADING / ERROR
  // ===================
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Đang tải sản phẩm...
      </div>
    )

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="text-red-500">{error}</div>
        <button
          className="px-4 py-2 bg-primary text-white rounded-md"
          onClick={() => location.reload()}
        >
          Thử lại
        </button>
      </div>
    )

  // ===================
  // UI CHÍNH
  // ===================
  return (
    <div className="min-h-screen bg-background">
      <main className="p-4 lg:p-8">
        <ProductsHeader />

        <ProductsStats stats={stats} />

        <ProductsFilters
          search={search}
          setSearch={setSearch}
          genderFilter={genderFilter}
          setGenderFilter={setGenderFilter}
          subcategoryFilter={subcategoryFilter}
          setSubcategoryFilter={setSubcategoryFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priceFilter={priceFilter}
          setPriceFilter={setPriceFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
          genderOptions={genderOptions}
          subcategoryOptions={subcategoryOptions}
          statusOptions={statusOptions}
        />

        {viewMode === "table" ? (
          <ProductsTable
            products={paginatedProducts}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onView={(p) => setViewProduct(p)}
            onEdit={(p) => setEditProduct(p)}
            onDelete={async (p) => {
  const res = await fetch("/api/admin/products/toggle-status", {
    method: "POST",
    body: JSON.stringify({ productId: p.id }),
    headers: { "Content-Type": "application/json" },
  })

  const json = await res.json()

  if (json.success) {
    // cập nhật lại state UI
    setProducts((prev) =>
      prev.map((item) =>
        item.id === p.id ? { ...item, isActive: json.isActive, status: json.isActive ? "active" : "inactive" } : item
      )
    )
  }
}}

          />
        ) : (
          <ProductsGrid
            products={paginatedProducts}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onView={(p) => setViewProduct(p)}
            onEdit={(p) => setEditProduct(p)}
            onDelete={async (p) => {
  const res = await fetch("/api/admin/products/toggle-status", {
    method: "POST",
    body: JSON.stringify({ productId: p.id }),
    headers: { "Content-Type": "application/json" },
  })

  const json = await res.json()

  if (json.success) {
    // cập nhật lại state UI
    setProducts((prev) =>
      prev.map((item) =>
        item.id === p.id ? { ...item, isActive: json.isActive, status: json.isActive ? "active" : "inactive" } : item
      )
    )
  }
}}

          />
        )}

        <ProductsPagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />

        <ProductViewDialog
          product={viewProduct}
          onClose={() => setViewProduct(null)}
        />

        <ProductEditDialog
          product={editProduct}
          setProducts={setProducts}
          onClose={() => setEditProduct(null)}
        />

        {/* Nếu vẫn cần xóa 1 sản phẩm riêng, thêm lại ProductDeleteDialog ở đây */}


      </main>
    </div>
  )
}
