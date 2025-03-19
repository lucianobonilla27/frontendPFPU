"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Navbar from "../../components/navbar"
import { PlusCircle, Pencil, Trash2, AlertCircle, BookOpen, Loader2, CheckCircle, X, Info } from "lucide-react"

// Componente de Notificación simple
const Notification = ({ type, message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  const bgColors = {
    success: "bg-green-100 border-green-400 text-green-700",
    error: "bg-red-100 border-red-400 text-red-700",
    info: "bg-blue-100 border-blue-400 text-blue-700",
    warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
  }

  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
  }

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-md border ${bgColors[type]} shadow-md max-w-md`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">{icons[type]}</div>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

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

// Componente de formulario para materias
const SubjectForm = ({ isEditing, initialValues, grades, onSubmit, onCancel, isSubmitting }) => {
  const [formValues, setFormValues] = useState({
    materia: initialValues?.materia || "",
    id_anio: initialValues?.id_anio || "",
  })

  const nameInputRef = useRef(null)

  // Enfocar el input cuando el componente se monta
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [])

  // Actualizar valores cuando cambian los initialValues
  useEffect(() => {
    if (initialValues) {
      setFormValues({
        materia: initialValues.materia || "",
        id_anio: initialValues.id_anio || "",
      })
    } else {
      setFormValues({
        materia: "",
        id_anio: "",
      })
    }
  }, [initialValues])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormValues((prev) => ({
      ...prev,
      [name]: name === "id_anio" ? Number.parseInt(value, 10) || "" : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formValues.materia && formValues.id_anio) {
      onSubmit(formValues)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">{isEditing ? "Editar Materia" : "Nueva Materia"}</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Materia</label>
          <input
            ref={nameInputRef}
            type="text"
            name="materia"
            value={formValues.materia}
            onChange={handleChange}
            placeholder="Ej: Matemáticas"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            disabled={isSubmitting}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Año al que pertenece</label>
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
const DeleteConfirmation = ({ subject, onConfirm, onCancel, isSubmitting }) => {
  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        <AlertCircle className="w-6 h-6 text-red-600" />
        <h2 className="text-xl font-bold">Confirmar Eliminación</h2>
      </div>
      <p className="text-gray-600 mb-6">
        ¿Estás seguro de que deseas eliminar la materia "{subject?.materia}"? Esta acción no se puede deshacer.
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

const SubjectManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [selectedSubjectForDelete, setSelectedSubjectForDelete] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estado para notificaciones
  const [notification, setNotification] = useState({
    visible: false,
    type: "success",
    message: "",
  })

  // Función para mostrar notificación
  const showNotification = (type, message) => {
    setNotification({
      visible: true,
      type,
      message,
    })
  }

  // Función para cerrar notificación
  const closeNotification = () => {
    setNotification((prev) => ({
      ...prev,
      visible: false,
    }))
  }

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
      showNotification("error", "No se pudieron cargar los años. Por favor, intenta de nuevo más tarde.")
    }
  }, [])

  // Función para obtener todas las materias
  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("https://localhost:7213/GetMaterias")

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setSubjects(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching subjects:", err)
      setError("No se pudieron cargar las materias. Por favor, intenta de nuevo más tarde.")
      showNotification("error", "No se pudieron cargar las materias. Por favor, intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar años y materias al montar el componente
  useEffect(() => {
    const loadData = async () => {
      await fetchGrades()
      await fetchSubjects()
    }

    loadData()
  }, [fetchGrades, fetchSubjects])

  // Función para crear una nueva materia
  const createSubject = async (subjectData) => {
    try {
      setIsSubmitting(true)
      const response = await fetch("https://localhost:7213/AddMateria", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...subjectData,
          id_docente: null, // Según la especificación, id_docente debe ser null al crear
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Recargar la lista de materias
      await fetchSubjects()

      // Mostrar notificación de éxito
      showNotification("success", `La materia "${subjectData.materia}" ha sido creada exitosamente.`)

      // Cerrar el modal
      setIsModalOpen(false)
    } catch (err) {
      console.error("Error creating subject:", err)
      setError("No se pudo crear la materia. Por favor, intenta de nuevo.")
      showNotification("error", "No se pudo crear la materia. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para actualizar una materia existente
  const updateSubject = async (subjectData) => {
    try {
      setIsSubmitting(true)
      const response = await fetch("https://localhost:7213/UpdateMateria", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_materia: editingSubject.id_materia,
          ...subjectData,
          id_docente: editingSubject.id_docente, // Mantener el id_docente existente
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Recargar la lista de materias
      await fetchSubjects()

      // Mostrar notificación de éxito
      showNotification("success", `La materia "${subjectData.materia}" ha sido actualizada exitosamente.`)

      // Cerrar el modal y limpiar el formulario
      setIsModalOpen(false)
      setEditingSubject(null)
    } catch (err) {
      console.error("Error updating subject:", err)
      setError("No se pudo actualizar la materia. Por favor, intenta de nuevo.")
      showNotification("error", "No se pudo actualizar la materia. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para eliminar una materia
  const deleteSubject = async () => {
    if (!selectedSubjectForDelete) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`https://localhost:7213/DeleteMateria/${selectedSubjectForDelete.id_materia}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Mostrar notificación de éxito
      showNotification("success", `La materia "${selectedSubjectForDelete.materia}" ha sido eliminada exitosamente.`)

      // Recargar la lista de materias
      await fetchSubjects()

      // Cerrar el modal
      setIsDeleteModalOpen(false)
      setSelectedSubjectForDelete(null)
    } catch (err) {
      console.error("Error deleting subject:", err)
      setError("No se pudo eliminar la materia. Por favor, intenta de nuevo.")
      showNotification("error", "No se pudo eliminar la materia. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (subject) => {
    setEditingSubject(subject)
    setIsModalOpen(true)
  }

  const handleDelete = (subject) => {
    setSelectedSubjectForDelete(subject)
    setIsDeleteModalOpen(true)
  }

  const handleFormSubmit = (formData) => {
    if (editingSubject) {
      updateSubject(formData)
    } else {
      createSubject(formData)
    }
  }

  const closeFormModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false)
      setEditingSubject(null)
    }
  }

  const closeDeleteModal = () => {
    if (!isSubmitting) {
      setIsDeleteModalOpen(false)
      setSelectedSubjectForDelete(null)
    }
  }

  // Función para obtener el nombre del año a partir del id_anio
  const getGradeName = (id_anio) => {
    const grade = grades.find((g) => g.id_anio === id_anio)
    return grade ? grade.anio : "Desconocido"
  }

  // Agrupar materias por año
  const subjectsByGrade = subjects.reduce((acc, subject) => {
    if (!acc[subject.id_anio]) {
      acc[subject.id_anio] = {
        id_anio: subject.id_anio,
        gradeName: getGradeName(subject.id_anio),
        subjects: [],
      }
    }
    acc[subject.id_anio].subjects.push(subject)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Componente de notificación */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.visible}
        onClose={closeNotification}
      />

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
                disabled={loading || grades.length === 0}
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Nueva Materia
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
                <span className="ml-2 text-gray-600">Cargando materias...</span>
              </div>
            ) : (
              /* Lista de Materias agrupadas por año */
              <div className="space-y-6">
                {Object.keys(subjectsByGrade).length > 0 ? (
                  Object.values(subjectsByGrade).map((gradeGroup) => (
                    <div key={gradeGroup.id_anio} className="border rounded-lg p-4">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">{gradeGroup.gradeName}</h2>
                      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {gradeGroup.subjects.map((subject) => (
                          <div
                            key={subject.id_materia}
                            className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
                                <h3 className="font-medium text-gray-900">{subject.materia}</h3>
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
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No hay materias registradas. Crea una nueva para comenzar.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal para crear/editar materia */}
        <Modal isOpen={isModalOpen} onClose={closeFormModal}>
          <SubjectForm
            isEditing={!!editingSubject}
            initialValues={editingSubject}
            grades={grades}
            onSubmit={handleFormSubmit}
            onCancel={closeFormModal}
            isSubmitting={isSubmitting}
          />
        </Modal>

        {/* Modal de confirmación de eliminación */}
        <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
          <DeleteConfirmation
            subject={selectedSubjectForDelete}
            onConfirm={deleteSubject}
            onCancel={closeDeleteModal}
            isSubmitting={isSubmitting}
          />
        </Modal>
      </div>
    </div>
  )
}

export default SubjectManagement

