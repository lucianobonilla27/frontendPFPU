"use client"

import { useState, useEffect } from "react"
import Navbar from "../components/navbar"
import { School, Users, BookOpen, GraduationCap, Loader2 } from "lucide-react"

export default function HomePage() {
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const user =
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || '{"role":"alumno"}') : { role: "alumno" }
    const storageId = user ? user.id_usuario : null




  // Define icon mapping for stats
  const iconMapping = {
    "Total Alumnos": Users,
    "Total Docentes": GraduationCap,
    "Total Materias": BookOpen,
    "Total Cursos": School,
    "Mis Materias": BookOpen,
    Materias: BookOpen,
    Asistencia: Users,
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        let endpoint = ""

        // Determine which endpoint to call based on user role
        switch (user.role) {
          case "administrativo":
            endpoint = "estadisticasAdmin"
            break
          case "docente":
            endpoint = `estadisticasDocente/${storageId}`
            break
          case "alumno":
            endpoint = `estadisticasAlumno/${storageId}`
            break
          default:
            endpoint = "estadisticasGeneral"
        }

        const response = await fetch(`https://localhost:7213/${endpoint}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.status}`)
        }

        const data = await response.json()

        // Transform API response to the format expected by the component
        const transformedStats = transformApiResponse(data, user.role)
        setStats(transformedStats)
        setError(null)
      } catch (err) {
        console.error("Error fetching stats:", err)
        setError("No se pudieron cargar las estadísticas. Intente nuevamente más tarde.")

        // Fallback to hardcoded data in case of error
        setFallbackStats()
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user.role, storageId])

  // Transform API response to the format expected by the component
  const transformApiResponse = (data, role) => {
    const transformedStats = []

    if (role === "administrativo") {
      // Transform admin stats
      if (data.cantidadAlumnos !== undefined) {
        transformedStats.push({ name: "Total Alumnos", value: data.cantidadAlumnos.toString(), icon: "Users" })
      }
      if (data.cantidadDocentes !== undefined) {
        transformedStats.push({
          name: "Total Docentes",
          value: data.cantidadDocentes.toString(),
          icon: "GraduationCap",
        })
      }
      if (data.cantidadMaterias !== undefined) {
        transformedStats.push({ name: "Total Materias", value: data.cantidadMaterias.toString(), icon: "BookOpen" })
      }
      if (data.cantidadCursos !== undefined) {
        transformedStats.push({ name: "Total Cursos", value: data.cantidadCursos.toString(), icon: "School" })
      }
    } else if (role === "docente") {
      // Transform teacher stats
      if (data.cantidadMaterias !== undefined) {
        transformedStats.push({ name: "Mis Materias", value: data.cantidadMaterias.toString(), icon: "BookOpen" })
      }
      if (data.cantidadAlumnos !== undefined) {
        transformedStats.push({ name: "Total Alumnos", value: data.cantidadAlumnos.toString(), icon: "Users" })
      }
    } else if (role === "alumno") {
      // Transform student stats
      if (data.cantidadMaterias !== undefined) {
        transformedStats.push({ name: "Materias", value: data.cantidadMaterias.toString(), icon: "BookOpen" })
      }
      if (data.porcentajeAsistencia !== undefined) {
        transformedStats.push({ name: "Asistencia", value: `${data.porcentajeAsistencia}%`, icon: "Users" })
      }
    }

    return transformedStats
  }

  // Fallback function to set hardcoded stats in case of API error
  const setFallbackStats = () => {
    const adminStats = [
      { name: "Total Alumnos", value: "245", icon: "Users" },
      { name: "Total Docentes", value: "12", icon: "GraduationCap" },
      { name: "Total Materias", value: "8", icon: "BookOpen" },
      { name: "Total Cursos", value: "12", icon: "School" },
    ]

    const docenteStats = [
      { name: "Mis Materias", value: "2", icon: "BookOpen" },
      { name: "Total Alumnos", value: "87", icon: "Users" },
    ]

    const alumnoStats = [
      { name: "Materias", value: "8", icon: "BookOpen" },
      { name: "Asistencia", value: "95%", icon: "Users" },
    ]

    switch (user.role) {
      case "administrativo":
        setStats(adminStats)
        break
      case "docente":
        setStats(docenteStats)
        break
      case "alumno":
        setStats(alumnoStats)
        break
      default:
        setStats([])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {user?.name || "Usuario"}</h1>
          <p className="text-gray-600">
            Panel de{" "}
            {user?.role === "administrativo" ? "Administración" : user?.role === "docente" ? "Docente" : "Estudiante"}
          </p>
        </div>

        {/* Dashboard Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600">Cargando estadísticas...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const IconComponent = iconMapping[stat.name] || Users
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    </div>
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

