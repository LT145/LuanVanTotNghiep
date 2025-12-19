"use client"

import { useState, useRef } from "react"
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  Star,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { signOut } from "next-auth/react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  user: {
    name: string
    email: string
    avatar?: string | null
  }
}

export default function Sidebar({ activeTab, setActiveTab, user }: SidebarProps) {
  const [avatarUrl] = useState(user?.avatar || "/fashion-profile-avatar.png")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const menuItems = [
    { id: "overview", label: "Tổng quan", icon: User },
    { id: "orders", label: "Đơn hàng", icon: Package },
    { id: "returns", label: "Đổi / Trả", icon: RotateCcw }, // ✅ NEW
    { id: "wishlist", label: "Yêu thích", icon: Heart },
    { id: "reviews", label: "Đánh giá", icon: Star },
    { id: "addresses", label: "Địa chỉ", icon: MapPin },
    { id: "settings", label: "Cài đặt", icon: Settings },
  ]

  return (
    <aside className="w-64 bg-white border-r border-border min-h-screen flex flex-col ">
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-border">
          <div className="relative">
            <Avatar className="w-20 h-20">
              {/* bạn đang không dùng AvatarImage trong file này */}
              <AvatarFallback>{user?.name?.charAt(0) || "?"}</AvatarFallback>
            </Avatar>
            <input ref={fileInputRef} type="file" className="hidden" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{user?.name}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <Button
          onClick={() => signOut({ callbackUrl: "/" })}
          variant="outline"
          className="w-full gap-2 justify-center mt-4 bg-transparent"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </Button>
      </div>
    </aside>
  )
}
