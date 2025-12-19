// app/api/admin/returns/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role

    if (role !== "ADMIN" && role !== "MANAGER") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") // optional

    const data = await prisma.returnRequest.findMany({
      where: {
        isActive: true,
        ...(status ? { status: status as any } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        order: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            totalAmount: true,
            recipientName: true,
            recipientPhone: true,
          },
        },
        items: {
          include: {
            orderItem: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: { where: { isMain: true }, select: { url: true } },
                  },
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error("GET /api/admin/returns error:", e)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
