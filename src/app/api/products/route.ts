// app/api/products/route.ts
import { NextResponse } from "next/server"
import { v2 as cloudinary, UploadApiResponse } from "cloudinary"
import { Readable } from "stream"
import slugify from "slugify"
import { PrismaClient } from "@prisma/client"
import OpenAI from "openai"

const prisma = new PrismaClient()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export const runtime = "nodejs"

// ==============================
// ⚙️ Cloudinary config
// ==============================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

// Buffer → Stream
function bufferToStream(buffer: Buffer) {
  const readable = new Readable()
  readable.push(buffer)
  readable.push(null)
  return readable
}

function uploadBufferToCloudinary(buffer: Buffer, folder: string) {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err || !result) return reject(err)
      resolve(result)
    })
    bufferToStream(buffer).pipe(stream)
  })
}

async function uploadFile(file: File, folder: string) {
  const buffer = Buffer.from(await file.arrayBuffer())
  const res = await uploadBufferToCloudinary(buffer, folder)
  return res.secure_url
}

// ==============================
// 🔤 Helper Keyword + Slug
// ==============================
function removeVietnameseTones(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D")
}

async function generateProductSlug(name: string) {
  const base = slugify(name, { lower: true, strict: true, locale: "vi" }) || "san-pham"
  let slug = base
  let count = 1

  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${base}-${count++}`
  }

  return slug
}

// ========== LOCAL KEYWORDS ==========
function buildLocalKeywords(name: string, description?: string | null): string[] {
  const raw = `${name} ${description || ""}`
  const normalized = removeVietnameseTones(raw.toLowerCase())
  const cleaned = normalized.replace(/[^a-z0-9\s]/g, " ")

  const tokens = cleaned
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1)

  const set = new Set<string>()
  for (const t of tokens) {
    set.add(t)
    if (set.size >= 30) break
  }
  return [...set]
}

// ========== AI KEYWORDS ==========
async function buildAIKeywords(name: string, description: string): Promise<string[]> {
  try {
    const prompt = `
Hãy tạo keyword để người mua tìm thấy sản phẩm này.
Sản phẩm: ${name}
Mô tả: ${description}

YÊU CẦU:
- chỉ trả về mảng JSON gồm các từ khóa
- dạng: ["ao thun","ao oversize","streetwear","cotton 2 chieu"]
- viết không dấu, lowercase
- tối đa 20 từ khóa
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    })

    const content = response.choices[0].message.content || ""
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) return parsed
    return []
  } catch (err) {
    console.log("⚠ AI keyword error → fallback:", err)
    return []
  }
}

// ==============================
// 🧱 POST /api/products
// ==============================
// app/api/products/route.ts



import { buildGeminiKeywords } from "@/lib/gemini"


// ==============================
// ⚙️ Cloudinary config
// ==============================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

// ==============================
// Buffer → Stream
// ==============================


// ==============================
// 🔤 Helper: remove Vietnamese tones
// ==============================
function removeVietnamese(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
}

// ==============================
// 🔤 Helper Local Keyword
// ==============================

// ==============================
// 🔤 Slug generator
// ==============================

// ==============================
// 🧱 POST /api/products
// ==============================
export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const name = formData.get("name")?.toString().trim() || ""
    const material = formData.get("material")?.toString() || ""
    const costPrice = Number(formData.get("costPrice"))
    const basePrice = Number(formData.get("basePrice"))
    const isActive = formData.get("isActive") === "true"
    const mainCategoryId = formData.get("mainCategoryId")?.toString()
    const subCategoryId = formData.get("subCategoryId")?.toString()
    const description = formData.get("description")?.toString() || ""

    const mainImage = formData.get("mainImage") as File | null
    const galleryFiles = formData.getAll("galleryImages").filter((f) => f instanceof File) as File[]

    if (!name || !mainCategoryId || !subCategoryId)
      return NextResponse.json({ success: false, message: "Thiếu dữ liệu" }, { status: 400 })

    if (!mainImage)
      return NextResponse.json({ success: false, message: "Thiếu ảnh chính" }, { status: 400 })

    // ---- Parse color variants ----
    const raw = formData.get("colorVariants")?.toString() || "[]"
    const colorVariants = JSON.parse(raw)

    // ---- SLUG ----
    const slug = await generateProductSlug(name)

    // ---- KEYWORDS (Gemini + local) ----
    const localKW = buildLocalKeywords(name, description)
    const geminiKW = await buildGeminiKeywords(name, description)
    const keywords = [...new Set([...localKW, ...geminiKW])]

    // ---- UPLOAD IMAGES ----
    const folder = `products/${slug}`

    const mainImageUrl = await uploadFile(mainImage, `${folder}/main`)
const galleryUrls: string[] = []


    for (const f of galleryFiles) {
      galleryUrls.push(await uploadFile(f, `${folder}/gallery`))
    }

    const colorImageUrls = new Array(colorVariants.length).fill(null)
    for (let i = 0; i < colorVariants.length; i++) {
      const f = formData.get(`colorImage_${i}`) as File | null
      if (f) colorImageUrls[i] = await uploadFile(f, `${folder}/colors`)
    }

    // ---- SAVE DB ----
    const productId = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name,
          slug,
          description,
          basePrice,
          costPrice,
          isActive,
          categoryId: subCategoryId,
          keywords,
        },
      })

      await tx.productImage.create({
        data: { url: mainImageUrl, isMain: true, productId: product.id },
      })

      if (galleryUrls.length > 0) {
        await tx.productImage.createMany({
          data: galleryUrls.map((url) => ({
            url,
            isMain: false,
            productId: product.id,
          })),
        })
      }

      // variants
      for (let i = 0; i < colorVariants.length; i++) {
        const cv = colorVariants[i]

        const colorRow = await tx.productVariantColor.create({
          data: {
            color: cv.color,
            productId: product.id,
          },
        })

        await tx.productVariantSize.createMany({
          data: cv.sizes.map((s: any) => ({
            size: s.size,
            price: s.price,
            stock: s.stock,
            colorVariantId: colorRow.id,
          })),
        })

        if (colorImageUrls[i]) {
          await tx.productImage.create({
            data: {
              url: colorImageUrls[i]!,
              isMain: false,
              productId: product.id,
              variantColorId: colorRow.id,
            },
          })
        }
      }

      return product.id
    })

    // ---- RETURN FULL PRODUCT ----
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
        variantColors: {
          include: { sizes: true, images: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: product })
  } catch (err) {
    console.error("❌ Product POST ERROR:", err)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
