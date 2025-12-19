"use client"

import { useState } from "react"

interface ProductTabsProps {
  product: {
    description: string
  }
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("description")

  const tabs = [
    {
      id: "description",
      label: "Mô tả sản phẩm",
      content: (
<div
  className="max-w-none"
  dangerouslySetInnerHTML={{ __html: product.description }}
/>

      ),
    },
    {
      id: "sizing",
      label: "Kích thước sản phẩm",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground mb-4">Bảng kích thước chi tiết (đơn vị: cm)</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Kích thước</th>
                  <th className="text-left py-3 px-4 font-semibold">Chiều dài</th>
                  <th className="text-left py-3 px-4 font-semibold">Chiều rộng</th>
                  <th className="text-left py-3 px-4 font-semibold">Vòng ngực</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { size: "XS", length: "65", width: "42", chest: "84" },
                  { size: "S", length: "67", width: "44", chest: "88" },
                  { size: "M", length: "69", width: "46", chest: "92" },
                  { size: "L", length: "71", width: "48", chest: "96" },
                  { size: "XL", length: "73", width: "50", chest: "100" },
                  { size: "XXL", length: "75", width: "52", chest: "104" },
                ].map((row) => (
                  <tr key={row.size} className="border-b border-border hover:bg-muted">
                    <td className="py-3 px-4 font-medium">{row.size}</td>
                    <td className="py-3 px-4">{row.length}</td>
                    <td className="py-3 px-4">{row.width}</td>
                    <td className="py-3 px-4">{row.chest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            * Các số liệu trên có thể chênh lệch ±1-2cm do cách đo lường
          </p>
        </div>
      ),
    },
    {
      id: "shipping",
      label: "Chính sách giao hàng",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Giao hàng</h4>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Giao hàng miễn phí cho đơn hàng từ 500.000₫</li>
              <li>Thời gian giao hàng: 2-5 ngày làm việc</li>
              <li>Hỗ trợ giao hàng toàn quốc</li>
              <li>Đóng gói cẩn thận, bảo vệ sản phẩm</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Hoàn trả</h4>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Hoàn trả miễn phí trong 30 ngày</li>
              <li>Sản phẩm phải còn nguyên vẹn, chưa sử dụng</li>
              <li>Hoàn tiền trong 5-7 ngày làm việc</li>
              <li>Liên hệ hỗ trợ khách hàng để bắt đầu quá trình hoàn trả</li>
            </ul>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-semibold text-sm whitespace-nowrap rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-4">{tabs.find((tab) => tab.id === activeTab)?.content}</div>
    </div>
  )
}
