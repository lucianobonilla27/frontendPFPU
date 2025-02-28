"use client"

import { useState, useEffect } from "react"
import Navbar from "../../components/navbar"
import { Check, Clock, X, AlertCircle, Save, Search, Loader2 } from "lucide-react"

export default function AttendanceManagement() {
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [isRegistering, setIsRegistering] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [attendanceData, setAttendanceData] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Datos de ejemplo - En una implementación real, estos vendrían de una API
  const teacherSubjects = [
    {
      id: 1,
      name: "Matemáticas",
      course: "1° A",
      students: [
        { id: 1, name: "Juan Pérez" },
        { id: 2, name: "María García" },
        { id: 3, name: "Pedro López" },
        { id: 4, name: "Ana Martínez" },
      ],
    },
    {
      id: 2,
      name: "Matemáticas",
      course: "2° B",
      students: [
        { id: 5, name: "Luis Rodríguez" },
        { id: 6, name: "Carmen Sánchez" },
      ],
    },
  ]

  // Datos de ejemplo de asistencias registradas
  const mockAttendanceRecords = {
    // Clave: `${subjectId}-${date}`
    "1-2024-03-20": {
      1: "present",
      2: "late",
      3: "absent",
      4: "present",
    },
    "2-2024-03-20": {
      5: "present",
      6: "present",
    },
  }

  const attendanceStates = [
    { value: "present", label: "Presente", icon: Check, color: "text-green-600 hover:bg-green-50" },
    { value: "late", label: "Tarde", icon: Clock, color: "text-yellow-600 hover:bg-yellow-50" },
    { value: "absent", label: "Ausente", icon: X, color: "text-red-600 hover:bg-red-50" },
  ]

  // Buscar asistencia existente cuando cambia la materia o fecha
  useEffect(() => {
    if (selectedSubject && selectedDate) {
      searchAttendance()
    }
  }, [selectedSubject, selectedDate])

  const searchAttendance = async () => {
    setIsLoading(true)
    setErrorMessage("")

    try {
      // Simular llamada a la API
      const recordKey = `${selectedSubject}-${selectedDate}`
      const existingRecord = mockAttendanceRecords[recordKey]

      if (existingRecord) {
        setAttendanceData(existingRecord)
        setIsRegistering(true)
        setIsEditing(true)
      } else {
        setAttendanceData({})
        setIsRegistering(false)
        setIsEditing(false)
      }
    } catch (error) {
      setErrorMessage("Error al buscar el registro de asistencia")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const startRegistration = () => {
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

    // Inicializar el estado de asistencia para todos los estudiantes
    const subject = teacherSubjects.find((s) => s.id.toString() === selectedSubject)
    const initialAttendance = {}
    subject.students.forEach((student) => {
      initialAttendance[student.id] = null // null significa no registrado
    })
    setAttendanceData(initialAttendance)
    setIsRegistering(true)
    setIsEditing(false)
    setErrorMessage("")
  }

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  const handleSubmit = async () => {
    // Verificar que todos los estudiantes tengan asistencia registrada
    const unregistered = Object.values(attendanceData).some((status) => status === null)
    if (unregistered) {
      setErrorMessage("Debe registrar la asistencia de todos los estudiantes")
      return
    }

    try {
      // Aquí iría la llamada a la API para guardar la asistencia
      // await saveAttendance({
      //   subjectId: selectedSubject,
      //   date: selectedDate,
      //   attendance: attendanceData,
      //   isEditing: isEditing
      // })

      setSuccessMessage(isEditing ? "Asistencia actualizada correctamente" : "Asistencia registrada correctamente")
      setTimeout(() => {
        setSuccessMessage("")
        setIsRegistering(false)
        setIsEditing(false)
        setAttendanceData({})
      }, 3000)
    } catch (error) {
      setErrorMessage("Error al guardar la asistencia")
      console.error(error)
    }
  }

  const getStatusIcon = (status) => {
    if (!status) return null
    const stateConfig = attendanceStates.find((s) => s.value === status)
    if (!stateConfig) return null
    const Icon = stateConfig.icon
    return <Icon className={`h-5 w-5 ${stateConfig.color.split(" ")[0]}`} />
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
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="">Seleccionar materia...</option>
                    {teacherSubjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {`${subject.name} - ${subject.course}`}
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
                        {teacherSubjects
                          .find((s) => s.id.toString() === selectedSubject)
                          ?.students.map((student) => (
                            <tr key={student.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {student.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-4">
                                  {attendanceStates.map((state) => {
                                    const Icon = state.icon
                                    return (
                                      <button
                                        key={state.value}
                                        onClick={() => handleAttendanceChange(student.id, state.value)}
                                        className={`p-2 rounded-md transition-colors ${
                                          attendanceData[student.id] === state.value ? "bg-gray-100" : ""
                                        } ${state.color}`}
                                        title={state.label}
                                      >
                                        <Icon className="h-5 w-5" />
                                      </button>
                                    )
                                  })}
                                  {getStatusIcon(attendanceData[student.id])}
                                </div>
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
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isEditing ? "Actualizar Asistencia" : "Guardar Asistencia"}
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

