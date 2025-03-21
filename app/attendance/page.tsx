"use client"

import { useState, useEffect, useCallback } from "react"
import Navbar from "../../components/navbar"
import { Check, Clock, X, AlertCircle, Save, Search, Loader2 } from "lucide-react"
import { useAuth } from "../../contexts/auth-context"

// Interfaces para los tipos de datos
interface Materia {
  id_materia: number
  materia: string
  id_anio: number
  id_docente: number | null
}

interface Alumno {
  id_usuario: number
  nombre: string
  apellido: string
  dni: number
  correo: string
  curso?: {
    id_curso: number
    division: string
    id_anio: number
    anio: string
  }
}

interface Asistencia {
  id_asistencia: number
  id_alumno: number
  id_materia: number
  fecha: string
  estado: string // "P" (presente), "T" (tarde), "A" (ausente)
}

// Actualizar la interfaz de AttendanceData
interface AttendanceData {
  estado: string | null
  id_asistencia?: number
  editing?: boolean
}

export default function AttendanceManagement() {
  const { user } = useAuth()
  const [materias, setMaterias] = useState<Materia[]>([])
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [isRegistering, setIsRegistering] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  // Actualizar el tipo de estado attendanceData
  const [attendanceData, setAttendanceData] = useState<Record<number, AttendanceData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Mapeo de estados de asistencia entre la UI y la API
  const attendanceStates = [
    { value: "P", label: "Presente", icon: Check, color: "text-green-600 hover:bg-green-50" },
    { value: "T", label: "Tarde", icon: Clock, color: "text-yellow-600 hover:bg-yellow-50" },
    { value: "A", label: "Ausente", icon: X, color: "text-red-600 hover:bg-red-50" },
  ]

  // Función para hacer peticiones a la API
  const makeRequest = useCallback(async (method: string, url: string, data: any = null): Promise<any> => {
    try {
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      }

      if (data) {
        options.body = JSON.stringify(data)
      }

      const response = await fetch(url, options)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Verificar si la respuesta es JSON o texto
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        return await response.json()
      } else {
        const text = await response.text()
        return { message: text, success: true }
      }
    } catch (error) {
      console.error("Error in makeRequest:", error)
      throw error
    }
  }, [])

  // Cargar materias del docente al iniciar
  useEffect(() => {
    const fetchTeacherSubjects = async () => {
      if (!user?.id_usuario) return

      try {
        setIsLoading(true)
        const data = await makeRequest(
          "GET",
          `https://localhost:7213/GetMateriasByDocente?id_docente=${user.id_usuario}`,
        )
        setMaterias(data)
      } catch (error) {
        console.error("Error al cargar materias:", error)
        setErrorMessage("No se pudieron cargar las materias. Verifica la conexión con el servidor.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeacherSubjects()
  }, [user?.id_usuario, makeRequest])

  // Cargar alumnos cuando se selecciona una materia
  useEffect(() => {
    if (!selectedSubject) return

    const fetchStudents = async () => {
      try {
        setIsLoading(true)
        const data = await makeRequest(
          "GET",
          `https://localhost:7213/GetAlumnosByMateria?id_materia=${selectedSubject}`,
        )
        setAlumnos(data)
      } catch (error) {
        console.error("Error al cargar alumnos:", error)
        setErrorMessage("No se pudieron cargar los alumnos. Verifica la conexión con el servidor.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudents()
  }, [selectedSubject, makeRequest])

  // Actualizar la función searchAttendance para manejar correctamente los registros existentes
  const searchAttendance = async () => {
    if (!selectedSubject || !selectedDate) {
      setErrorMessage("Debe seleccionar una materia y una fecha")
      return
    }

    setIsLoading(true)
    setErrorMessage("")

    try {
      // Obtener todas las asistencias para la materia y fecha seleccionadas
      const asistencias = await makeRequest("GET", `https://localhost:7213/GetAllAsistencias`)

      // Filtrar las asistencias por materia y fecha
      const filteredAsistencias = asistencias.filter(
        (a: Asistencia) => a.id_materia === selectedSubject && a.fecha.split("T")[0] === selectedDate,
      )

      if (filteredAsistencias.length > 0) {
        // Convertir el array de asistencias a un objeto con id_alumno como clave
        const attendanceMap: Record<number, AttendanceData> = {}
        filteredAsistencias.forEach((a: Asistencia) => {
          attendanceMap[a.id_alumno] = {
            estado: a.estado,
            id_asistencia: a.id_asistencia,
            editing: false, // Inicialmente no en modo edición
          }
        })

        setAttendanceData(attendanceMap)
        setIsRegistering(true)
        setIsEditing(true)
      } else {
        setAttendanceData({})
        setIsRegistering(false)
        setIsEditing(false)
      }
    } catch (error) {
      console.error("Error al buscar el registro de asistencia:", error)
      setErrorMessage("Error al buscar el registro de asistencia")
    } finally {
      setIsLoading(false)
    }
  }

  // Modificar la función startRegistration para verificar si ya existen registros
  const startRegistration = async () => {
    if (!selectedSubject) {
      setErrorMessage("Debe seleccionar una materia")
      return
    }
    if (!selectedDate) {
      setErrorMessage("Debe seleccionar una fecha")
      return
    }

    // Verificar que la fecha no sea futura
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDateObj = new Date(selectedDate)
    if (selectedDateObj > today) {
      setErrorMessage("No se puede registrar asistencia para fechas futuras")
      return
    }

    // Verificar si ya existen registros para esta materia y fecha
    try {
      setIsLoading(true)
      const asistencias = await makeRequest("GET", `https://localhost:7213/GetAllAsistencias`)

      // Filtrar las asistencias por materia y fecha
      const existingAsistencias = asistencias.filter(
        (a: Asistencia) => a.id_materia === selectedSubject && a.fecha.split("T")[0] === selectedDate,
      )

      if (existingAsistencias.length > 0) {
        setErrorMessage(
          "Ya existe un registro de asistencia para esta materia y fecha. Utilice 'Buscar Asistencia' para editarlo.",
        )
        setIsLoading(false)
        return
      }

      // Si no hay registros existentes, continuar con el registro nuevo
      const initialAttendance: Record<number, { estado: string | null; id_asistencia?: number; editing?: boolean }> = {}
      alumnos.forEach((alumno) => {
        initialAttendance[alumno.id_usuario] = {
          estado: null, // null significa no registrado
          editing: true, // Inicialmente en modo edición para nuevos registros
        }
      })
      setAttendanceData(initialAttendance)
      setIsRegistering(true)
      setIsEditing(false)
      setErrorMessage("")
    } catch (error) {
      console.error("Error al verificar registros existentes:", error)
      setErrorMessage("Error al verificar si ya existen registros de asistencia")
    } finally {
      setIsLoading(false)
    }
  }

  // Actualizar la función handleAttendanceChange para usar el nuevo formato de datos
  const handleAttendanceChange = (studentId: number, status: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        estado: status,
        editing: false, // Ocultar botones después de seleccionar
      },
    }))
  }

  // Agregar función para habilitar la edición de un registro
  const enableEditing = (studentId: number) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        editing: true,
      },
    }))
  }

  // Actualizar la función handleSubmit para manejar correctamente las claves primarias
  const handleSubmit = async () => {
    // Verificar que todos los estudiantes tengan asistencia registrada
    const unregistered = Object.values(attendanceData).some((data) => data.estado === null)
    if (unregistered) {
      setErrorMessage("Debe registrar la asistencia de todos los estudiantes")
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      // Primero, obtener todas las asistencias existentes para esta materia y fecha
      const asistencias = await makeRequest("GET", `https://localhost:7213/GetAllAsistencias`)

      // Filtrar las asistencias por materia y fecha
      const existingAsistencias = asistencias.filter(
        (a: Asistencia) => a.id_materia === selectedSubject && a.fecha.split("T")[0] === selectedDate,
      )

      // Crear un mapa de asistencias existentes por id_alumno
      const existingMap: Record<number, Asistencia> = {}
      existingAsistencias.forEach((a: Asistencia) => {
        existingMap[a.id_alumno] = a
      })

      // Crear o actualizar asistencias para cada alumno
      for (const alumnoId in attendanceData) {
        const data = attendanceData[alumnoId]
        const alumnoIdNum = Number(alumnoId)

        if (data.estado) {
          // Verificar si ya existe una asistencia para este alumno, materia y fecha
          const existingAsistencia = existingMap[alumnoIdNum]

          if (existingAsistencia) {
            // Si existe, actualizar
            const asistenciaData = {
              id_asistencia: existingAsistencia.id_asistencia,
              id_alumno: alumnoIdNum,
              id_materia: selectedSubject,
              fecha: selectedDate,
              estado: data.estado,
            }
            await makeRequest("PUT", "https://localhost:7213/UpdateAsistencia", asistenciaData)
          } else {
            // Si no existe, crear nueva
            const asistenciaData = {
              id_asistencia: 0, // El backend asignará un ID
              id_alumno: alumnoIdNum,
              id_materia: selectedSubject,
              fecha: selectedDate,
              estado: data.estado,
            }
            await makeRequest("POST", "https://localhost:7213/CreateAsistencia", asistenciaData)
          }
        }
      }

      setSuccessMessage(isEditing ? "Asistencia actualizada correctamente" : "Asistencia registrada correctamente")
      setTimeout(() => {
        setSuccessMessage("")
        setIsRegistering(false)
        setIsEditing(false)
        setAttendanceData({})
      }, 3000)
    } catch (error) {
      console.error("Error al guardar la asistencia:", error)
      setErrorMessage("Error al guardar la asistencia")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Actualizar la función getStatusIcon para usar el nuevo formato de datos
  const getStatusIcon = (data: { estado: string | null; id_asistencia?: number; editing?: boolean } | undefined) => {
    if (!data || !data.estado) return null
    const stateConfig = attendanceStates.find((s) => s.value === data.estado)
    if (!stateConfig) return null
    const Icon = stateConfig.icon
    return <Icon className={`h-5 w-5 ${stateConfig.color.split(" ")[0]}`} />
  }

  // Actualizar la función getStatusLabel para mostrar el texto del estado
  const getStatusLabel = (data: { estado: string | null; id_asistencia?: number; editing?: boolean } | undefined) => {
    if (!data || !data.estado) return ""
    const stateConfig = attendanceStates.find((s) => s.value === data.estado)
    return stateConfig ? stateConfig.label : ""
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {successMessage && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">{successMessage}</div>}

          {errorMessage && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {errorMessage}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Control de Asistencia</h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Selector de materia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Materia</label>
                  <select
                    value={selectedSubject || ""}
                    onChange={(e) => setSelectedSubject(Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="">Seleccionar materia...</option>
                    {materias.map((materia) => (
                      <option key={materia.id_materia} value={materia.id_materia}>
                        {/* necesito añadir el año de la materia tambien por si hay dos materias con el mismo nombre */}
                        {materia.materia + " (" + materia.id_anio + "° año" + ")"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selector de fecha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : !isRegistering ? (
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={searchAttendance}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Asistencia
                  </button>
                  <button
                    onClick={startRegistration}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={!selectedSubject || alumnos.length === 0}
                  >
                    Registrar Nueva Asistencia
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {isEditing && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                      <p className="text-blue-700 text-sm">Editando asistencia existente para {selectedDate}</p>
                    </div>
                  )}

                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Alumno
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                        </tr>
                      </thead>

                      <tbody className="bg-white divide-y divide-gray-200">
                        {alumnos.map((alumno) => (
                          <tr key={alumno.id_usuario}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {alumno.nombre} {alumno.apellido}
                              <div className="text-xs text-gray-500">DNI: {alumno.dni}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {attendanceData[alumno.id_usuario]?.editing ? (
                                // Mostrar botones de selección si está en modo edición
                                <div className="flex items-center space-x-4">
                                  {attendanceStates.map((state) => {
                                    const Icon = state.icon
                                    return (
                                      <button
                                        key={state.value}
                                        onClick={() => handleAttendanceChange(alumno.id_usuario, state.value)}
                                        className={`p-2 rounded-md transition-colors ${
                                          attendanceData[alumno.id_usuario]?.estado === state.value ? "bg-gray-100" : ""
                                        } ${state.color}`}
                                        title={state.label}
                                        disabled={isSubmitting}
                                      >
                                        <Icon className="h-5 w-5" />
                                      </button>
                                    )
                                  })}
                                </div>
                              ) : (
                                // Mostrar el estado actual y un botón para cambiar
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    {getStatusIcon(attendanceData[alumno.id_usuario])}
                                    <span className="text-sm">{getStatusLabel(attendanceData[alumno.id_usuario])}</span>
                                  </div>
                                  <button
                                    onClick={() => enableEditing(alumno.id_usuario)}
                                    className="ml-4 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                                    disabled={isSubmitting}
                                  >
                                    Cambiar
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        setIsRegistering(false)
                        setIsEditing(false)
                        setAttendanceData({})
                      }}
                      className="px-4 py-2 border rounded-md hover:bg-gray-50"
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isEditing ? "Actualizando..." : "Guardando..."}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {isEditing ? "Actualizar Asistencia" : "Guardar Asistencia"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

