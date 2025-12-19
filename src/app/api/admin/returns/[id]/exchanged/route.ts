// app/api/admin/returns/[id]/exchanged/route.ts
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

    // Demo: cho phép đổi xong khi đã RECEIVED
    if (rr.status !== "RECEIVED") {
      return NextResponse.json(
        { success: false, message: "Return must be RECEIVED before EXCHANGED" },
        { status: 400 }
      )
    }

    const stamp = `Exchanged by ${adminId} at ${new Date().toISOString()}`
    const updated = await prisma.returnRequest.update({
      where: { id },
      data: {
        status: "EXCHANGED",
        adminNote: adminNote ? `${stamp}\n${adminNote}` : stamp,
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (e) {
    console.error("POST /api/admin/returns/[id]/exchanged error:", e)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
