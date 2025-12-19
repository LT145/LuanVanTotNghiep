"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Sidebar from "@/components/profile/sidebar"
import ProfileContent from "@/components/profile/profile-content"

const ALLOWED_TABS = [
  "overview",
  "orders",
  "wishlist",
  "reviews",
  "addresses",
  "settings",
]

export default function Page() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState("overview")
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 🧷 Đọc hash trên URL lần đầu + khi hash đổi (#orders, #wishlist,…)
  useEffect(() => {
    if (typeof window === "undefined") return

    const applyHash = () => {
      const raw = window.location.hash.replace("#", "") // "orders", "wishlist", "order", ...
      if (!raw) return

      // alias: #order cũng được, map sang "orders"
      const hash = raw === "order" ? "orders" : raw

      if (ALLOWED_TABS.includes(hash)) {
        setActiveTab(hash)
      }
    }

    applyHash()

    window.addEventListener("hashchange", applyHash)
    return () => window.removeEventListener("hashchange", applyHash)
  }, [])

  // 🛰️ Fetch user
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return

    async function fetchUser() {
      try {
        const res = await fetch(`/api/user/${session?.user.id}`)
        const data = await res.json()
        setUser(data)
      } catch (err) {
        console.error("Lỗi khi tải thông tin user:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [session?.user?.id, status])

  // 🧭 Hàm đổi tab + cập nhật hash trên URL
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)

    if (typeof window !== "undefined") {
      const { pathname, search } = window.location
      const newUrl = `${pathname}${search}#${tab}`
      window.history.replaceState(null, "", newUrl)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Đang tải thông tin người dùng...</p>
      </div>
    )
  }

  if (!session || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Không tìm thấy thông tin người dùng 😢</p>
      </div>
    )
  }

  return (
    <div className="custom-container min-h-screen bg-background">
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} user={user} />
        <main className="flex-1">
          <ProfileContent activeTab={activeTab} user={user} />
        </main>
      </div>
    </div>
  )
}
