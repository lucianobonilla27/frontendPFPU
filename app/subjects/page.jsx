"use client"

import { useState } from "react"
import Navbar from "../../components/navbar"
import { PlusCircle, Pencil, Trash2, AlertCircle, BookOpen } from "lucide-react"

const SubjectManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [selectedSubjectForDelete, setSelectedSubjectForDelete] = useState(null)

  // Datos de ejemplo de años disponibles (vendrían de la base de datos)
  const [grades] = useState([
    { id: 1, name: "1er Grado" },
    { id: 2, name: "2do Grado" },
    { id: 3, name: "3er Grado" },
    { id: 4, name: "4to Grado" },
    { id: 5, name: "5to Grado" },
    { id: 6, name: "6to Grado" },
  ])

  // Datos de ejemplo de materias
  const [subjects] = useState([
    {
      id: 1,
      name: "Matemáticas",
      gradeId: 1,
      gradeName: "1er Grado",
    },
    {
      id: 2,
      name: "Lengua",
      gradeId: 1,
      gradeName: "1er Grado",
    },
    {
      id: 3,
      name: "Ciencias Naturales",
      gradeId: 2,
      gradeName: "2do Grado",
    },
  ])

  const handleEdit = (subject) => {
    setEditingSubject(subject)
    setIsModalOpen(true)
  }

  const handleDelete = (subject) => {
    setSelectedSubjectForDelete(subject)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    // Aquí iría la lógica para eliminar la materia
    console.log("Eliminando materia:", selectedSubjectForDelete)
    setIsDeleteModalOpen(false)
    setSelectedSubjectForDelete(null)
  }

  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md">{children}</div>
      </div>
    )
  }

  // Agrupar materias por año
  const subjectsByGrade = subjects.reduce((acc, subject) => {
    if (!acc[subject.gradeId]) {
      acc[subject.gradeId] = {
        gradeName: subject.gradeName,
        subjects: [],
      }
    }
    acc[subject.gradeId].subjects.push(subject)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Materias</h1>
              <button
                onClick={() => {
                  setEditingSubject(null)
                  setIsModalOpen(true)
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full sm:w-auto justify-center"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Nueva Materia
              </button>
            </div>

            {/* Lista de Materias agrupadas por año */}
            <div className="space-y-6">
              {Object.entries(subjectsByGrade).map(([gradeId, { gradeName, subjects }]) => (
                <div key={gradeId} className="border rounded-lg p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{gradeName}</h2>
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {subjects.map((subject) => (
                      <div
                        key={subject.id}
                        className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
                            <h3 className="font-medium text-gray-900">{subject.name}</h3>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(subject)}
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(subject)}
                              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal para crear/editar materia */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">{editingSubject ? "Editar Materia" : "Nueva Materia"}</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Materia</label>
                <input
                  type="text"
                  defaultValue={editingSubject?.name}
                  placeholder="Ej: Matemáticas"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Año al que pertenece</label>
                <select
                  defaultValue={editingSubject?.gradeId || ""}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white"
                >
                  <option value="">Seleccionar año</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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

        {/* Modal de confirmación de eliminación */}
        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold">Confirmar Eliminación</h2>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar la materia "{selectedSubjectForDelete?.name}"? Esta acción no se
              puede deshacer.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Eliminar
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default SubjectManagement

