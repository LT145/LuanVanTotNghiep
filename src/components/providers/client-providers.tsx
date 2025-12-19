"use client"

import { ReactNode } from "react"
import { SessionProvider } from "next-auth/react"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import { Header } from "@/components/header/header"
import { CartSidebar } from "@/components/cart/cart-sidebar"
import { AuthModal } from "@/components/auth/auth-modal"
import { Toaster } from "sonner"
import { usePathname } from "next/navigation"

export default function ClientProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith("/admin")

  return (
    <SessionProvider>
      <AuthProvider>
        <CartProvider>
          
          {/* HEADER KHÔNG BỊ CHỚP ĐĂNG NHẬP */}
          {!isAdminPage && <Header />}

          <main>{children}</main>

          <CartSidebar />
          <AuthModal />
        </CartProvider>
      </AuthProvider>

      <Toaster position="top-center" />
    </SessionProvider>
  )
}
