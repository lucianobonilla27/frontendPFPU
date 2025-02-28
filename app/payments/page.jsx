"use client"

import { useState } from "react"
import Navbar from "../../components/navbar"
import { Calendar, DollarSign, Download, AlertCircle, CheckCircle, Clock } from "lucide-react"

// Tipos de pago
const paymentTypes = {
  ENROLLMENT: "Matrícula",
  MONTHLY_FEE: "Cuota Mensual",
  MATERIALS: "Materiales",
  UNIFORM: "Uniforme",
  EXCURSION: "Excursión",
  OTHER: "Otro",
}

export default function PaymentsInfo() {
  const [selectedTab, setSelectedTab] = useState("pending")
  const [showNotification, setShowNotification] = useState(true)

  // Datos de ejemplo
  const paymentsData = {
    summary: {
      totalDebt: 25000,
      nextDueDate: "2024-03-25",
      nextAmount: 5000,
      paymentStatus: "up-to-date", // up-to-date, late, very-late
    },
    pending: [
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
        status: "pending",
      },
    ],
    history: [
      {
        id: 3,
        type: "MONTHLY_FEE",
        concept: "Cuota Febrero 2024",
        amount: 5000,
        paidDate: "2024-02-23",
        dueDate: "2024-02-25",
        receiptUrl: "/comprobante-1.pdf",
        status: "paid",
        paymentMethod: "Transferencia Bancaria",
      },
      {
        id: 4,
        type: "ENROLLMENT",
        concept: "Matrícula 2024",
        amount: 10000,
        paidDate: "2024-01-15",
        dueDate: "2024-01-25",
        receiptUrl: "/comprobante-2.pdf",
        status: "paid",
        paymentMethod: "Tarjeta de Crédito",
      },
    ],
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Notificación de pago pendiente */}
          {showNotification && paymentsData.pending.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-700">
                    Tienes {paymentsData.pending.length} pagos pendientes. Próximo vencimiento:{" "}
                    {new Date(paymentsData.summary.nextDueDate).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => setShowNotification(false)} className="text-yellow-400 hover:text-yellow-500">
                  <span className="sr-only">Cerrar</span>
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>
          )}

          {/* Resumen de pagos */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Estado de Cuenta</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-sm font-medium text-blue-900">Deuda Total</h3>
                </div>
                <p className="mt-2 text-2xl font-bold text-blue-700">
                  ${paymentsData.summary.totalDebt.toLocaleString()}
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="text-sm font-medium text-yellow-900">Próximo Vencimiento</h3>
                </div>
                <p className="mt-2 text-2xl font-bold text-yellow-700">
                  {new Date(paymentsData.summary.nextDueDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-yellow-600">${paymentsData.summary.nextAmount.toLocaleString()}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="text-sm font-medium text-green-900">Estado</h3>
                </div>
                <p className="mt-2 text-xl font-bold text-green-700">Al día</p>
              </div>
            </div>
          </div>

          {/* Tabs de pagos */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setSelectedTab("pending")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === "pending"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Pagos Pendientes
                </button>
                <button
                  onClick={() => setSelectedTab("history")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === "history"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Historial de Pagos
                </button>
              </nav>
            </div>

            {selectedTab === "pending" ? (
              <div className="space-y-4">
                {paymentsData.pending.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeColor(payment.type)}`}
                        >
                          {paymentTypes[payment.type]}
                        </span>
                        <h3 className="text-lg font-medium text-gray-900">{payment.concept}</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Vencimiento: {new Date(payment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <span className="text-lg font-medium text-gray-900">${payment.amount.toLocaleString()}</span>
                      {getStatusBadge(payment.status)}
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Pagar</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {paymentsData.history.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeColor(payment.type)}`}
                        >
                          {paymentTypes[payment.type]}
                        </span>
                        <h3 className="text-lg font-medium text-gray-900">{payment.concept}</h3>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          Pagado el: {new Date(payment.paidDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">Método: {payment.paymentMethod}</p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <span className="text-lg font-medium text-gray-900">${payment.amount.toLocaleString()}</span>
                      {getStatusBadge(payment.status)}
                      <button
                        className="flex items-center px-4 py-2 border rounded-md hover:bg-gray-50"
                        onClick={() => window.open(payment.receiptUrl, "_blank")}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Comprobante
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

