"use client"

import { useState, useEffect } from "react"
import Navbar from "../../components/navbar"
import { Calendar, DollarSign, AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react"

// Interfaces para los tipos de datos
interface Deuda {
  id_deuda: number
  fecha_vencimiento: string
  id_alumno: number
  estado: string
  monto: number
  id_tipo: number
  tipo_nombre?: string
  pagos?: Pago[]
  montoPagado?: number
  montoPendiente?: number
}

interface Pago {
  id_pago: number
  monto: number
  fecha: string
  id_alumno: number
  id_deuda: number
  id_tipo?: number
  fecha_vencimiento?: string
  concepto?: string
}

// Modificar la interfaz ResumenDeuda para que coincida con el formato de respuesta del backend
interface ResumenDeuda extends Deuda {
  // Mantiene la misma estructura que Deuda
  deudaTotal?: number
  proximoVencimiento?: string
  proximoMonto?: number
  estadoPago?: string
}

interface TipoPago {
  id_tipo: number
  tipo: string
}

export default function PaymentsInfo() {
  const [selectedTab, setSelectedTab] = useState("pending")
  const [showNotification, setShowNotification] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)

  // Estados para los datos
  const [deudas, setDeudas] = useState<Deuda[]>([])
  const [pagos, setPagos] = useState<Pago[]>([])
  const [resumenDeuda, setResumenDeuda] = useState<ResumenDeuda | null>(null)
  const [tiposPago, setTiposPago] = useState<{ [key: number]: string }>({})
  const [deudaTotal, setDeudaTotal] = useState(0)

  // Obtener el ID del usuario actual
  useEffect(() => {
    const getUserId = async () => {
      try {
        // Obtener de localStorage
        const user = localStorage.getItem("user")
        const storedUserId = user ? JSON.parse(user).id_usuario : null
        if (storedUserId) {
          setUserId(Number.parseInt(storedUserId))
        } else {
          // Si no hay ID en localStorage, podrías redirigir al login
          // o usar un ID de prueba para desarrollo
          setUserId(1) // ID de prueba
          console.warn("No se encontró ID de usuario, usando ID de prueba")
        }
      } catch (error) {
        console.error("Error al obtener ID de usuario:", error)
        setError("No se pudo obtener la información del usuario")
      }
    }

    getUserId()
  }, [])

  // Función para hacer peticiones a la API
  const fetchData = async (url: string) => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error al obtener datos de ${url}:`, error)
      throw error
    }
  }

  // Cargar datos cuando el userId esté disponible
  useEffect(() => {
    if (!userId) return

    const loadPaymentsData = async () => {
      try {
        setLoading(true)

        // 1. Obtener tipos de pago
        const tiposPagoData = await fetchData(`https://localhost:7213/GetAllTipoPago`)
        const tiposPagoMap = tiposPagoData.reduce((acc: { [key: number]: string }, tipo: TipoPago) => {
          acc[tipo.id_tipo] = tipo.tipo
          return acc
        }, {})
        setTiposPago(tiposPagoMap)

        // 2. Obtener deudas del alumno
        const deudasData = await fetchData(`https://localhost:7213/GetDeudasAlumno/${userId}`)

        // 3. Obtener pagos del alumno
        const pagosData = await fetchData(`https://localhost:7213/GetPagosAlumno/${userId}`)
        setPagos(pagosData)

        // 4. Obtener resumen de deuda
        const resumenData = await fetchData(`https://localhost:7213/GetResumenDeudaAlumno/${userId}`)
        setResumenDeuda(resumenData)

        // Procesar deudas para calcular montos pagados y pendientes
        const deudasProcesadas = deudasData.map((deuda: Deuda) => {
          // Encontrar pagos asociados a esta deuda
          const pagosPorDeuda = pagosData.filter((pago: Pago) => pago.id_deuda === deuda.id_deuda)
          const montoPagado = pagosPorDeuda.reduce((sum: number, pago: Pago) => sum + pago.monto, 0)
          const montoPendiente = Math.max(0, deuda.monto - montoPagado)

          return {
            ...deuda,
            pagos: pagosPorDeuda,
            montoPagado,
            montoPendiente,
          }
        })

        setDeudas(deudasProcesadas)

        // Calcular deuda total pendiente
        const deudasPendientes = deudasProcesadas.filter((deuda) => deuda.estado !== "Pagado")
        const totalDeuda = deudasPendientes.reduce((sum, deuda) => sum + (deuda.monto), 0)
        setDeudaTotal(totalDeuda)
      } catch (error) {
        console.error("Error al cargar datos de pagos:", error)
        setError("No se pudieron cargar los datos de pagos. Por favor, intenta de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    loadPaymentsData()
  }, [userId])

  // Filtrar deudas pendientes y pagadas
  const deudasPendientes = deudas.filter((deuda) => deuda.estado !== "Pagado")
  const deudasPagadas = deudas.filter((deuda) => deuda.estado === "Pagado")

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Pagado":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Pagado
          </span>
        )
      case "Pendiente":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            Pendiente
          </span>
        )
      case "Vencido":
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

  // Obtener el color y el icono para el estado del alumno
  const getEstadoAlumnoStyle = (estado: string) => {
    switch (estado) {
      case "Sin deuda":
        return {
          bgColor: "bg-green-50",
          textColor: "text-green-700",
          icon: <CheckCircle className="h-5 w-5 text-green-600 mr-2" />,
          titleColor: "text-green-900",
        }
      case "Pendiente":
        return {
          bgColor: "bg-yellow-50",
          textColor: "text-yellow-700",
          icon: <Clock className="h-5 w-5 text-yellow-600 mr-2" />,
          titleColor: "text-yellow-900",
        }
      case "Vencido":
        return {
          bgColor: "bg-red-50",
          textColor: "text-red-700",
          icon: <AlertCircle className="h-5 w-5 text-red-600 mr-2" />,
          titleColor: "text-red-900",
        }
      default:
        return {
          bgColor: "bg-gray-50",
          textColor: "text-gray-700",
          icon: <AlertCircle className="h-5 w-5 text-gray-600 mr-2" />,
          titleColor: "text-gray-900",
        }
    }
  }

  const getPaymentTypeColor = (tipoId: number) => {
    const colors: { [key: string]: string } = {
      Matrícula: "bg-purple-100 text-purple-800",
      "Cuota Mensual": "bg-blue-100 text-blue-800",
      Materiales: "bg-green-100 text-green-800",
      Uniforme: "bg-indigo-100 text-indigo-800",
      Excursión: "bg-pink-100 text-pink-800",
    }

    const tipoNombre = tiposPago[tipoId] || "Otro"
    return colors[tipoNombre] || "bg-gray-100 text-gray-800"
  }

  // Corregir el problema de las fechas que se muestran con un día menos
  const formatDate = (dateString: string) => {
    if (!dateString) return ""

    // Extraer solo la parte de la fecha (YYYY-MM-DD)
    const datePart = dateString.split("T")[0]

    // Dividir en componentes
    const [year, month, day] = datePart.split("-").map((num) => Number.parseInt(num))

    // Crear un formateador de fecha localizado
    const formatter = new Intl.DateTimeFormat("es", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC", // Usar UTC para evitar ajustes de zona horaria
    })

    // Crear fecha en UTC para evitar ajustes de zona horaria
    const date = new Date(Date.UTC(year, month - 1, day))
    return formatter.format(date)
  }

  // Generar concepto para mostrar
  const getConcepto = (deuda: Deuda) => {
    const tipoNombre = tiposPago[deuda.id_tipo] || "Pago"

    // Extraer solo la parte de la fecha (YYYY-MM-DD)
    const datePart = deuda.fecha_vencimiento.split("T")[0]

    // Dividir en componentes
    const [year, month, day] = datePart.split("-").map((num) => Number.parseInt(num))

    // Crear fecha en UTC para evitar ajustes de zona horaria
    const fecha = new Date(Date.UTC(year, month - 1, day))

    // Obtener el nombre del mes en español
    const nombreMes = fecha.toLocaleString("es", { month: "long", timeZone: "UTC" })
    const año = fecha.getUTCFullYear()

    return `${tipoNombre} - ${nombreMes} ${año}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Navbar />
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="mt-2 text-gray-600">Cargando información de pagos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto bg-red-50 p-6 rounded-lg border border-red-200">
            <h1 className="text-xl font-bold text-red-700 mb-2">Error</h1>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!resumenDeuda) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h1 className="text-xl font-bold text-yellow-700 mb-2">Sin datos</h1>
            <p className="text-yellow-600">No se encontraron datos de pagos para mostrar.</p>
          </div>
        </div>
      </div>
    )
  }

  // Obtener el estilo para el estado del alumno
  const estadoStyle = getEstadoAlumnoStyle(resumenDeuda.estado)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Notificación de pago pendiente */}
          {showNotification && deudasPendientes.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-700">
                    Tienes {deudasPendientes.length} pagos pendientes. Próximo vencimiento:{" "}
                    {formatDate(resumenDeuda.fecha_vencimiento)}
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
              {/* Primer cuadro: Deuda total pendiente */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-sm font-medium text-blue-900">Deuda Total</h3>
                </div>
                <p className="mt-2 text-2xl font-bold text-blue-700">${deudaTotal.toLocaleString()}</p>
              </div>

              {/* Segundo cuadro: Próximo vencimiento */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="text-sm font-medium text-yellow-900">
                    {resumenDeuda.estado === "Vencido" ? "Vencimiento más antiguo" : "Próximo Vencimiento"}
                  </h3>
                </div>
                <p className="mt-2 text-2xl font-bold text-yellow-700">{formatDate(resumenDeuda.fecha_vencimiento)}</p>
              
              </div>

              {/* Tercer cuadro: Estado del alumno (usando el estado del resumenDeuda) */}
              <div className={`p-4 rounded-lg ${estadoStyle.bgColor}`}>
                <div className="flex items-center">
                  {estadoStyle.icon}
                  <h3 className={`text-sm font-medium ${estadoStyle.titleColor}`}>Estado</h3>
                </div>
                <p className={`mt-2 text-xl font-bold ${estadoStyle.textColor}`}>{resumenDeuda.estado}</p>
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
                {deudasPendientes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No tienes pagos pendientes en este momento.</div>
                ) : (
                  deudasPendientes.map((deuda) => (
                    <div
                      key={deuda.id_deuda}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeColor(deuda.id_tipo)}`}
                          >
                            {tiposPago[deuda.id_tipo] || "Otro"}
                          </span>
                          <h3 className="text-lg font-medium text-gray-900">{getConcepto(deuda)}</h3>
                        </div>
                        <p className="text-sm text-gray-600">Vencimiento: {formatDate(deuda.fecha_vencimiento)}</p>
                        {deuda.montoPagado && deuda.montoPagado > 0 && (
                          <p className="text-sm text-green-600">
                            Pagado: ${deuda.montoPagado.toLocaleString()} | Pendiente: $
                            {deuda.monto.toLocaleString()}
                          </p>
                        )
                       
                        }
                      </div>
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <span className="text-lg font-medium text-gray-900">${deuda.monto.toLocaleString()}</span>
                        {getStatusBadge(deuda.estado)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {deudasPagadas.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No hay historial de pagos para mostrar.</div>
                ) : (
                  [...deudasPagadas, ...deudasPendientes].map((deuda) => (  //  Combinar ambas listas ya que antes solo se mostrababan los pagos de las deudas pagadas
                    <div
                      key={deuda.id_deuda}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeColor(deuda.id_tipo)}`}
                          >
                            {tiposPago[deuda.id_tipo] || "Otro"}
                          </span>
                          <h3 className="text-lg font-medium text-gray-900">{getConcepto(deuda)}</h3>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">Vencimiento: {formatDate(deuda.fecha_vencimiento)}</p>
                          {deuda.pagos && deuda.pagos.length > 0 && (
                            <div className="text-sm text-gray-600">
                              <p>Pagos realizados:</p>
                              <ul className="ml-4 list-disc">
                                {deuda.pagos.map((pago) => (
                                  <li key={pago.id_pago}>
                                    ${pago.monto.toLocaleString()} - {formatDate(pago.fecha)}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <span className="text-lg font-medium text-gray-900">${deuda.monto.toLocaleString()}</span>
                        {getStatusBadge(deuda.estado)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

