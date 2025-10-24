export type Product = {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  type: "male" | "female" | "kids"
  colors: string[]
  sizes: string[]
  description: string
  rating: number
  reviews: number
}

export const products: Product[] = [
  // Male - Áo Thun
  {
    id: "male-tshirt-1",
    name: "Áo Thun Oversize Basic",
    price: 299000,
    originalPrice: 399000,
    image: "/male-tshirt-1.jpg",
    category: "ao-thun",
    type: "male",
    colors: ["Đen", "Trắng", "Xám"],
    sizes: ["S", "M", "L", "XL"],
    description: "Áo thun oversize phong cách streetwear, chất liệu cotton 100% thoáng mát",
    rating: 4.5,
    reviews: 128,
  },
  {
    id: "male-tshirt-2",
    name: "Áo Thun Graphic Print",
    price: 349000,
    image: "/male-tshirt-2.jpg",
    category: "ao-thun",
    type: "male",
    colors: ["Đen", "Trắng"],
    sizes: ["M", "L", "XL"],
    description: "Áo thun in hình graphic độc đáo, phong cách trẻ trung",
    rating: 4.7,
    reviews: 95,
  },
  {
    id: "male-tshirt-3",
    name: "Áo Thun Polo Nam",
    price: 399000,
    image: "/male-tshirt-3.jpg",
    category: "ao-thun",
    type: "male",
    colors: ["Xanh Navy", "Đen", "Trắng"],
    sizes: ["S", "M", "L", "XL"],
    description: "Áo polo nam lịch sự, phù hợp đi làm và dạo phố",
    rating: 4.6,
    reviews: 112,
  },
  {
    id: "male-tshirt-4",
    name: "Áo Thun Tie Dye",
    price: 379000,
    image: "/male-tshirt-4.jpg",
    category: "ao-thun",
    type: "male",
    colors: ["Nhiều màu"],
    sizes: ["M", "L", "XL"],
    description: "Áo thun nhuộm tie dye độc đáo, không trùng lặp",
    rating: 4.8,
    reviews: 87,
  },

  // Male - Áo Sơ Mi
  {
    id: "male-shirt-1",
    name: "Áo Sơ Mi Trắng Oxford",
    price: 499000,
    image: "/male-shirt-1.jpg",
    category: "ao-so-mi",
    type: "male",
    colors: ["Trắng", "Xanh Nhạt"],
    sizes: ["S", "M", "L", "XL"],
    description: "Áo sơ mi Oxford cao cấp, form slim fit hiện đại",
    rating: 4.9,
    reviews: 156,
  },
  {
    id: "male-shirt-2",
    name: "Áo Sơ Mi Kẻ Sọc",
    price: 449000,
    image: "/male-shirt-2.jpg",
    category: "ao-so-mi",
    type: "male",
    colors: ["Xanh/Trắng", "Đen/Trắng"],
    sizes: ["M", "L", "XL"],
    description: "Áo sơ mi kẻ sọc thanh lịch, dễ phối đồ",
    rating: 4.5,
    reviews: 89,
  },

  // Male - Quần Jean
  {
    id: "male-jeans-1",
    name: "Quần Jean Slim Fit",
    price: 599000,
    originalPrice: 799000,
    image: "/male-jeans-1.jpg",
    category: "quan-jean",
    type: "male",
    colors: ["Xanh Đậm", "Đen"],
    sizes: ["29", "30", "31", "32", "33"],
    description: "Quần jean slim fit ôm vừa phải, tôn dáng",
    rating: 4.6,
    reviews: 203,
  },
  {
    id: "male-jeans-2",
    name: "Quần Jean Rách Gối",
    price: 649000,
    image: "/male-jeans-2.jpg",
    category: "quan-jean",
    type: "male",
    colors: ["Xanh Nhạt"],
    sizes: ["29", "30", "31", "32"],
    description: "Quần jean rách gối phong cách streetwear",
    rating: 4.7,
    reviews: 145,
  },

  // Male - Áo Khoác
  {
    id: "male-jacket-1",
    name: "Áo Khoác Bomber",
    price: 899000,
    image: "/male-jacket-1.jpg",
    category: "ao-khoac",
    type: "male",
    colors: ["Đen", "Xanh Rêu"],
    sizes: ["M", "L", "XL"],
    description: "Áo khoác bomber phong cách quân đội, chất liệu dù cao cấp",
    rating: 4.8,
    reviews: 167,
  },

  // Female - Áo Thun
  {
    id: "female-tshirt-1",
    name: "Áo Thun Baby Tee",
    price: 249000,
    image: "/female-tshirt-1.jpg",
    category: "ao-thun",
    type: "female",
    colors: ["Trắng", "Hồng", "Đen"],
    sizes: ["S", "M", "L"],
    description: "Áo thun baby tee form ngắn, phong cách Y2K",
    rating: 4.6,
    reviews: 234,
  },
  {
    id: "female-tshirt-2",
    name: "Áo Thun Oversize Nữ",
    price: 299000,
    image: "/female-tshirt-2.jpg",
    category: "ao-thun",
    type: "female",
    colors: ["Trắng", "Đen", "Be"],
    sizes: ["M", "L"],
    description: "Áo thun oversize unisex, thoải mái và trendy",
    rating: 4.7,
    reviews: 189,
  },

  // Female - Váy
  {
    id: "female-dress-1",
    name: "Váy Hoa Nhí Vintage",
    price: 449000,
    image: "/female-dress-1.jpg",
    category: "vay",
    type: "female",
    colors: ["Hoa Nhí"],
    sizes: ["S", "M", "L"],
    description: "Váy hoa nhí phong cách vintage, dáng xòe nữ tính",
    rating: 4.9,
    reviews: 312,
  },
  {
    id: "female-dress-2",
    name: "Váy Maxi Dài",
    price: 599000,
    image: "/female-dress-2.jpg",
    category: "vay",
    type: "female",
    colors: ["Đen", "Trắng", "Đỏ"],
    sizes: ["S", "M", "L"],
    description: "Váy maxi dài thanh lịch, phù hợp dự tiệc",
    rating: 4.8,
    reviews: 156,
  },

  // Female - Quần Jean
  {
    id: "female-jeans-1",
    name: "Quần Jean Ống Rộng",
    price: 549000,
    image: "/female-jeans-1.jpg",
    category: "quan-jean",
    type: "female",
    colors: ["Xanh Nhạt", "Đen"],
    sizes: ["26", "27", "28", "29"],
    description: "Quần jean ống rộng trendy, tôn dáng",
    rating: 4.7,
    reviews: 198,
  },

  // Kids - Áo Thun
  {
    id: "kids-tshirt-1",
    name: "Áo Thun Hoạt Hình",
    price: 199000,
    image: "/kids-tshirt-1.jpg",
    category: "ao-thun",
    type: "kids",
    colors: ["Nhiều màu"],
    sizes: ["2-3T", "4-5T", "6-7T"],
    description: "Áo thun in hình hoạt hình đáng yêu cho bé",
    rating: 4.8,
    reviews: 267,
  },
  {
    id: "kids-tshirt-2",
    name: "Áo Thun Basic Trẻ Em",
    price: 149000,
    image: "/kids-tshirt-2.jpg",
    category: "ao-thun",
    type: "kids",
    colors: ["Trắng", "Đen", "Xanh"],
    sizes: ["2-3T", "4-5T", "6-7T", "8-9T"],
    description: "Áo thun basic cotton mềm mại cho bé",
    rating: 4.6,
    reviews: 189,
  },

  // Kids - Váy
  {
    id: "kids-dress-1",
    name: "Váy Công Chúa",
    price: 349000,
    image: "/kids-dress-1.jpg",
    category: "vay",
    type: "kids",
    colors: ["Hồng", "Trắng"],
    sizes: ["2-3T", "4-5T", "6-7T"],
    description: "Váy công chúa xinh xắn cho bé gái",
    rating: 4.9,
    reviews: 423,
  },
]

export function getProductsByCategory(type: string, category: string): Product[] {
  return products.filter((p) => p.type === type && p.category === category)
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}
