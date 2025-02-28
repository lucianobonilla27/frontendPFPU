"use client"

import { useState } from "react"
import Navbar from "../../components/navbar"
import { Edit2, AlertCircle, Search } from "lucide-react"

export default function GradesManagement() {
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedTrimester, setSelectedTrimester] = useState("")
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const [gradeData, setGradeData] = useState({
    grade: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  })

  // Datos de ejemplo - En una implementación real, estos vendrían de una API
  const teacherSubjects = [
    {
      id: 1,
      name: "Matemáticas",
      course: "1° A",
      students: [
        {
          id: 1,
          name: "Juan Pérez",
          email: "juan@ejemplo.com",
          grades: {
            0: [], // Recuperatorio
            1: [{ id: 1, grade: 8, date: "2024-03-15", description: "Primer parcial" }],
            2: [],
            3: [],
          },
        },
        {
          id: 2,
          name: "María García",
          email: "maria@ejemplo.com",
          grades: {
            0: [{ id: 2, grade: 6, date: "2024-03-20", description: "Recuperatorio primer trimestre" }],
            1: [{ id: 3, grade: 4, date: "2024-03-10", description: "Primer parcial" }],
            2: [],
            3: [],
          },
        },
      ],
    },
  ]

  const trimesters = [
    { value: "0", label: "Recuperatorio" },
    { value: "1", label: "Primer Trimestre" },
    { value: "2", label: "Segundo Trimestre" },
    { value: "3", label: "Tercer Trimestre" },
  ]

  const handleGradeSubmit = async (e) => {
    e.preventDefault()

    // Validación de nota
    const gradeValue = Number.parseFloat(gradeData.grade)
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 10) {
      setErrorMessage("La nota debe estar entre 0 y 10")
      return
    }

    try {
      // Aquí iría la llamada a la API para guardar la nota
      // await saveGrade({
      //   studentId: selectedStudent.id,
      //   subjectId: selectedSubject,
      //   trimester: selectedTrimester,
      //   ...gradeData
      // })

      // Simulación de envío de email
      console.log(`Enviando notificación a ${selectedStudent.email} sobre nueva nota`)

      setSuccessMessage("Nota guardada correctamente y notificación enviada al alumno")
      setTimeout(() => setSuccessMessage(""), 3000)
      setShowGradeModal(false)
    } catch (error) {
      setErrorMessage("Error al guardar la nota")
      console.error(error)
    }
  }

  const openGradeModal = (student, trimester) => {
    setSelectedStudent(student)
    setSelectedTrimester(trimester)
    // Si hay notas previas en este trimestre, tomamos la última
    const trimesterGrades = student.grades[trimester]
    const lastGrade = trimesterGrades[trimesterGrades.length - 1]

    setGradeData({
      grade: lastGrade?.grade || "",
      date: lastGrade?.date || new Date().toISOString().split("T")[0],
      description: lastGrade?.description || "",
    })
    setShowGradeModal(true)
  }

  // Filtrar estudiantes por nombre
  const getFilteredStudents = () => {
    if (!selectedSubject) return []

    const subject = teacherSubjects.find((s) => s.id.toString() === selectedSubject)
    if (!subject) return []

    return subject.students.filter((student) => student.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }

  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md">{children}</div>
      </div>
    )
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
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Notas</h1>

              {/* Selector de materia */}
              <div className="mb-6">
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

              {selectedSubject && (
                <>
                  {/* Buscador de alumnos */}
                  <div className="mb-6">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar alumno..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-md"
                      />
                      <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Tabla de notas */}
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
                          <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.name}
                            </td>
                            {trimesters.map((trimester) => (
                              <td key={trimester.value} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex flex-col space-y-2">
                                  {student.grades[trimester.value].map((grade, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                      <span className="font-medium">{grade.grade}</span>
                                      <button
                                        onClick={() => openGradeModal(student, trimester.value)}
                                        className="p-1 hover:bg-gray-100 rounded"
                                        title={grade.description}
                                      >
                                        <Edit2 className="h-4 w-4 text-gray-400" />
                                      </button>
                                    </div>
                                  ))}
                                  {student.grades[trimester.value].length === 0 && (
                                    <button
                                      onClick={() => openGradeModal(student, trimester.value)}
                                      className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                      Agregar nota
                                    </button>
                                  )}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Modal para asignar/editar nota */}
          <Modal isOpen={showGradeModal} onClose={() => setShowGradeModal(false)}>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">{gradeData.grade ? "Editar Nota" : "Asignar Nota"}</h2>
              <p className="text-sm text-gray-600 mb-4">
                Alumno: {selectedStudent?.name}
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
                  <label className="block text-sm font-medium text-gray-700">Fecha</label>
                  <input
                    type="date"
                    value={gradeData.date}
                    onChange={(e) => setGradeData({ ...gradeData, date: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    value={gradeData.description}
                    onChange={(e) => setGradeData({ ...gradeData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    rows="3"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowGradeModal(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  )
}

