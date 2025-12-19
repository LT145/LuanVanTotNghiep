"use client"

import { useState } from "react"
import { Edit2, Trash2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function Customers() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const customers = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      phone: "0901234567",
      address: "123 Đường Lê Lợi, Hà Nội",
      joinDate: "2023-05-15",
      lastOrder: "2024-10-20",
      orders: 15,
      spent: 5200000,
      status: "Hoạt động",
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@email.com",
      phone: "0912345678",
      address: "456 Đường Nguyễn Huệ, TP.HCM",
      joinDate: "2023-08-22",
      lastOrder: "2024-10-18",
      orders: 28,
      spent: 8900000,
      status: "Hoạt động",
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "levanc@email.com",
      phone: "0923456789",
      address: "789 Đường Hải Phòng, Đà Nẵng",
      joinDate: "2024-01-10",
      lastOrder: "2024-09-05",
      orders: 8,
      spent: 2100000,
      status: "Hoạt động",
    },
    {
      id: 4,
      name: "Phạm Thị D",
      email: "phamthid@email.com",
      phone: "0934567890",
      address: "321 Đường Trần Hưng Đạo, Hải Phòng",
      joinDate: "2023-03-08",
      lastOrder: "2024-10-25",
      orders: 42,
      spent: 15300000,
      status: "VIP",
    },
    {
      id: 5,
      name: "Hoàng Văn E",
      email: "hoangvane@email.com",
      phone: "0945678901",
      address: "654 Đường Cách Mạng Tháng 8, Cần Thơ",
      joinDate: "2024-06-12",
      lastOrder: "2024-08-30",
      orders: 5,
      spent: 1800000,
      status: "Hoạt động",
    },
    {
      id: 6,
      name: "Võ Thị F",
      email: "vothif@email.com",
      phone: "0956789012",
      address: "987 Đường Lý Thường Kiệt, Hà Nội",
      joinDate: "2023-11-20",
      lastOrder: "2024-10-22",
      orders: 19,
      spent: 6500000,
      status: "Hoạt động",
    },
    {
      id: 7,
      name: "Đặng Văn G",
      email: "dangvang@email.com",
      phone: "0967890123",
      address: "147 Đường Bà Triệu, TP.HCM",
      joinDate: "2023-07-05",
      lastOrder: "2024-10-10",
      orders: 12,
      spent: 4200000,
      status: "Hoạt động",
    },
    {
      id: 8,
      name: "Bùi Thị H",
      email: "buithih@email.com",
      phone: "0978901234",
      address: "258 Đường Phan Bội Châu, Đà Nẵng",
      joinDate: "2024-02-14",
      lastOrder: "2024-10-15",
      orders: 22,
      spent: 7800000,
      status: "VIP",
    },
  ]

  // Filter and sort
  const filtered = customers
    .filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "spent") return b.spent - a.spent
      if (sortBy === "orders") return b.orders - a.orders
      return 0
    })

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginatedData = filtered.slice(startIdx, startIdx + itemsPerPage)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Quản lý khách hàng</h1>
        <p className="text-muted-foreground mt-1">Xem thông tin và lịch sử mua hàng của khách</p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <Input
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
        >
          <option value="name">Sắp xếp: Tên</option>
          <option value="spent">Sắp xếp: Chi tiêu cao nhất</option>
          <option value="orders">Sắp xếp: Đơn hàng nhiều nhất</option>
        </select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Tên khách hàng</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Điện thoại</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Ngày tham gia</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Đơn hàng</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Tổng chi tiêu</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Trạng thái</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((customer) => (
              <tr key={customer.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium">{customer.name}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{customer.email}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{customer.phone}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {new Date(customer.joinDate).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 text-sm font-medium">{customer.orders}</td>
                <td className="px-6 py-4 text-sm font-semibold">{formatCurrency(customer.spent)}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${customer.status === "VIP" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}
                  >
                    {customer.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button className="p-2 hover:bg-muted rounded transition-colors">
                    <Edit2 size={16} className="text-foreground" />
                  </button>
                  <button className="p-2 hover:bg-destructive/10 rounded transition-colors">
                    <Trash2 size={16} className="text-destructive" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Hiển thị {startIdx + 1} đến {Math.min(startIdx + itemsPerPage, filtered.length)} trong {filtered.length} khách
          hàng
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Trước
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg transition-colors ${currentPage === page ? "bg-foreground text-background" : "border border-border hover:bg-muted"}`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  )
}
