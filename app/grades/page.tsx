"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Navbar from "../../components/navbar"
import { Edit2, AlertCircle, Search, Trash2, CheckCircle, Loader2, Plus } from "lucide-react"
import { useAuth } from "../../contexts/auth-context"

// Interfaces para los tipos de datos
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

interface Materia {
  id_materia: number
  materia: string
  id_anio: number
  id_docente: number | null
}

interface Nota {
  id_nota: number
  id_alumno: number
  id_materia: number
  fecha: string
  nota: number
  descripcion: string
  trimestre: number
}

interface Curso {
  id_curso: number
  division: string
  cupo_restante: number
  id_anio: number
}

// Componente Modal reutilizable
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null

  const handleModalClick = (e) => {
    e.stopPropagation()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-md" onClick={handleModalClick}>
        {children}
      </div>
    </div>
  )
}

export default function GradesManagement() {
  const { user } = useAuth()
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)
  const [selectedTrimester, setSelectedTrimester] = useState<number | null>(null)
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Alumno | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [gradeToDelete, setGradeToDelete] = useState<Nota | null>(null)

  // Estados para almacenar datos de la API
  const [teacherSubjects, setTeacherSubjects] = useState<Materia[]>([])
  const [students, setStudents] = useState<Alumno[]>([])
  const [grades, setGrades] = useState<Nota[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  //const [selectedSubjectAnio, setSelectedSubjectAnio] = useState<number | null>(null)

  const [gradeData, setGradeData] = useState({
    grade: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    trimester: 1,
  })

  const trimesters = [
    { value: 1, label: "Primer Trimestre" },
    { value: 2, label: "Segundo Trimestre" },
    { value: 3, label: "Tercer Trimestre" },
    { value: 0, label: "Recuperatorio" }

  ]

  // Obtener el ID del docente actual desde el contexto de autenticación
  const currentTeacherId = user?.id_usuario || 4 // Fallback a 4 para desarrollo

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
      try {
        setIsLoading(true)
        const data = await makeRequest(
          "GET",
          `https://localhost:7213/GetMateriasByDocente?id_docente=${currentTeacherId}`,
        )
        setTeacherSubjects(data)
      } catch (error) {
        console.error("Error al cargar materias:", error)
        setErrorMessage("No se pudieron cargar las materias. Verifica la conexión con el servidor.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeacherSubjects()
  }, [currentTeacherId, makeRequest])

  // Cargar cursos
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const data = await makeRequest("GET", "https://localhost:7213/GetAllCursos")
        setCursos(data)
      } catch (error) {
        console.error("Error al cargar cursos:", error)
      }
    }

    fetchCursos()
  }, [makeRequest])

  // Actualizar la función para cargar alumnos y notas cuando se selecciona una materia
  // Reemplazar el useEffect completo que carga alumnos y notas con este:

  useEffect(() => {
    if (!selectedSubject) return

    const fetchStudentsAndGrades = async () => {
      try {
        setIsLoading(true)

        // Obtener notas para la materia seleccionada
        const gradesData = await makeRequest("GET", `https://localhost:7213/GetNotasByMateria/${selectedSubject}`)
        setGrades(gradesData)

        // Usar el endpoint específico para obtener alumnos por materia
        const alumnosData = await makeRequest(
          "GET",
          `https://localhost:7213/GetAlumnosByMateria?id_materia=${selectedSubject}`,
        )
        setStudents(alumnosData)

        // Si no hay alumnos pero hay notas, podríamos intentar obtener los alumnos de las notas
        if (alumnosData.length === 0 && gradesData.length > 0) {
          console.log("No se encontraron alumnos para esta materia, pero hay notas registradas.")
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        setErrorMessage("No se pudieron cargar los datos. Verifica la conexión con el servidor.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudentsAndGrades()
  }, [selectedSubject, makeRequest])

  // Eliminar o comentar el useEffect que actualiza selectedSubjectAnio ya que no lo necesitamos más
  // También podemos eliminar el estado selectedSubjectAnio si no se usa en otra parte

  // Actualizar el año de la materia seleccionada
  /*useEffect(() => {
    if (selectedSubject) {
      const subject = teacherSubjects.find((s) => s.id_materia === selectedSubject)
      if (subject) {
        setSelectedSubjectAnio(subject.id_anio)
      }
    } else {
      setSelectedSubjectAnio(null)
    }
  }, [selectedSubject, teacherSubjects]);*/

  // Función para obtener las notas de un alumno en un trimestre específico
  const getStudentGradesByTrimester = (studentId: number, trimester: number) => {
    return grades.filter(
      (grade) => grade.id_alumno === studentId && grade.id_materia === selectedSubject && grade.trimestre === trimester,
    )
  }

  // Función para manejar la creación o actualización de una nota
  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación de nota
    const gradeValue = Number.parseFloat(gradeData.grade)
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 10) {
      setErrorMessage("La nota debe estar entre 0 y 10")
      return
    }

    if (!selectedStudent || selectedTrimester === null || !selectedSubject) {
      setErrorMessage("Faltan datos necesarios para guardar la nota")
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage("")

      // Verificar si ya existe una nota para este alumno, materia y trimestre
      const existingGrades = getStudentGradesByTrimester(selectedStudent.id_usuario, selectedTrimester)
      const isUpdate = existingGrades.length > 0

      const payload: Nota = {
        id_nota: isUpdate ? existingGrades[0].id_nota : 0,
        id_alumno: selectedStudent.id_usuario,
        id_materia: selectedSubject,
        fecha: gradeData.date,
        nota: gradeValue,
        descripcion: gradeData.description,
        trimestre: selectedTrimester,
      }

      if (isUpdate) {
        // Actualizar nota existente
        await makeRequest("PUT", "https://localhost:7213/UpdateNota", payload)

        // Actualizar el estado local
        setGrades((prevGrades) =>
          prevGrades.map((grade) =>
            grade.id_alumno === payload.id_alumno &&
            grade.id_materia === payload.id_materia &&
            grade.trimestre === payload.trimestre
              ? payload
              : grade,
          ),
        )
      } else {
        // Crear nueva nota
        const response = await makeRequest("POST", "https://localhost:7213/CreateNota", payload)

        // Verificar la respuesta
        console.log("Respuesta al crear nota:", response)

        // Si la respuesta contiene el ID de la nota creada, usarlo
        // De lo contrario, recargar todas las notas para asegurarnos de tener datos actualizados
        if (response && response.id_nota) {
          // Actualizar el estado local con la nueva nota
          setGrades((prevGrades) => [...prevGrades, response])
        } else {
          // Recargar todas las notas para esta materia
          const updatedGrades = await makeRequest("GET", `https://localhost:7213/GetNotasByMateria/${selectedSubject}`)
          setGrades(updatedGrades)
        }
      }

      setSuccessMessage(`Nota ${isUpdate ? "actualizada" : "guardada"} correctamente`)
      setTimeout(() => setSuccessMessage(""), 3000)
      setShowGradeModal(false)
    } catch (error) {
      console.error("Error al guardar nota:", error)
      setErrorMessage(`Error al ${isUpdate ? "actualizar" : "guardar"} la nota`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para eliminar una nota
  const handleDeleteGrade = async () => {
    if (!gradeToDelete) return

    try {
      setIsDeleting(true)
      setErrorMessage("")

      const { id_nota, id_alumno, id_materia, fecha } = gradeToDelete
      const formattedDate = encodeURIComponent(fecha)

      await makeRequest(
        "DELETE",
        `https://localhost:7213/DeleteNota/${id_nota}/${id_alumno}/${id_materia}/${formattedDate}`,
      )

      // Actualizar el estado local eliminando la nota
      setGrades((prevGrades) =>
        prevGrades.filter(
          (grade) => !(grade.id_nota === id_nota && grade.id_alumno === id_alumno && grade.id_materia === id_materia),
        ),
      )

      setSuccessMessage("Nota eliminada correctamente")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Error al eliminar nota:", error)
      setErrorMessage("Error al eliminar la nota")
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
      setGradeToDelete(null)
    }
  }

  // Función para abrir el modal de edición/creación de nota
  const openGradeModal = (student: Alumno, trimester: number) => {
    setSelectedStudent(student)
    setSelectedTrimester(trimester)

    // Verificar si ya existe una nota para este alumno, materia y trimestre
    const existingGrades = getStudentGradesByTrimester(student.id_usuario, trimester)
    const existingGrade = existingGrades.length > 0 ? existingGrades[0] : null

    setGradeData({
      grade: existingGrade ? existingGrade.nota.toString() : "",
      date: existingGrade ? existingGrade.fecha.split("T")[0] : new Date().toISOString().split("T")[0],
      description: existingGrade ? existingGrade.descripcion : "",
      trimester: trimester,
    })

    setShowGradeModal(true)
  }

  // Función para confirmar la eliminación de una nota
  const confirmDeleteGrade = (grade: Nota) => {
    setGradeToDelete(grade)
    setShowDeleteConfirm(true)
  }

  // Filtrar estudiantes por nombre o apellido
  const getFilteredStudents = () => {
    if (!selectedSubject || !students.length) return []

    return students.filter(
      (student) =>
        student.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.dni.toString().includes(searchTerm),
    )
  }

  // Obtener el nombre de la materia seleccionada
  const getSelectedSubjectName = () => {
    if (!selectedSubject) return ""
    const subject = teacherSubjects.find((s) => s.id_materia === selectedSubject)
    return subject ? subject.materia : ""
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Mensajes de éxito y error */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {errorMessage}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Notas</h1>

              {/* Selector de materia */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Materia</label>
                <select
                  value={selectedSubject || ""}
                  onChange={(e) => setSelectedSubject(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  disabled={isLoading}
                >
                  <option value="">Seleccionar materia...</option>
                  {teacherSubjects.map((subject) => (
                    <option key={subject.id_materia} value={subject.id_materia}>
                      {`${subject.materia} - Año ${subject.id_anio}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estado de carga */}
              {isLoading && selectedSubject && (
                <div className="flex justify-center my-8">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <span className="ml-2 text-gray-600">Cargando datos...</span>
                </div>
              )}

              {selectedSubject && !isLoading && (
                <>
                  {/* Buscador de alumnos */}
                  <div className="mb-6">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar alumno por nombre, apellido o DNI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-md"
                      />
                      <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {students.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No se encontraron alumnos para esta materia.</div>
                  ) : (
                    /* Tabla de notas */
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Alumno
                            </th>
                            {trimesters.map((trimester) => (
                              <th
                                key={trimester.value}
                                className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {trimester.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {getFilteredStudents().map((student) => (
                            <tr key={student.id_usuario}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {student.nombre} {student.apellido}
                                <div className="text-xs text-gray-500">DNI: {student.dni}</div>
                              </td>
                              {trimesters.map((trimester) => {
                                const studentGrades = getStudentGradesByTrimester(student.id_usuario, trimester.value)
                                return (
                                  <td
                                    key={trimester.value}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                  >
                                    <div className="flex flex-col space-y-2">
                                      {studentGrades.map((grade) => (
                                        <div key={grade.id_nota} className="flex items-center justify-between">
                                          <span className="font-medium">{grade.nota.toFixed(2)}</span>
                                          <div className="flex space-x-1">
                                            <button
                                              onClick={() => openGradeModal(student, trimester.value)}
                                              className="p-1 hover:bg-gray-100 rounded"
                                              title={grade.descripcion}
                                            >
                                              <Edit2 className="h-4 w-4 text-gray-400" />
                                            </button>
                                            <button
                                              onClick={() => confirmDeleteGrade(grade)}
                                              className="p-1 hover:bg-gray-100 rounded"
                                              title="Eliminar nota"
                                            >
                                              <Trash2 className="h-4 w-4 text-red-400" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                      {studentGrades.length === 0 && (
                                        <button
                                          onClick={() => openGradeModal(student, trimester.value)}
                                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                        >
                                          <Plus className="h-3 w-3 mr-1" />
                                          Agregar nota
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                          {getFilteredStudents().length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                No se encontraron alumnos que coincidan con la búsqueda
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Modal para asignar/editar nota */}
          <Modal isOpen={showGradeModal} onClose={() => !isSubmitting && setShowGradeModal(false)}>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {getStudentGradesByTrimester(selectedStudent?.id_usuario || 0, selectedTrimester || 0).length > 0
                  ? "Editar Nota"
                  : "Asignar Nota"}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Alumno: {selectedStudent ? `${selectedStudent.nombre} ${selectedStudent.apellido}` : ""}
                <br />
                Materia: {getSelectedSubjectName()}
                <br />
                Período: {trimesters.find((t) => t.value === selectedTrimester)?.label}
              </p>
              <form onSubmit={handleGradeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nota</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    value={gradeData.grade}
                    onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  {/* Si está en modo edicion la fecha no se puede editar */}
                  <label className="block text-sm font-medium text-gray-700">Fecha</label>
                  <input
                    type="date"
                    disabled={getStudentGradesByTrimester(selectedStudent?.id_usuario || 0, selectedTrimester || 0).length > 0}
                    value={gradeData.date}
                    onChange={(e) => setGradeData({ ...gradeData, date: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                    max={new Date().toISOString().split("T")[0]} // Limita la fecha máxima a hoy
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    value={gradeData.description}
                    onChange={(e) => setGradeData({ ...gradeData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    rows={3}
               
                  />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowGradeModal(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </Modal>

          {/* Modal de confirmación para eliminar nota */}
          <Modal isOpen={showDeleteConfirm} onClose={() => !isDeleting && setShowDeleteConfirm(false)}>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Confirmar eliminación</h2>
              <p className="text-sm text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar esta nota? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteGrade}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    "Eliminar"
                  )}
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  )
}

