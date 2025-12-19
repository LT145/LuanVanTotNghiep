import { DefaultSession } from "next-auth"
import { Role, UserGender } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: Role        // 🔥 enum Prisma
      avatar?: string
      phone?: string
      gender?: UserGender | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    name?: string
    email?: string
    role: Role
    avatar?: string
    phone?: string
    gender?: UserGender | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role           // 🔥 dùng enum Prisma thay vì string
    avatar?: string
  }
}
