"use client"

import { useAuthModal } from "@/lib/auth-context"
import { useEffect, useMemo, useState } from "react"
import { signIn } from "next-auth/react"
import { CheckCircle2, XCircle, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { AuthMode } from "@/lib/auth-context"

type StepRegister = "form" | "otp"
type StepForgot = "send" | "reset"

export function AuthModal() {
  const { isOpen, setIsOpen, mode, setMode } = useAuthModal()

  // ✅ Hooks PHẢI gọi trước mọi return
  const [step, setStep] = useState<StepRegister>("form")
  const [forgotStep, setForgotStep] = useState<StepForgot>("send")

  const [otp, setOtp] = useState("")
  const [countdown, setCountdown] = useState(0)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [gender, setGender] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [loading, setLoading] = useState(false)

  // đếm ngược OTP (dùng chung)
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  // reset step khi đóng/mở modal
  useEffect(() => {
    if (!isOpen) return
    setStep("form")
    setForgotStep("send")
    setOtp("")
    setCountdown(0)
    setLoading(false)
  }, [isOpen])

  // reset step khi đổi mode (tránh bị kẹt step)
  useEffect(() => {
    if (!isOpen) return
    setStep("form")
    setForgotStep("send")
    setOtp("")
    setCountdown(0)
    setLoading(false)
  }, [mode, isOpen])

  // ✅ luôn gọi useMemo trước mọi return
  const passwordStrength = useMemo(() => {
    const pw = mode === "forgot" ? newPassword : password
    let score = 0
    if (pw.length >= 8) score += 1
    if (/[A-Z]/.test(pw)) score += 1
    if (/[0-9]/.test(pw)) score += 1
    return score
  }, [password, newPassword, mode])

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 1:
        return "bg-red-500"
      case 2:
        return "bg-yellow-500"
      case 3:
        return "bg-green-500"
      default:
        return "bg-gray-200"
    }
  }

  const getStrengthLabel = () => {
    switch (passwordStrength) {
      case 0:
        return "Chưa nhập"
      case 1:
        return "Yếu"
      case 2:
        return "Trung bình"
      case 3:
        return "Mạnh"
      default:
        return ""
    }
  }

  const isStrongPassword = (pw: string) =>
    pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)

  const closeModal = () => {
    setIsOpen(false)
    setStep("form")
    setForgotStep("send")
    setOtp("")
    setCountdown(0)
    setLoading(false)
  }

  // ✅ CHỈ return sau khi gọi xong toàn bộ hooks ở trên
  if (!isOpen) return null

  // ===================== LOGIN =====================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast.error("⚠️ Vui lòng nhập email và mật khẩu")
      return
    }

    setLoading(true)
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.error === "ACCOUNT_BLOCKED") {
        toast.error("Tài khoản của bạn đã bị khóa 🚫", {
          description: "Vui lòng liên hệ admin để mở khóa.",
        })
        return
      }

      if (res?.error) {
        toast.error("Sai thông tin đăng nhập ❌")
        return
      }

      const sessionRes = await fetch("/api/auth/session")
      const sessionData = await sessionRes.json()
      const role = sessionData?.user?.role

      toast.success("🔐 Đăng nhập thành công!")

      if (role === "ADMIN" || role === "MANAGER") {
        window.location.href = "/admin"
      } else if (role === "SHIPPER") {
        window.location.href = "/shipper"
      } else {
        window.location.href = "/"
      }

      closeModal()
    } catch {
      toast.error("⚙️ Lỗi khi đăng nhập")
    } finally {
      setLoading(false)
    }
  }

  // ===================== REGISTER: SEND OTP =====================
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !gender || !birthDate || !email.trim() || !password.trim()) {
      toast.error("⚠️ Vui lòng nhập đầy đủ thông tin trước khi gửi OTP")
      return
    }

    if (!isStrongPassword(password)) {
      toast.error("⚠️ Mật khẩu chưa đủ mạnh", {
        description: "Cần ít nhất 8 ký tự, 1 chữ hoa và 1 chữ số.",
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success("📩 OTP đã được gửi!")
        setStep("otp")
        setCountdown(60)
        setTimeout(() => setLoading(false), 350)
      } else {
        toast.error("Không gửi được OTP ❌", { description: data.message })
      }
    } catch {
      toast.error("⚙️ Lỗi khi gửi OTP")
    } finally {
      setLoading(false)
    }
  }

  // ===================== REGISTER: VERIFY OTP =====================
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp.trim()) {
      toast.error("⚠️ Vui lòng nhập mã OTP")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/register/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, gender, birthDate, otp }),
      })

      const data = await res.json()
      if (!data.success) {
        toast.error("❌ Xác minh OTP thất bại", { description: data.message })
        return
      }

      toast.success("🎉 Xác minh thành công", { description: "Đang đăng nhập..." })

      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (loginRes?.error) toast.error("Đăng nhập thất bại ❌")
      else {
        toast.success("✅ Đăng nhập thành công", { description: "Chào mừng bạn quay lại!" })
        closeModal()
      }
    } catch {
      toast.error("⚙️ Lỗi khi xác minh OTP")
    } finally {
      setLoading(false)
    }
  }

  const resendOtpRegister = async () => {
    if (countdown > 0) return
    if (!email.trim()) {
      toast.error("⚠️ Vui lòng nhập email")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("📩 OTP mới đã được gửi lại!")
        setCountdown(60)
      } else {
        toast.error("Không gửi lại được OTP", { description: data.message })
      }
    } catch {
      toast.error("⚙️ Lỗi khi gửi lại OTP")
    } finally {
      setLoading(false)
    }
  }

  // ===================== FORGOT: SEND OTP =====================
  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error("⚠️ Vui lòng nhập email")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!data.success) {
        toast.error("Không gửi được OTP ❌", { description: data.message })
        return
      }

      toast.success("📩 OTP đã được gửi!")
      setForgotStep("reset")
      setCountdown(60)
    } catch {
      toast.error("⚙️ Lỗi khi gửi OTP")
    } finally {
      setLoading(false)
    }
  }

  // ===================== FORGOT: RESEND OTP =====================
  const resendOtpForgot = async () => {
    if (countdown > 0) return
    if (!email.trim()) {
      toast.error("⚠️ Vui lòng nhập email")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("📩 OTP mới đã được gửi lại!")
        setCountdown(60)
      } else {
        toast.error("Không gửi lại được OTP", { description: data.message })
      }
    } catch {
      toast.error("⚙️ Lỗi khi gửi lại OTP")
    } finally {
      setLoading(false)
    }
  }

  // ===================== FORGOT: RESET PASSWORD =====================
  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp.trim()) {
      toast.error("⚠️ Vui lòng nhập OTP")
      return
    }
    if (!newPassword.trim()) {
      toast.error("⚠️ Vui lòng nhập mật khẩu mới")
      return
    }
    if (!isStrongPassword(newPassword)) {
      toast.error("⚠️ Mật khẩu mới chưa đủ mạnh", {
        description: "Cần ít nhất 8 ký tự, 1 chữ hoa và 1 chữ số.",
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      })
      const data = await res.json()

      if (!data.success) {
        toast.error("❌ Đổi mật khẩu thất bại", { description: data.message })
        return
      }

      toast.success("✅ Đổi mật khẩu thành công", {
        description: "Bạn có thể đăng nhập lại.",
      })

      setMode("login" as AuthMode)
      setPassword("")
      setNewPassword("")
      setOtp("")
      setCountdown(0)
      setStep("form")
      setForgotStep("send")
    } catch {
      toast.error("⚙️ Lỗi khi đổi mật khẩu")
    } finally {
      setLoading(false)
    }
  }

  const title = (() => {
    if (mode === "login") return "Đăng nhập"
    if (mode === "register") return step === "otp" ? "Xác minh OTP" : "Đăng ký"
    return forgotStep === "reset" ? "Đặt lại mật khẩu" : "Quên mật khẩu"
  })()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-96 p-8 rounded-2xl shadow-2xl relative border border-gray-200 animate-fadeIn">
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">{title}</h2>

        {/* ===================== LOGIN UI ===================== */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <InputField label="Mật khẩu" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white py-2 rounded-md hover:bg-gray-900 transition flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("forgot")
                setForgotStep("send")
                setOtp("")
                setNewPassword("")
                setCountdown(0)
              }}
              className="text-sm text-gray-600 hover:underline text-left"
            >
              Quên mật khẩu?
            </button>

            <p className="text-sm text-center text-gray-600 mt-2">
              Chưa có tài khoản?{" "}
              <button
                onClick={() => setMode("register")}
                className="font-medium text-black cursor-pointer hover:underline"
                type="button"
              >
                Đăng ký ngay
              </button>
            </p>
          </form>
        )}

        {/* ===================== REGISTER FORM ===================== */}
        {mode === "register" && step === "form" && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <InputField label="Họ và tên" value={name} onChange={(e) => setName(e.target.value)} />

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Giới tính</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-black"
              >
                <option value="">Chọn giới tính</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            <InputField label="Ngày sinh" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <InputField label="Mật khẩu" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

            <div className="mt-1">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Độ mạnh: {getStrengthLabel()}</span>
              </div>
              <Progress value={passwordStrength * 33.3} className={cn("h-2 rounded-full", getStrengthColor())} />
              <div className="mt-2 space-y-1 text-xs">
                <PasswordCheck condition={password.length >= 8} label="Ít nhất 8 ký tự" />
                <PasswordCheck condition={/[A-Z]/.test(password)} label="1 chữ in hoa" />
                <PasswordCheck condition={/[0-9]/.test(password)} label="1 chữ số" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white py-2 rounded-md hover:bg-gray-900 transition flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? "Đang gửi OTP..." : "Gửi mã OTP"}
            </button>

            <p className="text-sm text-center text-gray-600 mt-2">
              Đã có tài khoản?{" "}
              <button
                onClick={() => setMode("login")}
                className="font-medium text-black hover:underline"
                type="button"
              >
                Đăng nhập
              </button>
            </p>
          </form>
        )}

        {/* ===================== REGISTER OTP ===================== */}
        {mode === "register" && step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <InputField
              label="Nhập mã OTP"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6 chữ số"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? "Đang xác minh..." : "Xác minh & Đăng ký"}
            </button>

            <div className="text-center text-sm text-gray-600 mt-2">
              {countdown > 0 ? (
                <span className="flex justify-center items-center gap-1">
                  <Clock className="w-4 h-4" /> Gửi lại sau {countdown}s
                </span>
              ) : (
                <button onClick={resendOtpRegister} type="button" className="text-blue-600 hover:underline" disabled={loading}>
                  Gửi lại mã OTP
                </button>
              )}
            </div>

            <button type="button" onClick={() => setStep("form")} className="text-sm text-gray-600 hover:underline">
              ← Quay lại chỉnh thông tin
            </button>
          </form>
        )}

        {/* ===================== FORGOT SEND ===================== */}
        {mode === "forgot" && forgotStep === "send" && (
          <form onSubmit={handleForgotSendOtp} className="flex flex-col gap-4">
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email đã đăng ký"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white py-2 rounded-md hover:bg-gray-900 transition disabled:opacity-50"
            >
              {loading ? "Đang gửi OTP..." : "Gửi OTP"}
            </button>

            <button type="button" onClick={() => setMode("login")} className="text-sm text-gray-600 hover:underline">
              ← Quay lại đăng nhập
            </button>
          </form>
        )}

        {/* ===================== FORGOT RESET ===================== */}
        {mode === "forgot" && forgotStep === "reset" && (
          <form onSubmit={handleForgotReset} className="flex flex-col gap-4">
            <InputField label="Nhập OTP" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6 chữ số" />

            <InputField
              label="Mật khẩu mới"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mật khẩu mới"
            />

            <div className="mt-1">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Độ mạnh: {getStrengthLabel()}</span>
              </div>
              <Progress value={passwordStrength * 33.3} className={cn("h-2 rounded-full", getStrengthColor())} />
              <div className="mt-2 space-y-1 text-xs">
                <PasswordCheck condition={newPassword.length >= 8} label="Ít nhất 8 ký tự" />
                <PasswordCheck condition={/[A-Z]/.test(newPassword)} label="1 chữ in hoa" />
                <PasswordCheck condition={/[0-9]/.test(newPassword)} label="1 chữ số" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? "Đang đổi..." : "Đổi mật khẩu"}
            </button>

            <div className="text-center text-sm text-gray-600 mt-2">
              {countdown > 0 ? (
                <span className="flex justify-center items-center gap-1">
                  <Clock className="w-4 h-4" /> Gửi lại sau {countdown}s
                </span>
              ) : (
                <button onClick={resendOtpForgot} type="button" className="text-blue-600 hover:underline" disabled={loading}>
                  Gửi lại OTP
                </button>
              )}
            </div>

            <div className="flex justify-between text-sm">
              <button type="button" onClick={() => setForgotStep("send")} className="text-gray-600 hover:underline">
                ← Nhập lại email
              </button>
              <button type="button" onClick={() => setMode("login")} className="text-gray-600 hover:underline">
                Về đăng nhập
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function PasswordCheck({ condition, label }: { condition: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {condition ? (
        <CheckCircle2 className="text-green-600 w-4 h-4" />
      ) : (
        <XCircle className="text-red-500 w-4 h-4" />
      )}
      <span className={condition ? "text-green-600" : "text-gray-600"}>{label}</span>
    </div>
  )
}

function InputField({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-600">{label}</label>
      <input
        {...props}
        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black"
      />
    </div>
  )
}
