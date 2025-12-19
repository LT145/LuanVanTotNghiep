"use client"

import {
  Eye,
  Search,
  Loader2,
  X,
  Check,
  Clock,
  Package,
  User,
  Truck,
  RefreshCcw,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

// 🗺️ Enum → Tiếng Việt (Return Status)
const returnStatusLabel: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  RECEIVED: "Đã nhận hàng",
  EXCHANGED: "Đã đổi xong",
  REFUNDED: "Đã hoàn tiền",
  CANCELLED: "Đã hủy",
}

const returnTypeLabel: Record<string, string> = {
  RETURN: "Đổi/Trả",
  EXCHANGE: "Đổi hàng",
  REFUND: "Hoàn tiền",
}

interface ReturnRow {
  id: string
  orderId: string
  customer: string
  createdAt: string // ISO
  dateTime: string // display
  status: string
  type: string
  items: number
}

interface ReturnDetail {
  id: string
  userId: string
  orderId: string
  type: string
  reason: string
  note: string | null
  status: string
  adminNote: string | null
  createdAt: string

  user?: {
    id: string
    name: string | null
    email: string | null
  } | null

  order?: {
    id: string
    status: string
    createdAt: string
    totalAmount: number
    recipientName?: string
    recipientPhone?: string
  } | null

  items: {
    id: string
    quantity: number
    orderItemId: string
    orderItem?: {
      id: string
      color?: string | null
      size?: string | null
      quantity: number
      price: number
      productId?: string
      product?: {
        id: string
        name: string
        slug: string
        images?: { url: string }[]
      } | null
    } | null
  }[]
}

export default function AdminReturnsPage() {
  const [rows, setRows] = useState<ReturnRow[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const [selected, setSelected] = useState<ReturnDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Reject note
  const [adminNoteInput, setAdminNoteInput] = useState("")
  const [showAdminNoteBox, setShowAdminNoteBox] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isReceiving, setIsReceiving] = useState(false)
  const [isExchanging, setIsExchanging] = useState(false)

  // =========================================================
  // 🔹 Load list
  // =========================================================
  const fetchReturns = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/returns", { cache: "no-store" })
      const js = await res.json()

      if (js?.success) {
        const list: ReturnRow[] = (js.data || []).map((r: any) => {
          const d = new Date(r.createdAt)
          const customer =
            r?.user?.name || r?.user?.email || r?.customer || "Không rõ"

          return {
            id: r.id,
            orderId: r.orderId,
            customer,
            createdAt: r.createdAt,
            dateTime: d.toLocaleString("vi-VN"),
            status: r.status,
            type: r.type ?? "RETURN",
            items: r?.items?.length ?? 0, // ✅ đúng
          }
        })
        setRows(list)
      } else {
        toast.error("Không thể tải danh sách đổi/trả.")
      }
    } catch (e) {
      console.error(e)
      toast.error("Lỗi khi tải danh sách đổi/trả.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReturns()
  }, [])

  // =========================================================
  // 🔍 Filter + search + sort
  // =========================================================
  const filteredRows = useMemo(() => {
    let filtered = [...rows]

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.orderId.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter)
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        case "date-desc":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        default:
          return 0
      }
    })

    return filtered
  }, [rows, searchTerm, statusFilter, sortBy])

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentRows = filteredRows.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  useEffect(() => setCurrentPage(1), [searchTerm, statusFilter, sortBy])

  // =========================================================
  // 🔹 View detail
  // =========================================================
  const handleViewDetail = async (id: string) => {
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/admin/returns/${id}`, {
        cache: "no-store",
      })
      const js = await res.json()
      if (js?.success) {
        setSelected(js.data)
        setAdminNoteInput("")
        setShowAdminNoteBox(false)
      } else toast.error("Không tìm thấy yêu cầu đổi/trả.")
    } catch (err) {
      console.error(err)
      toast.error("Lỗi khi tải chi tiết đổi/trả.")
    } finally {
      setDetailLoading(false)
    }
  }

  // =========================================================
  // ✅ Approve (PENDING -> APPROVED)
  // =========================================================
  const handleApprove = async () => {
    if (!selected) return
    if (selected.status !== "PENDING") return

    try {
      setIsApproving(true)
      const res = await fetch(`/api/admin/returns/${selected.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // adminNote optional
        body: adminNoteInput.trim()
          ? JSON.stringify({ adminNote: adminNoteInput.trim() })
          : undefined,
      })
      const js = await res.json()

      if (js?.success) {
        toast.success("✅ Đã duyệt yêu cầu đổi/trả!")
        const newStatus = "APPROVED"

        setSelected((prev) =>
          prev ? { ...prev, status: newStatus, adminNote: js?.data?.adminNote ?? prev.adminNote } : prev
        )
        setRows((prev) =>
          prev.map((r) => (r.id === selected.id ? { ...r, status: newStatus } : r))
        )
      } else {
        toast.error(js?.message || "Lỗi khi duyệt.")
      }
    } catch (e) {
      console.error(e)
      toast.error("Không thể duyệt yêu cầu.")
    } finally {
      setIsApproving(false)
    }
  }

  // =========================================================
  // ❌ Reject (PENDING -> REJECTED) - API nhận adminNote
  // =========================================================
  const handleReject = async () => {
    if (!selected) return
    if (selected.status !== "PENDING") return

    if (!adminNoteInput.trim()) {
      toast.error("Vui lòng nhập lý do từ chối (adminNote).")
      return
    }

    try {
      setIsRejecting(true)
      const res = await fetch(`/api/admin/returns/${selected.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote: adminNoteInput.trim() }), // ✅ đúng API
      })
      const js = await res.json()

      if (js?.success) {
        toast.success("❌ Đã từ chối yêu cầu.")
        const newStatus = "REJECTED"

        setSelected((prev) =>
          prev ? { ...prev, status: newStatus, adminNote: js?.data?.adminNote ?? prev.adminNote } : prev
        )
        setRows((prev) =>
          prev.map((r) => (r.id === selected.id ? { ...r, status: newStatus } : r))
        )
        setShowAdminNoteBox(false)
      } else {
        toast.error(js?.message || "Lỗi khi từ chối.")
      }
    } catch (e) {
      console.error(e)
      toast.error("Không thể từ chối yêu cầu.")
    } finally {
      setIsRejecting(false)
    }
  }

  // =========================================================
  // 📦 Received (APPROVED -> RECEIVED) - cộng tồn kho ở API
  // =========================================================
  const handleReceived = async () => {
    if (!selected) return
    if (selected.status !== "APPROVED") return

    try {
      setIsReceiving(true)
      const res = await fetch(`/api/admin/returns/${selected.id}/received`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: adminNoteInput.trim()
          ? JSON.stringify({ adminNote: adminNoteInput.trim() })
          : undefined,
      })
      const js = await res.json()

      if (js?.success) {
        toast.success("📦 Đã xác nhận nhận hàng (đã cộng tồn kho)!")
        const newStatus = "RECEIVED"

        setSelected((prev) => (prev ? { ...prev, status: newStatus } : prev))
        setRows((prev) =>
          prev.map((r) => (r.id === selected.id ? { ...r, status: newStatus } : r))
        )
      } else {
        toast.error(js?.message || "Lỗi khi xác nhận nhận hàng.")
      }
    } catch (e) {
      console.error(e)
      toast.error("Không thể xác nhận nhận hàng.")
    } finally {
      setIsReceiving(false)
    }
  }

  // =========================================================
  // 🔁 Exchanged (RECEIVED -> EXCHANGED) - demo
  // =========================================================
  const handleExchanged = async () => {
    if (!selected) return
    if (selected.status !== "RECEIVED") return

    try {
      setIsExchanging(true)
      const res = await fetch(`/api/admin/returns/${selected.id}/exchanged`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: adminNoteInput.trim()
          ? JSON.stringify({ adminNote: adminNoteInput.trim() })
          : undefined,
      })
      const js = await res.json()

      if (js?.success) {
        toast.success("🔁 Đã đánh dấu đổi xong!")
        const newStatus = "EXCHANGED"

        setSelected((prev) => (prev ? { ...prev, status: newStatus } : prev))
        setRows((prev) =>
          prev.map((r) => (r.id === selected.id ? { ...r, status: newStatus } : r))
        )
      } else {
        toast.error(js?.message || "Lỗi khi đánh dấu đổi xong.")
      }
    } catch (e) {
      console.error(e)
      toast.error("Không thể đánh dấu đổi xong.")
    } finally {
      setIsExchanging(false)
    }
  }

  // =========================================================
  // UI helpers
  // =========================================================
  const statusBadgeClass = (status: string) => {
    if (status === "APPROVED") return "border-green-500 text-green-700 bg-green-50"
    if (status === "REJECTED") return "border-red-400 text-red-600 bg-red-50"
    if (status === "RECEIVED") return "border-blue-400 text-blue-700 bg-blue-50"
    if (status === "EXCHANGED") return "border-purple-400 text-purple-700 bg-purple-50"
    if (status === "CANCELLED") return "border-gray-400 text-gray-700 bg-gray-50"
    // PENDING
    return "border-yellow-400 text-yellow-700 bg-yellow-50"
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Quản lý đổi / trả</h1>
          <p className="text-muted-foreground mt-1">
            Duyệt hoặc từ chối yêu cầu đổi/trả của khách hàng
          </p>
        </div>

        <button
          onClick={fetchReturns}
          className="px-4 py-2 border rounded-lg hover:bg-muted flex items-center gap-2"
        >
          <RefreshCcw size={16} />
          Tải lại
        </button>
      </div>

      {/* Filters */}
      <Card className="p-6 space-y-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-3 text-muted-foreground"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm theo mã yêu cầu, mã đơn, tên khách..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Trạng thái</label>
            <select
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground bg-background"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Từ chối</option>
              <option value="RECEIVED">Đã nhận hàng</option>
              <option value="EXCHANGED">Đã đổi xong</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sắp xếp theo</label>
            <select
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground bg-background"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-desc">Thời gian mới nhất</option>
              <option value="date-asc">Thời gian cũ nhất</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-16 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Đang tải danh sách đổi/trả...
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4">Mã yêu cầu</th>
                  <th className="text-left py-3 px-4">Mã đơn</th>
                  <th className="text-center py-3 px-4">Khách hàng</th>
                  <th className="text-center py-3 px-4">Ngày giờ</th>
                  <th className="text-center py-3 px-4">Loại</th>
                  <th className="text-center py-3 px-4">Số SP</th>
                  <th className="text-center py-3 px-4">Trạng thái</th>
                  <th className="text-center py-3 px-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="py-3 px-4">{r.id}</td>
                      <td className="py-3 px-4">{r.orderId}</td>
                      <td className="py-3 px-4 text-center">{r.customer}</td>
                      <td className="py-3 px-4 text-sm text-center">{r.dateTime}</td>
                      <td className="py-3 px-4 text-sm text-center">
                        {returnTypeLabel[r.type] ?? r.type}
                      </td>
                      <td className="py-3 px-4 text-sm text-center">{r.items}</td>
                      <td className="py-3 px-4 text-sm text-center">
                        {returnStatusLabel[r.status] ?? r.status}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleViewDetail(r.id)}
                          className="p-2 hover:bg-muted rounded"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      Không tìm thấy yêu cầu nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination (basic) */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Trước
            </button>
            <div className="px-3 py-1 text-sm text-muted-foreground">
              Trang {currentPage}/{totalPages}
            </div>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Sau
            </button>
          </div>
        )}
      </Card>

      {/* Detail dialog */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null)
            setAdminNoteInput("")
            setShowAdminNoteBox(false)
          }
        }}
      >
        <DialogContent
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            max-w-5xl max-h-[90vh] bg-white border border-gray-200 shadow-xl
            rounded-2xl animate-in fade-in slide-in-from-bottom duration-300 overflow-hidden"
        >
          {/* Close */}
          <button
            onClick={() => {
              setSelected(null)
              setAdminNoteInput("")
              setShowAdminNoteBox(false)
            }}
            className="fixed top-[calc(50%-43vh)] right-[calc(50%-44rem)] p-2 rounded-full bg-white/80
              hover:bg-gray-100 active:bg-gray-200 shadow-sm border border-gray-200
              transition-transform duration-200 z-[9999]"
            aria-label="Đóng"
          >
            <X size={20} className="text-gray-700" />
          </button>

          <DialogTitle className="sr-only">Chi tiết đổi/trả</DialogTitle>

          <div className="overflow-y-auto max-h-[85vh] p-0 scrollbar-hide">
            {detailLoading ? (
              <div className="flex justify-center items-center py-16 text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Đang tải chi tiết...
              </div>
            ) : (
              selected && (
                <div className="p-2 space-y-8 text-gray-800">
                  {/* Header */}
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-2 py-6 flex justify-between items-center z-10">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                        Đổi/Trả #{selected.id.slice(0, 8).toUpperCase()}
                      </h2>
                      <p className="text-gray-500 text-sm mt-1">
                        Ngày tạo:{" "}
                        {new Date(selected.createdAt).toLocaleString("vi-VN")}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Mã đơn:{" "}
                        <span className="font-medium text-gray-900">
                          {selected.orderId}
                        </span>
                      </p>
                    </div>

                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase border ${statusBadgeClass(
                        selected.status
                      )}`}
                    >
                      {returnStatusLabel[selected.status] ?? selected.status}
                    </span>
                  </div>

                  {/* Customer */}
                  <div className="border border-gray-200 rounded-lg p-5 space-y-3 bg-white">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-600 flex items-center gap-2">
                      <User size={16} /> Khách hàng
                    </h3>
                    <p className="text-sm font-medium">
                      {selected.user?.name || "Không rõ"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selected.user?.email || ""}
                    </p>
                  </div>

                  {/* Reason */}
                  <div className="border border-gray-200 rounded-lg p-5 bg-white space-y-2">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-600">
                      Lý do & ghi chú
                    </h3>
                    <p className="text-sm">
                      <span className="text-gray-500">Loại:</span>{" "}
                      <span className="font-medium">
                        {returnTypeLabel[selected.type] ?? selected.type}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Lý do:</span>{" "}
                      <span className="font-medium">{selected.reason}</span>
                    </p>
                    {selected.note && (
                      <p className="text-sm text-gray-700">
                        <span className="text-gray-500">Ghi chú:</span>{" "}
                        {selected.note}
                      </p>
                    )}

                    {/* ✅ adminNote từ API */}
                    {selected.adminNote && (
                      <div className="mt-3 p-3 rounded-md bg-gray-50 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                          GHI CHÚ ADMIN
                        </p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {selected.adminNote}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-600 flex items-center gap-2">
                      <Package size={16} /> Sản phẩm yêu cầu
                    </h3>

                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                      {selected.items.map((it) => {
                        const p = it.orderItem?.product
                        const img = p?.images?.[0]?.url || "/placeholder.svg"
                        const color = it.orderItem?.color ?? "-"
                        const size = it.orderItem?.size ?? "-"
                        const price = it.orderItem?.price ?? 0

                        return (
                          <div
                            key={it.id}
                            className="flex gap-4 p-4 items-center hover:bg-gray-50 transition"
                          >
                            <img
                              src={img}
                              alt={p?.name || "product"}
                              className="w-16 h-16 rounded object-cover border border-gray-200"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">
                                {p?.name || "Không rõ sản phẩm"}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Màu: {color} | Size: {size} | SL yêu cầu:{" "}
                                <span className="font-semibold">
                                  {it.quantity}
                                </span>
                              </p>
                            </div>
                            <p className="font-semibold text-sm whitespace-nowrap">
                              {price.toLocaleString("vi-VN")}₫
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center border-t border-gray-200 pt-6">
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Clock size={14} /> Cập nhật:{" "}
                      {new Date(selected.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </div>

                  {/* Actions */}
                  {(selected.status === "PENDING" ||
                    selected.status === "APPROVED" ||
                    selected.status === "RECEIVED") && (
                    <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                      {/* input admin note (optional) */}
                      {showAdminNoteBox && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Ghi chú admin
                          </label>
                          <textarea
                            value={adminNoteInput}
                            onChange={(e) => setAdminNoteInput(e.target.value)}
                            rows={3}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="Ví dụ: yêu cầu hợp lệ / thiếu video mở hộp / quá thời hạn..."
                          />
                          <p className="text-xs text-gray-500">
                            Ghi chú này sẽ lưu vào adminNote.
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap justify-end gap-3">
                        {/* PENDING actions */}
                        {selected.status === "PENDING" && (
                          <>
                            <button
                              onClick={handleApprove}
                              disabled={isApproving}
                              className={`flex items-center gap-2 px-5 py-2 rounded-md font-semibold transition ${
                                isApproving
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-black text-white hover:bg-gray-800"
                              }`}
                            >
                              {isApproving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check size={16} />
                              )}
                              Duyệt
                            </button>

                            {!showAdminNoteBox ? (
                              <button
                                onClick={() => setShowAdminNoteBox(true)}
                                className="flex items-center gap-2 px-5 py-2 border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100 transition font-semibold"
                              >
                                <X size={16} /> Từ chối
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowAdminNoteBox(false)
                                    setAdminNoteInput("")
                                  }}
                                  className="flex items-center gap-2 px-5 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition text-sm"
                                >
                                  Đóng
                                </button>

                                <button
                                  onClick={handleReject}
                                  disabled={isRejecting || !adminNoteInput.trim()}
                                  className={`flex items-center gap-2 px-5 py-2 rounded-md font-semibold transition ${
                                    isRejecting || !adminNoteInput.trim()
                                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                      : "bg-red-600 text-white hover:bg-red-700"
                                  }`}
                                >
                                  {isRejecting && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  )}
                                  Xác nhận từ chối
                                </button>
                              </>
                            )}
                          </>
                        )}

                        {/* APPROVED -> RECEIVED */}
                        {selected.status === "APPROVED" && (
                          <button
                            onClick={handleReceived}
                            disabled={isReceiving}
                            className={`flex items-center gap-2 px-5 py-2 rounded-md font-semibold transition ${
                              isReceiving
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            {isReceiving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Truck size={16} />
                            )}
                            Đã nhận hàng
                          </button>
                        )}

                        {/* RECEIVED -> EXCHANGED */}
                        {selected.status === "RECEIVED" && (
                          <button
                            onClick={handleExchanged}
                            disabled={isExchanging}
                            className={`flex items-center gap-2 px-5 py-2 rounded-md font-semibold transition ${
                              isExchanging
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-purple-600 text-white hover:bg-purple-700"
                            }`}
                          >
                            {isExchanging ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCcw size={16} />
                            )}
                            Đã đổi xong
                          </button>
                        )}

                        {/* Toggle note box */}
                        {!showAdminNoteBox && selected.status !== "PENDING" && (
                          <button
                            onClick={() => setShowAdminNoteBox(true)}
                            className="px-4 py-2 border rounded-md hover:bg-gray-50 text-sm"
                          >
                            Thêm ghi chú
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
