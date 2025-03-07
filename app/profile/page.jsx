"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/auth-context"
import Navbar from "../../components/navbar"
import { Eye, EyeOff, Save, Lock, Loader2, AlertCircle, CheckCircle } from "lucide-react"

// Configuración de campos por tipo de usuario
const userFields = {
  alumno: [
    { name: "nombre", label: "Nombre", type: "text", colSpan: 1 },
    { name: "apellido", label: "Apellido", type: "text", colSpan: 1 },
    { name: "dni", label: "DNI", type: "text", colSpan: 1, disabled: true },
    { name: "fecha_nac", label: "Fecha de Nacimiento", type: "date", colSpan: 1 },
    { name: "telefono", label: "Teléfono", type: "tel", colSpan: 1 },
    { name: "correo", label: "Correo Electrónico", type: "email", colSpan: 2 },
    { name: "direccion", label: "Dirección", type: "text", colSpan: 2 },
    { name: "matricula", label: "Matrícula", type: "text", colSpan: 1, disabled: true },
  ],
  docente: [
    { name: "nombre", label: "Nombre", type: "text", colSpan: 1 },
    { name: "apellido", label: "Apellido", type: "text", colSpan: 1 },
    { name: "dni", label: "DNI", type: "text", colSpan: 1, disabled: true },
    { name: "telefono", label: "Teléfono", type: "tel", colSpan: 1 },
    { name: "correo", label: "Correo Electrónico", type: "email", colSpan: 2 },
  ],
  admin: [
    { name: "nombre", label: "Nombre", type: "text", colSpan: 1 },
    { name: "apellido", label: "Apellido", type: "text", colSpan: 1 },
    { name: "dni", label: "DNI", type: "text", colSpan: 1, disabled: true },
    { name: "telefono", label: "Teléfono", type: "tel", colSpan: 1 },
    { name: "correo", label: "Correo Electrónico", type: "email", colSpan: 2 },
  ],
}

// Reemplazar el componente Modal actual con esta versión mejorada
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

export default function UserProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Obtener los campos correspondientes al tipo de usuario
  const userType =
    user?.role?.toLowerCase() ||
    (typeof window !== "undefined" && localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))?.role?.toLowerCase()
      : "alumno")
  const fields = userFields[userType === "administrativo" ? "admin" : userType] || userFields.alumno

  // Estado para los datos del perfil
  const [profileData, setProfileData] = useState({})
  const [originalProfileData, setOriginalProfileData] = useState({})

  // Estado para el cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Función para obtener los datos del usuario desde la API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)

        // Obtener el usuario del localStorage
        const storedUser = localStorage.getItem("user")

        if (!storedUser) {
          setErrorMessage("No se encontró información del usuario en la sesión")
          setIsLoading(false)
          return
        }

        const userObj = JSON.parse(storedUser)
        const userId = userObj.id_usuario

        if (!userId) {
          setErrorMessage("No se pudo obtener el ID del usuario")
          setIsLoading(false)
          return
        }

        // Determinar la URL según el tipo de usuario (role)
        const userRole = userObj.role.toLowerCase()
        const apiUrl =
          userRole === "alumno"
            ? `https://localhost:7213/GetAlumno?id_usuario=${userId}`
            : `https://localhost:7213/GetUsuario?id_usuario=${userId}`

        const response = await fetch(apiUrl)

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const userData = await response.json()

        // Formatear la fecha de nacimiento si existe
        if (userData.fecha_nac) {
          userData.fecha_nac = userData.fecha_nac.split("T")[0]
        }

        setProfileData(userData)
        setOriginalProfileData({ ...userData })
      } catch (error) {
        console.error("Error fetching user data:", error)
        setErrorMessage("No se pudieron cargar los datos del usuario. Por favor, intenta de nuevo más tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    })
  }

  // Reemplazar la función handlePasswordChange con esta versión optimizada
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Modificar la función handleSubmit para actualizar originalProfileData después de guardar exitosamente
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      setErrorMessage("")

      // Obtener el usuario del localStorage
      const storedUser = localStorage.getItem("user")

      if (!storedUser) {
        setErrorMessage("No se encontró información del usuario en la sesión")
        return
      }

      const userObj = JSON.parse(storedUser)
      const userId = userObj.id_usuario

      if (!userId) {
        setErrorMessage("No se pudo obtener el ID del usuario")
        return
      }

      // Determinar la URL según el tipo de usuario (role)
      const userRole = userObj.role.toLowerCase()
      const apiUrl =
        userRole === "alumno"
          ? `https://localhost:7213/UpdateAlumno`
          : userRole === "docente"
            ? `https://localhost:7213/UpdateDocente`
            : `https://localhost:7213/UpdateAdministrador`

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userObj.token}`,
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Actualizar originalProfileData con los datos guardados exitosamente
      setOriginalProfileData({ ...profileData })

      setSuccessMessage("Datos actualizados correctamente")
      setTimeout(() => setSuccessMessage(""), 3000)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating user data:", error)
      setErrorMessage("No se pudieron actualizar los datos. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden")
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage("")

      // Obtener el usuario del localStorage
      const storedUser = localStorage.getItem("user")

      if (!storedUser) {
        setErrorMessage("No se encontró información del usuario en la sesión")
        return
      }

      const userObj = JSON.parse(storedUser)
      const userId = userObj.id_usuario

      if (!userId) {
        setErrorMessage("No se pudo obtener el ID del usuario")
        return
      }

      // Endpoint para cambiar la contraseña
      const apiUrl = `https://localhost:7213/api/auth/ChangePassword`

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userObj.token}`,
        },
        body: JSON.stringify({
          idUsuario: userId,
          oldPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      setSuccessMessage("Contraseña actualizada correctamente")
      setTimeout(() => setSuccessMessage(""), 3000)
      setShowPasswordModal(false)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error updating password:", error)
      setErrorMessage("No se pudo actualizar la contraseña. Verifica que la contraseña actual sea correcta.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reemplazar la sección del modal de cambio de contraseña con esta versión mejorada
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Mensaje de éxito */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {successMessage}
            </div>
          )}

          {/* Mensaje de error */}
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {errorMessage}
            </div>
          )}

          {/* Perfil */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Cambiar Contraseña
                  </button>
                  <button
                    onClick={() => {
                      if (isEditing) {
                        // Reset to original data when canceling
                        setProfileData({ ...originalProfileData })
                        setIsEditing(false)
                      } else {
                        setIsEditing(true)
                      }
                    }}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isEditing ? "Cancelar" : "Editar Perfil"}
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <span className="ml-2 text-gray-600">Cargando datos del perfil...</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {fields?.map((field) => (
                      <div key={field.name} className={field.colSpan === 2 ? "md:col-span-2" : ""}>
                        <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                        <input
                          type={field.type}
                          name={field.name}
                          value={profileData[field.name] || ""}
                          onChange={handleProfileChange}
                          disabled={field.disabled || !isEditing || isSubmitting}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    ))}
                  </div>

                  {isEditing && (
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Cambios
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Modal de cambio de contraseña */}
          {showPasswordModal && (
            <Modal isOpen={showPasswordModal} onClose={() => !isSubmitting && setShowPasswordModal(false)}>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Cambiar Contraseña</h2>

                {errorMessage && showPasswordModal && (
                  <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contraseña Actual</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-10"
                        required
                        disabled={isSubmitting}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        disabled={isSubmitting}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-10"
                        required
                        disabled={isSubmitting}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        disabled={isSubmitting}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-10"
                        required
                        disabled={isSubmitting}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        disabled={isSubmitting}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(false)}
                      className="px-4 py-2 border rounded-md hover:bg-gray-50"
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:bg-blue-400"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Actualizando...
                        </>
                      ) : (
                        "Actualizar Contraseña"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  )
}

