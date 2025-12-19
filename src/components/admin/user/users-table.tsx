"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, Lock, Unlock } from "lucide-react"

export default function UsersTable({ users, selectedIds, setSelectedIds, onView, onToggleStatus }: any) {
  const toggle = (id: string) => {
    const s = new Set(selectedIds)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelectedIds(s)
  }

  return (
    <div className="rounded-2xl border shadow-sm overflow-hidden mb-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] text-center">
              <Checkbox
                checked={selectedIds.size === users.length}
                onCheckedChange={() =>
                  setSelectedIds(
                    selectedIds.size === users.length ? new Set() : new Set(users.map((u: any) => u.id))
                  )
                }
              />
            </TableHead>
            <TableHead>Tên</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Đơn hàng</TableHead>
            <TableHead className="text-center">Đã chi</TableHead>
            <TableHead className="text-center">Lần cuối mua</TableHead>
            <TableHead className="text-center">Trạng thái</TableHead>
            <TableHead className="w-20 text-center">Hành động</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((u: any) => (
            <TableRow key={u.id} className="hover:bg-muted/40">
              <TableCell className="text-center">
                <Checkbox checked={selectedIds.has(u.id)} onCheckedChange={() => toggle(u.id)} />
              </TableCell>

              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>

              <TableCell className="text-center">{u.totalCompletedOrders}</TableCell>
              <TableCell className="text-center">{u.totalSpent.toLocaleString()}₫</TableCell>

              <TableCell className="text-center">
                {u.lastPurchaseAt ? new Date(u.lastPurchaseAt).toLocaleDateString("vi-VN") : "—"}
              </TableCell>

              {/* STATUS */}
              <TableCell className="text-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    u.status === "BLOCKED"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {u.status === "BLOCKED" ? "Đã khóa" : "Hoạt động"}
                </span>
              </TableCell>

              {/* ACTIONS */}
              <TableCell className="text-right flex gap-2 justify-end">
                <button
                  onClick={() => onView(u)}
                  className="p-2 hover:bg-muted rounded-lg transition"
                >
                  <Eye className="w-5 h-5 text-blue-600" />
                </button>

                <button
                  onClick={() => onToggleStatus(u.id)}
                  className={`p-2 rounded-lg transition ${
                    u.status === "BLOCKED"
                      ? "bg-green-100 hover:bg-green-200 text-green-700"
                      : "bg-red-100 hover:bg-red-200 text-red-700"
                  }`}
                >
                  {u.status === "BLOCKED" ? <Unlock size={18} /> : <Lock size={18} />}
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
