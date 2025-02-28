"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/auth-context"
import Navbar from "../../components/navbar"
import { Eye, EyeOff, Save, Lock } from "lucide-react"

// Configuración de campos por tipo de usuario
const userFields = {
  student: [
    { name: "firstName", label: "Nombre", type: "text", colSpan: 1 },
    { name: "lastName", label: "Apellido", type: "text", colSpan: 1 },
    { name: "dni", label: "DNI", type: "text", colSpan: 1, disabled: true },
    { name: "birthDate", label: "Fecha de Nacimiento", type: "date", colSpan: 1 },
    { name: "phone", label: "Teléfono", type: "tel", colSpan: 1 },
    { name: "email", label: "Correo Electrónico", type: "email", colSpan: 2 },
    { name: "address", label: "Dirección", type: "text", colSpan: 2 },

  ],
  teacher: [
    { name: "firstName", label: "Nombre", type: "text", colSpan: 1 },
    { name: "lastName", label: "Apellido", type: "text", colSpan: 1 },
    { name: "dni", label: "DNI", type: "text", colSpan: 1, disabled: true },
    { name: "phone", label: "Teléfono", type: "tel", colSpan: 1 },
    { name: "email", label: "Correo Electrónico", type: "email", colSpan: 2 },
    { name: "address", label: "Dirección", type: "text", colSpan: 2 },
  ],
  admin: [
    { name: "firstName", label: "Nombre", type: "text", colSpan: 1 },
    { name: "lastName", label: "Apellido", type: "text", colSpan: 1 },
    { name: "dni", label: "DNI", type: "text", colSpan: 1, disabled: true },
    { name: "phone", label: "Teléfono", type: "tel", colSpan: 1 },
    { name: "email", label: "Correo Electrónico", type: "email", colSpan: 2 },
    { name: "address", label: "Dirección", type: "text", colSpan: 2 },
  ],
}

// Datos de ejemplo por tipo de usuario
const mockData = {
  student: {
    firstName: "Juan",
    lastName: "Pérez",
    dni: "12345678",
    birthDate: "2010-05-15",
    phone: "123-456-7890",
    email: "juan@ejemplo.com",
    address: "Calle Principal 123",
  },
  teacher: {
    firstName: "María",
    lastName: "González",
    dni: "87654321",
    phone: "123-456-7890",
    email: "maria@escuela.com",
    address: "Av. Principal 123",
  },
  admin: {
    firstName: "Carlos",
    lastName: "Rodríguez",
    dni: "98765432",
    phone: "123-456-7890",
    email: "carlos@admin.com",
    address: "Plaza Central 456",
  },
}

export default function UserProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Obtener los campos correspondientes al tipo de usuario
  const userType = user?.tipo || "student"
  const fields = userFields[userType]

  // Estado para los datos del perfil
  const [profileData, setProfileData] = useState(mockData[userType])

  // Estado para el cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para guardar los cambios
    setSuccessMessage("Datos actualizados correctamente")
    setTimeout(() => setSuccessMessage(""), 3000)
    setIsEditing(false)
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }
    // Aquí iría la lógica para verificar y cambiar la contraseña
    setSuccessMessage("Contraseña actualizada correctamente")
    setTimeout(() => setSuccessMessage(""), 3000)
    setShowPasswordModal(false)
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
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
        <div className="max-w-3xl mx-auto">
          {/* Mensaje de éxito */}
          {successMessage && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">{successMessage}</div>}

          {/* Perfil */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Cambiar Contraseña
                  </button>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {isEditing ? "Cancelar" : "Editar Perfil"}
                  </button>
                </div>
              </div>

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
                        disabled={field.disabled || !isEditing}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Modal de cambio de contraseña */}
          <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)}>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Cambiar Contraseña</h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contraseña Actual</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Actualizar Contraseña
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

