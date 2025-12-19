import "./globals.css"
import { Roboto_Condensed } from "next/font/google"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextAuthProvider } from "@/components/providers/session-provider"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import { Header } from "@/components/header/header"
import { CartSidebar } from "@/components/cart/cart-sidebar"
import { AuthModal } from "@/components/auth/auth-modal"
import { Toaster } from "sonner"
import { ReactNode } from "react"
import { GlobalLoader } from "@/components/global-loader/GlobalLoader"
import { HeaderWrapper } from "@/components/header/header-wrapper"

const roboto = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-roboto-condensed",
})

export default async function RootLayout({ children }: { children: ReactNode }) {

  // 🌟 QUAN TRỌNG: Lấy session server-side
  const session = await getServerSession(authOptions)

  return (
    <html lang="vi" className={roboto.variable}>
      <body className="font-roboto-condensed">

        {/* 🌟 Truyền session xuống client */}
        <NextAuthProvider session={session}>
          <AuthProvider>
            <CartProvider>
<GlobalLoader />
              {/* Header không bị chớp nữa */}
<HeaderWrapper />

              <main>{children}</main>

              <CartSidebar />
              <AuthModal />

            </CartProvider>
          </AuthProvider>
        </NextAuthProvider>

        <Toaster position="top-center" />
      </body>
    </html>
  )
}
