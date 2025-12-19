"use client"

import { Eye, Lock, Unlock } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export default function UsersGrid({ users, selectedIds, setSelectedIds, onView, onToggleStatus }: any) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      {users.map((u: any) => (
        <div key={u.id} className="p-4 border rounded-xl bg-white shadow-sm relative group">

          {/* Checkbox */}
          <Checkbox
            className="absolute top-3 left-3"
            checked={selectedIds.has(u.id)}
            onCheckedChange={() => {
              const s = new Set(selectedIds)
              s.has(u.id) ? s.delete(u.id) : s.add(u.id)
              setSelectedIds(s)
            }}
          />

          {/* Name */}
          <h3 className="font-semibold text-lg group-hover:text-primary">{u.name}</h3>
          <p className="text-sm text-muted-foreground">{u.email}</p>

          <div className="mt-3 text-sm">
            <p>Đơn thành công: <b>{u.totalCompletedOrders}</b></p>
            <p>Đã chi: <b>{u.totalSpent.toLocaleString()}₫</b></p>

            <p className="mt-2">
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  u.status === "BLOCKED"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {u.status === "BLOCKED" ? "Đã khóa" : "Hoạt động"}
              </span>
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onView(u)}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-primary text-white rounded-lg text-sm"
            >
              <Eye className="w-4 h-4" />
              Chi tiết
            </button>

            <button
              onClick={() => onToggleStatus(u.id)}
              className={`px-3 py-2 rounded-lg ${
                u.status === "BLOCKED"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {u.status === "BLOCKED" ? <Unlock size={16} /> : <Lock size={16} />}
            </button>
          </div>

        </div>
      ))}
    </div>
  )
}
