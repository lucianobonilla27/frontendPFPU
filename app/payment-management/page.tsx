"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Navbar from "../../components/navbar"
import {
  Search,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Plus,
  Send,
  Pencil,
  Trash2,
  X,
  Loader2,
} from "lucide-react"

// Interfaces para los tipos de datos
interface Alumno {
  id_usuario: number
  nombre: string
  apellido: string
  dni: number
  correo: string
  curso?: {
    id_curso: number
    division: string
    id_anio: number
    anio: string
  }
}

interface TipoPago {
  id_tipo: number
  tipo: string
}

interface Pago {
  id_pago: number
  monto: number
  fecha: string
  id_tipo: number
  estado: string
  id_alumno: number
  tipo_pago?: TipoPago
  alumno?: Alumno
}

// Componente Modal reutilizable
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

// Componente para el formulario de pago
const PaymentForm = ({
  isEditing,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  alumnos,
  tiposPago,
  fetchingAlumnos,
  fetchingTiposPago,
}) => {
  const [formValues, setFormValues] = useState(initialValues)
  const [dateError, setDateError] = useState("")
  const conceptoInputRef = useRef(null)

  // Enfocar el input cuando el componente se monta
  useEffect(() => {
    if (conceptoInputRef.current) {
      conceptoInputRef.current.focus()
    }
  }, [])

  // Actualizar valores cuando cambian los initialValues
  useEffect(() => {
    setFormValues(initialValues)
  }, [initialValues])

  // Determinar qué estados están permitidos según la fecha
  const getAvailableStates = () => {
    if (!formValues.fecha) return ["Pendiente", "Pagado", "Vencido"]

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const fechaVencimiento = new Date(formValues.fecha)
    fechaVencimiento.setHours(0, 0, 0, 0)

    // Si la fecha es pasada (anterior a hoy)
    if (fechaVencimiento < today) {
      return ["Pagado", "Vencido"]
    }

    // Si la fecha es hoy
    if (fechaVencimiento.getTime() === today.getTime()) {
      return ["Pagado", "Pendiente"]
    }

    // Si la fecha es futura
    return ["Pagado", "Pendiente"]
  }

  // Verificar si el estado actual es válido para la fecha seleccionada
  useEffect(() => {
    const availableStates = getAvailableStates()

    // Si el estado actual no está en los estados disponibles, cambiarlo al primer estado disponible
    if (formValues.estado && !availableStates.includes(formValues.estado)) {
      setFormValues((prev) => ({
        ...prev,
        estado: availableStates[0],
      }))
    }
  }, [formValues.estado, getAvailableStates]) // Removed formValues.fecha from dependencies

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === "fecha") {
      setDateError("")
    }

    setFormValues((prev) => ({
      ...prev,
      [name]: name === "monto" || name === "id_tipo" || name === "id_alumno" ? Number(value) : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validación final antes de enviar
    const availableStates = getAvailableStates()
    if (!availableStates.includes(formValues.estado)) {
      setDateError(`Para la fecha seleccionada, el estado solo puede ser: ${availableStates.join(" o ")}`)
      return
    }

    onSubmit(formValues)
  }

  // Obtener los estados disponibles para mostrar en el select
  const availableStates = getAvailableStates()

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">{isEditing ? "Editar Pago" : "Registrar Pago"}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Alumno</label>
          <select
            name="id_alumno"
            value={formValues.id_alumno || ""}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
            disabled={isSubmitting || isEditing}
          >
            <option value="">Seleccionar alumno...</option>
            {fetchingAlumnos ? (
              <option disabled>Cargando alumnos...</option>
            ) : (
              alumnos.map((alumno) => (
                <option key={alumno.id_usuario} value={alumno.id_usuario}>
                  {alumno.nombre} {alumno.apellido} - {alumno.dni}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de Pago</label>
          <select
            name="id_tipo"
            value={formValues.id_tipo || ""}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
            disabled={isSubmitting}
          >
            <option value="">Seleccionar tipo...</option>
            {fetchingTiposPago ? (
              <option disabled>Cargando tipos de pago...</option>
            ) : (
              tiposPago.map((tipo) => (
                <option key={tipo.id_tipo} value={tipo.id_tipo}>
                  {tipo.tipo}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Monto</label>
          <input
            type="number"
            name="monto"
            value={formValues.monto || ""}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
            disabled={isSubmitting}
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha de Vencimiento</label>
          <input
            type="date"
            name="fecha"
            value={formValues.fecha ? formValues.fecha.split("T")[0] : ""}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border ${dateError ? "border-red-300" : "border-gray-300"} px-3 py-2`}
            required
            disabled={isSubmitting}
          />
          {dateError && <p className="mt-1 text-sm text-red-600">{dateError}</p>}
          <p className="mt-1 text-xs text-gray-500">La fecha determina los estados disponibles para el pago.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Estado</label>
          <select
            name="estado"
            value={formValues.estado || ""}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
            disabled={isSubmitting}
          >
            <option value="">Seleccionar estado...</option>
            {availableStates.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            {formValues.fecha && (
              <>
                {new Date(formValues.fecha) < new Date()
                  ? "Fecha pasada: solo puede estar Vencido o Pagado"
                  : new Date(formValues.fecha).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)
                    ? "Fecha actual: puede estar Pendiente o Pagado"
                    : "Fecha futura: puede estar Pendiente o Pagado"}
              </>
            )}
          </p>
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

// Componente para el formulario de tipo de pago
const PaymentTypeForm = ({ isEditing, initialValues, onSubmit, onCancel, isSubmitting }) => {
  const [formValues, setFormValues] = useState(initialValues)
  const tipoInputRef = useRef(null)

  // Enfocar el input cuando el componente se monta
  useEffect(() => {
    if (tipoInputRef.current) {
      tipoInputRef.current.focus()
    }
  }, [])

  // Actualizar valores cuando cambian los initialValues
  useEffect(() => {
    setFormValues(initialValues)
  }, [initialValues])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formValues)
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">{isEditing ? "Editar Tipo de Pago" : "Nuevo Tipo de Pago"}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre del Tipo</label>
          <input
            ref={tipoInputRef}
            type="text"
            name="tipo"
            value={formValues.tipo || ""}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
            disabled={isSubmitting}
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
const DeleteConfirmation = ({ item, itemType, onConfirm, onCancel, isSubmitting }) => {
  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        <AlertCircle className="w-6 h-6 text-red-600" />
        <h2 className="text-xl font-bold">Confirmar Eliminación</h2>
      </div>
      <p className="text-gray-600 mb-6">
        ¿Estás seguro de que deseas eliminar{" "}
        {itemType === "payment" ? `el pago de $${item.monto}` : `el tipo de pago "${item.tipo}"`}? Esta acción no se
        puede deshacer.
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

export default function PaymentManagement() {
  // Estados para la gestión de pagos
  const [pagos, setPagos] = useState<Pago[]>([])
  const [tiposPago, setTiposPago] = useState<TipoPago[]>([])
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [pagosPorAlumno, setPagosPorAlumno] = useState<{ [key: number]: Pago[] }>({})

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedType, setSelectedType] = useState("all")

  // Estados para modales
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showPaymentTypeModal, setShowPaymentTypeModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showNotifyModal, setShowNotifyModal] = useState(false)

  // Estados para edición y eliminación
  const [editingPayment, setEditingPayment] = useState<Pago | null>(null)
  const [editingPaymentType, setEditingPaymentType] = useState<TipoPago | null>(null)
  const [itemToDelete, setItemToDelete] = useState<any>(null)
  const [deleteType, setDeleteType] = useState<"payment" | "paymentType">("payment")

  // Estados para mensajes y carga
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchingAlumnos, setFetchingAlumnos] = useState(true)
  const [fetchingTiposPago, setFetchingTiposPago] = useState(true)

  // Estado para el alumno seleccionado
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null)

  // Función para formatear fechas correctamente
  const formatDate = (dateString: string) => {
    if (!dateString) return ""

    // Dividir la fecha en partes (asumiendo formato YYYY-MM-DD)
    const parts = dateString.split("T")[0].split("-")
    if (parts.length !== 3) return dateString

    // Crear fecha usando UTC para evitar problemas de zona horaria
    const year = Number.parseInt(parts[0])
    const month = Number.parseInt(parts[1]) - 1 // Los meses en JS son 0-11
    const day = Number.parseInt(parts[2])

    return new Date(year, month, day).toLocaleDateString()
  }

  // Valores iniciales para nuevos pagos y tipos de pago
  const initialPayment: Pago = {
    id_pago: 0,
    monto: 0,
    fecha: new Date().toISOString().split("T")[0],
    id_tipo: 0,
    estado: "Pendiente",
    id_alumno: 0,
  }

  const initialPaymentType: TipoPago = {
    id_tipo: 0,
    tipo: "",
  }

  // Función para hacer peticiones a la API
  const makeRequest = useCallback(async (method: string, url: string, data: any = null): Promise<any> => {
    try {
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      }

      if (data) {
        options.body = JSON.stringify(data)
      }

      const response = await fetch(url, options)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Verificar si la respuesta es JSON o texto
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        return await response.json()
      } else {
        const text = await response.text()
        return { message: text, success: true }
      }
    } catch (error) {
      console.error("Error in makeRequest:", error)
      throw error
    }
  }, [])

  // Cargar todos los pagos
  const fetchPagos = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await makeRequest("GET", "https://localhost:7213/GetAllPago")
      setPagos(data)

      // Organizar pagos por alumno
      const pagosPorAlumnoObj: { [key: number]: Pago[] } = {}
      for (const pago of data) {
        if (!pagosPorAlumnoObj[pago.id_alumno]) {
          pagosPorAlumnoObj[pago.id_alumno] = []
        }
        pagosPorAlumnoObj[pago.id_alumno].push(pago)
      }
      setPagosPorAlumno(pagosPorAlumnoObj)
    } catch (error) {
      console.error("Error fetching pagos:", error)
      setErrorMessage("No se pudieron cargar los pagos. Por favor, intenta de nuevo más tarde.")
    } finally {
      setIsLoading(false)
    }
  }, [makeRequest])

  // Función para verificar y actualizar pagos vencidos
  const checkAndUpdateOverduePagos = useCallback(async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Normalizar a inicio del día

      const pagosToUpdate = pagos.filter((pago) => {
        // Solo verificar pagos pendientes
        if (pago.estado !== "Pendiente") return false

        // Convertir fecha de vencimiento a objeto Date
        const fechaVencimiento = new Date(pago.fecha)
        fechaVencimiento.setHours(0, 0, 0, 0)

        // Verificar si la fecha de vencimiento ya pasó (es anterior a hoy)
        return fechaVencimiento < today
      })

      // Actualizar pagos vencidos
      for (const pago of pagosToUpdate) {
        const updatedPago = { ...pago, estado: "Vencido" }
        await makeRequest("PUT", "https://localhost:7213/UpdatePago", updatedPago)
      }

      // Si se actualizó algún pago, recargar la lista
      if (pagosToUpdate.length > 0) {
        await fetchPagos()
      }
    } catch (error) {
      console.error("Error checking overdue pagos:", error)
    }
  }, [pagos, makeRequest, fetchPagos])

  // Cargar todos los tipos de pago
  const fetchTiposPago = useCallback(async () => {
    try {
      setFetchingTiposPago(true)
      const data = await makeRequest("GET", "https://localhost:7213/GetAllTipoPago")
      setTiposPago(data)
    } catch (error) {
      console.error("Error fetching tipos de pago:", error)
      setErrorMessage("No se pudieron cargar los tipos de pago. Por favor, intenta de nuevo más tarde.")
    } finally {
      setFetchingTiposPago(false)
    }
  }, [makeRequest])

  // Cargar todos los alumnos
  const fetchAlumnos = useCallback(async () => {
    try {
      setFetchingAlumnos(true)
      const data = await makeRequest("GET", "https://localhost:7213/GetAlumnos")
      setAlumnos(data)
    } catch (error) {
      console.error("Error fetching alumnos:", error)
      setErrorMessage("No se pudieron cargar los alumnos. Por favor, intenta de nuevo más tarde.")
    } finally {
      setFetchingAlumnos(false)
    }
  }, [makeRequest])

  // Cargar datos iniciales
  useEffect(() => {
    fetchPagos()
    fetchTiposPago()
    fetchAlumnos()
  }, [fetchPagos, fetchTiposPago, fetchAlumnos])

  // Verificar pagos vencidos cuando se cargan los pagos
  useEffect(() => {
    if (pagos.length > 0) {
      checkAndUpdateOverduePagos()
    }
  }, [pagos.length, checkAndUpdateOverduePagos])

  // Función para crear un nuevo pago
  const createPago = async (pagoData: Pago) => {
    try {
      setIsSubmitting(true)
      await makeRequest("POST", "https://localhost:7213/AddPago", pagoData)

      // Recargar la lista de pagos
      await fetchPagos()

      // Mostrar mensaje de éxito
      setSuccessMessage("Pago registrado correctamente")
      setTimeout(() => setSuccessMessage(""), 3000)

      // Cerrar el modal
      setShowPaymentModal(false)
      setEditingPayment(null)
    } catch (error) {
      console.error("Error creating pago:", error)
      setErrorMessage("No se pudo registrar el pago. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para actualizar un pago existente
  const updatePago = async (pagoData: Pago) => {
    try {
      setIsSubmitting(true)
      await makeRequest("PUT", "https://localhost:7213/UpdatePago", pagoData)

      // Recargar la lista de pagos
      await fetchPagos()

      // Mostrar mensaje de éxito
      setSuccessMessage("Pago actualizado correctamente")
      setTimeout(() => setSuccessMessage(""), 3000)

      // Cerrar el modal
      setShowPaymentModal(false)
      setEditingPayment(null)
    } catch (error) {
      console.error("Error updating pago:", error)
      setErrorMessage("No se pudo actualizar el pago. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para eliminar un pago
  const deletePago = async () => {
    if (!itemToDelete) return

    try {
      setIsSubmitting(true)
      await makeRequest("DELETE", `https://localhost:7213/DeletePago/${itemToDelete.id_pago}`)

      // Recargar la lista de pagos
      await fetchPagos()

      // Mostrar mensaje de éxito
      setSuccessMessage("Pago eliminado correctamente")
      setTimeout(() => setSuccessMessage(""), 3000)

      // Cerrar el modal
      setShowDeleteModal(false)
      setItemToDelete(null)
    } catch (error) {
      console.error("Error deleting pago:", error)
      setErrorMessage("No se pudo eliminar el pago. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para crear un nuevo tipo de pago
  const createTipoPago = async (tipoData: TipoPago) => {
    try {
      setIsSubmitting(true)
      await makeRequest("POST", "https://localhost:7213/AddTipoPago", tipoData)

      // Recargar la lista de tipos de pago
      await fetchTiposPago()

      // Mostrar mensaje de éxito
      setSuccessMessage("Tipo de pago creado correctamente")
      setTimeout(() => setSuccessMessage(""), 3000)

      // Cerrar el modal
      setShowPaymentTypeModal(false)
      setEditingPaymentType(null)
    } catch (error) {
      console.error("Error creating tipo pago:", error)
      setErrorMessage("No se pudo crear el tipo de pago. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para actualizar un tipo de pago existente
  const updateTipoPago = async (tipoData: TipoPago) => {
    try {
      setIsSubmitting(true)
      await makeRequest("PUT", "https://localhost:7213/PutTipoPago", tipoData)

      // Recargar la lista de tipos de pago
      await fetchTiposPago()

      // Mostrar mensaje de éxito
      setSuccessMessage("Tipo de pago actualizado correctamente")
      setTimeout(() => setSuccessMessage(""), 3000)

      // Cerrar el modal
      setShowPaymentTypeModal(false)
      setEditingPaymentType(null)
    } catch (error) {
      console.error("Error updating tipo pago:", error)
      setErrorMessage("No se pudo actualizar el tipo de pago. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para eliminar un tipo de pago
  const deleteTipoPago = async () => {
    if (!itemToDelete) return

    try {
      setIsSubmitting(true)
      await makeRequest("DELETE", `https://localhost:7213/DeleteTipoPago/${itemToDelete.id_tipo}`)

      // Recargar la lista de tipos de pago
      await fetchTiposPago()

      // Mostrar mensaje de éxito
      setSuccessMessage("Tipo de pago eliminado correctamente")
      setTimeout(() => setSuccessMessage(""), 3000)

      // Cerrar el modal
      setShowDeleteModal(false)
      setItemToDelete(null)
    } catch (error) {
      console.error("Error deleting tipo pago:", error)
      setErrorMessage("No se pudo eliminar el tipo de pago. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para manejar el envío del formulario de pago
  const handlePaymentSubmit = (formData: Pago) => {
    // Verificar si el estado es válido para la fecha seleccionada
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const fechaVencimiento = new Date(formData.fecha)
    fechaVencimiento.setHours(0, 0, 0, 0)

    let estadoValido = true

    // Si la fecha es pasada (anterior a hoy)
    if (fechaVencimiento < today) {
      if (formData.estado === "Pendiente") {
        estadoValido = false
      }
    }
    // Si la fecha es hoy o futura
    else {
      if (formData.estado === "Vencido") {
        estadoValido = false
      }
    }

    if (!estadoValido) {
      setErrorMessage("El estado seleccionado no es válido para la fecha de vencimiento")
      setTimeout(() => setErrorMessage(""), 5000)
      return
    }

    if (editingPayment) {
      updatePago({
        ...formData,
        id_pago: editingPayment.id_pago,
      })
    } else {
      createPago(formData)
    }
  }

  // Función para manejar el envío del formulario de tipo de pago
  const handlePaymentTypeSubmit = (formData: TipoPago) => {
    if (editingPaymentType) {
      updateTipoPago({
        ...formData,
        id_tipo: editingPaymentType.id_tipo,
      })
    } else {
      createTipoPago(formData)
    }
  }

  // Función para manejar la eliminación
  const handleDelete = () => {
    if (deleteType === "payment") {
      deletePago()
    } else {
      deleteTipoPago()
    }
  }

  // Función para notificar pagos vencidos
  const handleNotifyLatePayments = async () => {
    try {
      setIsSubmitting(true)

      // Obtener todos los alumnos con pagos vencidos
      const alumnosConPagosVencidos = new Set()

      // Recopilar información de pagos vencidos por alumno
      const pagosPorAlumnoVencidos = {}

      Object.entries(pagosPorAlumno).forEach(([idAlumno, pagosAlumno]) => {
        const pagosVencidos = pagosAlumno.filter((pago) => pago.estado === "Vencido")

        if (pagosVencidos.length > 0) {
          alumnosConPagosVencidos.add(Number(idAlumno))
          pagosPorAlumnoVencidos[idAlumno] = pagosVencidos
        }
      })

      // Si no hay alumnos con pagos vencidos, mostrar mensaje y salir
      if (alumnosConPagosVencidos.size === 0) {
        setSuccessMessage("No hay alumnos con pagos vencidos para notificar")
        setShowNotifyModal(false)
        setTimeout(() => setSuccessMessage(""), 3000)
        return
      }

      // Preparar los datos para enviar correos
      const alumnosData = Array.from(alumnosConPagosVencidos).map((idAlumno) => {
        const alumno = alumnos.find((a) => a.id_usuario === Number(idAlumno))
        const pagosVencidos = pagosPorAlumnoVencidos[idAlumno]

        return {
          id_alumno: idAlumno,
          nombre: alumno ? `${alumno.nombre} ${alumno.apellido}` : "Alumno",
          correo: alumno ? alumno.correo : "",
          pagos: pagosVencidos.map((pago) => ({
            id_pago: pago.id_pago,
            monto: pago.monto,
            fecha: pago.fecha,
            tipo: getTipoPagoName(pago.id_tipo),
          })),
        }
      })

      console.log("Enviando notificaciones a los siguientes alumnos:", alumnosData)

      // Aquí iría la lógica para enviar correos electrónicos
      // Simulamos el envío con un tiempo de espera
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mostrar detalles de los correos enviados
      const correosEnviados = alumnosData.filter((a) => a.correo).length
      const alumnosSinCorreo = alumnosData.filter((a) => !a.correo).length

      let mensaje = `Se han enviado ${correosEnviados} notificaciones correctamente`
      if (alumnosSinCorreo > 0) {
        mensaje += `. ${alumnosSinCorreo} alumnos no tienen correo registrado.`
      }

      setSuccessMessage(mensaje)
      setShowNotifyModal(false)
      setTimeout(() => setSuccessMessage(""), 5000)
    } catch (error) {
      console.error("Error al enviar notificaciones:", error)
      setErrorMessage("Error al enviar las notificaciones: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para obtener el nombre del tipo de pago
  const getTipoPagoName = (id_tipo: number) => {
    const tipo = tiposPago.find((t) => t.id_tipo === id_tipo)
    return tipo ? tipo.tipo : "Desconocido"
  }

  // Función para obtener el nombre completo del alumno
  const getAlumnoName = (id_alumno: number) => {
    const alumno = alumnos.find((a) => a.id_usuario === id_alumno)
    return alumno ? `${alumno.nombre} ${alumno.apellido}` : "Desconocido"
  }

  // Función para obtener el color del badge según el estado
  const getStatusBadgeColor = (estado: string) => {
    switch (estado) {
      case "Pagado":
        return "bg-green-100 text-green-800"
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "Vencido":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Función para obtener el icono del badge según el estado
  const getStatusBadgeIcon = (estado: string) => {
    switch (estado) {
      case "Pagado":
        return <CheckCircle className="w-4 h-4 mr-1" />
      case "Pendiente":
        return <Clock className="w-4 h-4 mr-1" />
      case "Vencido":
        return <AlertCircle className="w-4 h-4 mr-1" />
      default:
        return null
    }
  }

  // Filtrar alumnos según el término de búsqueda
  const filteredAlumnos = alumnos.filter((alumno) => {
    const fullName = `${alumno.nombre} ${alumno.apellido}`.toLowerCase()
    const dni = alumno.dni.toString()

    return fullName.includes(searchTerm.toLowerCase()) || dni.includes(searchTerm)
  })

  // Contar pagos vencidos
  const countVencidos = pagos.filter((pago) => pago.estado === "Vencido").length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {errorMessage}
              <button onClick={() => setErrorMessage("")} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Pagos</h1>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowPaymentTypeModal(true)}
                  className="flex items-center px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Tipo de Pago
                </button>
                <button
                  onClick={() => {
                    console.log("Abriendo modal de notificación")
                    setShowNotifyModal(true)
                  }}
                  className="flex items-center px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Notificar Morosos ({countVencidos})
                </button>
                <button
                  onClick={() => {
                    setEditingPayment(null)
                    setSelectedAlumno(null)
                    setShowPaymentModal(true)
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
                  <option value="Pagado">Pagados</option>
                  <option value="Pendiente">Pendientes</option>
                  <option value="Vencido">Vencidos</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="all">Todos los tipos</option>
                  {tiposPago.map((tipo) => (
                    <option key={tipo.id_tipo} value={tipo.id_tipo}>
                      {tipo.tipo}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Estado de carga */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="ml-2 text-gray-600">Cargando pagos...</span>
              </div>
            ) : (
              /* Lista de tipos de pago */
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Tipos de Pago</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tiposPago.map((tipo) => (
                        <tr key={tipo.id_tipo}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{tipo.id_tipo}</td>
                          <td className="px-4 py-2 whitespace-text-gray-900">{tipo.tipo}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setEditingPaymentType(tipo)
                                  setShowPaymentTypeModal(true)
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setItemToDelete(tipo)
                                  setDeleteType("paymentType")
                                  setShowDeleteModal(true)
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Lista de alumnos y pagos */}
            {!isLoading && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Pagos por Alumno</h2>

                {filteredAlumnos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron alumnos que coincidan con la búsqueda.
                  </div>
                ) : (
                  filteredAlumnos
                    .map((alumno) => {
                      const alumnoPayments = pagosPorAlumno[alumno.id_usuario] || []

                      // Filtrar pagos según los filtros seleccionados
                      const filteredPayments = alumnoPayments.filter((pago) => {
                        const matchesStatus = selectedStatus === "all" || pago.estado === selectedStatus
                        const matchesType = selectedType === "all" || pago.id_tipo.toString() === selectedType
                        return matchesStatus && matchesType
                      })

                      // Si no hay pagos que coincidan con los filtros, no mostrar este alumno
                      if (filteredPayments.length === 0 && (selectedStatus !== "all" || selectedType !== "all")) {
                        return null
                      }

                      return (
                        <div key={alumno.id_usuario} className="border rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {alumno.nombre} {alumno.apellido}
                              </h3>
                              <p className="text-sm text-gray-600">DNI: {alumno.dni}</p>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedAlumno(alumno)
                                setEditingPayment(null)
                                setShowPaymentModal(true)
                              }}
                              className="mt-2 sm:mt-0 flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Nuevo Pago
                            </button>
                          </div>

                          {filteredPayments.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                              No hay pagos registrados para este alumno.
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Tipo
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Monto
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Vencimiento
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Estado
                                    </th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                      Acciones
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {filteredPayments.map((pago) => (
                                    <tr key={pago.id_pago}>
                                      <td className="px-4 py-2">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          {getTipoPagoName(pago.id_tipo)}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-900">
                                        ${pago.monto.toLocaleString()}
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-900">{formatDate(pago.fecha)}</td>
                                      <td className="px-4 py-2">
                                        <span
                                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(pago.estado)}`}
                                        >
                                          {getStatusBadgeIcon(pago.estado)}
                                          {pago.estado}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 text-right">
                                        <div className="flex justify-end space-x-2">
                                          <button
                                            onClick={() => {
                                              setEditingPayment(pago)
                                              setSelectedAlumno(alumno)
                                              setShowPaymentModal(true)
                                            }}
                                            className="text-blue-600 hover:text-blue-900"
                                          >
                                            <Pencil className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              setItemToDelete(pago)
                                              setDeleteType("payment")
                                              setShowDeleteModal(true)
                                            }}
                                            className="text-red-600 hover:text-red-900"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                          {pago.estado === "Pagado" && (
                                            <button
                                              className="text-blue-600 hover:text-blue-800"
                                              onClick={() => {
                                                /* Lógica para descargar comprobante */
                                                alert("Descargando comprobante...")
                                              }}
                                            >
                                              <Download className="w-4 h-4" />
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )
                    })
                    .filter(Boolean) // Filtrar los elementos null
                )}

                {filteredAlumnos.length > 0 &&
                  filteredAlumnos.every((alumno) => {
                    const alumnoPayments = pagosPorAlumno[alumno.id_usuario] || []
                    const filteredPayments = alumnoPayments.filter((pago) => {
                      const matchesStatus = selectedStatus === "all" || pago.estado === selectedStatus
                      const matchesType = selectedType === "all" || pago.id_tipo.toString() === selectedType
                      return matchesStatus && matchesType
                    })
                    return filteredPayments.length === 0
                  }) &&
                  (selectedStatus !== "all" || selectedType !== "all") && (
                    <div className="text-center py-8 text-gray-500">
                      No hay pagos que coincidan con los filtros seleccionados.
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Modal de registro/edición de pago */}
          <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
            <PaymentForm
              isEditing={!!editingPayment}
              initialValues={
                editingPayment
                  ? {
                      ...editingPayment,
                      id_alumno: selectedAlumno ? selectedAlumno.id_usuario : editingPayment.id_alumno,
                    }
                  : {
                      ...initialPayment,
                      id_alumno: selectedAlumno ? selectedAlumno.id_usuario : 0,
                    }
              }
              onSubmit={handlePaymentSubmit}
              onCancel={() => setShowPaymentModal(false)}
              isSubmitting={isSubmitting}
              alumnos={alumnos}
              tiposPago={tiposPago}
              fetchingAlumnos={fetchingAlumnos}
              fetchingTiposPago={fetchingTiposPago}
            />
          </Modal>

          {/* Modal de registro/edición de tipo de pago */}
          <Modal isOpen={showPaymentTypeModal} onClose={() => setShowPaymentTypeModal(false)}>
            <PaymentTypeForm
              isEditing={!!editingPaymentType}
              initialValues={editingPaymentType || initialPaymentType}
              onSubmit={handlePaymentTypeSubmit}
              onCancel={() => setShowPaymentTypeModal(false)}
              isSubmitting={isSubmitting}
            />
          </Modal>

          {/* Modal de confirmación de eliminación */}
          <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
            <DeleteConfirmation
              item={itemToDelete}
              itemType={deleteType}
              onConfirm={handleDelete}
              onCancel={() => setShowDeleteModal(false)}
              isSubmitting={isSubmitting}
            />
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
                  <div>
                    <p className="text-sm text-yellow-700">Hay {countVencidos} pagos vencidos en el sistema.</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      {
                        Object.entries(pagosPorAlumno).filter(([_, pagos]) =>
                          pagos.some((pago) => pago.estado === "Vencido"),
                        ).length
                      }{" "}
                      alumnos tienen pagos vencidos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6 max-h-60 overflow-y-auto border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Alumno</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Pagos Vencidos
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(pagosPorAlumno)
                      .filter(([_, pagos]) => pagos.some((pago) => pago.estado === "Vencido"))
                      .map(([idAlumno, pagos]) => {
                        const alumno = alumnos.find((a) => a.id_usuario === Number(idAlumno))
                        const pagosVencidos = pagos.filter((pago) => pago.estado === "Vencido")
                        const totalVencido = pagosVencidos.reduce((sum, pago) => sum + pago.monto, 0)

                        return (
                          <tr key={idAlumno}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              {alumno ? `${alumno.nombre} ${alumno.apellido}` : "Alumno desconocido"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{pagosVencidos.length}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">${totalVencido.toLocaleString()}</td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowNotifyModal(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleNotifyLatePayments}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={isSubmitting || countVencidos === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Notificaciones
                    </>
                  )}
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  )
}

