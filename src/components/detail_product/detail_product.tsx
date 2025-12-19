"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Heart, Sparkles, Upload, Loader2 } from "lucide-react"
import ProductTabs from "@/components/detail_product/product-tabs"
import RelatedProducts from "@/components/detail_product/related-products"
import ProductReviews from "@/components/detail_product/product-reviews"
import { useCart } from "@/lib/cart-context"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { getProductBySlug } from "@/lib/api/detail_product"
import { increaseViewBySlug } from "@/lib/api/view-count"
import { useSession } from "next-auth/react"
import { saveRecentlyViewed } from "@/lib/api/recently-viewed"
import RecentlyViewedProducts from "../recently-view/recently-view"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ProductDetailPage({ productSlug }: { productSlug: string }) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [selectedColor, setSelectedColor] = useState<any>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  const galleryRef = useRef<HTMLDivElement>(null)
  const { addToCart } = useCart()
  const { data: session } = useSession()

  // ===================================================
  // TRY-ON AI STATE
  // ===================================================
  const [tryOnOpen, setTryOnOpen] = useState(false)
  const [humanFile, setHumanFile] = useState<File | null>(null)
  const [humanPreview, setHumanPreview] = useState<string | null>(null)

  const [tryOnLoading, setTryOnLoading] = useState(false)
  const [tryOnResultUrl, setTryOnResultUrl] = useState<string | null>(null)

  // ✅ NEW: preview result large
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    return () => {
      if (humanPreview) URL.revokeObjectURL(humanPreview)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ✅ Bonus: đóng try-on thì đóng luôn preview
  useEffect(() => {
    if (!tryOnOpen) setPreviewOpen(false)
  }, [tryOnOpen])

  const openTryOn = () => {
    // tuỳ bạn: có thể yêu cầu login, hoặc bỏ
    // if (!session?.user?.id) return toast.error("Bạn cần đăng nhập để dùng thử đồ AI")

    if (!selectedColor) return toast.error("Chọn màu trước khi thử đồ!")

    setTryOnResultUrl(null)
    setTryOnOpen(true)
  }

  const onPickHuman = (file: File | null) => {
    setTryOnResultUrl(null)
    setHumanFile(file)

    if (humanPreview) URL.revokeObjectURL(humanPreview)

    if (file) {
      const url = URL.createObjectURL(file)
      setHumanPreview(url)
    } else {
      setHumanPreview(null)
    }
  }

  const runTryOn = async (garmentImageUrl: string) => {
    if (!humanFile) {
      toast.error("Vui lòng upload ảnh người trước!")
      return
    }

    try {
      setTryOnLoading(true)
      setTryOnResultUrl(null)

      const fd = new FormData()
      fd.append("human", humanFile)
      fd.append("garmentUrl", garmentImageUrl)

      // ✅ VModel cần category (upper_body / lower_body / dresses)
      // Bạn có thể map theo category sản phẩm sau, tạm thời upper_body
      fd.append("category", "upper_body")
      fd.append("crop", "true")
      fd.append("steps", "30")

      // meta tuỳ ý
      fd.append("productId", String(product?.id ?? ""))
      fd.append("color", String(selectedColor?.color ?? ""))
      fd.append("size", String(selectedSize ?? ""))

      const res = await fetch("/api/tryon", {
        method: "POST",
        body: fd,
      })

      const js = await res.json().catch(() => null)

      if (!res.ok || !js?.success) {
        toast.error(js?.message ?? "Thử đồ thất bại. Vui lòng thử lại.")
        return
      }

      // ✅ backend VModel mình đưa sẽ trả outputUrl
      const url = js.outputUrl || js.resultUrl
      if (!url) {
        toast.error("Không nhận được ảnh kết quả từ server.")
        return
      }

      setTryOnResultUrl(url)
      toast.success("Thử đồ thành công ✨")
    } catch (e: any) {
      toast.error(e?.message ?? "Có lỗi khi thử đồ.")
    } finally {
      setTryOnLoading(false)
    }
  }

  // ===================================================
  // LOAD PRODUCT + CHECK FAVORITE
  // ===================================================
  useEffect(() => {
    if (!productSlug) return

    const load = async () => {
      setLoading(true)

      const data = await getProductBySlug(productSlug)

      // ❌ Nếu API trả về lỗi → dừng ngay
      if (!data || data.success === false) {
        setProduct(null)
        setLoading(false)
        return
      }

      const p = data.data ?? data
      if (!p) {
        setProduct(null)
        setLoading(false)
        return
      }

      setProduct(p)

      if (p.variantColors?.length > 0) {
        setSelectedColor(p.variantColors[0])
      }

      // reset chọn size / ảnh
      setSelectedSize(null)
      setSelectedImage(0)

      increaseViewBySlug(p.slug)

      if (session?.user?.id) {
        saveRecentlyViewed(p.slug, session.user.id)

        const fav = await fetch(`/api/favorite/check?productId=${p.id}`)
        const js = await fav.json()
        setIsFavorite(js.isFavorite)
      }

      setLoading(false)
    }

    load()
  }, [productSlug, session])

  if (!productSlug) return null

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-500">
        Đang tải sản phẩm...
      </div>
    )
  }

  if (!product)
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-500">
        Không tìm thấy sản phẩm 😢
      </div>
    )

  // ===================================================
  // GALLERY
  // ===================================================
  const mainImage =
    product.images?.find((i: any) => i.isMain)?.url ||
    product.images?.[0]?.url ||
    "/placeholder.svg"

  const gallery = product.images?.filter((i: any) => !i.isMain) || []
  const colorImgs =
    product.variantColors?.flatMap((c: any) => c.images?.map((i: any) => i.url) || []) || []

  const fullGallery = [mainImage, ...gallery.map((i: any) => i.url), ...colorImgs]

  // ✅ Mặc định dùng ảnh ở "Màu sắc" làm garment cho try-on
  const selectedGarmentUrl =
    selectedColor?.images?.[0]?.url ||
    product.images?.find((i: any) => i.isMain)?.url ||
    product.images?.[0]?.url ||
    "/placeholder.svg"

  // ===================================================
  // PROMOTION PRICES
  // ===================================================
  const filterBySelectedColor = false
  const activePromotions = Array.isArray(product.promotions) ? product.promotions : []

  const promotionsScoped =
    filterBySelectedColor && selectedColor?.id
      ? activePromotions.filter((pm: any) => pm.colorVariantId === selectedColor.id)
      : activePromotions

  const allPromoPrices: number[] =
    promotionsScoped
      .flatMap((pm: any) => (pm.sizes || []).map((ps: any) => Number(ps.price)))
      .filter(Boolean) || []

  const minPromoPrice = allPromoPrices.length ? Math.min(...allPromoPrices) : null

  const sizesForColor = selectedColor?.sizes || []

  const selectedSizeObj =
    selectedColor?.sizes?.find((s: any) => s.size === selectedSize) || null

  const basePrice = Number(selectedSizeObj?.price ?? product.basePrice ?? 0)

  const selectedPromoPrice = (() => {
    if (!selectedSizeObj?.id) return null

    const pricesForThisSize: number[] =
      promotionsScoped
        .flatMap((pm: any) =>
          (pm.sizes || [])
            .filter((ps: any) => ps.sizeId === selectedSizeObj.id)
            .map((ps: any) => Number(ps.price)),
        )
        .filter((x: any) => Number.isFinite(x) && x > 0) || []

    if (!pricesForThisSize.length) return null
    return Math.min(...pricesForThisSize)
  })()

  const finalPrice =
    selectedPromoPrice != null && selectedPromoPrice > 0 && selectedPromoPrice < basePrice
      ? selectedPromoPrice
      : null

  // ===================================================
  // FAVORITE TOGGLE
  // ===================================================
  const toggleFavorite = async () => {
    if (!session?.user?.id) {
      toast.error("Bạn cần đăng nhập để yêu thích sản phẩm")
      return
    }

    const res = await fetch("/api/favorite/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    })

    const js = await res.json()

    if (js.success) {
      if (js.action === "added") {
        setIsFavorite(true)
        toast.success("Đã thêm vào yêu thích ❤️")
      } else {
        setIsFavorite(false)
        toast("Đã bỏ yêu thích ❌")
      }
    }
  }

  // ===================================================
  // ADD TO CART
  // ===================================================
  const handleAddToCart = async () => {
    if (!selectedColor) return toast.error("Chọn màu!")
    if (!selectedSize) return toast.error("Chọn kích thước!")

    await addToCart({
      productId: product.id,
      name: product.name,
      price: finalPrice ?? basePrice,
      image:
        selectedColor.images?.[0]?.url ||
        product.images?.find((i: any) => i.isMain)?.url ||
        product.images?.[0]?.url,
      selectedColor: selectedColor.color,
      selectedSize,
      quantity: 1,
    })

    toast.success("Đã thêm vào giỏ hàng 🛒")
  }

  // ===================================================
  // UI
  // ===================================================
  return (
    <div className="custom-container mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* LEFT */}
        <div className="lg:w-1/2 sticky top-24 self-start">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 shadow">
            <AnimatePresence initial={false}>
              <motion.img
                key={fullGallery[selectedImage]}
                src={fullGallery[selectedImage]}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
              />
            </AnimatePresence>

            <button
              onClick={() =>
                setSelectedImage((prev) => (prev === 0 ? fullGallery.length - 1 : prev - 1))
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow"
            >
              <ChevronLeft />
            </button>

            <button
              onClick={() =>
                setSelectedImage((prev) => (prev === fullGallery.length - 1 ? 0 : prev + 1))
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow"
            >
              <ChevronRight />
            </button>
          </div>

          {/* THUMBNAILS */}
          <div ref={galleryRef} className="flex gap-2 overflow-x-auto scrollbar-hide p-3">
            {fullGallery.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`
                  relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2
                  ${selectedImage === idx ? "border-primary" : "border-transparent"}
                `}
              >
                <Image fill src={img} alt="" className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:w-1/2 space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>

          {/* PRICE */}
          <div>
            {selectedSize ? (
              finalPrice ? (
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-bold text-red-600">
                    {finalPrice.toLocaleString("vi-VN")} ₫
                  </p>
                  <p className="text-lg text-muted-foreground line-through">
                    {basePrice.toLocaleString("vi-VN")} ₫
                  </p>
                </div>
              ) : (
                <p className="text-4xl font-bold">{basePrice.toLocaleString("vi-VN")} ₫</p>
              )
            ) : minPromoPrice ? (
              <div className="space-y-1">
                <p className="text-4xl font-bold text-red-600">
                  {minPromoPrice.toLocaleString("vi-VN")} ₫
                  </p>
                <p className="text-sm text-muted-foreground">
                  Giá khuyến mãi thấp nhất (chọn size để xem giá chính xác)
                </p>
              </div>
            ) : (
              <p className="text-4xl font-bold">
                {Number(product.basePrice || 0).toLocaleString("vi-VN")} ₫
              </p>
            )}
          </div>

          {/* COLORS */}
          <div>
            <p className="font-semibold mb-2">Màu sắc</p>
            <div className="flex gap-4 flex-wrap">
              {product.variantColors?.map((color: any) => {
                const thumb =
                  color.images?.[0]?.url ||
                  product.images?.find((i: any) => i.isMain)?.url ||
                  product.images?.[0]?.url ||
                  "/placeholder.svg"

                return (
                  <button
                    key={color.id}
                    onClick={() => {
                      setSelectedColor(color)
                      setSelectedSize(null)
                      setTryOnResultUrl(null)
                      // optional:
                      // setHumanFile(null)
                      // if (humanPreview) URL.revokeObjectURL(humanPreview)
                      // setHumanPreview(null)
                    }}
                    className={`
                      flex flex-col items-center gap-2 px-2 py-2 rounded-xl border-2 w-24
                      ${
                        selectedColor?.id === color.id
                          ? "border-primary shadow bg-primary/10"
                          : "border-gray-200 hover:border-primary"
                      }
                    `}
                  >
                    <div className="relative w-full h-20 rounded-lg overflow-hidden">
                      <Image fill src={thumb} alt={color.color} className="object-cover" />
                    </div>
                    <span className="text-sm font-medium">{color.color}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* SIZES */}
          {selectedColor && (
            <div>
              <p className="font-semibold mb-2">Kích thước</p>
              <div className="flex gap-3 flex-wrap">
                {sizesForColor.map((s: any) => (
                  <button
                    key={s.size}
                    disabled={s.stock <= 0}
                    onClick={() => setSelectedSize(s.size)}
                    className={`
                      w-12 h-12 flex items-center justify-center rounded-lg border
                      ${
                        selectedSize === s.size
                          ? "bg-primary text-white border-primary"
                          : "hover:border-primary"
                      }
                      ${s.stock <= 0 ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ADD TO CART + TRYON + FAVORITE */}
          <div className="flex gap-3">
            <Button className="h-12 flex-1" onClick={handleAddToCart}>
              Thêm vào giỏ hàng
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="h-12"
              onClick={openTryOn}
              disabled={!selectedColor} // ✅ chỉ cần chọn màu là bấm được
              title={!selectedColor ? "Vui lòng chọn màu" : "Thử đồ bằng AI"}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Thử đồ AI
            </Button>

            <button
              onClick={toggleFavorite}
              className="w-12 h-12 border rounded-lg flex items-center justify-center"
            >
              <Heart className={isFavorite ? "text-red-500 fill-red-500" : ""} />
            </button>
          </div>

          <ProductTabs product={product} />
        </div>
      </div>

      <RelatedProducts slug={product.slug} />
      <ProductReviews productId={product.id} />
      <RecentlyViewedProducts />

      {/* ==========================
          TRY-ON AI DIALOG
      ========================== */}
      <Dialog open={tryOnOpen} onOpenChange={setTryOnOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Thử đồ bằng AI</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT: Inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Ảnh người (upload)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPickHuman(e.target.files?.[0] ?? null)}
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>

                {humanPreview && (
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={humanPreview}
                      alt="human preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Ảnh sản phẩm dùng để thử (đang chọn)</Label>
                <div className="relative w-full aspect-square rounded-xl overflow-hidden border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedGarmentUrl} alt="garment" className="w-full h-full object-cover" />
                </div>
              </div>

              <Button
                onClick={() => runTryOn(selectedGarmentUrl)}
                disabled={tryOnLoading || !humanFile}
                className="w-full h-12"
              >
                {tryOnLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Bắt đầu thử đồ
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground">
                Gợi ý: ảnh người chụp toàn thân, nền đơn giản. Kết quả phụ thuộc chất lượng ảnh đầu vào.
              </p>
            </div>

            {/* RIGHT: Result */}
            <div className="space-y-2">
              <Label>Kết quả</Label>

              <div className="relative w-full aspect-square rounded-xl overflow-hidden border bg-muted flex items-center justify-center">
                {tryOnResultUrl ? (
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    className="w-full h-full cursor-zoom-in"
                    title="Nhấn để xem ảnh lớn"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tryOnResultUrl}
                      alt="try-on result"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ) : (
                  <div className="text-sm text-muted-foreground text-center px-6">
                    {tryOnLoading
                      ? "Đang tạo ảnh thử đồ..."
                      : "Chưa có kết quả. Hãy upload ảnh người và bấm “Bắt đầu thử đồ”."}
                  </div>
                )}
              </div>

              {tryOnResultUrl && (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      navigator.clipboard.writeText(tryOnResultUrl)
                      toast.success("Đã copy link ảnh kết quả")
                    }}
                  >
                    Copy link ảnh
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setTryOnResultUrl(null)
                      toast("Đã reset kết quả")
                    }}
                  >
                    Reset
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==========================
          LARGE PREVIEW DIALOG
      ========================== */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Xem ảnh thử đồ</DialogTitle>
          </DialogHeader>

          <div className="relative w-full h-[80vh] bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tryOnResultUrl ?? ""}
              alt="try-on large preview"
              className="w-full h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
