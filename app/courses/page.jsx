"use client"

import { useState } from "react"
import Navbar from "../../components/navbar"
import { PlusCircle, Pencil, Trash2, AlertCircle, Users } from "lucide-react"

const CourseManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [selectedCourseForDelete, setSelectedCourseForDelete] = useState(null)

  // Datos de ejemplo de años disponibles (vendrían de la base de datos)
  const [grades] = useState([
    { id: 1, name: "1er Grado" },
    { id: 2, name: "2do Grado" },
    { id: 3, name: "3er Grado" },
    { id: 4, name: "4to Grado" },
    { id: 5, name: "5to Grado" },
    { id: 6, name: "6to Grado" },
  ])

  // Datos de ejemplo de cursos
  const [courses] = useState([
    {
      id: 1,
      gradeId: 1,
      gradeName: "1er Grado",
      division: "A",
      capacity: 30,
      remainingCapacity: 25,
    },
    {
      id: 2,
      gradeId: 1,
      gradeName: "1er Grado",
      division: "B",
      capacity: 30,
      remainingCapacity: 28,
    },
    {
      id: 3,
      gradeId: 2,
      gradeName: "2do Grado",
      division: "A",
      capacity: 35,
      remainingCapacity: 30,
    },
  ])

  const handleEdit = (course) => {
    setEditingCourse(course)
    setIsModalOpen(true)
  }

  const handleDelete = (course) => {
    setSelectedCourseForDelete(course)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    // Aquí iría la lógica para eliminar el curso
    console.log("Eliminando curso:", selectedCourseForDelete)
    setIsDeleteModalOpen(false)
    setSelectedCourseForDelete(null)
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
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Cursos</h1>
              <button
                onClick={() => {
                  setEditingCourse(null)
                  setIsModalOpen(true)
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full sm:w-auto justify-center"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Nuevo Curso
              </button>
            </div>

            {/* Lista de Cursos */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div key={course.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {course.gradeName} "{course.division}"
                      </h2>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-1" />
                    <span>
                      Cupo: {course.remainingCapacity}/{course.capacity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal para crear/editar curso */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">{editingCourse ? "Editar Curso" : "Nuevo Curso"}</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                <select
                  defaultValue={editingCourse?.gradeId || ""}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">División</label>
                <input
                  type="text"
                  defaultValue={editingCourse?.division}
                  placeholder="Ej: A"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  maxLength={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cupo Total</label>
                <input
                  type="number"
                  min="1"
                  defaultValue={editingCourse?.capacity}
                  placeholder="Ej: 30"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
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
              ¿Estás seguro de que deseas eliminar el curso {selectedCourseForDelete?.gradeName} "
              {selectedCourseForDelete?.division}"? Esta acción no se puede deshacer.
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

export default CourseManagement

