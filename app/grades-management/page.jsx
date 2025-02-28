"use client"

import { useState } from "react"
import Navbar from "../../components/navbar"
import { Edit2 } from "lucide-react"

export default function GradesManagement() {
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedTrimester, setSelectedTrimester] = useState("1")
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [gradeData, setGradeData] = useState({
    grade: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  })

  // Datos de ejemplo
  const subjects = [
    { id: 1, name: "Matemáticas - 1° A" },
    { id: 2, name: "Matemáticas - 2° B" },
    { id: 3, name: "Física - 3° A" },
  ]

  const students = [
    {
      id: 1,
      name: "Juan Pérez",
      grades: {
        1: { grade: 8, date: "2024-03-15", description: "Examen parcial" },
        2: { grade: 7, date: "2024-06-20", description: "Trabajo práctico" },
        3: null,
      },
    },
    {
      id: 2,
      name: "María García",
      grades: {
        1: { grade: 9, date: "2024-03-15", description: "Examen parcial" },
        2: null,
        3: null,
      },
    },
    // Más estudiantes...
  ]

  const handleGradeSubmit = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para guardar la nota
    console.log("Guardando nota:", {
      studentId: selectedStudent.id,
      trimester: selectedTrimester,
      ...gradeData,
    })
    setShowGradeModal(false)
  }

  const openGradeModal = (student, trimester) => {
    setSelectedStudent(student)
    setSelectedTrimester(trimester)
    const existingGrade = student.grades[trimester]
    setGradeData({
      grade: existingGrade?.grade || "",
      date: existingGrade?.date || new Date().toISOString().split("T")[0],
      description: existingGrade?.description || "",
    })
    setShowGradeModal(true)
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
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSubject && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Alumno
                        </th>
                        {[1, 2, 3].map((trimester) => (
                          <th
                            key={trimester}
                            className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {trimester}° Trimestre
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.name}
                          </td>
                          {[1, 2, 3].map((trimester) => (
                            <td key={trimester} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center space-x-2">
                                <span>{student.grades[trimester]?.grade || "-"}</span>
                                <button
                                  onClick={() => openGradeModal(student, trimester.toString())}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <Edit2 className="h-4 w-4 text-gray-400" />
                                </button>
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                Trimestre: {selectedTrimester}°
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

