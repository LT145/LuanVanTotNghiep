"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type CategoryNavProps = {
  isHeaderHidden: boolean
}

export function CategoryNav({ isHeaderHidden }: CategoryNavProps) {
  const pathname = usePathname()

  const categories = [
    { name: "Nam", path: "/male" },
    { name: "Nữ", path: "/female" },
    { name: "Trẻ Em", path: "/kids" },
  ]

  return (
<nav
  className={`
    fixed left-0 right-0 z-40 border-b border-gray-200 
    bg-white/90 backdrop-blur-md
    transition-transform duration-300
    ${isHeaderHidden ? "translate-y-0" : "translate-y-16"}
  `}
>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-12 h-14">
          {categories.map((category) => {
            const isActive = pathname === category.path
            return (
              <Link
                key={category.path}
                href={category.path}
                className={`relative pb-1 text-base font-medium transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-gray-700 hover:text-primary"
                }`}
              >
                {category.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-scale-in" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
