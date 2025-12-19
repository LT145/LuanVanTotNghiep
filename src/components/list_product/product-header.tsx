"use client"

import { ChevronDown, Filter, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { FilterModal } from "./filter-modal"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"

const genderLabel: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  unisex: "Unisex",
}

export function ProductHeader({
  gender,
  categoryName,
  productCount,
}: {
  gender: string
  categoryName: string
  productCount: number
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <>
      <div className="sticky  z-30 bg-white border-b">
        <div className="custom-container mx-auto px-4 py-3">

          {/* PARENT WRAPPER */}
          <div
            className="
              flex flex-col md:flex-row
              md:items-center md:justify-between
              gap-3 w-full
            "
          >

            {/* LEFT BREADCRUMB */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {/* <span className="font-semibold text-foreground">
                {productCount} sản phẩm
              </span>
              <ChevronDown className="h-4 w-4" /> */}

              <span>Trang chủ</span>
              <span>{">"}</span>
              <span>Thời Trang {genderLabel[gender]}</span>
              <span>{">"}</span>
              <span className="font-semibold text-foreground">
                {categoryName}
              </span>
            </div>

            {/* RIGHT BUTTON GROUP */}
            <div
              className="
                flex flex-row            /* luôn cùng hàng */
                items-center 
                gap-2
                w-full md:w-auto
              "
            >

              {/* Filter */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterOpen(true)}
                className="gap-2 flex-1 sm:flex-none"
              >
                <Filter className="h-4 w-4" />
                Bộ lọc
              </Button>

              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent flex-1 sm:flex-none"
                  >
                    <MoreVertical className="h-4 w-4" />
                    Sắp xếp
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Mới nhất</DropdownMenuItem>
                  <DropdownMenuItem>Cũ nhất</DropdownMenuItem>
                  <DropdownMenuItem>Giá tăng dần</DropdownMenuItem>
                  <DropdownMenuItem>Giá giảm dần</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

          </div>
        </div>
      </div>

      <FilterModal open={isFilterOpen} onOpenChange={setIsFilterOpen} />
    </>
  )
}
