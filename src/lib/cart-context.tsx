"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

export type CartItem = {
  id?: string
  productId: string
  name: string
  price: number
  image: string
  selectedColor: string
  selectedSize: string
  quantity: number
}

// 🧩 Context type
type CartContextType = {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, "id">) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  getTotalItems: () => number
  getTotalPrice: () => number
  updateQuantity: (itemId: string, quantity: number) => Promise<void> // 👈 thêm dòng này
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
const { data: session, status } = useSession()

  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // 🧩 Load giỏ từ API nếu user đăng nhập
  useEffect(() => {
    const fetchCart = async () => {
      if (!session?.user?.id) return
      try {
        const res = await fetch("/api/cart")
        const data = await res.json()
        setCart(
          data?.items?.map((i: any) => ({
            id: i.id,
            productId: i.productId,
            name: i.product.name,
            price: i.price,
            image:
              i.product.images?.[0]?.url || "/placeholder.svg?height=100&width=100",
            selectedColor: i.color,
            selectedSize: i.size,
            quantity: i.quantity,
          })) || []
        )
      } catch (err) {
        console.error("❌ Lỗi khi tải giỏ hàng:", err)
      }
    }
    fetchCart()
  }, [session])

  // ➕ Thêm vào giỏ hàng (API hoặc localStorage)
const addToCart = async (item: Omit<CartItem, "id">) => {
  // Kiểm tra trạng thái NextAuth
  if (status === "loading") {
    toast.info("Đang kiểm tra đăng nhập...")
    return
  }
console.log("Session in addToCart:", session, "Status:", status);
  if (status == "unauthenticated") {
    toast.error("❌ Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng", {
      // action: {
      //   label: "Đăng nhập",
      //   onClick: () => (window.location.href = "/login"), // 👉 chuyển hướng
      // },
    })
    return
  }

  try {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: item.productId,
        color: item.selectedColor,
        size: item.selectedSize,
        quantity: item.quantity,
        price: item.price,
      }),
    })

    if (!res.ok) throw new Error("Không thể thêm sản phẩm vào giỏ hàng")

    // Sau khi thêm xong, load lại giỏ hàng
    const dataRes = await fetch("/api/cart")
    const data = await dataRes.json()
    setCart(
      data?.items?.map((i: any) => ({
        id: i.id,
        productId: i.productId,
        name: i.product.name,
        price: i.price,
        image:
          i.product.images?.[0]?.url || "/placeholder.svg?height=100&width=100",
        selectedColor: i.color,
        selectedSize: i.size,
        quantity: i.quantity,
      })) || []
    )

    setIsCartOpen(true)
    toast.success("✅ Đã thêm sản phẩm vào giỏ hàng 🛒")
  } catch (err) {
    console.error("❌ Lỗi khi thêm sản phẩm:", err)
    toast.error("Không thể thêm sản phẩm, vui lòng thử lại!")
  }
}



  const removeFromCart = async (itemId: string) => {
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    })
    setCart((prev) => prev.filter((x) => x.id !== itemId))
  }

  const clearCart = async () => {
    await fetch("/api/cart", { method: "PATCH" })
    setCart([])
  }

  const getTotalItems = () => cart.reduce((sum, i) => sum + i.quantity, 0)
  const getTotalPrice = () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
const updateQuantity = async (itemId: string, quantity: number) => {
  if (quantity <= 0) {
    await removeFromCart(itemId)
    return
  }

  await fetch("/api/cart", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId, quantity }),
  })

  setCart((prev) =>
    prev.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    )
  )
}

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalItems,
        getTotalPrice,
        isCartOpen,
        setIsCartOpen,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context)
    throw new Error("useCart phải được sử dụng trong CartProvider")
  return context
}
