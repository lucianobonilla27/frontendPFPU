"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Navbar from "../../components/navbar"
import { PlusCircle, Pencil, Trash2, AlertCircle, Loader2 } from "lucide-react"

// Componente Modal extraído fuera del componente principal
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

// Componente de formulario extraído para evitar re-renderizados innecesarios
const GradeForm = ({ isEditing, initialValue, onSubmit, onCancel, isSubmitting }) => {
  const [inputValue, setInputValue] = useState(initialValue || "")
  const inputRef = useRef(null)

  // Enfocar el input cuando el componente se monta
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Actualizar el valor del input cuando cambia initialValue
  useEffect(() => {
    setInputValue(initialValue || "")
  }, [initialValue])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onSubmit(inputValue)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">{isEditing ? "Editar Año" : "Nuevo Año"}</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Año</label>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ej: 1ero"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
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
  )
}

// Componente de confirmación de eliminación
const DeleteConfirmation = ({ grade, onConfirm, onCancel, isSubmitting }) => {
  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        <AlertCircle className="w-6 h-6 text-red-600" />
        <h2 className="text-xl font-bold">Confirmar Eliminación</h2>
      </div>
      <p className="text-gray-600 mb-6">
        ¿Estás seguro de que deseas eliminar {grade?.anio}? Esta acción no se puede deshacer.
      </p>
      <div className="flex justify-end space-x-4">
        <button onClick={onCancel} className="px-4 py-2 border rounded-md hover:bg-gray-50" disabled={isSubmitting}>
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
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
  )
}

const GradeManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingGrade, setEditingGrade] = useState(null)
  const [selectedGradeForDelete, setSelectedGradeForDelete] = useState(null)
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Función para obtener todos los años
  const fetchGrades = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("https://localhost:7213/GetAllAnios")

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setGrades(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching grades:", err)
      setError("No se pudieron cargar los años. Por favor, intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar años al montar el componente
  useEffect(() => {
    fetchGrades()
  }, [fetchGrades])

  // Función para crear un nuevo año
  const createGrade = async (gradeName) => {
    try {
      setIsSubmitting(true)
      const response = await fetch("https://localhost:7213/PostAnio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ anio: gradeName }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Recargar la lista de años
      await fetchGrades()

      // Cerrar el modal
      setIsModalOpen(false)
    } catch (err) {
      console.error("Error creating grade:", err)
      setError("No se pudo crear el año. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para actualizar un año existente
  const updateGrade = async (gradeName) => {
    if (!editingGrade) return

    try {
      setIsSubmitting(true)
      const response = await fetch("https://localhost:7213/PutAnio", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_anio: editingGrade.id_anio,
          anio: gradeName,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Recargar la lista de años
      await fetchGrades()

      // Cerrar el modal y limpiar el formulario
      setIsModalOpen(false)
      setEditingGrade(null)
    } catch (err) {
      console.error("Error updating grade:", err)
      setError("No se pudo actualizar el año. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para eliminar un año
  const deleteGrade = async () => {
    if (!selectedGradeForDelete) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`https://localhost:7213/DeleteAnio/${selectedGradeForDelete.id_anio}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Recargar la lista de años
      await fetchGrades()

      // Cerrar el modal
      setIsDeleteModalOpen(false)
      setSelectedGradeForDelete(null)
    } catch (err) {
      console.error("Error deleting grade:", err)
      setError("No se pudo eliminar el año. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (grade) => {
    setEditingGrade(grade)
    setIsModalOpen(true)
  }

  const handleDelete = (grade) => {
    setSelectedGradeForDelete(grade)
    setIsDeleteModalOpen(true)
  }

  const handleFormSubmit = (gradeName) => {
    if (editingGrade) {
      updateGrade(gradeName)
    } else {
      createGrade(gradeName)
    }
  }

  const closeFormModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false)
      setEditingGrade(null)
    }
  }

  const closeDeleteModal = () => {
    if (!isSubmitting) {
      setIsDeleteModalOpen(false)
      setSelectedGradeForDelete(null)
    }
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
                disabled={loading}
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Nuevo Año
              </button>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}

            {/* Estado de carga */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="ml-2 text-gray-600">Cargando años...</span>
              </div>
            ) : (
              /* Lista de Años */
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {grades.length > 0 ? (
                  grades.map((grade) => (
                    <div
                      key={grade.id_anio}
                      className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow flex justify-between items-center"
                    >
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{grade.anio}</h2>
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
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No hay años registrados. Crea uno nuevo para comenzar.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal para crear/editar año */}
        <Modal isOpen={isModalOpen} onClose={closeFormModal}>
          <GradeForm
            isEditing={!!editingGrade}
            initialValue={editingGrade?.anio || ""}
            onSubmit={handleFormSubmit}
            onCancel={closeFormModal}
            isSubmitting={isSubmitting}
          />
        </Modal>

        {/* Modal de confirmación de eliminación */}
        <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
          <DeleteConfirmation
            grade={selectedGradeForDelete}
            onConfirm={deleteGrade}
            onCancel={closeDeleteModal}
            isSubmitting={isSubmitting}
          />
        </Modal>
      </div>
    </div>
  )
}

export default GradeManagement

