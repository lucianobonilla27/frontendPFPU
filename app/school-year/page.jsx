"use client"

import { useState } from "react"
import Navbar from "../../components/navbar"
import { PlusCircle, Pencil, Trash2, AlertCircle } from "lucide-react"

const GradeManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingGrade, setEditingGrade] = useState(null)
  const [selectedGradeForDelete, setSelectedGradeForDelete] = useState(null)

  // Datos de ejemplo de años/grados
  const [grades] = useState([
    { id: 1, name: "1er Grado", number: 1 },
    { id: 2, name: "2do Grado", number: 2 },
    { id: 3, name: "3er Grado", number: 3 },
    { id: 4, name: "4to Grado", number: 4 },
    { id: 5, name: "5to Grado", number: 5 },
    { id: 6, name: "6to Grado", number: 6 },
  ])

  const handleEdit = (grade) => {
    setEditingGrade(grade)
    setIsModalOpen(true)
  }

  const handleDelete = (grade) => {
    setSelectedGradeForDelete(grade)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    // Aquí iría la lógica para eliminar el grado
    console.log("Eliminando grado:", selectedGradeForDelete)
    setIsDeleteModalOpen(false)
    setSelectedGradeForDelete(null)
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
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Años</h1>
              <button
                onClick={() => {
                  setEditingGrade(null)
                  setIsModalOpen(true)
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full sm:w-auto justify-center"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Nuevo Año
              </button>
            </div>

            {/* Lista de Años */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {grades.map((grade) => (
                <div
                  key={grade.id}
                  className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow flex justify-between items-center"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{grade.name}</h2>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(grade)}
                      className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(grade)}
                      className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal para crear/editar año */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">{editingGrade ? "Editar Año" : "Nuevo Año"}</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Año</label>
                <input
                  type="text"
                  defaultValue={editingGrade?.name}
                  placeholder="Ej: 1er Grado"
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
              ¿Estás seguro de que deseas eliminar {selectedGradeForDelete?.name}? Esta acción no se puede deshacer.
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

export default GradeManagement

