"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export type AuthMode = "login" | "register" | "forgot"

type AuthContextType = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  mode: AuthMode
  setMode: (mode: AuthMode) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<AuthMode>("login")

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
