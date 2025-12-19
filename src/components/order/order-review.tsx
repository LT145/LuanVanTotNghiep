"use client"

export default function OrderReview({
  items,
  loading,
}: {
  items: any[]
  loading: boolean
}) {
  if (loading) return <p>Đang tải giỏ hàng...</p>
  if (!items.length) return <p>Giỏ hàng trống</p>

  // ✅ Tính tổng tiền
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-black mb-6 text-center">
        Xem lại đơn hàng
      </h2>

      <div className="space-y-4">
        {items.map((item) => {
          const image =
            item.product.images.find((img: any) => img.isMain)?.url ||
            item.product.images[0]?.url ||
            "/placeholder.svg"

          return (
            <div
              key={item.id}
              className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all"
            >
              {/* 🖼️ Cột trái: ảnh + tên + size */}
              <div className="flex items-center gap-4">
                <img
                  src={image}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                />
                <div>
                  <h3 className="font-semibold text-black">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Màu: {item.color} | Size: {item.size}
                  </p>
                </div>
              </div>

              {/* 🔢 Cột giữa: số lượng */}
              <div className="text-center">
                <p className="text-sm text-gray-600">Số lượng</p>
                <p className="font-medium text-black">{item.quantity}</p>
              </div>

              {/* 💰 Cột phải: thành tiền */}
              <div className="text-right">
                <p className="text-sm text-gray-600">Thành tiền</p>
                <p className="font-semibold text-black">
                  {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* 🧾 Tổng cộng */}
      <div className="border-t pt-4 text-right">
        <p className="text-lg font-semibold text-black">
          Tổng cộng: {total.toLocaleString("vi-VN")}₫
        </p>
      </div>
    </div>
  )
}
