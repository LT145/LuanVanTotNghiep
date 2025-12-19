// src/types/all_product.ts

// Trạng thái hiển thị trong admin
export type AllProductStatus = "active" | "inactive" | "outofstock"

// Giới tính UI (map từ enum Gender của Prisma)
export type AllProductGender = "Nam" | "Nữ" | "Unisex"

// Category trả về từ API
export interface AllProductCategory {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  gender: "MALE" | "FEMALE" | "UNISEX"
}

// Ảnh sản phẩm (product.images)
export interface AllProductImage {
  id: string
  url: string
  isMain: boolean
  productId: string | null
  variantColorId: string | null
  createdAt: string
}

// Size trong một biến thể màu
export interface AllProductVariantSize {
  id: string
  size: string
  price: number
  stock: number
  colorVariantId: string
  createdAt: string
}

// Biến thể màu
export interface AllProductVariantColor {
  id: string
  color: string
  productId: string
  createdAt: string
  sizes: AllProductVariantSize[]
}

// 👉 Type chính dùng cho trang AllProducts
export interface AllProduct {
  // ----- dữ liệu raw từ API / DB -----
  id: string
  name: string
  basePrice: number
  costPrice: number
  isActive: boolean
  createdAt: string
  categoryId: string
  category?: AllProductCategory
  images: AllProductImage[]
  variantColors: AllProductVariantColor[]
  description:string
  // ----- field phục vụ UI admin -----
  image: string              // ảnh hiển thị chính
  gender: AllProductGender   // "nam" | "nu" | "unisex"
  subcategory: string        // tên danh mục (Áo thun, Quần,...)
  price: number              // giá dùng để sort/filter (mặc định = basePrice)
  salePrice: number | null   // giá KM (nếu có)
  sizeStock: Record<string, number> // tổng tồn kho theo size: { M: 5, L: 3, ... }
  status: AllProductStatus   // "active" | "inactive" | "outofstock"
  soldCount: number        // số lượng đã bán
}
