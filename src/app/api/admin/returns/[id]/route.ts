// app/api/admin/returns/[id]/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role

    if (role !== "ADMIN" && role !== "MANAGER") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      )
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing id" },
        { status: 400 }
      )
    }

    const rr = await prisma.returnRequest.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        order: {
          include: {
            items: {
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

    if (!rr || !rr.isActive) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: rr })
  } catch (e) {
    console.error("GET /api/admin/returns/[id] error:", e)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
