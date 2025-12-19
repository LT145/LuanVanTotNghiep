"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import type {
  AllProduct,
  EditableProduct,
  EditableVariantColor,
} from "@/types/admin/product_edit"

import RichTextEditor from "@/components/admin/rich-text-editor"

interface Props {
  product: AllProduct | null
  setProducts: React.Dispatch<React.SetStateAction<AllProduct[]>>
  onClose: () => void
}

export default function ProductEditDialog({
  product,
  setProducts,
  onClose,
}: Props) {
  const [form, setForm] = useState<EditableProduct | null>(null)
  const [variantColors, setVariantColors] = useState<EditableVariantColor[]>([])
  const [productImages, setProductImages] = useState<any[]>([])

  const [removedImages, setRemovedImages] = useState<string[]>([])
  const [removedColorImages, setRemovedColorImages] = useState<
    { colorId: string; imageId: string }[]
  >([])

  const [saving, setSaving] = useState(false)

  // ===========================================================
  // LOAD PRODUCT
  // ===========================================================
  useEffect(() => {
    if (!product) return

    const load = async () => {
      const res = await fetch(`/api/admin/products/${product.id}`)
      const full = await res.json()

      setForm({
        id: full.id,
        name: full.name,
        description: full.description ?? "",
        price: full.basePrice,
        costPrice: full.costPrice ?? 0,
        salePrice: null,

        variantColors: full.variantColors.map((c: any) => ({
          id: c.id,
          color: c.color,
          images: c.images || [],
          sizes: c.sizes.map((s: any) => ({
            id: s.id,
            size: s.size,
            price: s.price,
            stock: s.stock,
          })),
        })),
      })

      setVariantColors(
        full.variantColors.map((c: any) => ({
          id: c.id,
          color: c.color,
          images: c.images || [],
          sizes: c.sizes,
        })),
      )

      setProductImages(full.images || [])
    }

    load()
  }, [product])

  // ===========================================================
  // CLOSE
  // ===========================================================
  const handleClose = (open: boolean) => {
    if (!open && !saving) onClose()
  }

  // ===========================================================
  // UPDATE SIZE PRICE
  // ===========================================================
  const handleVariantPriceChange = (colorId: string, sizeId: string, value: number) => {
    setVariantColors((prev) =>
      prev.map((c) =>
        c.id !== colorId
          ? c
          : {
              ...c,
              sizes: c.sizes.map((s) =>
                s.id === sizeId ? { ...s, price: value } : s,
              ),
            },
      ),
    )
  }

  // ===========================================================
  // DELETE PRODUCT IMAGE (UI ONLY)
  // ===========================================================
  const handleDeleteImage = (imageId: string) => {
    if (!confirm("Xóa ảnh này?")) return

    setProductImages((prev) => prev.filter((img) => img.id !== imageId))
    setRemovedImages((prev) => [...prev, imageId])
  }

  // ===========================================================
  // DELETE COLOR IMAGE (UI ONLY)
  // ===========================================================
  const handleDeleteColorImage = (colorId: string, imageId: string) => {
    if (!confirm("Xóa ảnh màu này?")) return

    setVariantColors((prev) =>
      prev.map((c) =>
        c.id === colorId
          ? { ...c, images: c.images.filter((i) => i.id !== imageId) }
          : c,
      ),
    )

    setRemovedColorImages((prev) => [...prev, { colorId, imageId }])
  }

  // ===========================================================
  // UPLOAD PRODUCT IMAGE
  // ===========================================================
  const handleUploadImage = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file || !product) return

    const formData = new FormData()
    formData.append("image", file)

    try {
      const res = await fetch(`/api/admin/products/${product.id}/images`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        alert("Upload ảnh thất bại")
        return
      }

      const newImage = await res.json()

      setProductImages((prev) => [...prev, newImage])

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, images: [...p.images, newImage] } : p,
        ),
      )
    } catch (err) {
      console.error(err)
      alert("Có lỗi khi upload ảnh")
    } finally {
      e.target.value = ""
    }
  }

  // ===========================================================
  // SAVE
  // ===========================================================
  const save = async () => {
    if (!product || !form) return

    try {
      setSaving(true)

      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: form.price,
          costPrice: form.costPrice,
          variantColors,
          removedImages,
          removedColorImages,
        }),
      })

      if (!res.ok) {
        alert("Cập nhật thất bại")
        return
      }

const updated = await res.json();

setProducts((prev) =>
  prev.map((p) =>
    p.id === product.id
      ? {
          ...p,
          name: updated.name,
          description: updated.description ?? "",
          basePrice: updated.basePrice,
          costPrice: updated.costPrice,
          updatedAt: updated.updatedAt,
          images: updated.images,
          variantColors: updated.variantColors.map((c: any) => ({
            ...c,
            images: c.images,
            sizes: c.sizes.map((s: any) => ({
              ...s,
              price: s.price,
              stock: s.stock,
            })),
          })),
        }
      : p,
  )
)

onClose()

    } catch (err) {
      console.error(err)
      alert("Có lỗi xảy ra")
    } finally {
      setSaving(false)
    }
  }

  if (!form) return null

  // ===========================================================
  // UI
  // ===========================================================
  return (
    <Dialog open={!!product} onOpenChange={handleClose}>
      <DialogContent className="w-[90vw] max-w-[900px] max-h-[90vh] flex flex-col p-0">

        {/* HEADER */}
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-base">Sửa sản phẩm</DialogTitle>
        </DialogHeader>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="space-y-5">

            {/* NAME */}
            <div className="space-y-1.5">
              <Label className="text-xs">Tên</Label>
              <Input
                className="h-8 text-sm"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f!, name: e.target.value }))}
              />
            </div>

            {/* COST PRICE + PRICE */}
            <div className="flex gap-3 w-full">
              <div className="space-y-1.5 flex-1">
                <Label className="text-xs">Giá nhập</Label>
                <Input
                  type="number"
                  className="h-8 text-sm"
                  value={form.costPrice ?? 0}
                  onChange={(e) =>
                    setForm((f) => ({ ...f!, costPrice: Number(e.target.value) }))
                  }
                />
              </div>

              <div className="space-y-1.5 flex-1">
                <Label className="text-xs">Giá gốc</Label>
                <Input
                  type="number"
                  className="h-8 text-sm"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f!, price: Number(e.target.value) }))
                  }
                />
              </div>
            </div>


            {/* DESCRIPTION */}
            <div className="space-y-1.5">
              <Label className="text-xs">Mô tả</Label>
              <div className="border rounded-md bg-white">
                <RichTextEditor
                  value={form.description}
                  onChange={(html) => setForm((f) => ({ ...f!, description: html }))}
                />
              </div>
            </div>

            {/* VARIANT COLORS */}
            {variantColors.length > 0 && (
              <>
                <Separator />
                <Label className="text-sm font-semibold">Biến thể màu</Label>

                <div className="space-y-4">
                  {variantColors.map((color) => {
                    const defaultThumb =
                      productImages[0]?.url || "/no-image.png"

                    const thumb =
                      color.images?.[0]?.url || defaultThumb

                    return (
                      <div key={color.id} className="border rounded-lg p-3 bg-white shadow-sm">

                        {/* HEADER COLOR */}
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={thumb}
                            className="w-12 h-12 rounded-md object-cover border"
                            alt={color.color}
                          />

                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">
                              {color.color}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {color.sizes.length} kích cỡ
                            </span>
                          </div>
                        </div>

                        {/* SIZE LIST */}
                        <div className="grid grid-cols-1 gap-2">
                          {color.sizes.map((sz) => (
                            <div key={sz.id} className="flex items-center justify-between bg-muted/30 rounded px-3 py-2">
                              <div className="flex items-center gap-3">
                                <div className="text-xs font-bold w-8">{sz.size}</div>
                                <div className="text-[11px] text-muted-foreground">Kho: {sz.stock}</div>
                              </div>
<div className="flex gap-3 items-center ">
  <p>Giá bán</p>
                              <Input
                                type="number"
                                className="h-10 w-24 text-xs text-right"
                                value={sz.price}
                                onChange={(e) =>
                                  handleVariantPriceChange(color.id, sz.id, Number(e.target.value))
                                  
                                }
                              />
                              </div>
                            </div>
                          ))}
                        </div>


                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-4 py-3 border-t bg-slate-50">
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="flex-1 h-8 text-xs"
              onClick={() => handleClose(false)}
              disabled={saving}
            >
              Hủy
            </Button>

            <Button onClick={save} className="flex-1 h-8 text-xs" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}
