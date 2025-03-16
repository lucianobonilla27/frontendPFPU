"use client"

import { useState, useEffect } from "react"
import Navbar from "../../components/navbar"
import { BookOpen, Clock, TrendingUp, Loader2 } from "lucide-react"

// Interfaces para los tipos de datos
interface Nota {
  nota: number
  fecha: string
  descripcion: string
}

interface Materia {
  id_materia: number
  nombre: string
  docente?: string
  notas?: {
    1: Nota[]
    2: Nota[]
    3: Nota[]
    4: Nota[]
  }
  id_docente: number
  asistencia?: {
    total: number
    presentes: number
    tardes: number
    ausentes: number
    porcentaje: number
  }
  promedio?: number
}

interface InfoAcademica {
  anio: string
  grado: string
  materias: Materia[]
  promedioGeneral: number
}

export default function AcademicInfo() {
  const [selectedPeriod, setSelectedPeriod] = useState("current")
  const [academicData, setAcademicData] = useState<InfoAcademica | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)

  // Obtener el ID del usuario actual (esto dependerá de tu sistema de autenticación)
  useEffect(() => {
    // Simulación: obtener el ID del usuario de alguna fuente (localStorage, contexto, etc.)
    // Reemplaza esto con tu lógica real de autenticación
    const getUserId = async () => {
      try {
        const user = localStorage.getItem("user")
        const storedUserId = user ? JSON.parse(user).id_usuario : null
        if (storedUserId) {
          setUserId(Number.parseInt(storedUserId))
        } else {
          // Si no hay ID en localStorage, podrías redirigir al login
          // o usar un ID de prueba para desarrollo
          setUserId(1) // ID de prueba
          console.warn("No se encontró ID de usuario, usando ID de prueba")
        }
      } catch (error) {
        console.error("Error al obtener ID de usuario:", error)
        setError("No se pudo obtener la información del usuario")
      }
    }

    getUserId()
  }, [])

  // Función para hacer peticiones a la API
  const fetchData = async (url: string) => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error al obtener datos de ${url}:`, error)
      throw error
    }
  }

  // Cargar datos académicos cuando el userId esté disponible
  useEffect(() => {
    if (!userId) return

    const loadAcademicData = async () => {
      try {
        setLoading(true)

        // 1. Obtener información del grado del alumno
        const gradoInfo = await fetchData(`https://localhost:7213/GetAnioByAlumno/${userId}`)
     

        // 2. Obtener el promedio general del alumno
        const promedioGeneral = await fetchData(`https://localhost:7213/GetPromedioByAlumno/${userId}`)

        // 3. Obtener la cantidad de materias
        const cantidadMaterias = await fetchData(`https://localhost:7213/GetCantidadMateriasByAlumno/${userId}`)

        // 4. Obtener el porcentaje de asistencia general
        const porcentajeAsistencia = await fetchData(
          `https://localhost:7213/GetPorcentajeAsistenciasByAlumno/${userId}`,
        )

        // 5. Obtener información de docentes
        const docentes = await fetchData(`https://localhost:7213/GetDocentes`)
     

        // 6. Obtener las materias del alumno
        const materias = await fetchData(`https://localhost:7213/GetMateriasByAlumno?id_alumno=${userId}`)

        // Procesar cada materia para obtener asistencia, notas y promedio
        const materiasConDetalles = await Promise.all(
          materias.map(async (materia: any) => {
            const id_materia = materia.id_materia
            
        
            // Obtener datos de asistencia
            const presentes = await fetchData(
              `https://localhost:7213/GetPresentesByMateriaAlumno/${id_materia}/${userId}`,
            )
            const tardes = await fetchData(`https://localhost:7213/GetTardesByMateriaAlumno/${id_materia}/${userId}`)
            const ausentes = await fetchData(
              `https://localhost:7213/GetAusentesByMateriaAlumno/${id_materia}/${userId}`,
            )
            const porcentajeAsistenciaMateria = await fetchData(
              `https://localhost:7213/GetPorcentajeAsistenciasByMateriaAlumno/${id_materia}/${userId}`,
            )

            // Obtener notas por materia
            const notasMateria = await fetchData(
              `https://localhost:7213/GetNotasByMateriaAlumno/${id_materia}/${userId}`,
            )

            // Obtener promedio por materia
            const promedioMateria = await fetchData(
              `https://localhost:7213/GetPromedioByMateriaAlumno/${id_materia}/${userId}`,
            )

         
            // Encontrar el docente de esta materia, la materia tiene el id_docente
            const docenteMateria = docentes.find((docente: any) => docente.id_usuario === materia.id_docente)
            

            // Organizar las notas por trimestre
            // Asumiendo que notasMateria tiene una estructura como:
            // [{ nota: 8, fecha: "2023-03-15", descripcion: "Primer parcial", trimestre: 1 }, ...]
            const notasPorTrimestre = {
              1: notasMateria.filter((n: any) => n.trimestre === 1),
              2: notasMateria.filter((n: any) => n.trimestre === 2),
              3: notasMateria.filter((n: any) => n.trimestre === 3),
              // si es recuperatorio o final, agregarlo a un cuarto trimestre
              4: notasMateria.filter((n: any) => n.trimestre === 0),
             
            }

            // Calcular el total de clases
            const totalClases = presentes + tardes + ausentes

            return {
              ...materia,
              docente: docenteMateria ? `Prof. ${docenteMateria.nombre} ${docenteMateria.apellido}` : "Sin asignar",
              notas: notasPorTrimestre,
              asistencia: {
                total: totalClases,
                presentes,
                tardes,
                ausentes,
                porcentaje: porcentajeAsistenciaMateria,
              },
              promedio: promedioMateria,
            }
          }),
        )

        // Construir el objeto de datos académicos
        const academicInfo: InfoAcademica = {
          anio: new Date().getFullYear().toString(),
          grado: gradoInfo.msg || "Grado actual",
          materias: materiasConDetalles,
          promedioGeneral: promedioGeneral,
        }

        setAcademicData(academicInfo)
      } catch (error) {
        console.error("Error al cargar datos académicos:", error)
        setError("No se pudieron cargar los datos académicos. Por favor, intenta de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    loadAcademicData()
  }, [userId])

  // Función para calcular el porcentaje de asistencia
  const calculateAttendancePercentage = (attendance: any) => {
    if (!attendance) return "0.0"
    return attendance.porcentaje ? attendance.porcentaje.toFixed(1) : "0.0"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Navbar />
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="mt-2 text-gray-600">Cargando información académica...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto bg-red-50 p-6 rounded-lg border border-red-200">
            <h1 className="text-xl font-bold text-red-700 mb-2">Error</h1>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!academicData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h1 className="text-xl font-bold text-yellow-700 mb-2">Sin datos</h1>
            <p className="text-yellow-600">No se encontraron datos académicos para mostrar.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Encabezado */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Información Académica</h1>
            <p className="text-gray-600">
              {academicData.grado} - Año Lectivo {academicData.anio}
            </p>
          </div>

          {/* Selector de período */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setSelectedPeriod("current")}
                className={`px-4 py-2 rounded-md ${
                  selectedPeriod === "current" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Período Actual
              </button>
              <button
                disabled
                className="px-4 py-2 rounded-md text-gray-400 cursor-not-allowed"
                title="Funcionalidad no disponible"
              >
                Períodos Anteriores
              </button>
            </div>

            <div className="space-y-6">
              {/* Resumen del período actual */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-sm font-medium text-blue-900">Promedio General</h3>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-blue-700">
                    {academicData.promedioGeneral}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="text-sm font-medium text-green-900">Materias Cursando</h3>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-green-700">{academicData.materias.length}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-purple-600 mr-2" />
                    <h3 className="text-sm font-medium text-purple-900">Asistencia General</h3>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-purple-700">
                    {academicData.materias.length > 0
                      ? (
                          academicData.materias.reduce(
                            (sum, materia) => sum + (materia.asistencia?.porcentaje || 0),
                            0,
                          ) / academicData.materias.length
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </p>
                </div>
              </div>

              {/* Lista de materias actuales */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Materias en Curso</h2>
                {academicData.materias.length === 0 ? (
                  <div className="bg-white border rounded-lg p-6 text-center text-gray-500">
                    No hay materias registradas para este período.
                  </div>
                ) : (
                  academicData.materias.map((subject) => (
                    <div key={subject.id_materia} className="bg-white border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{subject.nombre}</h3>
                          <p className="text-sm text-gray-600">{subject.docente}</p>
                        </div>
                        <div className="mt-2 md:mt-0">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            Promedio: {subject.promedio}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Notas por trimestre */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Calificaciones</h4>
                          <div className="space-y-2">
                            {[1, 2, 3, 4].map((trimester) => (
                              <div key={trimester} className="flex justify-between items-center">
                                {/* si es el trimestre cuatro pertenece a la instancia de recuperación */}
                                <span className="text-sm text-gray-600">
                                  {trimester === 4 ? "Recuperación" : `Trimestre ${trimester}`}
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {subject.notas &&
                                    subject.notas[trimester as keyof typeof subject.notas]?.map((grade, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded bg-gray-100"
                                        title={grade.descripcion}
                                      >
                                        {grade.nota}
                                      </span>
                                    ))}
                                  {(!subject.notas ||
                                    !subject.notas[trimester as keyof typeof subject.notas] ||
                                    subject.notas[trimester as keyof typeof subject.notas].length === 0) && (
                                    <span className="text-sm text-gray-400">Sin notas</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Asistencia */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Asistencia</h4>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Presente</span>
                              <span className="text-sm text-gray-900">{subject.asistencia?.presentes || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Tarde</span>
                              <span className="text-sm text-gray-900">{subject.asistencia?.tardes || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Ausente</span>
                              <span className="text-sm text-gray-900">{subject.asistencia?.ausentes || 0}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span className="text-sm text-gray-600">Porcentaje</span>
                              <span className="text-sm text-gray-900">
                                {subject.asistencia?.porcentaje ? subject.asistencia.porcentaje.toFixed(1) : "0.0"}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

