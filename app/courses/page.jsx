"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Navbar from "../../components/navbar"
import { PlusCircle, Pencil, Trash2, AlertCircle, Users, Loader2 } from "lucide-react"

// Componente Modal extraído
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

// Componente de formulario para cursos
const CourseForm = ({ isEditing, initialValues, grades, onSubmit, onCancel, isSubmitting }) => {
  const [formValues, setFormValues] = useState({
    id_anio: initialValues?.id_anio || "",
    division: initialValues?.division || "",
    cupo_restante: initialValues?.cupo_restante || 30,
  })

  const divisionInputRef = useRef(null)

  // Enfocar el input cuando el componente se monta
  useEffect(() => {
    if (divisionInputRef.current) {
      divisionInputRef.current.focus()
    }
  }, [])

  // Actualizar valores cuando cambian los initialValues
  useEffect(() => {
    if (initialValues) {
      setFormValues({
        id_anio: initialValues.id_anio || "",
        division: initialValues.division || "",
        cupo_restante: initialValues.cupo_restante || 30,
      })
    }
  }, [initialValues])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormValues((prev) => ({
      ...prev,
      [name]: name === "cupo_restante" ? Number.parseInt(value, 10) : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formValues.id_anio && formValues.division && formValues.cupo_restante > 0) {
      onSubmit(formValues)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">{isEditing ? "Editar Curso" : "Nuevo Curso"}</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
          <select
            name="id_anio"
            value={formValues.id_anio}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white"
            disabled={isSubmitting}
            required
          >
            <option value="">Seleccionar año</option>
            {grades.map((grade) => (
              <option key={grade.id_anio} value={grade.id_anio}>
                {grade.anio}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">División</label>
          <input
            ref={divisionInputRef}
            type="text"
            name="division"
            value={formValues.division}
            onChange={handleChange}
            placeholder="Ej: A"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            maxLength={1}
            disabled={isSubmitting}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cupo Total</label>
          <input
            type="number"
            name="cupo_restante"
            value={formValues.cupo_restante}
            onChange={handleChange}
            min="1"
            placeholder="Ej: 30"
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
const DeleteConfirmation = ({ course, gradeName, onConfirm, onCancel, isSubmitting }) => {
  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        <AlertCircle className="w-6 h-6 text-red-600" />
        <h2 className="text-xl font-bold">Confirmar Eliminación</h2>
      </div>
      <p className="text-gray-600 mb-6">
        ¿Estás seguro de que deseas eliminar el curso {gradeName} "{course?.division}"? Esta acción no se puede
        deshacer.
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

const CourseManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [selectedCourseForDelete, setSelectedCourseForDelete] = useState(null)
  const [courses, setCourses] = useState([])
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Función para obtener todos los años
  const fetchGrades = useCallback(async () => {
    try {
      const response = await fetch("https://localhost:7213/GetAllAnios")

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setGrades(data)
    } catch (err) {
      console.error("Error fetching grades:", err)
      setError("No se pudieron cargar los años. Por favor, intenta de nuevo más tarde.")
    }
  }, [])

  // Función para obtener todos los cursos
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("https://localhost:7213/GetAllCursos")

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setCourses(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching courses:", err)
      setError("No se pudieron cargar los cursos. Por favor, intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar años y cursos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      await fetchGrades()
      await fetchCourses()
    }

    loadData()
  }, [fetchGrades, fetchCourses])

  // Función para crear un nuevo curso
  const createCourse = async (courseData) => {
    try {
      setIsSubmitting(true)
      const response = await fetch("https://localhost:7213/PostCurso", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Recargar la lista de cursos
      await fetchCourses()

      // Cerrar el modal
      setIsModalOpen(false)
    } catch (err) {
      console.error("Error creating course:", err)
      setError("No se pudo crear el curso. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para actualizar un curso existente
  const updateCourse = async (courseData) => {
    try {
      setIsSubmitting(true)
      const response = await fetch("https://localhost:7213/PutCurso", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_curso: editingCourse.id_curso,
          ...courseData,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Recargar la lista de cursos
      await fetchCourses()

      // Cerrar el modal y limpiar el formulario
      setIsModalOpen(false)
      setEditingCourse(null)
    } catch (err) {
      console.error("Error updating course:", err)
      setError("No se pudo actualizar el curso. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para eliminar un curso
  const deleteCourse = async () => {
    if (!selectedCourseForDelete) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`https://localhost:7213/DeleteCurso/${selectedCourseForDelete.id_curso}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Recargar la lista de cursos
      await fetchCourses()

      // Cerrar el modal
      setIsDeleteModalOpen(false)
      setSelectedCourseForDelete(null)
    } catch (err) {
      console.error("Error deleting course:", err)
      setError("No se pudo eliminar el curso. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (course) => {
    setEditingCourse(course)
    setIsModalOpen(true)
  }

  const handleDelete = (course) => {
    setSelectedCourseForDelete(course)
    setIsDeleteModalOpen(true)
  }

  const handleFormSubmit = (formData) => {
    if (editingCourse) {
      updateCourse(formData)
    } else {
      createCourse(formData)
    }
  }

  const closeFormModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false)
      setEditingCourse(null)
    }
  }

  const closeDeleteModal = () => {
    if (!isSubmitting) {
      setIsDeleteModalOpen(false)
      setSelectedCourseForDelete(null)
    }
  }

  // Función para obtener el nombre del año a partir del id_anio
  const getGradeName = (id_anio) => {
    const grade = grades.find((g) => g.id_anio === id_anio)
    return grade ? grade.anio : "Desconocido"
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
                disabled={loading || grades.length === 0}
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Nuevo Curso
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
                <span className="ml-2 text-gray-600">Cargando cursos...</span>
              </div>
            ) : (
              /* Lista de Cursos */
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <div
                      key={course.id_curso}
                      className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            {getGradeName(course.id_anio)} "{course.division}"
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
                        <span>Cupo: {course.cupo_restante}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No hay cursos registrados. Crea uno nuevo para comenzar.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal para crear/editar curso */}
        <Modal isOpen={isModalOpen} onClose={closeFormModal}>
          <CourseForm
            isEditing={!!editingCourse}
            initialValues={editingCourse}
            grades={grades}
            onSubmit={handleFormSubmit}
            onCancel={closeFormModal}
            isSubmitting={isSubmitting}
          />
        </Modal>

        {/* Modal de confirmación de eliminación */}
        <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
          <DeleteConfirmation
            course={selectedCourseForDelete}
            gradeName={selectedCourseForDelete ? getGradeName(selectedCourseForDelete.id_anio) : ""}
            onConfirm={deleteCourse}
            onCancel={closeDeleteModal}
            isSubmitting={isSubmitting}
          />
        </Modal>
      </div>
    </div>
  )
}

export default CourseManagement

