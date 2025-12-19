export type Gender = "nam" | "nu" | "unisex"

export type Category = {
  id: string
  name: string
  gender: Gender
  subcategories: string[]
}

export type SizeStock = {
  [size: string]: number
}

export type Product = {
  id: string
  name: string
  sku: string
  gender: Gender
  category: string
  subcategory: string
  price: number
  salePrice?: number
  sizeStock: SizeStock
  sizes: string[]
  colors: string[]
  status: "active" | "inactive" | "outofstock"
  image: string
  description: string
  createdAt: string
  updatedAt: string
    costPrice: number
  soldCount: number
}

export type StockHistory = {
  id: string
  productId: string
  productName: string
  productSku: string
  size: string
  type: "import" | "export" | "adjust"
  quantity: number
  previousStock: number
  newStock: number
  note: string
  createdAt: string
  createdBy: string
}

export const categories: Category[] = [
  {
    id: "1",
    name: "Nam",
    gender: "nam",
    subcategories: ["Áo thun", "Áo sơ mi", "Áo khoác", "Quần jeans", "Quần tây", "Quần short", "Đồ thể thao", "Đồ lót"],
  },
  {
    id: "2",
    name: "Nữ",
    gender: "nu",
    subcategories: [
      "Áo thun",
      "Áo sơ mi",
      "Áo kiểu",
      "Đầm/Váy",
      "Quần jeans",
      "Quần tây",
      "Chân váy",
      "Đồ ngủ",
      "Đồ lót",
    ],
  },
  {
    id: "3",
    name: "Unisex",
    gender: "unisex",
    subcategories: ["Áo thun", "Áo hoodie", "Áo khoác", "Quần jogger", "Phụ kiện"],
  },
]

const genderNames: Record<Gender, string> = {
  nam: "Nam",
  nu: "Nữ",
  unisex: "Unisex",
}

const allSubcategories = categories.flatMap((c) =>
  c.subcategories.map((sub) => ({ gender: c.gender, category: c.name, subcategory: sub })),
)

const productNames: Record<string, string[]> = {
  "Áo thun": ["Áo thun cổ tròn", "Áo thun oversize", "Áo thun polo", "Áo thun form rộng", "Áo thun in họa tiết"],
  "Áo sơ mi": ["Áo sơ mi dài tay", "Áo sơ mi ngắn tay", "Áo sơ mi oxford", "Áo sơ mi kẻ sọc", "Áo sơ mi trơn"],
  "Áo khoác": ["Áo khoác bomber", "Áo khoác jean", "Áo khoác gió", "Áo khoác cardigan", "Áo khoác da"],
  "Quần jeans": [
    "Quần jeans skinny",
    "Quần jeans slim fit",
    "Quần jeans regular",
    "Quần jeans baggy",
    "Quần jeans rách",
  ],
  "Quần tây": ["Quần tây công sở", "Quần tây slim fit", "Quần tây regular", "Quần tây ống suông"],
  "Quần short": ["Quần short kaki", "Quần short jeans", "Quần short thể thao", "Quần short lưng thun"],
  "Đồ thể thao": ["Bộ thể thao", "Áo tank top", "Quần tập gym", "Áo chạy bộ"],
  "Đồ lót": ["Quần lót boxer", "Quần lót brief", "Áo lót thể thao"],
  "Áo kiểu": ["Áo kiểu cổ V", "Áo peplum", "Áo croptop", "Áo 2 dây"],
  "Đầm/Váy": ["Đầm suông", "Đầm xòe", "Đầm body", "Đầm maxi", "Váy liền thân"],
  "Chân váy": ["Chân váy chữ A", "Chân váy bút chì", "Chân váy xếp ly", "Chân váy jean"],
  "Đồ ngủ": ["Bộ pyjama", "Váy ngủ", "Áo choàng ngủ"],
  "Áo hoodie": ["Hoodie oversize", "Hoodie zip", "Hoodie in họa tiết", "Hoodie trơn"],
  "Quần jogger": ["Jogger thun", "Jogger nỉ", "Jogger kaki"],
  "Phụ kiện": ["Mũ lưỡi trai", "Túi tote", "Tất/Vớ", "Khăn quàng"],
}

const colors = ["Đen", "Trắng", "Xám", "Navy", "Be", "Nâu", "Xanh lá", "Đỏ", "Hồng", "Vàng"]
const sizes = ["XS", "S", "M", "L", "XL", "XXL"]

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomSubset<T>(arr: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function generateSKU(gender: Gender, subcategory: string, index: number): string {
  const genderCode = gender === "nam" ? "M" : gender === "nu" ? "W" : "U"
  const catCode = subcategory.substring(0, 2).toUpperCase()
  return `${genderCode}${catCode}${String(index).padStart(4, "0")}`
}

export function getTotalStock(sizeStock: SizeStock): number {
  return Object.values(sizeStock).reduce((sum, qty) => sum + qty, 0)
}

export function getStockStatus(sizeStock: SizeStock): "instock" | "low" | "out" {
  const total = getTotalStock(sizeStock)
  if (total === 0) return "out"
  // Kiểm tra nếu có bất kỳ size nào sắp hết (<5)
  const hasLowStock = Object.values(sizeStock).some((qty) => qty > 0 && qty < 5)
  if (hasLowStock || total < 10) return "low"
  return "instock"
}

export function generateProducts(count: number): Product[] {
  const products: Product[] = []

  for (let i = 1; i <= count; i++) {
    const catInfo = randomFromArray(allSubcategories)
    const subcategory = catInfo.subcategory
    const names = productNames[subcategory] || [`${subcategory} mẫu`]
    const name = randomFromArray(names)
    const price = Math.floor(Math.random() * 900000 + 100000)
    const hasSale = Math.random() > 0.7
    const salePrice = hasSale ? Math.floor(price * (0.7 + Math.random() * 0.2)) : undefined

    const productSizes = randomSubset(sizes, 2, 6)

    const sizeStock: SizeStock = {}
    productSizes.forEach((size) => {
      sizeStock[size] = Math.floor(Math.random() * 50) // 0-49 cho mỗi size
    })

    const totalStock = getTotalStock(sizeStock)
    const status: Product["status"] = totalStock === 0 ? "outofstock" : Math.random() > 0.1 ? "active" : "inactive"

    const createdDate = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000))
    const updatedDate = new Date(createdDate.getTime() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))

    products.push({
      id: String(i),
      name: `${name} - ${randomFromArray(colors)}`,
      sku: generateSKU(catInfo.gender, subcategory, i),
      gender: catInfo.gender,
      category: catInfo.category,
      subcategory,
      price,
      salePrice,
      sizeStock,
      sizes: productSizes,
      colors: randomSubset(colors, 1, 4),
      status,
      image: `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(subcategory + " " + catInfo.gender)}`,
      description: `${name} chất liệu cao cấp, thiết kế hiện đại, phù hợp cho ${genderNames[catInfo.gender].toLowerCase()}.`,
      createdAt: createdDate.toISOString(),
      updatedAt: updatedDate.toISOString(),
        costPrice: 1,
  soldCount: 1
    })
  }

  return products
}

export function generateStockHistory(products: Product[], count: number): StockHistory[] {
  const history: StockHistory[] = []
  const types: StockHistory["type"][] = ["import", "export", "adjust"]
  const notes = {
    import: ["Nhập hàng từ nhà cung cấp", "Nhập bổ sung kho", "Nhập hàng mới về"],
    export: ["Xuất bán online", "Xuất bán cửa hàng", "Xuất trả nhà cung cấp"],
    adjust: ["Kiểm kê điều chỉnh", "Sản phẩm bị lỗi", "Hàng mẫu/tặng"],
  }

  for (let i = 1; i <= count; i++) {
    const product = randomFromArray(products)
    const size = randomFromArray(product.sizes)
    const type = randomFromArray(types)
    const quantity =
      type === "export"
        ? -Math.floor(Math.random() * 20 + 1)
        : Math.floor(Math.random() * 50 + 1) * (type === "adjust" ? (Math.random() > 0.5 ? 1 : -1) : 1)
    const previousStock = Math.floor(Math.random() * 100 + 10)
    const createdDate = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))

    history.push({
      id: String(i),
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      size, // Thêm size vào history
      type,
      quantity,
      previousStock,
      newStock: Math.max(0, previousStock + quantity),
      note: randomFromArray(notes[type]),
      createdAt: createdDate.toISOString(),
      createdBy: "Admin",
    })
  }

  return history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const sampleProducts = generateProducts(1000)
export const sampleStockHistory = generateStockHistory(sampleProducts, 100)
