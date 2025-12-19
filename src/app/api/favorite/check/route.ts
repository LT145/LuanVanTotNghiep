import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get("productId")

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ isFavorite: false })

  const fav = await prisma.favorite.findFirst({
    where: { userId: session.user.id, productId: productId || "" },
  })

  return NextResponse.json({ isFavorite: !!fav })
}
