"use client"

import { useAuth } from "../contexts/auth-context"
import Navbar from "../components/navbar"
import { School, Users, BookOpen, GraduationCap } from "lucide-react"

export default function HomePage() {
  const { user } = useAuth()

  // Estadísticas de ejemplo
  const adminStats = [
    { name: "Total Alumnos", value: "245", icon: Users },
    { name: "Total Docentes", value: "12", icon: GraduationCap },
    { name: "Total Materias", value: "8", icon: BookOpen },
    { name: "Total Cursos", value: "12", icon: School },
  ]

  const teacherStats = [
    { name: "Mis Cursos", value: "3", icon: School },
    { name: "Mis Materias", value: "2", icon: BookOpen },
    { name: "Total Alumnos", value: "87", icon: Users },
  ]

  const studentStats = [
    { name: "Materias", value: "8", icon: BookOpen },
    { name: "Asistencia", value: "95%", icon: Users },
  ]

  const getStatsForRole = () => {
    switch (user?.role) {
      case "admin":
        return adminStats
      case "teacher":
        return teacherStats
      case "student":
        return studentStats
      default:
        return []
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {user?.name}</h1>
          <p className="text-gray-600">
            Panel de {user?.role === "admin" ? "Administración" : user?.role === "teacher" ? "Docente" : "Estudiante"}
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {getStatsForRole().map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

