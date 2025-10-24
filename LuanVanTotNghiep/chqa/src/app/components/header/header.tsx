"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, ShoppingBag, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import { useAuthModal } from "@/lib/auth-context"
import { signOut, useSession } from "next-auth/react"

export function Header({ onHiddenChange }: { onHiddenChange?: (hidden: boolean) => void }) {
  const { getTotalItems, setIsCartOpen } = useCart()
  const { setIsOpen, setMode } = useAuthModal()
  const { data: session } = useSession()

  const [mounted, setMounted] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsHidden(true)
        onHiddenChange?.(true)
      } else {
        setIsHidden(false)
        onHiddenChange?.(false)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY, onHiddenChange])

  const totalItems = mounted ? getTotalItems() : 0

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b backdrop-blur-md 
      transition-transform duration-300 
      ${isHidden ? "-translate-y-full" : "translate-y-0"} 
      bg-white/90 backdrop-blur-md`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo + Mobile Menu */}
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-4 mt-6">
                <Link href="/male">Nam</Link>
                <Link href="/female">Nữ</Link>
                <Link href="/sale">Sale</Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="text-2xl font-bold text-primary">
            THỜI TRANG
          </Link>
        </div>

        {/* Search + Cart + Account */}
        <div className="flex items-center gap-4 relative">
          <div className="hidden md:flex items-center gap-2">
            <Input type="search" placeholder="Tìm kiếm..." className="w-64 focus:w-72" />
            <Button size="icon" variant="ghost">
              <Search className="h-5 w-5" />
            </Button>
          </div>

          <Button size="icon" variant="ghost" className="relative" onClick={() => setIsCartOpen(true)}>
            <ShoppingBag className="h-5 w-5" />
            {mounted && totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                {totalItems}
              </Badge>
            )}
          </Button>

          {/* Auth Section */}
          {!session ? (
            <Button
              variant="outline"
              className="border border-black text-black hover:bg-black hover:text-white"
              onClick={() => {
                setMode("login")
                setIsOpen(true)
              }}
            >
              Đăng nhập
            </Button>
          ) : (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <User className="h-5 w-5" />
              </Button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-md p-2 z-50">
                  <p className="text-sm text-gray-600 px-2 mb-2 border-b pb-1">
                    {session.user?.name || session.user?.email}
                  </p>

                  {/* ✅ Chỉ hiển thị nếu là admin */}
                  {session.user?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="block text-sm px-2 py-1 hover:bg-gray-100 rounded"
                    >
                      Trang quản trị
                    </Link>
                  )}

                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full text-left text-sm px-2 py-1 hover:bg-gray-100 rounded"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
