import { v2 as cloudinary } from "cloudinary"
import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

const prisma = new PrismaClient()

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const data = await req.formData()
    const file = data.get("file") as File
    const variantColorId = data.get("variantColorId") as string | null

    if (!file)
      return NextResponse.json({ error: "File required" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())

    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "products" },
        (err, res) => {
          if (err) reject(err)
          else resolve(res)
        }
      )
      stream.end(buffer)
    })

    const image = await prisma.productImage.create({
      data: {
        url: result.secure_url,
        productId: id,
        variantColorId: variantColorId || null,
      },
    })

    return NextResponse.json(image)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Upload fail" }, { status: 500 })
  }
}
