"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Truck, Loader2, MapPin, Plus } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import AddAddressDialog from "./add-address-dialog"
// ===============================
// 📦 Kiểu dữ liệu
// ===============================
interface ShippingForm {
  fullName: string
  email: string
  phone: string
  address: string
  ward: string
  wardName: string        // 🟢 đổi từ `string | undefined` → `string`
  district: string
  province: string
  provinceName: string    // 🟢 đổi từ `string | undefined` → `string`
  note: string
  shippingMethod: "standard" | "express" | string
}

interface UserAddress {
  id: string
  label?: string
  recipientName?: string
  recipientPhone?: string
  address: string
  province?: string       // TÊN
  ward?: string           // TÊN
  provinceCode?: string
  wardCode?: string
  isDefault: boolean
}

interface StoreSetting {
  latitude: number
  longitude: number
  normalShippingFee: number
  enableExpress: boolean
  expressRatePerKm: number
  maxExpressDistanceKm: number
  enableFreeShipByQuantity: boolean
  enableFreeShipByTotal: boolean
  freeShipMinQuantity: number
  freeShipMinTotal: number
}

interface ShippingInfoProps {
  formData: ShippingForm
  onFormChange: (data: ShippingForm) => void
  onShippingCostChange?: (cost: number) => void
  cartTotal?: number
  cartQuantity?: number
}

// ===============================
// 🚚 Component chính
// ===============================
export default function ShippingInfo({
  formData,
  onFormChange,
  onShippingCostChange,
  cartTotal = 0,
  cartQuantity = 0,
}: ShippingInfoProps) {
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [loadingAddress, setLoadingAddress] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const [store, setStore] = useState<StoreSetting | null>(null)

  const [standardCost, setStandardCost] = useState<number | null>(null)
  const [expressFee, setExpressFee] = useState<number | null>(null)
  const [distanceKm, setDistanceKm] = useState<number | null>(null)
  const [loadingDistance, setLoadingDistance] = useState(false)

  const didInit = useRef(false)
  const methodRef = useRef<ShippingForm["shippingMethod"]>(formData.shippingMethod)
  const calcSeq = useRef(0)

  useEffect(() => {
    methodRef.current = formData.shippingMethod
  }, [formData.shippingMethod])

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedId) || null,
    [addresses, selectedId]
  )

  // ===============================
  // ⚙️ Tính phí tiêu chuẩn (freeship)
  // ===============================
  const computeStandardCost = (s?: StoreSetting) => {
    const st = s || store
    if (!st) return null
    let cost = st.normalShippingFee
    if (st.enableFreeShipByQuantity && cartQuantity >= st.freeShipMinQuantity) cost = 0
    if (st.enableFreeShipByTotal && cartTotal >= st.freeShipMinTotal) cost = 0
    return cost
  }

  // ===============================
  // ⚙️ Tính phí hỏa tốc (từ tên phường/tỉnh)
  // ===============================
  const computeExpressFromName = async (
    wardName: string,
    provinceName: string,
    storeOverride?: StoreSetting
  ) => {
    const s = storeOverride || store
    if (!s || !wardName || !provinceName)
      return { fee: null as number | null, km: null as number | null }

    const seq = ++calcSeq.current
    try {
      setLoadingDistance(true)

      const query = `${wardName}, ${provinceName}, Việt Nam`
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
      )
      const geoJson = await geoRes.json()
      if (!geoJson.length || seq !== calcSeq.current) return { fee: null, km: null }

      const userLat = parseFloat(geoJson[0].lat)
      const userLng = parseFloat(geoJson[0].lon)

      const osrmRes = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${s.longitude},${s.latitude};${userLng},${userLat}?overview=false`
      )
      const osrmJson = await osrmRes.json()
      if (!osrmJson.routes?.length || seq !== calcSeq.current) return { fee: null, km: null }

      const km = osrmJson.routes[0].distance / 1000

      if (km > s.maxExpressDistanceKm) return { fee: null, km }

      const fee = Math.ceil((km * s.expressRatePerKm) / 1000) * 1000
      return { fee, km }
    } catch {
      return { fee: null, km: null }
    } finally {
      if (seq === calcSeq.current) setLoadingDistance(false)
    }
  }

  // ===============================
  // 🔰 INIT (chạy 1 lần)
  // ===============================
  useEffect(() => {
    if (didInit.current) return
    didInit.current = true

    const init = async () => {
      try {
        const storeRes = await fetch("/api/store-setting/shipping")
        const storeData = await storeRes.json()
        if (!storeData.success) throw new Error("Store fetch lỗi")
        setStore(storeData.store)

        const addrRes = await fetch("/api/user-address")
        const addrData = await addrRes.json()
        if (!addrData.success) throw new Error("Address fetch lỗi")
        setAddresses(addrData.addresses)

        const def = addrData.addresses.find((a: UserAddress) => a.isDefault)
        const currentMethod: "standard" | "express" =
          (formData.shippingMethod as "standard" | "express") || "standard"
        methodRef.current = currentMethod

        if (def) {
          setSelectedId(def.id)
          onFormChange({
            ...formData,
            fullName: def.recipientName || "",
            phone: def.recipientPhone || "",
            address: def.address,
            province: def.provinceCode || "",
            ward: def.wardCode || "",
            provinceName: def.province || "",
            wardName: def.ward || "",
            shippingMethod: currentMethod,
          })

          const std = computeStandardCost(storeData.store)
          setStandardCost(std)

          let expFee: number | null = null
          let km: number | null = null
          if (def.ward && def.province) {
            const r = await computeExpressFromName(def.ward, def.province, storeData.store)
            expFee = r.fee
            km = r.km
          }
          setExpressFee(expFee)
          setDistanceKm(km)

          if (currentMethod === "express" && expFee != null) onShippingCostChange?.(expFee)
          else if (std != null) onShippingCostChange?.(std)
        } else {
          const std = computeStandardCost(storeData.store)
          setStandardCost(std)
          if (std != null) onShippingCostChange?.(std)
        }
      } catch (e) {
        console.error(e)
        toast.error("Không tải được thông tin giao hàng.")
      } finally {
        setLoadingAddress(false)
      }
    }
    init()
  }, [])

  // ===============================
  // 🏠 Khi chọn địa chỉ mới
  // ===============================
  const handleSelect = async (addr: UserAddress) => {
    setSelectedId(addr.id)

    const newForm: ShippingForm = {
      ...formData,
      fullName: addr.recipientName || "",
      phone: addr.recipientPhone || "",
      address: addr.address,
      province: addr.provinceCode || "",
      ward: addr.wardCode || "",
      provinceName: addr.province || "",
      wardName: addr.ward || "",
      shippingMethod: "standard",
    }
    onFormChange(newForm)
    methodRef.current = "standard"
    setDialogOpen(false)

    const std = computeStandardCost()
    setStandardCost(std)
    if (std != null) onShippingCostChange?.(std)

    setLoadingDistance(true)
    setExpressFee(null)
    setDistanceKm(null)
    try {
      if (addr.ward && addr.province && store) {
        const r = await computeExpressFromName(addr.ward, addr.province, store)
        setExpressFee(r.fee)
        setDistanceKm(r.km)
      }
    } finally {
      setLoadingDistance(false)
    }
  }

  // ===============================
  // 🛒 Cập nhật khi giỏ hàng đổi
  // ===============================
  useEffect(() => {
    if (!store) return
    const std = computeStandardCost()
    setStandardCost(std)
    if (methodRef.current === "standard" && std != null) onShippingCostChange?.(std)
  }, [cartTotal, cartQuantity, store])

  // ===============================
  // 🚚 Đổi phương thức giao hàng
  // ===============================
  const canUseExpress =
    !!store &&
    !loadingDistance &&
    expressFee != null &&
    distanceKm != null &&
    distanceKm <= store.maxExpressDistanceKm

  const handleChangeShippingMethod = (newMethod: "standard" | "express") => {
    if (newMethod === "express" && !canUseExpress) {
      toast.warning("Chưa tính xong hoặc ngoài phạm vi hỏa tốc.")
      return
    }

    onFormChange({ ...formData, shippingMethod: newMethod })
    methodRef.current = newMethod

    if (newMethod === "express") {
      if (expressFee != null) onShippingCostChange?.(expressFee)
      else if (standardCost != null) onShippingCostChange?.(standardCost)
    } else {
      if (standardCost != null) onShippingCostChange?.(standardCost)
    }
  }

  const shippingMethods = [
    { id: "standard", label: "Giao hàng tiêu chuẩn", desc: "Phí cố định" },
    { id: "express", label: "Giao hàng hỏa tốc", desc: "Tính theo km" },
  ] as const

  const outOfRange =
    distanceKm != null && store && distanceKm > store.maxExpressDistanceKm

  // ===============================
  // 🧩 Giao diện
  // ===============================
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Thông tin giao hàng</h2>

      {/* Địa chỉ hiện tại */}
      <div className="flex items-center justify-between border rounded-lg p-4 bg-gray-50">
        {loadingAddress ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" /> Đang tải địa chỉ...
          </div>
        ) : selectedAddress ? (
          <div>
            <p className="font-medium text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {selectedAddress.label || "Địa chỉ"}{" "}
              {selectedAddress.isDefault && (
                <span className="text-xs bg-black text-white px-2 py-0.5 rounded">
                  Mặc định
                </span>
              )}
            </p>
            <p className="text-sm text-gray-600">
              {selectedAddress.recipientName} — {selectedAddress.recipientPhone}
            </p>
            <p className="text-sm text-gray-500">
              {selectedAddress.address}, {selectedAddress.ward}, {selectedAddress.province}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">Chưa có địa chỉ nào.</p>
        )}

{/* Popup chọn địa chỉ */}
<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogTrigger asChild>
    <Button
      variant="outline"
      className="border-black text-black hover:bg-black hover:text-white"
    >
      Thay đổi địa chỉ
    </Button>
  </DialogTrigger>
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle>Chọn địa chỉ giao hàng</DialogTitle>
    </DialogHeader>

    {loadingAddress ? (
      <div className="flex justify-center py-6">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    ) : (
      <div className="space-y-2 max-h-[350px] overflow-y-auto">
        {addresses.map((a) => (
          <Card
            key={a.id}
            onClick={() => handleSelect(a)}
            className={`cursor-pointer border p-2 transition hover:border-black ${
              selectedId === a.id ? "border-black bg-gray-50" : "border-gray-200"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="text-xs text-gray-800 space-y-0.5">
                <p className="font-medium text-gray-900 text-sm">
                  {a.label || "Địa chỉ"}{" "}
                  {a.isDefault && (
                    <span className="ml-1 text-[10px] bg-black text-white px-1 py-0.5 rounded">
                      Mặc định
                    </span>
                  )}
                </p>
                <p className="text-[12px] text-gray-600">
                  {a.recipientName} — {a.recipientPhone}
                </p>
                <p className="text-[12px] text-gray-500 truncate max-w-[260px]">
                  {a.address}, {a.ward}, {a.province}
                </p>
              </div>
              {selectedId === a.id && (
                <span className="text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded">
                  ✓ Đang chọn
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    )}

    {/* Nút mở form thêm địa chỉ */}
    <div className="pt-3 border-t flex justify-end">
      <Button onClick={() => setAddDialogOpen(true)}>
        <Plus className="w-4 h-4 mr-2" /> Thêm địa chỉ mới
      </Button>
    </div>
  </DialogContent>
</Dialog>

{/* Popup thêm địa chỉ mới */}
<AddAddressDialog
  open={addDialogOpen}
  onOpenChange={setAddDialogOpen}
  onAdded={async () => {
    // reload danh sách địa chỉ sau khi thêm
    setLoadingAddress(true)
    try {
      const res = await fetch("/api/user-address")
      const js = await res.json()
      if (js.success) setAddresses(js.addresses)
    } finally {
      setLoadingAddress(false)
    }
  }}
/>

      </div>

      {/* Phương thức giao hàng */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5" /> Phương thức giao hàng
        </h3>

        <div className="space-y-3">
          {shippingMethods.map((method) => {
            const disabledExpress = method.id === "express" && !canUseExpress
            return (
              <label
                key={method.id}
                className={`flex items-center justify-between border rounded-lg p-4 cursor-pointer transition ${
                  formData.shippingMethod === method.id
                    ? "border-black bg-white"
                    : "border-gray-300 hover:border-black"
                } ${disabledExpress ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div>
                  <p className="font-medium text-black">{method.label}</p>
                  <p className="text-sm text-gray-600">
                    {method.id === "express"
                      ? loadingDistance
                        ? "Đang tính khoảng cách..."
                        : expressFee != null
                        ? distanceKm != null
                          ? `Khoảng cách: ${distanceKm.toFixed(1)} km`
                          : "Đã tính phí"
                        : outOfRange
                        ? "Ngoài phạm vi"
                        : "Chưa khả dụng"
                      : "Phí cố định"}
                  </p>
                </div>

                <div className="text-right">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={method.id}
                    checked={formData.shippingMethod === method.id}
                    onChange={() => handleChangeShippingMethod(method.id)}
                    className="h-5 w-5 accent-black mr-2"
                    disabled={disabledExpress}
                  />
                  <span className="font-semibold text-black">
                    {method.id === "express"
                      ? expressFee != null
                        ? `${expressFee.toLocaleString("vi-VN")}₫`
                        : "-"
                      : standardCost != null
                      ? `${standardCost.toLocaleString("vi-VN")}₫`
                      : ""}
                  </span>
                </div>
              </label>
            )
          })}
        </div>
      </div>

      {/* 📝 Ghi chú */}
      <div className="bg-white border rounded-lg p-4">
        <label htmlFor="shipping-note" className="block text-sm font-medium text-gray-700 mb-2">
          Ghi chú cho đơn hàng
        </label>
        <textarea
          id="shipping-note"
          name="note"
          value={formData.note}
          onChange={(e) => onFormChange({ ...formData, note: e.target.value })}
          placeholder="Ví dụ: gọi trước khi giao, giao giờ hành chính, ghi chú về cổng/điểm gửi..."
          rows={4}
          className="w-full rounded-md border border-gray-300 p-2.5 outline-none focus:ring-2 focus:ring-black/70"
        />
        <div className="mt-1 text-xs text-gray-500">
          {formData.note?.length ?? 0}/300
        </div>
      </div>
    </div>
  )
}
