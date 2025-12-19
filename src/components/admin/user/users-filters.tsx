"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, LayoutGrid, List } from "lucide-react"

export default function UsersFilters({ search, setSearch, viewMode, setViewMode }: any) {
  return (
    <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm flex items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Tìm tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-1 border rounded-lg p-1">
        <Button
          variant={viewMode === "table" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("table")}
        >
          <List className="w-4 h-4" />
        </Button>

        <Button
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("grid")}
        >
          <LayoutGrid className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
