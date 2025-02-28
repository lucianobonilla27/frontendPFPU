"use client"

import { useState } from "react"
import Navbar from "../../components/navbar"
import { Search, Mail, AlertCircle, CheckCircle, Clock, Download, Plus, Send } from "lucide-react"

const paymentTypes = {
  ENROLLMENT: "Matrícula",
  MONTHLY_FEE: "Cuota Mensual",
  MATERIALS: "Materiales",
  UNIFORM: "Uniforme",
  EXCURSION: "Excursión",
  OTHER: "Otro",
}

export default function PaymentManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showNotifyModal, setShowNotifyModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Datos de ejemplo
  const students = [
    {
      id: 1,
      name: "Juan Pérez",
      grade: "4° A",
      email: "juan@ejemplo.com",
      payments: [
        {
          id: 1,
          type: "MONTHLY_FEE",
          concept: "Cuota Marzo 2024",
          amount: 5000,
          dueDate: "2024-03-25",
          status: "pending",
        },
        {
          id: 2,
          type: "MATERIALS",
          concept: "Materiales Primer Semestre",
          amount: 3000,
          dueDate: "2024-03-30",
          status: "late",
        },
      ],
    },
    {
      id: 2,
      name: "María García",
      grade: "4° A",
      email: "maria@ejemplo.com",
      payments: [
        {
          id: 3,
          type: "MONTHLY_FEE",
          concept: "Cuota Marzo 2024",
          amount: 5000,
          dueDate: "2024-03-25",
          status: "paid",
          paidDate: "2024-03-20",
          paymentMethod: "Transferencia",
        },
      ],
    },
  ]

  const [newPayment, setNewPayment] = useState({
    type: "",
    concept: "",
    amount: "",
    dueDate: "",
    status: "pending",
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Pagado
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            Pendiente
          </span>
        )
      case "late":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-4 h-4 mr-1" />
            Vencido
          </span>
        )
      default:
        return null
    }
  }

  const getPaymentTypeColor = (type) => {
    const colors = {
      ENROLLMENT: "bg-purple-100 text-purple-800",
      MONTHLY_FEE: "bg-blue-100 text-blue-800",
      MATERIALS: "bg-green-100 text-green-800",
      UNIFORM: "bg-indigo-100 text-indigo-800",
      EXCURSION: "bg-pink-100 text-pink-800",
      OTHER: "bg-gray-100 text-gray-800",
    }
    return colors[type] || colors.OTHER
  }

  const handleRegisterPayment = async (e) => {
    e.preventDefault()
    try {
      // Aquí iría la lógica para registrar el pago
      console.log("Registrando pago:", { student: selectedStudent, payment: newPayment })

      setSuccessMessage("Pago registrado correctamente")
      setShowRegisterModal(false)
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      setErrorMessage("Error al registrar el pago")
      console.error(error)
    }
  }

  const handleNotifyLatePayments = async () => {
    try {
      // Aquí iría la lógica para enviar notificaciones
      const latePayments = students.filter((student) => student.payments.some((payment) => payment.status === "late"))

      console.log("Enviando notificaciones a:", latePayments)

      setSuccessMessage("Notificaciones enviadas correctamente")
      setShowNotifyModal(false)
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      setErrorMessage("Error al enviar las notificaciones")
      console.error(error)
    }
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.grade.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      selectedStatus === "all" || student.payments.some((payment) => payment.status === selectedStatus)

    const matchesType = selectedType === "all" || student.payments.some((payment) => payment.type === selectedType)

    return matchesSearch && matchesStatus && matchesType
  })

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
        <div className="max-w-6xl mx-auto space-y-6">
          {successMessage && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">{successMessage}</div>}

          {errorMessage && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {errorMessage}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Pagos</h1>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowNotifyModal(true)}
                  className="flex items-center px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Notificar Morosos
                </button>
                <button
                  onClick={() => {
                    setSelectedStudent(null)
                    setNewPayment({
                      type: "",
                      concept: "",
                      amount: "",
                      dueDate: "",
                      status: "pending",
                    })
                    setShowRegisterModal(true)
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Pago
                </button>
              </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="all">Todos los estados</option>
                  <option value="paid">Pagados</option>
                  <option value="pending">Pendientes</option>
                  <option value="late">Vencidos</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="all">Todos los tipos</option>
                  {Object.entries(paymentTypes).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lista de estudiantes y pagos */}
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div key={student.id} className="border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.grade}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedStudent(student)
                        setNewPayment({
                          type: "",
                          concept: "",
                          amount: "",
                          dueDate: "",
                          status: "pending",
                        })
                        setShowRegisterModal(true)
                      }}
                      className="mt-2 sm:mt-0 flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Nuevo Pago
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Vencimiento
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {student.payments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeColor(payment.type)}`}
                              >
                                {paymentTypes[payment.type]}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">{payment.concept}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">${payment.amount.toLocaleString()}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {new Date(payment.dueDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2">{getStatusBadge(payment.status)}</td>
                            <td className="px-4 py-2 text-right">
                              {payment.status === "paid" && (
                                <button
                                  className="text-blue-600 hover:text-blue-800"
                                  onClick={() => {
                                    /* Lógica para descargar comprobante */
                                  }}
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal de registro de pago */}
          <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)}>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Registrar Pago</h2>
              {selectedStudent && (
                <p className="text-sm text-gray-600 mb-4">
                  Alumno: {selectedStudent.name} - {selectedStudent.grade}
                </p>
              )}
              <form onSubmit={handleRegisterPayment} className="space-y-4">
                {!selectedStudent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Alumno</label>
                    <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" required>
                      <option value="">Seleccionar alumno...</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} - {student.grade}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Pago</label>
                  <select
                    value={newPayment.type}
                    onChange={(e) => setNewPayment({ ...newPayment, type: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  >
                    <option value="">Seleccionar tipo...</option>
                    {Object.entries(paymentTypes).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Concepto</label>
                  <input
                    type="text"
                    value={newPayment.concept}
                    onChange={(e) => setNewPayment({ ...newPayment, concept: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Monto</label>
                  <input
                    type="number"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={newPayment.dueDate}
                    onChange={(e) => setNewPayment({ ...newPayment, dueDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    value={newPayment.status}
                    onChange={(e) => setNewPayment({ ...newPayment, status: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  >
                    <option value="pending">Pendiente</option>
                    <option value="paid">Pagado</option>
                    <option value="late">Vencido</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Registrar Pago
                  </button>
                </div>
              </form>
            </div>
          </Modal>

          {/* Modal de notificación a morosos */}
          <Modal isOpen={showNotifyModal} onClose={() => setShowNotifyModal(false)}>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Mail className="w-6 h-6 text-yellow-500 mr-2" />
                <h2 className="text-xl font-bold">Notificar Pagos Vencidos</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Se enviará un correo electrónico a todos los alumnos con pagos vencidos recordándoles sus obligaciones
                pendientes.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                  <p className="text-sm text-yellow-700">
                    Hay {students.filter((s) => s.payments.some((p) => p.status === "late")).length} alumnos con pagos
                    vencidos.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowNotifyModal(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleNotifyLatePayments}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Notificaciones
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  )
}

