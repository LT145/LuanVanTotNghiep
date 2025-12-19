import { NextResponse } from "next/server";

export async function GET() {
  try {
    const genders = [
      { id: "MALE", name: "Nam" },
      { id: "FEMALE", name: "Nữ" },
      { id: "UNISEX", name: "Unisex" },
    ];

    return NextResponse.json({
      success: true,
      data: genders,
    });
  } catch (error) {
    console.error("API gender error:", error);
    return NextResponse.json(
      { success: false, message: "Không thể tải danh sách giới tính." },
      { status: 500 }
    );
  }
}
