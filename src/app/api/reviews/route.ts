import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ⬇⬇⬇ Cloudinary nằm ngay trong API ⬇⬇⬇
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const rating = searchParams.get("rating");

    if (!productId) {
      return Response.json({ success: false, message: "Missing productId" });
    }

    const filter: any = { productId, isApproved: true };

    if (rating) filter.rating = Number(rating);

    const reviews = await prisma.review.findMany({
      where: filter,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, id: true } },
      },
    });

    return Response.json({ success: true, data: reviews });
  } catch (err) {
    console.error("GET Reviews Error:", err);
    return Response.json({ success: false, message: "Error fetching reviews" });
  }
}




export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Bạn cần đăng nhập để đánh giá" },
      { status: 401 }
    );
  }

  try {
    const { productId, rating, content, images } = await req.json();

    if (!productId || !rating) {
      return NextResponse.json(
        { success: false, message: "Thiếu dữ liệu đánh giá" },
        { status: 400 }
      );
    }

    // ----------------------------------------------------
    // 1. KIỂM TRA ĐÃ MUA SẢN PHẨM
    // ----------------------------------------------------
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.user.id,
          status: "COMPLETED",
        },
      },
    });

    if (!hasPurchased) {
      return NextResponse.json(
        { success: false, message: "Bạn phải mua sản phẩm này mới được đánh giá." },
        { status: 403 }
      );
    }

    // ----------------------------------------------------
    // 2. KIỂM TRA ĐÃ REVIEW CHƯA
    // ----------------------------------------------------
    const existing = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Bạn đã đánh giá sản phẩm này rồi." },
        { status: 400 }
      );
    }

    // ----------------------------------------------------
    // 3. UPLOAD ẢNH LÊN CLOUDINARY (trong API này)
    // ----------------------------------------------------
    let uploadedImages: string[] = [];

    if (images && images.length > 0) {
      for (const img of images) {
        const uploadRes = await cloudinary.uploader.upload(img, {
          folder: "reviews",
        });
        uploadedImages.push(uploadRes.secure_url);
      }
    }

    // ----------------------------------------------------
    // 4. TẠO REVIEW
    // ----------------------------------------------------
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId,
        rating,
        content,
        images: uploadedImages, // save URL array
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đánh giá thành công!",
      data: review,
    });
  } catch (error) {
    console.error("POST Review Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
