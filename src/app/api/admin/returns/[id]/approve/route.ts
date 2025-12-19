// app/api/admin/returns/[id]/approve/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    const adminId = session?.user?.id

    if (!adminId || (role !== "ADMIN" && role !== "MANAGER")) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await req.json().catch(() => ({} as any))
    const adminNote = (body?.adminNote as string | undefined)?.trim()

    const rr = await prisma.returnRequest.findUnique({ where: { id } })
    if (!rr || !rr.isActive) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      )
    }

    if (rr.status !== "PENDING") {
      return NextResponse.json(
        { success: false, message: "Return is not PENDING" },
        { status: 400 }
      )
    }

    const stamp = `Approved by ${adminId} at ${new Date().toISOString()}`
    const updated = await prisma.returnRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        adminNote: adminNote ? `${stamp}\n${adminNote}` : stamp,
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (e) {
    console.error("POST /api/admin/returns/[id]/approve error:", e)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
