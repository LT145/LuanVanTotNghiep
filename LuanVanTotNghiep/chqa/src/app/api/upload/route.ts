import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// ⚙️ Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// 🧩 Helper: chuyển buffer → stream để upload
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

// =================================================================
// 🧱 POST — Upload 1 ảnh bất kỳ (FE gửi formData có "file")
// =================================================================
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Thiếu file ảnh để upload" },
        { status: 400 }
      );
    }

    // Đọc file thành buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload lên Cloudinary
    const uploadRes = await uploadBufferToCloudinary(buffer, folder);

    return NextResponse.json({
      success: true,
      url: uploadRes.secure_url,
      public_id: uploadRes.public_id,
    });
  } catch (error) {
    console.error("❌ Lỗi khi upload ảnh:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi server khi upload ảnh" },
      { status: 500 }
    );
  }
}
