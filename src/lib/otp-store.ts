type OtpEntry = {
  otp: string
  expiresAt: number
}

const otpStore = new Map<string, OtpEntry>()

// Lưu OTP + thời gian hết hạn
export function setOtp(email: string, otp: string, ttlMs = 10 * 60 * 1000) {
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + ttlMs,
  })
}

// Verify OTP
export function verifyOtp(email: string, otp: string): boolean {
  const entry = otpStore.get(email)
  if (!entry) return false

  // Hết hạn
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email)
    return false
  }

  // Sai mã
  if (entry.otp !== otp) return false

  // Đúng → xoá ngay
  otpStore.delete(email)
  return true
}
