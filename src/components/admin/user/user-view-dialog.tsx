"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Collapsible } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function UserViewDialog({ user, onClose }: any) {
  if (!user) return null

  const addresses = user.addresses ?? []
  const reviews = user.reviews ?? []

  const [openAddress, setOpenAddress] = useState(false)
  const [openReview, setOpenReview] = useState(false)

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Thông tin khách hàng</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">

          {/* Tên */}
          <div>
            <p className="text-sm text-muted-foreground">Tên</p>
            <p className="font-semibold">{user.name}</p>
          </div>

          {/* Email */}
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-semibold">{user.email}</p>
          </div>

          {/* Tổng chi tiêu */}
          <div>
            <p className="text-sm text-muted-foreground">Tổng chi tiêu</p>
            <p className="font-semibold">{user.totalSpent.toLocaleString("vi-VN")}₫</p>
          </div>

          {/* Lần cuối mua */}
          <div>
            <p className="text-sm text-muted-foreground">Lần cuối mua</p>
            <p className="font-semibold">
              {user.lastPurchaseAt
                ? new Date(user.lastPurchaseAt).toLocaleDateString("vi-VN")
                : "—"}
            </p>
          </div>

          {/* =============== ĐỊA CHỈ (animation) =============== */}
          <Collapsible open={openAddress} onOpenChange={setOpenAddress}>
            <div
              className="flex items-center justify-between cursor-pointer select-none"
              onClick={() => setOpenAddress(!openAddress)}
            >
              <p className="text-sm font-medium">Địa chỉ đã lưu</p>
              <ChevronDown
                className={`h-5 w-5 transition-transform duration-300 ${openAddress ? "rotate-180" : ""}`}
              />
            </div>

            <AnimatePresence initial={false}>
              {openAddress && (
                <motion.div
                  key="addr"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden mt-3 space-y-3"
                >
                  {addresses.length === 0 ? (
                    <p className="text-muted-foreground">Không có địa chỉ</p>
                  ) : (
                    addresses.map((addr: any) => (
                      <div
                        key={addr.id}
                        className="p-3 border rounded-lg bg-muted/30"
                      >
                        <p className="font-semibold">{addr.label}</p>
                        <p>{addr.recipientName}</p>
                        <p>{addr.recipientPhone}</p>
                        <p>{addr.address}</p>
                        <p>{addr.ward}, {addr.province}</p>

                        {addr.isDefault && (
                          <p className="text-xs text-primary mt-1">(Mặc định)</p>
                        )}
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Collapsible>

          {/* =============== ĐÁNH GIÁ (animation) =============== */}
          <Collapsible open={openReview} onOpenChange={setOpenReview}>
            <div
              className="flex items-center justify-between cursor-pointer select-none"
              onClick={() => setOpenReview(!openReview)}
            >
              <p className="text-sm font-medium">Đánh giá</p>
              <ChevronDown
                className={`h-5 w-5 transition-transform duration-300 ${openReview ? "rotate-180" : ""}`}
              />
            </div>

            <AnimatePresence initial={false}>
              {openReview && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden mt-3"
                >
                  {reviews.length === 0 ? (
                    <p className="text-muted-foreground">Chưa có đánh giá</p>
                  ) : (
                    <ul className="list-disc ml-5 space-y-2">
                      {reviews.map((r: any) => (
                        <li key={r.id}>
                          <b>{r.product?.name}</b>: {r.rating} ⭐
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Collapsible>

        </div>
      </DialogContent>
    </Dialog>
  )
}
