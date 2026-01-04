"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  Users,
  ChevronDown,
  Menu,
  X,
  Warehouse,
  PlusCircle,
  ShoppingCart,
  HomeIcon,
  Settings,
  Tag,
  RefreshCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  role: "ADMIN" | "MANAGER" | "USER" | "SHIPPER"
}

type NavItem = {
  id: string
  label: string
  icon: React.ReactNode
  children?: { id: string; label: string; icon?: React.ReactNode }[]
}

const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Tổng quan",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    id: "products",
    label: "Sản phẩm",
    icon: <Package className="h-5 w-5" />,
    children: [
      { id: "products", label: "Tất cả sản phẩm", icon: <Package className="h-4 w-4" /> },
      //{ id: "products-manage", label: "Quản lý sản phẩm", icon: <Settings className="h-4 w-4" /> },
      { id: "products-add", label: "Thêm sản phẩm", icon: <PlusCircle className="h-4 w-4" /> },
      { id: "inventory", label: "Kho hàng", icon: <Warehouse className="h-4 w-4" /> },
    ],
  },

  // ✅ Khuyến mãi
  {
    id: "promotions",
    label: "Khuyến mãi",
    icon: <Tag className="h-5 w-5" />,
  },

  // ✅ Đổi / Trả
  {
    id: "returns",
    label: "Đổi / Trả",
    icon: <RefreshCcw className="h-5 w-5" />,
  },

  {
    id: "orders",
    label: "Đơn hàng",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    id: "account",
    label: "Tài khoản",
    icon: <Users className="h-5 w-5" />,
  },
    {
    id: "settings",
    label: "Cài đặt",
    icon: <Settings className="h-5 w-5" />,
  }
]

// 🎯 QUYỀN MENU THEO ROLE
function filterNavByRole(role: "ADMIN" | "MANAGER" | "SHIPPER" | "USER") {
  if (role === "ADMIN") return navItems

  if (role === "MANAGER") {
    return navItems.filter((item) =>
      ["dashboard", "products", "promotions", "orders", "returns"].includes(item.id)
    )
  }

  return []
}

export function Sidebar({ currentPage, onPageChange, role }: SidebarProps) {
  const [expanded, setExpanded] = useState<string[]>(["products"])
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleExpand = (id: string) => {
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const filteredNav = filterNavByRole(role)

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <span className="text-xl font-bold">CLOSET</span>
        <span className="ml-1 text-xl font-light text-muted-foreground">Admin</span>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {filteredNav.map((item) => {
          const isActive = currentPage.startsWith(item.id)
          const hasChildren = !!item.children

          return (
            <div key={item.id}>
              {/* Parent */}
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(item.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium",
                    isActive
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {item.icon} {item.label}
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      expanded.includes(item.id) && "rotate-180"
                    )}
                  />
                </button>
              ) : (
                <button
                  onClick={() => onPageChange(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                    isActive
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {item.icon} {item.label}
                </button>
              )}

              {/* Children */}
              {hasChildren && expanded.includes(item.id) && (
                <div className="ml-4 mt-1 space-y-1 border-l pl-4">
                  {item.children!.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => onPageChange(child.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                        currentPage === child.id
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      {child.icon}
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Nút quay về Home */}
      <div className="border-t p-4">
        <a
          href="/"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium transition hover:bg-secondary/80"
        >
          <HomeIcon className="h-5 w-5" />
          Về trang chủ
        </a>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 bg-background lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X /> : <Menu />}
      </Button>

      {/* Overlay */}
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setMobileOpen(false)} />}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
