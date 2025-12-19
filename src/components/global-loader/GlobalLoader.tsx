"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function GlobalLoader() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timeout = setTimeout(() => setLoading(false), 300) // cho mượt
    return () => clearTimeout(timeout)
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed inset-0 bg-white/60 flex items-center justify-center z-[9999]">
      <div className="animate-spin w-10 h-10 border-4 border-gray-400 border-t-black rounded-full" />
    </div>
  )
}
