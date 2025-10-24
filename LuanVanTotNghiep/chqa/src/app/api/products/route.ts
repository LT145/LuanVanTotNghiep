import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

const prisma = new PrismaClient();

// ⚙️ Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🧩 Helper: chuyển buffer thành stream để upload
function bufferToStream(buffer: Buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

// 🧩 Helper: upload buffer lên Cloudinary
async function uploadBufferToCloudinary(buffer: Buffer, folder: string) {
  return new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    bufferToStream(buffer).pipe(stream);
  });
}

// 🧩 Helper: slugify (đường dẫn thư mục)
function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// =======================================================================
// 🧱 POST — Thêm sản phẩm mới
// =======================================================================
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // 🧾 Thông tin sản phẩm cơ bản
    const name = String(formData.get("name") || "");
    const description = String(formData.get("description") || "");
    const brand = String(formData.get("brand") || "");
    const material = String(formData.get("material") || "");
    const basePrice = parseFloat(String(formData.get("basePrice") || "0"));
    const isActive = String(formData.get("isActive") || "true") === "true";

    const mainCategoryId = Number(formData.get("mainCategoryId"));
    const subCategoryId = formData.get("subCategoryId")
      ? Number(formData.get("subCategoryId"))
      : null;

    const colorVariants = JSON.parse(String(formData.get("colorVariants") || "[]")) as Array<{
      color: string;
      sizes: { size: string; price: number; stock: number }[];
    }>;

    if (!name || !mainCategoryId || !basePrice) {
      return NextResponse.json(
        { success: false, message: "⚠️ Thiếu thông tin bắt buộc (Tên, Danh mục, Giá cơ bản)." },
        { status: 400 }
      );
    }

    // 📦 1️⃣ Tạo Product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        brand,
        material,
        basePrice,
        isActive,
        mainCategoryId,
        subCategoryId: subCategoryId ?? undefined,
      },
    });

    const slug = slugify(name);
    const baseFolder = `products/${mainCategoryId}/${subCategoryId || "general"}/${slug}`;

    // 🖼️ 2️⃣ Upload ảnh đại diện
    const mainImageFile = formData.get("mainImage") as File | null;
    if (mainImageFile) {
      const buffer = Buffer.from(await mainImageFile.arrayBuffer());
      const uploadRes = await uploadBufferToCloudinary(buffer, baseFolder);
      await prisma.productImage.create({
        data: {
          url: uploadRes.secure_url,
          isMain: true,
          productId: product.id,
        },
      });
    }

    // 🖼️ 3️⃣ Upload ảnh gallery
    const galleryFiles = formData.getAll("galleryImages") as File[];
    for (const file of galleryFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const res = await uploadBufferToCloudinary(buffer, `${baseFolder}/gallery`);
      await prisma.productImage.create({
        data: {
          url: res.secure_url,
          isMain: false,
          productId: product.id,
        },
      });
    }

    // 🎨 4️⃣ Xử lý các biến thể màu & size
    for (let i = 0; i < colorVariants.length; i++) {
      const c = colorVariants[i];
      if (!c.color) continue;

      // Tạo bản ghi Color Variant
      const colorRecord = await prisma.productVariantColor.create({
        data: {
          color: c.color,
          productId: product.id,
        },
      });

      // Ảnh của màu
      const colorImageFile = formData.get(`colorImage_${i}`) as File | null;
      if (colorImageFile) {
        const buffer = Buffer.from(await colorImageFile.arrayBuffer());
        const res = await uploadBufferToCloudinary(buffer, `${baseFolder}/colors/${slugify(c.color)}`);
        await prisma.productImage.create({
          data: {
            url: res.secure_url,
            isMain: false,
            variantColorId: colorRecord.id,
          },
        });
      }

      // Danh sách size
      for (const s of c.sizes || []) {
        if (!s.size) continue;
        await prisma.productVariantSize.create({
          data: {
            size: s.size,
            price: Number(s.price || basePrice),
            stock: Number(s.stock || 0),
            colorVariantId: colorRecord.id,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "✅ Thêm sản phẩm thành công!",
      data: product,
    });
  } catch (err) {
    console.error("❌ Lỗi khi thêm sản phẩm:", err);
    return NextResponse.json(
      { success: false, message: "❌ Lỗi khi thêm sản phẩm" },
      { status: 500 }
    );
  }
}

// =======================================================================
// 🧩 GET — Lấy toàn bộ sản phẩm
// =======================================================================
// export async function GET() {
//   try {
//     const products = await prisma.product.findMany({
//       include: {
//         mainCategory: true,
//         subCategory: true,
//         images: true, // ảnh đại diện + gallery
//         variantColors: {
//           include: {
//             images: true, // ảnh riêng của màu
//             sizes: true,  // danh sách size
//           },
//         },
//       },
//       orderBy: { id: "desc" },
//     });

//     return NextResponse.json({ success: true, data: products });
//   } catch (err) {
//     console.error("❌ Lỗi GET products:", err);
//     return NextResponse.json(
//       { success: false, message: "❌ Lỗi khi lấy danh sách sản phẩm" },
//       { status: 500 }
//     );
//   }
// }
