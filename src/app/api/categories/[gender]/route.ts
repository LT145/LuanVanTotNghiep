import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { v2 as cloudinary, UploadApiResponse } from "cloudinary"
import { Readable } from "stream"

// -------------------- Cloudinary --------------------
const prisma = new PrismaClient()
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})
function slugify(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function bufferToStream(buffer: Buffer) {
  const stream = new Readable()
  stream.push(buffer)
  stream.push(null)
  return stream
}

async function uploadBufferToCloudinary(buffer: Buffer, folder: string) {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err || !result) return reject(err)
      resolve(result)
    })
    bufferToStream(buffer).pipe(upload)
  })
}

// =====================================================
// ✅ GET — lấy categories theo gender
// =====================================================
export async function GET(req: Request, context: any) {
  const { gender } = await context.params   // 🔥 FIX HERE

  const G = gender.toUpperCase()
  const valid = ["MALE", "FEMALE", "UNISEX"]

  if (!valid.includes(G)) {
    return NextResponse.json({ success: false, message: "Giới tính không hợp lệ" }, { status: 400 })
  }

  const categories = await prisma.category.findMany({
    where: { gender: G },
    orderBy: { name: "asc" },
  })

  return NextResponse.json({ success: true, data: categories })
}

// =====================================================
// ✅ POST — upload ảnh + tạo category
// =====================================================
export async function POST(req: Request, context: any) {
  try {
    const { gender } = await context.params   // 🔥 FIX HERE

    const G = gender.toUpperCase()
    const valid = ["MALE", "FEMALE", "UNISEX"]

    if (!valid.includes(G)) {
      return NextResponse.json({ success: false, message: "Giới tính không hợp lệ" }, { status: 400 })
    }

    const form = await req.formData()
    const name = form.get("name") as string | null
    const file = form.get("file") as File | null

    if (!name) {
      return NextResponse.json({ success: false, message: "Thiếu tên danh mục" }, { status: 400 })
    }

    let imageUrl = null

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const uploaded = await uploadBufferToCloudinary(buffer, `categories/${G}`)
      imageUrl = uploaded.secure_url
    }

const slug = slugify(name)



    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
        gender: G,
        imageUrl,
      },
    })

    return NextResponse.json({ success: true, data: newCategory })
  } catch (error) {
    console.error("❌ Category POST Error:", error)
    return NextResponse.json({ success: false, message: "Lỗi server" }, { status: 500 })
  }
}
