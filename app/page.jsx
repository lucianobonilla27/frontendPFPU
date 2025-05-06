"use client"

import { useState, useEffect } from "react"
import Navbar from "../components/navbar"
import {
  School,
  Users,
  BookOpen,
  GraduationCap,
  Loader2,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Percent,
  XCircle,
} from "lucide-react"
import { BarChart } from "../components/bar-chart"
import { PieChartComponent } from "../components/pie-chart"
import { RecentActivity } from "../components/recent-activity"
import { ModernClock } from "../components/modern-clock"

export default function HomePage() {
  const [stats, setStats] = useState([])
  const [chartData, setChartData] = useState(null)
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
    "Promedio General": Award,
    "Alumnos con Deuda": AlertCircle,
    "Pagos Recibidos": DollarSign,
    "Asistencia Promedio": Percent,
    "Notas Pendientes": FileText,
    "Notas Registradas": CheckCircle2,
    "Deudas Pendientes": AlertCircle,
    "Materias Aprobadas": CheckCircle2,
    "Materias Desaprobadas": XCircle,
    "Último Pago": DollarSign,
  }

  // Modifica la función useEffect para incluir la obtención de datos del gráfico
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

        // Fetch chart data based on user role
        await fetchChartData(user.role)

        setError(null)
      } catch (err) {
        console.error("Error fetching stats:", err)
        setError("No se pudieron cargar las estadísticas. Intente nuevamente más tarde.")

        // Fallback to hardcoded data in case of error
        setFallbackStats()
        setChartData(generateFallbackChartData(user.role))
      } finally {
        setLoading(false)
      }
    }

    // Modificar la función fetchChartData para incluir la obtención de datos para el rol docente
    const fetchChartData = async (role) => {
      try {
        let chartDataObj = {
          barChart: null,
          pieChart: null,
        }

        // Obtener datos para el gráfico de barras según el rol
        if (role === "administrativo") {
          // Obtener datos de asistencia por año para administradores
          const asistenciaResponse = await fetch("https://localhost:7213/graficosAdmin/asistencia", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })

          if (asistenciaResponse.ok) {
            const asistenciaData = await asistenciaResponse.json()

            // Transformar los datos al formato esperado por el componente BarChart
            chartDataObj.barChart = {
              labels: asistenciaData.labels,
              datasets: [
                {
                  label: asistenciaData.label,
                  data: asistenciaData.data,
                  backgroundColor: "#3b82f6",
                },
              ],
            }
          } else {
            throw new Error(`Error fetching attendance chart data: ${asistenciaResponse.status}`)
          }

          // Obtener datos para el gráfico circular de deudas
          const deudaResponse = await fetch("https://localhost:7213/graficosAdmin/deuda", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })

          if (deudaResponse.ok) {
            const deudaData = await deudaResponse.json()

            // Transformar los datos al formato esperado por el componente PieChart
            chartDataObj.pieChart = {
              labels: deudaData.labels,
              datasets: [
                {
                  data: deudaData.data,
                  backgroundColor: deudaData.backgroundColor,
                },
              ],
            }
          } else {
            throw new Error(`Error fetching debt chart data: ${deudaResponse.status}`)
          }
        } else if (role === "docente") {
          // Obtener datos para el gráfico de barras de promedio por trimestre para docentes
          const promedioResponse = await fetch(`https://localhost:7213/graficoPromedioDocente/${storageId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })

          if (promedioResponse.ok) {
            const promedioData = await promedioResponse.json()

            // Transformar los datos al formato esperado por el componente BarChart
            chartDataObj.barChart = {
              labels: promedioData.labels.map((trimestre) =>
                trimestre === "0" ? "Recuperatorio" : `Trimestre ${trimestre}`,
              ),
              datasets: [
                {
                  label: promedioData.label,
                  data: promedioData.data,
                  backgroundColor: "#3b82f6",
                },
              ],
            }
          } else {
            throw new Error(`Error fetching teacher average chart data: ${promedioResponse.status}`)
          }

          // Obtener datos para el gráfico circular de asistencia de alumnos por docente
          const asistenciaResponse = await fetch(
            `https://localhost:7213/graficoAsistenciasAlumnoByDocente/${storageId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            },
          )

          if (asistenciaResponse.ok) {
            const asistenciaData = await asistenciaResponse.json()

            // Transformar las etiquetas para que sean más descriptivas
            const labelMap = {
              A: "Ausente",
              P: "Presente",
              T: "Tarde",
            }

            // Transformar los datos al formato esperado por el componente PieChart
            chartDataObj.pieChart = {
              labels: asistenciaData.labels.map((label) => labelMap[label] || label),
              datasets: [
                {
                  data: asistenciaData.data,
                  backgroundColor: asistenciaData.backgroundColor,
                },
              ],
            }
          } else {
            throw new Error(`Error fetching teacher attendance chart data: ${asistenciaResponse.status}`)
          }
        } else if (role === "alumno") {
          // Obtener datos para el gráfico de barras de notas por materia para alumnos
          const notasResponse = await fetch(`https://localhost:7213/graficoNotasAlumno/${storageId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })

          if (notasResponse.ok) {
            const notasData = await notasResponse.json()

            // Transformar los datos al formato esperado por el componente BarChart
            chartDataObj.barChart = {
              labels: notasData.labels,
              datasets: [
                {
                  label: notasData.label,
                  data: notasData.data,
                  backgroundColor: "#3b82f6",
                },
              ],
            }
          } else {
            throw new Error(`Error fetching student grades chart data: ${notasResponse.status}`)
          }

          // Obtener datos para el gráfico circular de asistencia total del alumno
          const asistenciaResponse = await fetch(`https://localhost:7213/graficoAsistenciaTotalAlumno/${storageId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })

          if (asistenciaResponse.ok) {
            const asistenciaData = await asistenciaResponse.json()

            // Transformar las etiquetas para que sean más descriptivas
            const labelMap = {
              A: "Ausente",
              P: "Presente",
              T: "Tarde",
            }

            // Transformar los datos al formato esperado por el componente PieChart
            chartDataObj.pieChart = {
              labels: asistenciaData.labels.map((label) => labelMap[label] || label),
              datasets: [
                {
                  data: asistenciaData.data,
                  backgroundColor: asistenciaData.backgroundColor,
                },
              ],
            }
          } else {
            throw new Error(`Error fetching student attendance chart data: ${asistenciaResponse.status}`)
          }
        } else {
          // Para otros roles, usar datos de fallback
          chartDataObj = generateFallbackChartData(role)
        }

        setChartData(chartDataObj)
      } catch (error) {
        console.error("Error fetching chart data:", error)
        // Usar datos de fallback en caso de error
        setChartData(generateFallbackChartData(role))
      }
    }

    fetchStats()
  }, [user.role, storageId])

  // Transform API response to the format expected by the component
  const transformApiResponse = (data, role) => {
    const transformedStats = []

    if (role === "administrativo") {
      // Transform admin stats - these would come from your API
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

      // Additional admin stats based on your DB schema
      // These would need to be added to your API
      transformedStats.push({
        name: "Asistencia Promedio",
        value: data.porcentajeAsistenciasGlobal.toString() + "%",
        icon: "Percent",
      })
      transformedStats.push({ name: "Alumnos con Deuda", value: data.alumnosConDeuda.toString(), icon: "AlertCircle" })
    } else if (role === "docente") {
      // Transform teacher stats
      if (data.cantidadMaterias !== undefined) {
        transformedStats.push({ name: "Mis Materias", value: data.cantidadMaterias.toString(), icon: "BookOpen" })
      }
      if (data.cantidadAlumnos !== undefined) {
        transformedStats.push({ name: "Total Alumnos", value: data.cantidadAlumnos.toString(), icon: "Users" })
      }

      // Additional teacher stats based on your DB schema
      transformedStats.push({ name: "Asistencia Promedio", value: "88%", icon: "Percent" })
      // transformedStats.push({ name: "Notas Pendientes", value: "15", icon: "FileText" })
      // transformedStats.push({ name: "Notas Registradas", value: "120", icon: "CheckCircle2" })
    } else if (role === "alumno") {
      // Transform student stats
      if (data.cantidadMaterias !== undefined) {
        transformedStats.push({ name: "Materias", value: data.cantidadMaterias.toString(), icon: "BookOpen" })
      }
      if (data.porcentajeAsistencia !== undefined) {
        transformedStats.push({ name: "Asistencia", value: `${data.porcentajeAsistencia}%`, icon: "Users" })
      }

      if (data.promedioNotas !== undefined) {
        transformedStats.push({ name: "Promedio General", value: `${data.promedioNotas}`, icon: "Award" })
      }

      if (data.cantidadDeudas !== undefined) {
        transformedStats.push({ name: "Deudas Pendientes", value: data.cantidadDeudas.toString(), icon: "AlertCircle" })
      }

      if (data.cantidadMateriasAprobadas !== undefined) {
        transformedStats.push({
          name: "Materias Aprobadas",
          value: data.cantidadMateriasAprobadas.toString(),
          icon: "CheckCircle2",
        })
      }

      if (data.cantidadMateriasDesaprobadas !== undefined) {
        transformedStats.push({
          name: "Materias Desaprobadas",
          value: data.cantidadMateriasDesaprobadas.toString(),
          icon: "XCircle",
        })
      }
    }

    return transformedStats
  }

  // Generate chart data based on API response
  const generateChartData = (data, role) => {
    // Esta función ya no se usa directamente, pero la mantenemos por compatibilidad
    return generateFallbackChartData(role)
  }

  // Generate fallback chart data
  const generateFallbackChartData = (role) => {
    if (role === "administrativo") {
      return {
        barChart: {
          labels: ["1° Año", "2° Año", "3° Año", "4° Año", "5° Año"],
          datasets: [
            {
              label: "Promedio de Asistencia por Año",
              data: [92, 88, 85, 78, 82],
              backgroundColor: "#3b82f6",
            },
          ],
        },
        pieChart: {
          labels: ["Al día", "Deuda < 30 días", "Deuda > 30 días"],
          datasets: [
            {
              data: [65, 25, 10],
              backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
            },
          ],
        },
      }
    } else if (role === "docente") {
      return {
        barChart: {
          labels: ["1° Trim", "2° Trim", "3° Trim"],
          datasets: [
            {
              label: "Promedio de Notas por Trimestre",
              data: [7.2, 7.8, 8.1],
              backgroundColor: "#3b82f6",
            },
          ],
        },
        pieChart: {
          labels: ["Presente", "Tarde", "Ausente"],
          datasets: [
            {
              data: [75, 15, 10],
              backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
            },
          ],
        },
      }
    } else {
      // alumno
      return {
        barChart: {
          labels: ["Matemáticas", "Lengua", "Historia", "Ciencias", "Arte"],
          datasets: [
            {
              label: "Mis Calificaciones",
              data: [8.5, 9.0, 7.5, 8.0, 9.5],
              backgroundColor: "#3b82f6",
            },
          ],
        },
        pieChart: {
          labels: ["Presente", "Tarde", "Ausente"],
          datasets: [
            {
              data: [85, 10, 5],
              backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
            },
          ],
        },
      }
    }
  }

  // Fallback function to set hardcoded stats in case of API error
  const setFallbackStats = () => {
    const adminStats = [
      { name: "Total Alumnos", value: "245", icon: "Users" },
      { name: "Total Docentes", value: "12", icon: "GraduationCap" },
      { name: "Total Materias", value: "8", icon: "BookOpen" },
      { name: "Total Cursos", value: "12", icon: "School" },
      { name: "Asistencia Promedio", value: "85%", icon: "Percent" },
      { name: "Alumnos con Deuda", value: "24", icon: "AlertCircle" },
    ]

    const docenteStats = [
      { name: "Mis Materias", value: "2", icon: "BookOpen" },
      { name: "Total Alumnos", value: "87", icon: "Users" },
      { name: "Asistencia Promedio", value: "88%", icon: "Percent" },
      { name: "Notas Pendientes", value: "15", icon: "FileText" },
      { name: "Notas Registradas", value: "120", icon: "CheckCircle2" },
    ]

    const alumnoStats = [
      { name: "Materias", value: "8", icon: "BookOpen" },
      { name: "Asistencia", value: "95%", icon: "Users" },
      { name: "Promedio General", value: "7.5", icon: "Award" },
      { name: "Deudas Pendientes", value: "2", icon: "AlertCircle" },
      { name: "Materias Aprobadas", value: "6", icon: "CheckCircle2" },
      { name: "Materias Desaprobadas", value: "2", icon: "XCircle" },
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

  // Get title for charts based on user role
  const getChartTitles = (role) => {
    if (role === "administrativo") {
      return {
        bar: "Asistencia por Año",
        pie: "Estado de Pagos",
      }
    } else if (role === "docente") {
      return {
        bar: "Promedio por Trimestre",
        pie: "Distribución de Asistencia",
      }
    } else {
      // alumno
      return {
        bar: "Calificaciones por Materia",
        pie: "Mi Asistencia",
      }
    }
  }

  const chartTitles = getChartTitles(user.role)

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

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600">Cargando estadísticas...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">{error}</div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              {stats.map((stat, index) => {
                const IconComponent = iconMapping[stat.name] || Users
                return (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                  >
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

            {/* Charts Section */}
            {chartData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">{chartTitles.bar}</h2>
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="h-64">
                    <BarChart data={chartData.barChart} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">{chartTitles.pie}</h2>
                    {/* Muestro signo dolar solo si el rol es admin, sino muestro uno referido a asistencia */}
                    {user.role === "administrativo" ? (
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Users className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="h-64 flex justify-center">
                    <PieChartComponent data={chartData.pieChart} />
                  </div>
                </div>
              </div>
            )}

            {/* Additional Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <RecentActivity role={user.role} />
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Reloj</h2>
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div className="h-64">
                  <ModernClock />
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
