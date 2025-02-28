"use client"

import type React from "react"

import { useAuth } from "../contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

// Configuración de rutas por rol
const routePermissions: { [key: string]: string[] } = {
  // Rutas administrativas
  "/users": ["administrativo"],
  "/school-year": ["administrativo"],
  "/courses": ["administrativo"],
  "/subjects": ["administrativo"],
  "/payment-management": ["administrativo"],

  // Rutas de docentes
  "/grades": ["administrativo", "docente"],
  "/attendance": ["administrativo", "docente"],

  // Rutas de estudiantes
  "/academic-info": ["administrativo", "alumno"],
  "/payments": ["administrativo", "alumno"],
}

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!user?.token) {
      router.push("/login")
      return
    }

    const allowedRoles = routePermissions[pathname]
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push("/unauthorized")
    }
  }, [user, pathname, router])

  return children
}

