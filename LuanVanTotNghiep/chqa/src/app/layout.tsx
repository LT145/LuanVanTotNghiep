import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Suspense } from "react"
import { CartProvider } from "@/lib/cart-context"
import { CartSidebar } from "@/components/cart-sidebar"
import { AuthProvider } from "@/lib/auth-context"
import { AuthModal } from "@/components/auth-modal"
import { NextAuthProvider } from "@/components/providers/session-provider"

export const metadata: Metadata = {
  title: "Thời Trang - Cửa Hàng Quần Áo",
  description: "Khám phá bộ sưu tập thời trang hiện đại với phong cách Việt Nam",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body>
        {/* ✅ Bọc toàn bộ app trong SessionProvider */}
        <NextAuthProvider>
          <AuthProvider>
            <CartProvider>
              <Suspense fallback={null}>{children}</Suspense>
              <CartSidebar />
              <AuthModal />
            </CartProvider>
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
