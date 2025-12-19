import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// ==============================
// Helpers
// ==============================
function toISO(d: Date) {
  return d.toISOString().slice(0, 10) // FE dùng input type="date" => yyyy-mm-dd
}

type PromotionMap = Record<
  string,
  {
    price: number
    startDate: string
    endDate: string
  }
>

function pickLatestPromotionPerSize(args: {
  // promotions của 1 colorVariant
  promotions: Array<{
    id: string
    isActive: boolean
    startDate: Date
    endDate: Date
    promotionPrice: number
    createdAt: Date
    sizes: Array<{
      sizeId: string
      price: number
    }>
  }>
  // sizes của 1 colorVariant
  sizes: Array<{
    id: string
    size: string
  }>
}): PromotionMap {
  const { promotions, sizes } = args

  // map sizeId -> sizeLabel
  const sizeIdToLabel = new Map<string, string>()
  for (const s of sizes) sizeIdToLabel.set(s.id, s.size)

  // gom theo sizeId các candidate promotions
  const candidatesBySizeId = new Map<
    string,
    Array<{
      price: number
      startDate: Date
      endDate: Date
      createdAt: Date
    }>
  >()

  for (const promo of promotions) {
    if (!promo.isActive) continue
    for (const ps of promo.sizes) {
      const arr = candidatesBySizeId.get(ps.sizeId) || []
      arr.push({
        price: ps.price ?? promo.promotionPrice,
        startDate: promo.startDate,
        endDate: promo.endDate,
        createdAt: promo.createdAt,
      })
      candidatesBySizeId.set(ps.sizeId, arr)
    }
  }

  // chọn “mới nhất” theo startDate, nếu bằng nhau thì createdAt
  const result: PromotionMap = {}
  for (const [sizeId, candidates] of candidatesBySizeId.entries()) {
    const label = sizeIdToLabel.get(sizeId)
    if (!label) continue

    candidates.sort((a, b) => {
      const s = b.startDate.getTime() - a.startDate.getTime()
      if (s !== 0) return s
      return b.createdAt.getTime() - a.createdAt.getTime()
    })

    const best = candidates[0]
    result[label] = {
      price: best.price,
      startDate: toISO(best.startDate),
      endDate: toISO(best.endDate),
    }
  }

  return result
}

// ==============================
// GET: trả data đúng format FE
// ==============================
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: {
          orderBy: [{ isMain: "desc" }, { createdAt: "asc" }],
          take: 1,
        },
        variantColors: {
          orderBy: { createdAt: "asc" },
          include: {
            sizes: {
              orderBy: { createdAt: "asc" },
            },
            promotions: {
              orderBy: { createdAt: "desc" },
              include: {
                sizes: true, // PromotionSize[]
              },
            },
            images: {
              orderBy: [{ isMain: "desc" }, { createdAt: "asc" }],
              take: 1,
            },
          },
        },
      },
    })

    // Map ra đúng interface FE đang dùng:
    // Product { id, name, gender, category, image, basePrice, sold, status, variants[] }
    const mapped = products.map((p) => {
      const mainImage =
        p.images?.[0]?.url ||
        p.variantColors?.[0]?.images?.[0]?.url ||
        "/placeholder.svg"

      const status = p.isActive ? "Đang bán" : "Đã khóa"

      const variants = p.variantColors.map((vc) => {
        const promotions = pickLatestPromotionPerSize({
          promotions: vc.promotions.map((x) => ({
            id: x.id,
            isActive: x.isActive,
            startDate: x.startDate,
            endDate: x.endDate,
            promotionPrice: x.promotionPrice,
            createdAt: x.createdAt,
            sizes: x.sizes.map((s) => ({
              sizeId: s.sizeId,
              price: s.price,
            })),
          })),
          sizes: vc.sizes.map((s) => ({ id: s.id, size: s.size })),
        })

        return {
          // thêm các id để FE thao tác API dễ
          id: vc.id, // colorVariantId
          color: vc.color,
          sizes: vc.sizes.map((s) => ({
            id: s.id, // sizeId
            size: s.size,
            inventory: s.stock,
            price: s.price,
          })),
          promotions, // { [sizeLabel]: {price,startDate,endDate} }
        }
      })

      return {
        id: p.id,
        name: p.name,
        gender: p.category?.gender ? String(p.category.gender) : "UNISEX",
        category: p.category?.name ?? "",
        image: mainImage,
        basePrice: p.basePrice,
        sold: p.soldCount,
        status,
        variants,
      }
    })

    return NextResponse.json({ ok: true, data: mapped })
  } catch (err) {
    console.error("GET /api/admin/promotions error:", err)
    return NextResponse.json({ ok: false, message: "Internal Server Error" }, { status: 500 })
  }
}

// ==============================
// POST: tạo/cập nhật KM cho 1 màu
// - Mặc định: "cập nhật" = tắt hết promotions cũ của colorVariant rồi tạo campaign mới
// Body:
// {
//   productId: string,
//   colorVariantId: string,
//   promotionType: "all" | "specific",
//   sizeIds?: string[],           // required if specific
//   promotionPrice: number,
//   startDate: string,            // yyyy-mm-dd
//   endDate: string               // yyyy-mm-dd
// }
// ==============================
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const productId = String(body.productId || "")
    const colorVariantId = String(body.colorVariantId || "")
    const promotionType = body.promotionType === "specific" ? "specific" : "all"
    const sizeIds: string[] = Array.isArray(body.sizeIds) ? body.sizeIds.map(String) : []
    const promotionPrice = Number(body.promotionPrice)
    const startDate = String(body.startDate || "")
    const endDate = String(body.endDate || "")

    if (!productId || !colorVariantId) {
      return NextResponse.json({ ok: false, message: "Missing productId/colorVariantId" }, { status: 400 })
    }
    if (!Number.isFinite(promotionPrice) || promotionPrice <= 0) {
      return NextResponse.json({ ok: false, message: "Invalid promotionPrice" }, { status: 400 })
    }
    if (!startDate || !endDate) {
      return NextResponse.json({ ok: false, message: "Missing startDate/endDate" }, { status: 400 })
    }
    if (promotionType === "specific" && sizeIds.length === 0) {
      return NextResponse.json({ ok: false, message: "sizeIds is required for specific promotion" }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
      return NextResponse.json({ ok: false, message: "Invalid date range" }, { status: 400 })
    }

    // Lấy list sizeIds mục tiêu
    const targetSizeIds =
      promotionType === "all"
        ? (
            await prisma.productVariantSize.findMany({
              where: { colorVariantId },
              select: { id: true },
            })
          ).map((x) => x.id)
        : sizeIds

    if (targetSizeIds.length === 0) {
      return NextResponse.json({ ok: false, message: "No sizes found for this colorVariant" }, { status: 400 })
    }

    // Transaction:
    // - Disable tất cả promotions cũ của colorVariant (để “cập nhật” ra 1 campaign mới sạch)
    // - Create Promotion
    // - Create PromotionSize cho các sizeIds
    const created = await prisma.$transaction(async (tx) => {
      await tx.promotion.updateMany({
        where: { colorVariantId, isActive: true },
        data: { isActive: false, status: "DISABLED" },
      })

      const promo = await tx.promotion.create({
        data: {
          productId,
          colorVariantId,
          scope: promotionType === "all" ? "ALL_SIZES" : "SPECIFIC_SIZES",
          promotionPrice,
          startDate: start,
          endDate: end,
          // status có thể để FE tự tính theo date; mình set sơ bộ
          status: start > new Date() ? "SCHEDULED" : "ACTIVE",
          isActive: true,
          sizes: {
            createMany: {
              data: targetSizeIds.map((sizeId) => ({
                sizeId,
                price: promotionPrice,
              })),
              skipDuplicates: true,
            },
          },
        },
        include: { sizes: true },
      })

      return promo
    })

    return NextResponse.json({ ok: true, data: { promotionId: created.id } })
  } catch (err) {
    console.error("POST /api/admin/promotions error:", err)
    return NextResponse.json({ ok: false, message: "Internal Server Error" }, { status: 500 })
  }
}

// ==============================
// DELETE: xoá KM
// Body:
// - Xoá 1 size:
//   { colorVariantId: string, sizeId: string }
// - Xoá toàn bộ KM của màu:
//   { colorVariantId: string }
// ==============================
export async function DELETE(req: Request) {
  try {
    const body = await req.json()

    const colorVariantId = String(body.colorVariantId || "")
    const sizeId = body.sizeId ? String(body.sizeId) : undefined

    if (!colorVariantId) {
      return NextResponse.json({ ok: false, message: "Missing colorVariantId" }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      if (sizeId) {
        // Xoá promotionSize của sizeId trong tất cả promotions active của colorVariant
        await tx.promotionSize.deleteMany({
          where: {
            sizeId,
            promotion: {
              colorVariantId,
              isActive: true,
            },
          },
        })

        // Nếu promotion nào hết sizes thì disable luôn
        const activePromos = await tx.promotion.findMany({
          where: { colorVariantId, isActive: true },
          select: { id: true },
        })

        for (const pr of activePromos) {
          const count = await tx.promotionSize.count({ where: { promotionId: pr.id } })
          if (count === 0) {
            await tx.promotion.update({
              where: { id: pr.id },
              data: { isActive: false, status: "DISABLED" },
            })
          }
        }
      } else {
        // Xoá toàn bộ KM của màu => disable promotions + xoá promotionSize
        const promos = await tx.promotion.findMany({
          where: { colorVariantId, isActive: true },
          select: { id: true },
        })

        if (promos.length) {
          await tx.promotionSize.deleteMany({
            where: { promotionId: { in: promos.map((x) => x.id) } },
          })
          await tx.promotion.updateMany({
            where: { id: { in: promos.map((x) => x.id) } },
            data: { isActive: false, status: "DISABLED" },
          })
        }
      }
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("DELETE /api/admin/promotions error:", err)
    return NextResponse.json({ ok: false, message: "Internal Server Error" }, { status: 500 })
  }
}
