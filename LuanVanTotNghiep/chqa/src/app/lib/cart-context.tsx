  "use client"

  import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
  import type { Product } from "@/lib/products-data"

  export type CartItem = {
    product: Product
    selectedColor: string
    selectedSize: string
    quantity: number
  }

  type CartContextType = {
    cart: CartItem[]
    addToCart: (item: CartItem) => void
    removeFromCart: (productId: string, color: string, size: string) => void
    updateQuantity: (productId: string, color: string, size: string, quantity: number) => void
    clearCart: () => void
    getTotalItems: () => number
    getTotalPrice: () => number
    isCartOpen: boolean
    setIsCartOpen: (open: boolean) => void
  }

  const CartContext = createContext<CartContextType | undefined>(undefined)

  export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([])
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    // Load cart from localStorage on mount
    useEffect(() => {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        setCart(JSON.parse(savedCart))
      }
      setIsLoaded(true)
    }, [])

    // Save cart to localStorage whenever it changes
    useEffect(() => {
      if (isLoaded) {
        localStorage.setItem("cart", JSON.stringify(cart))
      }
    }, [cart, isLoaded])

    const addToCart = (item: CartItem) => {
      setCart((prevCart) => {
        const existingItemIndex = prevCart.findIndex(
          (cartItem) =>
            cartItem.product.id === item.product.id &&
            cartItem.selectedColor === item.selectedColor &&
            cartItem.selectedSize === item.selectedSize,
        )

        if (existingItemIndex > -1) {
          const newCart = [...prevCart]
          newCart[existingItemIndex].quantity += item.quantity
          return newCart
        }

        return [...prevCart, item]
      })
      setIsCartOpen(true)
    }

    const removeFromCart = (productId: string, color: string, size: string) => {
      setCart((prevCart) =>
        prevCart.filter(
          (item) => !(item.product.id === productId && item.selectedColor === color && item.selectedSize === size),
        ),
      )
    }

    const updateQuantity = (productId: string, color: string, size: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId, color, size)
        return
      }

      setCart((prevCart) =>
        prevCart.map((item) =>
          item.product.id === productId && item.selectedColor === color && item.selectedSize === size
            ? { ...item, quantity }
            : item,
        ),
      )
    }

    const clearCart = () => {
      setCart([])
    }

    const getTotalItems = () => {
      return cart.reduce((total, item) => total + item.quantity, 0)
    }

    const getTotalPrice = () => {
      return cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
    }

    return (
      <CartContext.Provider
        value={{
          cart,
          addToCart,
          removeFromCart,
          updateQuantity,
          clearCart,
          getTotalItems,
          getTotalPrice,
          isCartOpen,
          setIsCartOpen,
        }}
      >
        {children}
      </CartContext.Provider>
    )
  }

  export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
      throw new Error("useCart must be used within a CartProvider")
    }
    return context
  }
