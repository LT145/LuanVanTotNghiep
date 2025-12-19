import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const newStatus = user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";

    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });

    return NextResponse.json({
      success: true,
      message: newStatus === "ACTIVE" ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản",
      status: newStatus,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
