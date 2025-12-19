"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Star,
  MapPin,
  Package,
  Heart,
  ChevronDown,
  Truck,
  RotateCcw,
  X,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import AddAddressDialog from "@/components/order/add-address-dialog"

interface ProfileContentProps {
  activeTab: string
  user: any
}

// 🧠 Hàm chuyển slug
function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
}

// 💰 Format tiền VNĐ
const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")} đ`

// 🏠 Gộp địa chỉ đầy đủ
const formatFullAddress = (address: string, ward?: string, province?: string) =>
  [address, ward, province].filter(Boolean).join(", ")

// 📦 Convert status
const mapOrderStatus = (status: string) => {
  switch (status) {
    case "PENDING":
      return "Chờ xác nhận"
    case "PROCESSING":
      return "Đang xử lý"
    case "SHIPPING":
      return "Đang giao"
    case "COMPLETED":
      return "Đã giao"
    case "CANCELLED":
      return "Đã hủy"
    default:
      return "Không xác định"
  }
}

// 🚚 Convert shipping method
const mapShippingMethod = (method: string) => {
  return method === "EXPRESS" ? "Giao hàng nhanh" : "Giao hàng tiêu chuẩn"
}

// ===============================
// 🔁 TYPES FE cho Đổi/Trả
// ===============================
type ReturnType = "EXCHANGE" | "RETURN" | "REFUND"
type ReturnStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "RECEIVED"
  | "EXCHANGED"
  | "REFUNDED"
  | "CANCELLED"

const mapReturnType = (t: ReturnType) => {
  switch (t) {
    case "EXCHANGE":
      return "Đổi hàng"
    case "RETURN":
      return "Trả hàng"
    case "REFUND":
      return "Hoàn tiền"
    default:
      return "Đổi/Trả"
  }
}

const mapReturnStatus = (s: ReturnStatus) => {
  switch (s) {
    case "PENDING":
      return { label: "Chờ duyệt", cls: "bg-blue-50 text-blue-600" }
    case "APPROVED":
      return { label: "Đã duyệt", cls: "bg-green-50 text-green-600" }
    case "REJECTED":
      return { label: "Từ chối", cls: "bg-rose-50 text-rose-600" }
    case "RECEIVED":
      return { label: "Đã nhận hàng", cls: "bg-amber-50 text-amber-700" }
    case "EXCHANGED":
      return { label: "Đã đổi xong", cls: "bg-green-50 text-green-600" }
    case "REFUNDED":
      return { label: "Đã hoàn tiền", cls: "bg-green-50 text-green-600" }
    case "CANCELLED":
      return { label: "Đã huỷ", cls: "bg-gray-100 text-gray-700" }
    default:
      return { label: "Không rõ", cls: "bg-gray-100 text-gray-700" }
  }
}

export default function ProfileContent({ activeTab, user }: ProfileContentProps) {
  const [expandedOrders, setExpandedOrders] = useState<string[]>([])

  // ================== FAVORITES (STATE) ==================
  const [favorites, setFavorites] = useState(
    (user?.favorites || []).map((fav: any) => ({
      ...fav,
      isFavorite: true,
    }))
  )

  // 🔹 STATE cho địa chỉ (để update realtime)
  const [addresses, setAddresses] = useState<any[]>(user?.addresses || [])

  // nếu props user thay đổi (refetch từ trên), đồng bộ lại
  useEffect(() => {
    setAddresses(user?.addresses || [])
  }, [user?.addresses])

  // ⭐ Toggle trái tim mà không xoá item khỏi danh sách
  async function toggleFavorite(productId: string) {
    setFavorites((prev: any[]) =>
      prev.map((f: any) =>
        f.product.id === productId ? { ...f, isFavorite: !f.isFavorite } : f
      )
    )

    try {
      const res = await fetch("/api/favorite/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, userId: user.id }),
      })

      const js = await res.json()

      if (js.action === "added") toast.success("Đã thêm vào yêu thích ❤️")
      else if (js.action === "removed") toast.success("Đã bỏ khỏi yêu thích 💔")
    } catch (err) {
      toast.error("Không thể kết nối. Thử lại!")
      console.error(err)
    }
  }

  // ================== ORDERS ==================
  const rawOrders = (user?.orders || [])
    .slice()
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

  const orders = rawOrders.map((o: any) => ({
    ...o,
    rawStatus: o.status,
    cancelReason: o.cancelReason || null,
    date: new Date(o.createdAt).toLocaleDateString("vi-VN"),
    total: formatCurrency(o.totalAmount),
    fullAddress: formatFullAddress(o.shippingAddress, o.ward, o.province),
    status: mapOrderStatus(o.status),
    shipping: mapShippingMethod(o.shippingMethod),
    estimatedDelivery: o.shippingMethod === "EXPRESS" ? "1-2 ngày" : "3-5 ngày",
    shippingFee: formatCurrency(o.shippingFee ?? 0),
  }))

  // 💸 Tổng chi tiêu
  const totalSpentNumber = rawOrders
    .filter(
      (o: any) =>
        o.status === "PROCESSING" ||
        o.status === "SHIPPING" ||
        o.status === "COMPLETED"
    )
    .reduce((sum: number, o: any) => sum + (o.totalAmount ?? 0), 0)

  const totalSpent = formatCurrency(totalSpentNumber)

  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false)

  const toggleOrderExpanded = (id: string) => {
    setExpandedOrders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  // 🔁 Hàm reload địa chỉ từ server sau khi thêm mới
  const reloadAddresses = async () => {
    try {
      const res = await fetch(`/api/user/${user.id}`)
      const data = await res.json()
      setAddresses(data.addresses || [])
    } catch (err) {
      console.error(err)
      toast.error("Không tải lại danh sách địa chỉ được.")
    }
  }

  // ===================================================
  // 🔁 ĐỔI / TRẢ (STATE + API)
  // ===================================================
  const [returnRequests, setReturnRequests] = useState<any[]>([])
  const [returnsLoading, setReturnsLoading] = useState(false)

  const [isCreateReturnOpen, setIsCreateReturnOpen] = useState(false)
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<any>(null)

  const [returnType, setReturnType] = useState<ReturnType>("EXCHANGE")
  const [returnReason, setReturnReason] = useState("")
  const [returnNote, setReturnNote] = useState("")
  const [selectedItems, setSelectedItems] = useState<
    { orderItemId: string; quantity: number }[]
  >([])

  const eligibleOrders = rawOrders.filter((o: any) => o.status === "COMPLETED")

  const loadReturns = async () => {
    try {
      setReturnsLoading(true)
      const res = await fetch("/api/returns", { cache: "no-store" })
      const json = await res.json()
      if (json?.success) setReturnRequests(json.data || [])
      else setReturnRequests([])
    } catch (e) {
      console.error(e)
      toast.error("Không tải được danh sách đổi/trả.")
    } finally {
      setReturnsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "returns") loadReturns()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const openCreateReturn = (order: any) => {
    setSelectedOrderForReturn(order)
    setReturnType("EXCHANGE")
    setReturnReason("")
    setReturnNote("")
    setSelectedItems([])
    setIsCreateReturnOpen(true)
  }

  const toggleSelectReturnItem = (orderItem: any) => {
    const id = orderItem.id
    setSelectedItems((prev) => {
      const found = prev.find((x) => x.orderItemId === id)
      if (found) return prev.filter((x) => x.orderItemId !== id)
      return [...prev, { orderItemId: id, quantity: 1 }]
    })
  }

  const setReturnQty = (orderItemId: string, qty: number, maxQty: number) => {
    const safe = Math.max(1, Math.min(qty, maxQty))
    setSelectedItems((prev) =>
      prev.map((x) => (x.orderItemId === orderItemId ? { ...x, quantity: safe } : x))
    )
  }

  const submitReturn = async () => {
    if (!selectedOrderForReturn?.id) return toast.error("Thiếu đơn hàng.")
    if (!returnReason.trim()) return toast.error("Vui lòng nhập lý do đổi/trả.")
    if (selectedItems.length === 0) return toast.error("Vui lòng chọn ít nhất 1 sản phẩm.")

    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderForReturn.id,
          type: returnType,
          reason: returnReason,
          note: returnNote,
          items: selectedItems, // [{ orderItemId, quantity }]
        }),
      })

      const json = await res.json()
      if (!json?.success) {
        toast.error(json?.message || "Tạo yêu cầu đổi/trả thất bại.")
        return
      }

      toast.success("Đã gửi yêu cầu đổi/trả ✅")
      setIsCreateReturnOpen(false)
      loadReturns()
    } catch (e) {
      console.error(e)
      toast.error("Không thể gửi yêu cầu. Thử lại!")
    }
  }

  return (
    <div className="flex-1 p-6 lg:p-8">
      {/* ================== 🧭 TỔNG QUAN ================== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-8 border border-border shadow-sm">
            <h1 className="text-3xl font-bold mb-2 text-foreground">
              Xin chào, {user?.name || "Khách"} 👋
            </h1>
            <p className="text-muted-foreground">
              Quản lý hồ sơ, đơn hàng, địa chỉ và yêu thích của bạn tại đây
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 border border-border bg-gradient-to-br from-white to-secondary/20 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tổng đơn hàng</p>
                  <p className="text-3xl font-bold text-foreground">{orders.length}</p>
                </div>
                <Package className="w-12 h-12 text-accent/30" />
              </div>
            </Card>

            <Card className="p-6 border border-border bg-gradient-to-br from-white to-pink-50 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Yêu thích</p>
                  <p className="text-3xl font-bold text-foreground">
                    {favorites.length}
                  </p>
                </div>
                <Heart className="w-12 h-12 text-rose-300" />
              </div>
            </Card>

            <Card className="p-6 border border-border bg-gradient-to-br from-white to-yellow-50 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tổng chi tiêu</p>
                  <p className="text-2xl font-bold text-foreground">{totalSpent}</p>
                </div>
                <Star className="w-12 h-12 text-yellow-300" />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ================== 📦 ĐƠN HÀNG ================== */}
      {activeTab === "orders" && (
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-6">Đơn hàng của bạn</h1>

          {orders.length === 0 ? (
            <Card className="p-12 text-center border border-border bg-gradient-to-br from-white to-secondary/20">
              <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Bạn chưa có đơn hàng nào.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {orders.map((order: any) => {
                const isExpanded = expandedOrders.includes(order.id)
                return (
                  <Card key={order.id} className="border border-border overflow-hidden">
                    <button
                      onClick={() => toggleOrderExpanded(order.id)}
                      className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-secondary/50 transition border-b border-border"
                    >
                      <div className="flex items-center justify-between flex-1 ">
                        <div className="text-left">
                          <p className="font-semibold text-foreground text-sm">
                            Mã đơn: {order.id}
                          </p>
                          <p className="text-xs ">Ngày đặt hàng: {order.date}</p>
                        </div>

                        <div className="flex items-center gap-6">
                          <p className="text-sm text-muted-foreground">
                            {order.items.length} sản phẩm
                          </p>
                          <p className="font-bold text-foreground">{order.total}</p>

                          <span
                            className={`text-sm font-semibold px-3 py-1 rounded-sm ${
                              order.status === "Đã giao"
                                ? "bg-green-50 text-green-600"
                                : order.status === "Đã hủy"
                                ? "bg-rose-50 text-rose-600"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground ml-4 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 py-4 space-y-3">
                            {order.items.map((i: any) => (
                              <div
                                key={i.id}
                                className="flex gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
                              >
                                <img
                                  src={i.product?.images?.[0]?.url || "/placeholder.svg"}
                                  className="w-16 h-16 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-foreground">
                                    {i.product?.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Số lượng: {i.quantity} • Màu: {i.color} • Size:{" "}
                                    {i.size}
                                  </p>
                                  <p className="text-sm font-semibold text-accent mt-2">
                                    {formatCurrency(i.price)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="px-6 py-4 bg-secondary/20 border-t border-border">
                            <p className="text-xs font-semibold text-muted-foreground mb-3">
                              THÔNG TIN NHẬN HÀNG
                            </p>
                            <div className="space-y-2">
                              <p className="text-sm text-foreground">
                                <span className="text-muted-foreground">Người nhận:</span>{" "}
                                {order.recipientName}
                              </p>

                              <p className="text-sm text-foreground">
                                <span className="text-muted-foreground">SĐT:</span>{" "}
                                {order.recipientPhone}
                              </p>

                              <p className="text-sm text-foreground">
                                <span className="text-muted-foreground">Địa chỉ:</span>{" "}
                                {order.fullAddress}
                              </p>
                            </div>
                          </div>

                          <div className="px-6 py-4 bg-secondary/30 border-t border-border">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  Vận chuyển:
                                </span>
                                <span className="text-sm font-medium text-foreground flex items-center gap-1">
                                  <Truck className="w-4 h-4" /> {order.shipping}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  Dự kiến giao:
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                  {order.estimatedDelivery}
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-border">
                                <span className="text-sm text-muted-foreground">
                                  Phí giao hàng:
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                  {order.shippingFee}
                                </span>
                              </div>
                            </div>
                          </div>

                          {order.rawStatus === "CANCELLED" && order.cancelReason && (
                            <div className="px-6 py-4 bg-rose-50 border-t border-rose-100">
                              <p className="text-xs font-semibold text-rose-700 mb-1">
                                LÝ DO HỦY ĐƠN
                              </p>
                              <p className="text-sm text-rose-800">{order.cancelReason}</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ================== 🔁 ĐỔI / TRẢ ================== */}
      {activeTab === "returns" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Đổi / Trả</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gửi yêu cầu đổi/trả, chờ admin duyệt và theo dõi trạng thái tại đây.
              </p>
            </div>

            <Button
              className="gap-2"
              onClick={() => {
                if (eligibleOrders.length === 0) {
                  toast("Chỉ có thể đổi/trả với đơn ĐÃ GIAO.")
                  return
                }
                openCreateReturn(eligibleOrders[0])
              }}
            >
              <RotateCcw className="w-4 h-4" />
              Tạo yêu cầu
            </Button>
          </div>

          {/* QUICK: Chọn đơn để tạo */}
          <Card className="p-4 border border-border">
            <p className="text-sm font-semibold mb-3">Tạo yêu cầu từ đơn đã giao</p>

            {eligibleOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Bạn chưa có đơn nào ở trạng thái <b>Đã giao</b> để đổi/trả.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {eligibleOrders.slice(0, 6).map((o: any) => (
                  <button
                    key={o.id}
                    onClick={() => openCreateReturn(o)}
                    className="text-left p-4 rounded-lg border border-border hover:bg-secondary/40 transition"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">Mã đơn: {o.id}</p>
                      <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">
                        Đã giao
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ngày: {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                    <p className="text-sm font-bold mt-2">
                      {formatCurrency(o.totalAmount || 0)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* LIST RETURNS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Yêu cầu của bạn</h2>
              <Button variant="outline" onClick={loadReturns}>
                Tải lại
              </Button>
            </div>

            {returnsLoading ? (
              <Card className="p-10 text-center border border-border">
                <p className="text-muted-foreground">Đang tải...</p>
              </Card>
            ) : returnRequests.length === 0 ? (
              <Card className="p-10 text-center border border-border bg-gradient-to-br from-white to-secondary/10">
                <RotateCcw className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Bạn chưa có yêu cầu đổi/trả nào.</p>
              </Card>
            ) : (
              returnRequests.map((r: any) => {
                const st = mapReturnStatus(r.status as ReturnStatus)
                return (
                  <Card key={r.id} className="border border-border p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground text-sm">
                          Mã yêu cầu: {r.id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Đơn: {r.orderId} • {mapReturnType(r.type)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tạo lúc:{" "}
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleString("vi-VN")
                            : "—"}
                        </p>
                      </div>

                      <span className={`text-sm font-semibold px-3 py-1 rounded ${st.cls}`}>
                        {st.label}
                      </span>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Lý do:</span>{" "}
                        <span className="font-medium">{r.reason}</span>
                      </p>
                      {r.note ? (
                        <p className="text-sm mt-1">
                          <span className="text-muted-foreground">Ghi chú:</span>{" "}
                          {r.note}
                        </p>
                      ) : null}
                    </div>

                    {/* items */}
                    {Array.isArray(r.items) && r.items.length > 0 && (
                      <div className="mt-4 border-t border-border pt-4 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          SẢN PHẨM YÊU CẦU
                        </p>
                        {r.items.map((it: any) => (
                          <div
                            key={it.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {it?.orderItem?.product?.name || "Sản phẩm"}{" "}
                              {it?.orderItem?.color ? `• ${it.orderItem.color}` : ""}{" "}
                              {it?.orderItem?.size ? `• ${it.orderItem.size}` : ""}
                            </span>
                            <span className="font-semibold">x{it.quantity}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* admin note */}
                    {r.adminNote ? (
                      <div className="mt-4 bg-secondary/30 border border-border rounded-lg p-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                          PHẢN HỒI TỪ ADMIN
                        </p>
                        <p className="text-sm">{r.adminNote}</p>
                      </div>
                    ) : null}
                  </Card>
                )
              })
            )}
          </div>

          {/* CREATE RETURN MODAL */}
          {isCreateReturnOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-2xl rounded-xl bg-white border border-border shadow-lg overflow-hidden">
                <div className="p-5 border-b border-border flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Tạo yêu cầu đổi / trả</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Đơn: <b>{selectedOrderForReturn?.id}</b>
                    </p>
                  </div>

                  <button
                    className="p-2 rounded-lg hover:bg-secondary/60 transition"
                    onClick={() => setIsCreateReturnOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-5">
                  {/* TYPE */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Loại yêu cầu</p>
                    <div className="flex flex-wrap gap-2">
                      {(["EXCHANGE", "RETURN", "REFUND"] as ReturnType[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => setReturnType(t)}
                          className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${
                            returnType === t
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:bg-secondary/50"
                          }`}
                        >
                          {mapReturnType(t)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ITEMS */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Chọn sản phẩm</p>

                    <div className="space-y-2 max-h-64 overflow-auto pr-1">
                      {(selectedOrderForReturn?.items || []).map((oi: any) => {
                        const checked = selectedItems.some((x) => x.orderItemId === oi.id)
                        const selected = selectedItems.find((x) => x.orderItemId === oi.id)
                        const maxQty = oi.quantity || 1

                        return (
                          <div
                            key={oi.id}
                            className={`p-3 rounded-lg border ${
                              checked ? "border-primary bg-primary/5" : "border-border"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex gap-3">
                                <img
                                  src={oi.product?.images?.[0]?.url || "/placeholder.svg"}
                                  className="w-14 h-14 object-cover rounded"
                                />
                                <div>
                                  <p className="text-sm font-semibold">
                                    {oi.product?.name || "Sản phẩm"}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Màu: {oi.color || "—"} • Size: {oi.size || "—"} • Đã mua:{" "}
                                    {oi.quantity}
                                  </p>
                                  <p className="text-sm font-bold mt-2">
                                    {formatCurrency(oi.price || 0)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <button
                                  onClick={() => toggleSelectReturnItem(oi)}
                                  className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                                    checked
                                      ? "border-primary bg-primary text-white"
                                      : "border-border hover:bg-secondary/60"
                                  }`}
                                >
                                  {checked ? "Đã chọn" : "Chọn"}
                                </button>

                                {checked && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">SL:</span>
                                    <input
                                      type="number"
                                      min={1}
                                      max={maxQty}
                                      value={selected?.quantity || 1}
                                      onChange={(e) =>
                                        setReturnQty(
                                          oi.id,
                                          Number(e.target.value || 1),
                                          maxQty
                                        )
                                      }
                                      className="w-20 h-9 px-2 border border-border rounded-lg text-sm"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* REASON */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Lý do</p>
                    <textarea
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      rows={3}
                      placeholder="Ví dụ: Áo bị lỗi đường may / size không vừa / muốn đổi màu..."
                      className="w-full border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  {/* NOTE */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">
                      Ghi chú (tuỳ chọn)
                    </p>
                    <textarea
                      value={returnNote}
                      onChange={(e) => setReturnNote(e.target.value)}
                      rows={2}
                      placeholder="Ghi chú thêm cho admin..."
                      className="w-full border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>

                <div className="p-5 border-t border-border flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateReturnOpen(false)}>
                    Huỷ
                  </Button>
                  <Button onClick={submitReturn}>Gửi yêu cầu</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================== 🏠 ĐỊA CHỈ ================== */}
      {activeTab === "addresses" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">Địa chỉ của bạn</h1>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              onClick={() => setIsAddAddressOpen(true)}
            >
              + Thêm địa chỉ
            </Button>
          </div>

          <div className="space-y-4">
            {addresses.length > 0 ? (
              addresses.map((addr: any) => (
                <Card
                  key={addr.id}
                  className="p-6 border border-border bg-gradient-to-br from-white to-secondary/10 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {addr.label || "Địa chỉ"}
                        </h3>

                        {addr.isDefault && (
                          <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                            Mặc định
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-foreground">
                        <span className="text-muted-foreground">Người nhận:</span>{" "}
                        {addr.recipientName || user?.name}
                      </p>

                      <p className="text-sm text-foreground">
                        <span className="text-muted-foreground">SĐT:</span>{" "}
                        {addr.recipientPhone || user?.phone || "Chưa có"}
                      </p>

                      <p className="text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        {formatFullAddress(addr.address, addr.ward, addr.province)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Sửa
                      </Button>
                      <Button variant="outline" size="sm">
                        Xóa
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center border border-border bg-gradient-to-br from-white to-secondary/10">
                <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Bạn chưa có địa chỉ nào.</p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ================== ❤️ YÊU THÍCH ================== */}
      {activeTab === "wishlist" && (
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-6">
            Danh sách yêu thích
          </h1>

          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {favorites.map((fav: any) => {
                const p = fav.product

                const category = p?.category
                const mainCategory = category?.parent?.name
                  ? slugify(category.parent.name)
                  : "san-pham"
                const subCategory = slugify(category?.name || "khac")
                const url = `/${mainCategory}/${subCategory}/${p.slug}`

                const colors = p.variantColors?.map((c: any) => c.color) || []
                const image1 = p.images?.[0]?.url || "/placeholder.svg"
                const image2 = p.images?.[1]?.url || image1

                return (
                  <Link key={fav.id} href={url} className="block group">
                    <Card className="overflow-hidden shadow-sm hover:shadow-lg transition border border-border cursor-pointer rounded-xl">
                      <div className="relative w-full aspect-[4/4] overflow-hidden bg-gray-100">
                        <div className="flex w-[200%] h-full transition-transform duration-500 ease-out group-hover:-translate-x-1/2">
                          <div className="relative w-1/2 h-full">
                            <img
                              src={image1}
                              className="object-cover w-full h-full scale-105 group-hover:scale-110 transition"
                            />
                          </div>

                          <div className="relative w-1/2 h-full">
                            <img
                              src={image2}
                              className="object-cover w-full h-full scale-105 group-hover:scale-110 transition"
                            />
                          </div>
                        </div>

                        <Button
                          size="icon"
                          className="absolute top-3 right-3 rounded-full bg-white/90 hover:bg-white shadow-md"
                          onClick={(e) => {
                            e.preventDefault()
                            toggleFavorite(p.id)
                          }}
                        >
                          <Heart
                            className={`w-6 h-6 transition ${
                              fav.isFavorite
                                ? "fill-red-500 text-red-500"
                                : "text-gray-400"
                            }`}
                          />
                        </Button>
                      </div>

                      <div className="p-5">
                        <h3 className="text-base font-semibold mb-3 line-clamp-2">
                          {p.name}
                        </h3>

                        <div className="flex gap-2 mb-4">
                          {colors.map((c: string, i: number) => {
                            const color = c.toLowerCase()
                            const map =
                              {
                                đen: "bg-black",
                                đỏ: "bg-red-500",
                                trắng: "bg-white border",
                                vàng: "bg-yellow-400",
                                tím: "bg-purple-500",
                                nâu: "bg-amber-700",
                                be: "bg-amber-100",
                                xám: "bg-gray-400",
                                ghi: "bg-gray-400",
                              }[color] || "bg-gray-300"

                            return (
                              <div
                                key={i}
                                className={`w-5 h-5 rounded-full border ${map}`}
                              ></div>
                            )
                          })}
                        </div>

                        <p className="text-xl font-bold text-black mb-4">
                          {p.basePrice.toLocaleString("vi-VN")}₫
                        </p>

                        <Button
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm h-12 text-lg font-medium"
                          onClick={(e) => e.preventDefault()}
                        >
                          Thêm vào giỏ
                        </Button>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          ) : (
            <Card className="p-12 text-center border border-border bg-gradient-to-br from-white to-secondary/10">
              <Heart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Bạn chưa có sản phẩm yêu thích.</p>
            </Card>
          )}
        </div>
      )}

      {/* 🔹 Popup Thêm địa chỉ */}
      <AddAddressDialog
        open={isAddAddressOpen}
        onOpenChange={setIsAddAddressOpen}
        onAdded={() => {
          reloadAddresses()
        }}
      />
    </div>
  )
}
