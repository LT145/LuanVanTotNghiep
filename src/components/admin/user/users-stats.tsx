"use client"

import { Card, CardContent } from "@/components/ui/card"

export default function UsersStats({ users }: any) {
  const total = users.length
  const totalSpent = users.reduce((sum: number, u: any) => sum + (u.totalSpent ?? 0), 0)
  const reviewers = users.filter((u: any) => u.reviews.length > 0).length

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Tổng khách hàng</p><h2 className="text-2xl font-bold">{total}</h2></CardContent></Card>
      <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Tổng tiền đã chi</p><h2 className="text-2xl font-bold">{totalSpent.toLocaleString()}₫</h2></CardContent></Card>
      <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Khách có review</p><h2 className="text-2xl font-bold">{reviewers}</h2></CardContent></Card>
      <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Khách từng mua</p><h2 className="text-2xl font-bold">{users.filter((u: any) => u.totalOrders > 0).length}</h2></CardContent></Card>
    </div>
  )
}
