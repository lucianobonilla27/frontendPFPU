"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "../contexts/auth-context"
import Link from "next/link"
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Calendar,
  UserCircle,
  LogOut,
  Menu,
  School,
  FileText,
  CreditCard,
  DollarSign,
} from "lucide-react"

const Navbar = () => {
  const { user, logout } = useAuth()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const MenuItem = ({ href, icon: Icon, children }) => (
    <Link
      href={href}
      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150"
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{children}</span>
    </Link>
  )

  const AdminMenu = () => (
    <>
      <MenuItem href="/users" icon={Users}>
        Gestión de Usuarios
      </MenuItem>
      <MenuItem href="/subjects" icon={BookOpen}>
        Materias
      </MenuItem>
      <MenuItem href="/courses" icon={GraduationCap}>
        Cursos
      </MenuItem>
      <MenuItem href="/school-year" icon={Calendar}>
        Años
      </MenuItem>
      <MenuItem href="/payment-management" icon={DollarSign}>
        Gestión de Pagos
      </MenuItem>
    </>
  )

  const TeacherMenu = () => (
    <>
      <MenuItem href="/grades" icon={ClipboardList}>
        Gestión de Notas
      </MenuItem>
      <MenuItem href="/attendance" icon={Calendar}>
        Control de Asistencia
      </MenuItem>
    </>
  )

  const StudentMenu = () => (
    <>
      <MenuItem href="/academic-info" icon={FileText}>
        Información Académica
      </MenuItem>
      <MenuItem href="/payments" icon={CreditCard}>
        Pagos
      </MenuItem>
    </>
  )

  const getMenuForRole = () => {
    switch (user?.role) {
      case "administrativo":
        return <AdminMenu />
      case "docente":
        return <TeacherMenu />
      case "alumno":
        return <StudentMenu />
      default:
        return null
    }
  }

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center">
              <School className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">Sistema Educativo</span>
            </Link>
          </div>

          {/* Menú de navegación - Desktop */}
          <div className="hidden md:flex md:items-center md:space-x-4">{getMenuForRole()}</div>

          {/* Menú de usuario y botón móvil */}
          <div className="flex items-center">
            {/* Menú de usuario */}
            <div className="relative ml-3" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <span className="hidden md:block mr-2 text-sm">{user?.name}</span>
                <UserCircle className="h-8 w-8" />
              </button>

              {/* Menú desplegable de usuario */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                  <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <UserCircle className="mr-3 h-4 w-4" />
                    Mi Perfil
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>

            {/* Botón de menú móvil */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden ml-4 p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && <div className="md:hidden py-3 border-t">{getMenuForRole()}</div>}
      </div>
    </nav>
  )
}

export default Navbar

