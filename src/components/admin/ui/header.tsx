"use client"

import { Search, Bell, User } from "lucide-react"
import { Input } from "@/components/ui/input"

export function Header() {
  return (
    <header className="bg-card border-b border-border px-8 py-4 flex items-center justify-between">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input placeholder="Tìm kiếm..." className="pl-10 bg-muted border-border" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Bell size={20} className="text-foreground" />
        </button>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <User size={20} className="text-foreground" />
        </button>
      </div>
    </header>
  )
}
