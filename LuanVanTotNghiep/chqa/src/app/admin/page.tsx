import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  // Nếu chưa đăng nhập hoặc không phải admin → về trang chủ
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <main className="min-h-screen p-10 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">👑 Trang Quản Trị</h1>
      <p className="text-gray-700">
        Xin chào <strong>{session.user?.name || session.user?.email}</strong>!  
        Bạn đang đăng nhập với quyền <strong>ADMIN</strong>.
      </p>

      <div className="mt-10 grid gap-6 grid-cols-2 md:grid-cols-3">
        {/* 📦 Quản lý sản phẩm */}
        <Link
          href="/admin/products"
          className="p-6 border rounded-xl bg-white hover:shadow-md transition block hover:bg-gray-50"
        >
          <h2 className="font-semibold text-lg mb-2">📦 Quản lý sản phẩm</h2>
          <p className="text-sm text-gray-500">Xem, thêm, sửa hoặc xóa sản phẩm</p>
        </Link>

        {/* 🧍 Quản lý người dùng */}
        <Link
          href="/admin/users"
          className="p-6 border rounded-xl bg-white hover:shadow-md transition block hover:bg-gray-50"
        >
          <h2 className="font-semibold text-lg mb-2">🧍 Quản lý người dùng</h2>
          <p className="text-sm text-gray-500">Phân quyền, khóa tài khoản</p>
        </Link>

        {/* 💰 Quản lý đơn hàng */}
        <Link
          href="/admin/orders"
          className="p-6 border rounded-xl bg-white hover:shadow-md transition block hover:bg-gray-50"
        >
          <h2 className="font-semibold text-lg mb-2">💰 Quản lý đơn hàng</h2>
          <p className="text-sm text-gray-500">Theo dõi trạng thái đơn hàng</p>
        </Link>
      </div>
    </main>
  )
}

 