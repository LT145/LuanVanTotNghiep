"use client"

import {
  Eye,
  Search,
  Loader2,
  X,
  Check,
  Clock,
  Package,
  CreditCard,
  MapPin,
  User,
  Truck,
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

// 🗺️ Enum → Tiếng Việt
const statusLabel: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao",
  COMPLETED: "Đã giao",
  CANCELLED: "Đã hủy",
}

interface Order {
  id: string
  customer: string
  createdAt: string        // ISO time từ API
  dateTime: string         // Chuỗi hiển thị: dd/mm/yyyy, HH:mm:ss
  total: number
  status: string
  items: number
}

interface OrderDetail {
  id: string
  recipientName: string
  recipientPhone: string
  shippingAddress: string
  province: string
  ward: string
  paymentMethod: string
  shippingMethod: string
  status: string
  totalAmount: number
  shippingFee: number
  createdAt: string
  items: {
    id: string
    quantity: number
    price: number
    color: string
    size: string
    currentStock: number | null
    stockAfter: number | null
    product: {
      id: string
      name: string
      image: string | null
    }
  }[]
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [showCancelReason, setShowCancelReason] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const itemsPerPage = 6

  // ✅ Check tồn kho có đủ không (chỉ cần khi PENDING)
  const hasInsufficientStock = useMemo(() => {
    if (!selectedOrder) return false
    if (selectedOrder.status !== "PENDING") return false

    return selectedOrder.items.some(
      (item) =>
        item.currentStock != null && item.currentStock < item.quantity
    )
  }, [selectedOrder])

  // =========================================================
  // 🔹 Lấy danh sách đơn hàng (API rút gọn)
  // =========================================================
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/order", { cache: "no-store" })
        const js = await res.json()
        if (js.ok) {
          const list: Order[] = js.orders.map((o: any) => {
            const d = new Date(o.createdAt)
            return {
              id: o.id,
              customer: o.recipientName,
              createdAt: o.createdAt,
              dateTime: d.toLocaleString("vi-VN"), // hiển thị ngày + giờ
              total: o.totalAmount,
              status: o.status,
              items: o.itemsCount,
            }
          })
          setOrders(list)
        } else toast.error("Không thể tải danh sách đơn hàng.")
      } catch (e) {
        console.error("Error:", e)
        toast.error("Lỗi khi tải đơn hàng.")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  // =========================================================
  // 🔍 Lọc + Tìm kiếm + Sắp xếp
  // =========================================================
  const filteredOrders = useMemo(() => {
    let filtered = [...orders]

    // Tìm kiếm theo mã đơn hoặc tên khách
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.customer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Lọc theo trạng thái
    if (statusFilter === "NEED_ACTION") {
      // Chỉ lấy đơn CHỜ XÁC NHẬN + ĐANG XỬ LÝ
      filtered = filtered.filter(
        (o) => o.status === "PENDING" || o.status === "PROCESSING"
      )
    } else if (statusFilter !== "all") {
      filtered = filtered.filter((o) => o.status === statusFilter)
    }

    // Sắp xếp
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
        case "total-high":
          return b.total - a.total
        case "total-low":
          return a.total - b.total
        default:
          return 0
      }
    })
    return filtered
  }, [orders, searchTerm, statusFilter, sortBy])

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage)

  useEffect(() => setCurrentPage(1), [searchTerm, statusFilter, sortBy])

  // =========================================================
  // 🔹 Xem chi tiết đơn hàng
  // =========================================================
  const handleViewDetail = async (id: string) => {
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/order/${id}`, { cache: "no-store" })
      const js = await res.json()
      if (js.ok) {
        setSelectedOrder(js.order)
        setCancelReason("")
        setShowCancelReason(false)
      } else toast.error("Không tìm thấy đơn hàng.")
    } catch (err) {
      console.error("Error loading detail:", err)
      toast.error("Lỗi khi tải chi tiết đơn hàng.")
    } finally {
      setDetailLoading(false)
    }
  }

  // =========================================================
  // 🔹 Duyệt đơn hàng
  // =========================================================
  const handleApprove = async () => {
    if (!selectedOrder) return

    if (hasInsufficientStock) {
      toast.error("Tồn kho không đủ, không thể duyệt đơn. Vui lòng kiểm tra lại.")
      return
    }

    try {
      const res = await fetch(`/api/order/${selectedOrder.id}/approve`, {
        method: "POST",
      })
      const js = await res.json()
      if (js.ok) {
        toast.success("✅ Đơn hàng đã được duyệt!")
        setSelectedOrder({ ...selectedOrder, status: "PROCESSING" })
        setOrders((prev) =>
          prev.map((o) =>
            o.id === selectedOrder.id ? { ...o, status: "PROCESSING" } : o
          )
        )
      } else toast.error(js.error || "Lỗi khi duyệt đơn.")
    } catch (err) {
      console.error(err)
      toast.error("Không thể duyệt đơn.")
    }
  }

  // =========================================================
  // 🔹 Hủy đơn hàng (gửi API, kèm lý do)
  // =========================================================
  const handleCancel = async () => {
    if (!selectedOrder) return
    if (!cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy đơn.")
      return
    }

    try {
      setIsCancelling(true)
      const res = await fetch(`/api/order/${selectedOrder.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason.trim() }),
      })
      const js = await res.json()
      if (js.ok) {
        toast.success("❌ Đơn hàng đã bị hủy.")
        setSelectedOrder({ ...selectedOrder, status: "CANCELLED" })
        setOrders((prev) =>
          prev.map((o) =>
            o.id === selectedOrder.id ? { ...o, status: "CANCELLED" } : o
          )
        )
        setShowCancelReason(false)
      } else toast.error(js.error || "Lỗi khi hủy đơn.")
    } catch (err) {
      console.error(err)
      toast.error("Không thể hủy đơn.")
    } finally {
      setIsCancelling(false)
    }
  }

  // =========================================================
  // 🧩 Giao diện
  // =========================================================
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
        <p className="text-muted-foreground mt-1">
          Xem, tìm kiếm và lọc đơn hàng
        </p>
      </div>

      {/* Bộ lọc / tìm kiếm */}
      <Card className="p-6 space-y-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-3 text-muted-foreground"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn hoặc tên khách hàng..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Trạng thái đơn hàng
            </label>
            <select
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground bg-background"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="NEED_ACTION">
                Chờ xác nhận + Đang xử lý
              </option>
              <option value="SHIPPING">Đang giao</option>
              <option value="COMPLETED">Đã giao</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Sắp xếp theo
            </label>
            <select
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-foreground bg-background"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-desc">Thời gian mới nhất</option>
              <option value="date-asc">Thời gian cũ nhất</option>
              <option value="total-high">Tổng tiền cao → thấp</option>
              <option value="total-low">Tổng tiền thấp → cao</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Bảng đơn hàng */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-16 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Đang tải danh sách đơn hàng...
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4">Mã đơn</th>
                  <th className="text-center py-3 px-4">Khách hàng</th>
                  <th className="text-center py-3 px-4">Ngày giờ</th>
                  <th className="py-3 px-4 text-center">Sản phẩm</th>
                  <th className="text-center py-3 px-4">Tổng tiền</th>
                  <th className="text-center py-3 px-4">Trạng thái</th>
                  <th className="text-center py-3 px-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.length > 0 ? (
                  currentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="py-3 px-4">{order.id}</td>
                      <td className="py-3 px-4 text-center">
                        {order.customer}
                      </td>
                      <td className="py-3 px-4 text-sm text-center">
                        {order.dateTime}
                      </td>
                      <td className="py-3 px-4 text-sm text-center">
                        {order.items}
                      </td>
                      <td className="py-3 px-4 font-semibold text-center">
                        {order.total.toLocaleString("vi-VN")}₫
                      </td>
                      <td className="py-3 px-4 text-sm text-center">
                        {statusLabel[order.status] ?? order.status}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleViewDetail(order.id)}
                          className="p-2 hover:bg-muted rounded"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      Không tìm thấy đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Popup chi tiết */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOrder(null)
            setCancelReason("")
            setShowCancelReason(false)
          }
        }}
      >
        <DialogContent
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            max-w-5xl max-h-[90vh] bg-white border border-gray-200 shadow-xl
            rounded-2xl animate-in fade-in slide-in-from-bottom duration-300 overflow-hidden"
        >
          {/* Nút đóng cố định */}
          <button
            onClick={() => {
              setSelectedOrder(null)
              setCancelReason("")
              setShowCancelReason(false)
            }}
            className="fixed top-[calc(50%-43vh)] right-[calc(50%-44rem)] p-2 rounded-full bg-white/80
              hover:bg-gray-100 active:bg-gray-200 shadow-sm border border-gray-200
              transition-transform duration-200 z-[9999]"
            aria-label="Đóng"
          >
            <X
              size={20}
              className="text-gray-700 group-hover:rotate-90 transition-transform"
            />
          </button>

          <DialogTitle className="sr-only">Chi tiết đơn hàng</DialogTitle>

          <div className="overflow-y-auto max-h-[85vh] p-0 scrollbar-hide">
            {selectedOrder && (
              <div className="p-2 space-y-8 text-gray-800">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-2 py-6 flex justify-between items-center z-10">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                      Đơn hàng #{selectedOrder.id.slice(0, 8).toUpperCase()}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Ngày tạo:{" "}
                      {new Date(
                        selectedOrder.createdAt
                      ).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase border ${
                      selectedOrder.status === "COMPLETED"
                        ? "border-green-500 text-green-700 bg-green-50"
                        : selectedOrder.status === "CANCELLED"
                        ? "border-red-400 text-red-600 bg-red-50"
                        : selectedOrder.status === "SHIPPING"
                        ? "border-blue-400 text-blue-600 bg-blue-50"
                        : selectedOrder.status === "PROCESSING"
                        ? "border-yellow-400 text-yellow-700 bg-yellow-50"
                        : "border-gray-300 text-gray-700 bg-gray-50"
                    }`}
                  >
                    {statusLabel[selectedOrder.status]}
                  </span>
                </div>

                {/* Thông tin khách hàng & địa chỉ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-5 space-y-3 bg-white">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-600 flex items-center gap-2">
                      <User size={16} /> Khách hàng
                    </h3>
                    <p className="text-sm font-medium">
                      {selectedOrder.recipientName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.recipientPhone}
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-5 space-y-3 bg-white">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-600 flex items-center gap-2">
                      <MapPin size={16} /> Giao hàng đến
                    </h3>
                    <p className="text-sm">{selectedOrder.shippingAddress}</p>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.ward}, {selectedOrder.province}
                    </p>
                  </div>
                </div>

                {/* Thanh toán & giao hàng */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-5 bg-white">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-600 flex items-center gap-2 mb-2">
                      <CreditCard size={16} /> Thanh toán
                    </h3>
                    <p className="text-sm">{selectedOrder.paymentMethod}</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-5 bg-white">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-600 flex items-center gap-2 mb-2">
                      <Truck size={16} /> Hình thức giao
                    </h3>
                    <p className="text-sm">{selectedOrder.shippingMethod}</p>
                  </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-600 flex items-center gap-2">
                    <Package size={16} /> Sản phẩm
                  </h3>
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                    {selectedOrder.items.map((item) => {
                      const rawStockAfter =
                        item.stockAfter != null ? item.stockAfter : null
                      const isNegative =
                        rawStockAfter != null && rawStockAfter < 0
                      const displayStockAfter = isNegative
                        ? 0
                        : rawStockAfter

                      const shortage =
                        isNegative && rawStockAfter != null
                          ? Math.abs(rawStockAfter)
                          : 0

                      return (
                        <div
                          key={item.id}
                          className="flex gap-4 p-4 items-center hover:bg-gray-50 transition"
                        >
                          <img
                            src={item.product.image || "/placeholder.svg"}
                            alt={item.product.name}
                            className="w-16 h-16 rounded object-cover border border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Màu: {item.color} | Size: {item.size} | SL:{" "}
                              {item.quantity}
                            </p>

                            {/* Chỉ hiện tồn kho khi đơn PENDING */}
                            {selectedOrder.status === "PENDING" && (
                              <>
                                {item.currentStock != null ? (
                                  <p className="text-xs text-amber-700 mt-1">
                                    Tồn hiện tại:{" "}
                                    <span className="font-semibold">
                                      {item.currentStock}
                                    </span>{" "}
                                    • Sau đơn này:{" "}
                                    <span
                                      className={
                                        isNegative
                                          ? "font-semibold text-red-600"
                                          : "font-semibold"
                                      }
                                    >
                                      {displayStockAfter}
                                      {isNegative && shortage > 0
                                        ? ` (thiếu ${shortage})`
                                        : ""}
                                    </span>
                                  </p>
                                ) : (
                                  <p className="text-xs text-gray-400 mt-1">
                                    Không tìm thấy tồn kho cho biến thể này
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                          <p className="font-semibold text-sm whitespace-nowrap">
                            {item.price.toLocaleString("vi-VN")}₫
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Tổng tiền + phí ship */}
                <div className="flex justify-between items-center border-t border-gray-200 pt-6">
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock size={14} /> Cập nhật:{" "}
                    {new Date(
                      selectedOrder.createdAt
                    ).toLocaleString("vi-VN")}
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-gray-500 text-sm">
                      Tạm tính:{" "}
                      {(
                        selectedOrder.totalAmount - selectedOrder.shippingFee
                      ).toLocaleString("vi-VN")}
                      ₫
                    </p>
                    <p className="text-gray-500 text-sm">
                      Phí ship:{" "}
                      {selectedOrder.shippingFee.toLocaleString("vi-VN")}₫
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {selectedOrder.totalAmount.toLocaleString("vi-VN")}₫
                    </p>
                  </div>
                </div>

                {/* Nút hành động */}
                {selectedOrder.status === "PENDING" && (
                  <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                    {hasInsufficientStock && (
                      <p className="text-sm text-red-600 flex items-center gap-2">
                        <X size={14} />
                        Một số sản phẩm trong đơn không đủ tồn kho, không thể
                        duyệt đơn.
                      </p>
                    )}

                    {/* Ô nhập lý do hủy (chỉ hiện khi bấm Hủy) */}
                    {showCancelReason && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Lý do hủy đơn
                        </label>
                        <textarea
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          rows={3}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          placeholder="Ví dụ: Khách đổi ý, không liên hệ được, sai thông tin địa chỉ..."
                        />
                        <p className="text-xs text-gray-500">
                          Lý do này sẽ được lưu lại trong đơn hàng để tiện tra cứu sau.
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap justify-end gap-3">
                      {/* Nút duyệt luôn luôn có */}
                      <button
                        onClick={handleApprove}
                        disabled={hasInsufficientStock}
                        className={`flex items-center gap-2 px-5 py-2 rounded-md font-semibold transition ${
                          hasInsufficientStock
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-black text-white hover:bg-gray-800"
                        }`}
                      >
                        <Check size={16} /> Duyệt
                      </button>

                      {/* Nút hủy / xác nhận hủy */}
                      {!showCancelReason ? (
                        <button
                          onClick={() => setShowCancelReason(true)}
                          className="flex items-center gap-2 px-5 py-2 border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100 transition font-semibold"
                        >
                          <X size={16} /> Hủy
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setShowCancelReason(false)
                              setCancelReason("")
                            }}
                            className="flex items-center gap-2 px-5 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition text-sm"
                          >
                            Đóng
                          </button>
                          <button
                            onClick={handleCancel}
                            disabled={isCancelling || !cancelReason.trim()}
                            className={`flex items-center gap-2 px-5 py-2 rounded-md font-semibold transition ${
                              isCancelling || !cancelReason.trim()
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-red-600 text-white hover:bg-red-700"
                            }`}
                          >
                            {isCancelling && (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                            Xác nhận hủy
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
