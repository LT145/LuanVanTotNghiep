"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// ===============================
// Kiểu dữ liệu
// ===============================
interface Ward {
  code: string
  name: string
  fullName: string
  slug: string
  type: string
}

interface Province {
  code: string
  name: string
  wards: Ward[]
}

interface AddAddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdded?: () => void
}

export default function AddAddressDialog({ open, onOpenChange, onAdded }: AddAddressDialogProps) {
  const [loading, setLoading] = useState(false)
  const [provinceList, setProvinceList] = useState<Province[]>([])
  const [wardList, setWardList] = useState<Ward[]>([])

  // Form
  const [form, setForm] = useState({
    label: "",
    recipientName: "",
    recipientPhone: "",
    address: "",
    province: "",
    ward: "",
    isDefault: false,
  })

  // Load file JSON
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/vn-tree.json")
      const data = await res.json()
      setProvinceList(data)
    }
    fetchData()
  }, [])

  // Khi chọn tỉnh → load danh sách phường/xã
const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const provinceCode = e.target.value
  const province = provinceList.find((p) => p.code === provinceCode)

  setForm((prev) => ({
    ...prev,
    province: provinceCode,  // ✅ lưu code để select hiển thị đúng
    ward: ""
  }))

  setWardList(province?.wards || [])
}


  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, ward: e.target.value }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  const handleSubmit = async () => {
    if (!form.recipientName || !form.recipientPhone || !form.address) {
      toast.warning("Vui lòng điền đầy đủ thông tin bắt buộc.")
      return
    }

    try {
      setLoading(true)
      const res = await fetch("/api/user-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const js = await res.json()
      if (!js.success) throw new Error(js.error || "Không thể thêm địa chỉ.")

      toast.success("Thêm địa chỉ mới thành công!")
      onAdded?.()
      onOpenChange(false)
    } catch (e) {
      toast.error("Lỗi khi thêm địa chỉ.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm địa chỉ mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-3">
          <Input name="label" placeholder="Tên gợi nhớ" value={form.label} onChange={handleChange} />
          <Input name="recipientName" placeholder="Họ và tên người nhận *" value={form.recipientName} onChange={handleChange} />
          <Input name="recipientPhone" placeholder="Số điện thoại *" value={form.recipientPhone} onChange={handleChange} />
          <Input name="address" placeholder="Địa chỉ chi tiết *" value={form.address} onChange={handleChange} />

          {/* Province Select */}
          <select
            className="border rounded-md p-2 w-full"
            value={form.province}
            onChange={handleProvinceChange}
          >
            <option value="">-- Chọn Tỉnh / Thành phố --</option>
            {provinceList.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Ward Select */}
          <select
            className="border rounded-md p-2 w-full"
            value={form.ward}
            onChange={handleWardChange}
            disabled={!wardList.length}
          >
            <option value="">-- Chọn Phường / Xã --</option>
            {wardList.map((w) => (
              <option key={w.code} value={w.fullName}>
                {w.fullName}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleChange} className="accent-black" />
            Đặt làm địa chỉ mặc định
          </label>

          <Button disabled={loading} onClick={handleSubmit} className="w-full bg-black text-white hover:bg-gray-900 mt-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Lưu địa chỉ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
