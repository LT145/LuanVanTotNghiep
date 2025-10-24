"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setMessage("")

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    // Kiểm tra phản hồi
    const text = await res.text()
    try {
      const data = JSON.parse(text)

      if (data.success) {
        setMessage("🎉 Đăng ký thành công! Đang đăng nhập...")
        await signIn("credentials", {
          email,
          password,
          redirect: true,
          callbackUrl: "/",
        })
      } else {
        setMessage(`❌ ${data.message || "Đăng ký thất bại."}`)
      }
    } catch {
      console.error("❌ Phản hồi không phải JSON:", text)
      setMessage("⚠️ Lỗi phản hồi từ server.")
    }
  } catch (err) {
    console.error("❌ Lỗi khi gọi API:", err)
    setMessage("Không thể kết nối tới server.")
  } finally {
    setLoading(false)
  }
}


  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h2 className="text-2xl font-semibold">Đăng ký tài khoản</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-64">
        <input
          type="text"
          placeholder="Tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>
        {message && <p className="text-sm text-center mt-2">{message}</p>}
      </form>
    </div>
  )
}
