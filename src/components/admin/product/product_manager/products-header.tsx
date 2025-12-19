"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function ProductsHeader() {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Tất cả sản phẩm</h1>
        <p className="text-muted-foreground mt-1">
        </p>
      </div>
    </div>
  )
}
