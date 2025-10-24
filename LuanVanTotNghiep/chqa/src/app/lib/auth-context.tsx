"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type AuthContextType = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  mode: "login" | "register"
  setMode: (mode: "login" | "register") => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<"login" | "register">("login")

  return (
    <AuthContext.Provider value={{ isOpen, setIsOpen, mode, setMode }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthModal() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuthModal must be used within AuthProvider")
  return context
}
