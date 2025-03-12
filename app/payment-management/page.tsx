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
  CreditCard,
} from "lucide-react"

// Interfaces for data types
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

interface Deuda {
  id_deuda: number
  fecha_vencimiento: string
  id_alumno: number
  estado: string
  monto: number
  id_tipo: number
  alumno?: Alumno
  tipo_pago?: TipoPago
}

interface Pago {
  id_pago: number
  id_alumno: number
  fecha: string
  monto: number
  id_deuda: number
  alumno?: Alumno
}

// Reusable Modal component
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

// Debt form component
const DebtForm = ({
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
  const montoInputRef = useRef(null)

  // Focus input when component mounts
  useEffect(() => {
    if (montoInputRef.current) {
      montoInputRef.current.focus()
    }
  }, [])

  // Update values when initialValues change
  useEffect(() => {
    setFormValues(initialValues)
  }, [initialValues])

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === "fecha_vencimiento") {
      setDateError("")
    }

    setFormValues((prev) => ({
      ...prev,
      [name]: name === "monto" || name === "id_alumno" || name === "id_tipo" ? Number(value) : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    onSubmit(formValues)
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">{isEditing ? "Editar Deuda" : "Registrar Deuda"}</h2>
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
          <label className="block text-sm font-medium text-gray-700">Tipo de Deuda</label>
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
              <option disabled>Cargando tipos de deuda...</option>
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
            ref={montoInputRef}
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
            name="fecha_vencimiento"
            value={formValues.fecha_vencimiento ? formValues.fecha_vencimiento.split("T")[0] : ""}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border ${dateError ? "border-red-300" : "border-gray-300"} px-3 py-2`}
            required
            disabled={isSubmitting}
          />
          {dateError && <p className="mt-1 text-sm text-red-600">{dateError}</p>}
          <p className="mt-1 text-xs text-gray-500">La fecha determina los estados disponibles para la deuda.</p>
        </div>

        <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
          <p className="text-sm text-blue-700">
            <strong>Nota:</strong> El estado de la deuda se actualiza automáticamente por el sistema cuando:
          </p>
          <ul className="text-sm text-blue-700 list-disc pl-5 mt-1">
            <li>Se vence la fecha de pago (cambia a "Vencido")</li>
            <li>Se completa el pago total (cambia a "Pagado")</li>
          </ul>
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

// Payment form component
const PaymentForm = ({
  isEditing,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  deuda,
  pagosPorDeuda,
  calculateTotalPagos,
  calculateRemainingDebt,
}) => {
  const [formValues, setFormValues] = useState(initialValues)
  const montoInputRef = useRef(null)

  // Get payments for this debt
  const pagosDeuda = deuda ? pagosPorDeuda[deuda.id_deuda] || [] : []
  const totalPagado = deuda ? calculateTotalPagos(deuda.id_deuda) : 0


  // Focus input when component mounts
  useEffect(() => {
    if (montoInputRef.current) {
      montoInputRef.current.focus()
    }
  }, [])

  // Update values when initialValues change
  useEffect(() => {
    setFormValues(initialValues)
  }, [initialValues])

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setFormValues((prev) => ({
      ...prev,
      [name]: name === "monto" ? Number(value) : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formValues)
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">{isEditing ? "Editar Pago" : "Registrar Pago"}</h2>

      {deuda && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-medium text-blue-800">Detalles de la deuda</h3>
          <p className="text-sm text-blue-700">Monto total: ${deuda.monto.toLocaleString()}</p>
          <p className="text-sm text-blue-700">Pagado hasta ahora: ${totalPagado.toLocaleString()}</p>
         
          <p className="text-sm text-blue-700">Vencimiento: {new Date(deuda.fecha_vencimiento).toLocaleDateString()}</p>
        </div>
      )}

      {deuda && pagosDeuda.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium text-gray-700 mb-2">Historial de pagos</h3>
          <div className="max-h-40 overflow-y-auto border rounded p-2">
            {pagosDeuda.map((pago, index) => (
              <div key={pago.id_pago} className={`${index > 0 ? "border-t border-gray-100 pt-2 mt-2" : ""} text-sm`}>
                <div className="flex justify-between">
                  <span>${pago.monto.toLocaleString()}</span>
                  <span className="text-gray-500">{formatDate(pago.fecha)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Monto</label>
          <input
            ref={montoInputRef}
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
          {deuda && (
            <p className="mt-1 text-xs text-blue-600">
              Puede pagar hasta ${deuda.monto.toLocaleString()} para completar esta deuda.
            </p>
          )}
          {deuda && deuda.monto === 0 && (
            <p className="mt-1 text-xs text-green-600">Esta deuda ya ha sido pagada en su totalidad.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha de Pago</label>
          <input
            type="date"
            name="fecha"
            value={formValues.fecha ? formValues.fecha.split("T")[0] : ""}
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

// Payment type form component
const PaymentTypeForm = ({ isEditing, initialValues, onSubmit, onCancel, isSubmitting }) => {
  const [formValues, setFormValues] = useState(initialValues)
  const tipoInputRef = useRef(null)

  // Focus input when component mounts
  useEffect(() => {
    if (tipoInputRef.current) {
      tipoInputRef.current.focus()
    }
  }, [])

  // Update values when initialValues change
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

// Delete confirmation component
const DeleteConfirmation = ({ item, itemType, onConfirm, onCancel, isSubmitting }) => {
  let itemDescription = ""

  switch (itemType) {
    case "payment":
      itemDescription = `el pago de $${item.monto}`
      break
    case "debt":
      itemDescription = `la deuda de $${item.monto}`
      break
    case "paymentType":
      itemDescription = `el tipo de pago "${item.tipo}"`
      break
  }

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        <AlertCircle className="w-6 h-6 text-red-600" />
        <h2 className="text-xl font-bold">Confirmar Eliminación</h2>
      </div>
      <p className="text-gray-600 mb-6">
        ¿Estás seguro de que deseas eliminar {itemDescription}? Esta acción no se puede deshacer.
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

// Function to format dates correctly
const formatDate = (dateString: string) => {
  if (!dateString) return ""

  // Split date into parts (assuming YYYY-MM-DD format)
  const parts = dateString.split("T")[0].split("-")
  if (parts.length !== 3) return dateString

  // Create date using UTC to avoid timezone issues
  const year = Number.parseInt(parts[0])
  const month = Number.parseInt(parts[1]) - 1 // Months in JS are 0-11
  const day = Number.parseInt(parts[2])

  return new Date(year, month, day).toLocaleDateString()
}

export default function PaymentManagement() {
  // States for debt and payment management
  const [deudas, setDeudas] = useState<Deuda[]>([])
  const [pagos, setPagos] = useState<Pago[]>([])
  const [tiposPago, setTiposPago] = useState<TipoPago[]>([])
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [deudasPorAlumno, setDeudasPorAlumno] = useState<{ [key: number]: Deuda[] }>({})
  const [pagosPorDeuda, setPagosPorDeuda] = useState<{ [key: number]: Pago[] }>({})

  // States for filters and search
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")

  // States for modals
  const [showDebtModal, setShowDebtModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showPaymentTypeModal, setShowPaymentTypeModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showNotifyModal, setShowNotifyModal] = useState(false)

  // States for editing and deleting
  const [editingDebt, setEditingDebt] = useState<Deuda | null>(null)
  const [editingPayment, setEditingPayment] = useState<Pago | null>(null)
  const [editingPaymentType, setEditingPaymentType] = useState<TipoPago | null>(null)
  const [itemToDelete, setItemToDelete] = useState<any>(null)
  const [deleteType, setDeleteType] = useState<"payment" | "debt" | "paymentType">("debt")
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState<Deuda | null>(null)

  // States for messages and loading
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchingAlumnos, setFetchingAlumnos] = useState(true)
  const [fetchingTiposPago, setFetchingTiposPago] = useState(true)

  // State for selected student
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null)

  // Initial values for new debts, payments, and payment types
  const initialDebt: Deuda = {
    id_deuda: 0,
    fecha_vencimiento: new Date().toISOString().split("T")[0],
    id_alumno: 0,
    estado: "Pendiente",
    monto: 0,
    id_tipo: 0,
  }

  const initialPayment: Pago = {
    id_pago: 0,
    id_alumno: 0,
    fecha: new Date().toISOString().split("T")[0],
    monto: 0,
    id_deuda: 0,
  }

  const initialPaymentType: TipoPago = {
    id_tipo: 0,
    tipo: "",
  }

  // Function to make API requests
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

      // Check if response is JSON or text
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

  // Load all debts
  const fetchDeudas = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await makeRequest("GET", "https://localhost:7213/GetAllDeuda")
      setDeudas(data)

      // Organize debts by student
      const deudasPorAlumnoObj: { [key: number]: Deuda[] } = {}
      for (const deuda of data) {
        if (!deudasPorAlumnoObj[deuda.id_alumno]) {
          deudasPorAlumnoObj[deuda.id_alumno] = []
        }
        deudasPorAlumnoObj[deuda.id_alumno].push(deuda)
      }
      setDeudasPorAlumno(deudasPorAlumnoObj)

      // Fetch payments for each debt
      await fetchPagosPorDeuda(data)
    } catch (error) {
      console.error("Error fetching deudas:", error)
      setErrorMessage("No se pudieron cargar las deudas. Por favor, intenta de nuevo más tarde.")
    } finally {
      setIsLoading(false)
    }
  }, [makeRequest])

  // Fetch payments for each debt
  const fetchPagosPorDeuda = useCallback(
    async (deudas: Deuda[]) => {
      try {
        const pagosPorDeudaObj: { [key: number]: Pago[] } = {}

        // Get all payments
        const allPagos = await makeRequest("GET", "https://localhost:7213/GetAllPago")

        // Group payments by debt ID
        for (const pago of allPagos) {
          if (!pagosPorDeudaObj[pago.id_deuda]) {
            pagosPorDeudaObj[pago.id_deuda] = []
          }
          pagosPorDeudaObj[pago.id_deuda].push(pago)
        }

        setPagosPorDeuda(pagosPorDeudaObj)
        setPagos(allPagos)
      } catch (error) {
        console.error("Error fetching payments by debt:", error)
      }
    },
    [makeRequest],
  )

  // Function to check and update overdue debts
  const checkAndUpdateOverdueDeudas = useCallback(async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Normalize to start of day

      const deudasToUpdate = deudas.filter((deuda) => {
        // Only check pending debts
        if (deuda.estado !== "Pendiente") return false

        // Convert due date to Date object
        const fechaVencimiento = new Date(deuda.fecha_vencimiento)
        fechaVencimiento.setHours(0, 0, 0, 0)

        // Check if due date has passed (is before today)
        return fechaVencimiento < today
      })

      // Update overdue debts
      for (const deuda of deudasToUpdate) {
        const updatedDeuda = { ...deuda, estado: "Vencido" }
        await makeRequest("PUT", "https://localhost:7213/UpdateDeuda", updatedDeuda)
      }

      // If any debt was updated, reload the list
      if (deudasToUpdate.length > 0) {
        await fetchDeudas()
      }
    } catch (error) {
      console.error("Error checking overdue deudas:", error)
    }
  }, [deudas, makeRequest, fetchDeudas])

  // Load all payment types
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

  // Load all students
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

  // Load initial data
  useEffect(() => {
    fetchDeudas()
    fetchTiposPago()
    fetchAlumnos()
  }, [fetchDeudas, fetchTiposPago, fetchAlumnos])

  // Check overdue debts when debts are loaded
  useEffect(() => {
    if (deudas.length > 0) {
      checkAndUpdateOverdueDeudas()
    }
  }, [deudas.length, checkAndUpdateOverdueDeudas])

  // Function to create a new debt
  const createDeuda = async (deudaData: Deuda) => {
    try {
      setIsSubmitting(true)
      await makeRequest("POST", "https://localhost:7213/AddDeuda", deudaData)

      // Reload debt list
      await fetchDeudas()

      // Show success message
      setSuccessMessage("Deuda registrada correctamente")
      setTimeout(() => setSuccessMessage(""), 3000)

      // Close modal
      setShowDebtModal(false)
      setEditingDebt(null)
    } catch (error) {
      console.error("Error creating deuda:", error)
      setErrorMessage("No se pudo registrar la deuda. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to update an existing debt
  const updateDeuda = async (deudaData: Deuda) => {
    try {
      setIsSubmitting(true)
      await makeRequest("PUT", "https://localhost:7213/UpdateDeuda", deudaData)

      // Reload debt list
      await fetchDeudas()

      // Show success message
      setSuccessMessage("Deuda actualizada correctamente")
      setTimeout(() => setSuccessMessage(""), 3000)

      // Close modal
      setShowDebtModal(false)
      setEditingDebt(null)
    } catch (error) {
      console.error("Error updating deuda:", error)
      setErrorMessage("No se pudo actualizar la deuda. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to delete a debt
  const deleteDeuda = async () => {
    if (!itemToDelete) return

    try {
      setIsSubmitting(true)
      await makeRequest("DELETE", `https://localhost:7213/DeleteDeuda/${itemToDelete.id_deuda}`)

      // Reload debt list
      await fetchDeudas()

      // Show success message
      setSuccessMessage("Deuda eliminada correctamente")
      setTimeout(() => setSuccessMessage(""), 3000)

      // Close modal
      setShowDeleteModal(false)
      setItemToDelete(null)
    } catch (error) {
      console.error("Error deleting deuda:", error)
      setErrorMessage("No se pudo eliminar la deuda. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to create a new payment
  const createPago = async (pagoData: Pago) => {
    try {
      setIsSubmitting(true)

      // Make sure payment has correct student ID
      if (selectedDebtForPayment) {
        pagoData.id_alumno = selectedDebtForPayment.id_alumno
        pagoData.id_deuda = selectedDebtForPayment.id_deuda
      }

      // Create payment
      await makeRequest("POST", "https://localhost:7213/AddPago", pagoData)

      // Reload debt and payment lists
      await fetchDeudas()

      // Check if the debt is now fully paid and update status if needed
      if (selectedDebtForPayment) {
        await updateDebtStatus(selectedDebtForPayment)
      }

      // Show success message
      setSuccessMessage("Pago registrado correctamente")
      setTimeout(() => setSuccessMessage(""), 3000)

      // Close modal
      setShowPaymentModal(false)
      setEditingPayment(null)
      setSelectedDebtForPayment(null)
    } catch (error) {
      console.error("Error creating pago:", error)
      setErrorMessage("No se pudo registrar el pago. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to update an existing payment
  const updatePago = async (pagoData: Pago) => {
    try {
      setIsSubmitting(true)
      await makeRequest("PUT", "https://localhost:7213/UpdatePago", pagoData)

      // Reload payment list
      await fetchDeudas() // Also reload debts in case there are changes in the relationship

      // Find the debt associated with this payment and check if it's fully paid
      const debtForPayment = deudas.find((d) => d.id_deuda === pagoData.id_deuda)
      if (debtForPayment) {
        await updateDebtStatus(debtForPayment)
      }

      // Show success message
      setSuccessMessage("Pago actualizado correctamente")
      setTimeout(() => setSuccessMessage(""), 3000)

      // Close modal
      setShowPaymentModal(false)
      setEditingPayment(null)
    } catch (error) {
      console.error("Error updating pago:", error)
      setErrorMessage("No se pudo actualizar el pago. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to delete a payment
  const deletePago = async () => {
    if (!itemToDelete) return

    try {
      setIsSubmitting(true)

      // Store the debt ID before deleting the payment
      const debtId = itemToDelete.id_deuda

      // Delete payment
      await makeRequest("DELETE", `https://localhost:7213/DeletePago/${itemToDelete.id_pago}`)

      // Reload payment and debt lists
      await fetchDeudas()

      // Find the debt and update its status if needed
      const debtForPayment = deudas.find((d) => d.id_deuda === debtId)
      if (debtForPayment) {
        await updateDebtStatus(debtForPayment)
      }

      // Show success message
      setSuccessMessage("Pago eliminado correctamente")
      setTimeout(() => setSuccessMessage(""), 3000)

      // Close modal
      setShowDeleteModal(false)
      setItemToDelete(null)
    } catch (error) {
      console.error("Error deleting pago:", error)
      setErrorMessage("No se pudo eliminar el pago. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to create a new payment type
  const createTipoPago = async (tipoData: TipoPago) => {
    try {
      setIsSubmitting(true)
      await makeRequest("POST", "https://localhost:7213/AddTipoPago", tipoData)

      // Reload payment type list
      await fetchTiposPago()

      // Show success message
      setSuccessMessage("Tipo de pago creado correctamente")
      setTimeout(() => setSuccessMessage(""), 3000)

      // Close modal
      setShowPaymentTypeModal(false)
      setEditingPaymentType(null)
    } catch (error) {
      console.error("Error creating tipo pago:", error)
      setErrorMessage("No se pudo crear el tipo de pago. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to update an existing payment type
  const updateTipoPago = async (tipoData: TipoPago) => {
    try {
      setIsSubmitting(true)
      await makeRequest("PUT", "https://localhost:7213/PutTipoPago", tipoData)

      // Reload payment type list
      await fetchTiposPago()

      // Show success message
      setSuccessMessage("Tipo de pago actualizado correctamente")
      setTimeout(() => setSuccessMessage(""), 3000)

      // Close modal
      setShowPaymentTypeModal(false)
      setEditingPaymentType(null)
    } catch (error) {
      console.error("Error updating tipo pago:", error)
      setErrorMessage("No se pudo actualizar el tipo de pago. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to delete a payment type
  const deleteTipoPago = async () => {
    if (!itemToDelete) return

    try {
      setIsSubmitting(true)
      await makeRequest("DELETE", `https://localhost:7213/DeleteTipoPago/${itemToDelete.id_tipo}`)

      // Reload payment type list
      await fetchTiposPago()

      // Show success message
      setSuccessMessage("Tipo de pago eliminado correctamente")
      setTimeout(() => setSuccessMessage(""), 3000)

      // Close modal
      setShowDeleteModal(false)
      setItemToDelete(null)
    } catch (error) {
      console.error("Error deleting tipo pago:", error)
      setErrorMessage("No se pudo eliminar el tipo de pago. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to handle debt form submission
  const handleDebtSubmit = (formData: Deuda) => {
    // Set default estado based on date
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const fechaVencimiento = new Date(formData.fecha_vencimiento)
    fechaVencimiento.setHours(0, 0, 0, 0)

    // Set estado based on date
    if (fechaVencimiento < today) {
      formData.estado = "Vencido"
    } else {
      formData.estado = "Pendiente"
    }

    if (editingDebt) {
      updateDeuda({
        ...formData,
        id_deuda: editingDebt.id_deuda,
      })
    } else {
      createDeuda(formData)
    }
  }

  // Function to handle payment form submission
  const handlePaymentSubmit = (formData: Pago) => {
    if (editingPayment) {
      updatePago({
        ...formData,
        id_pago: editingPayment.id_pago,
        id_deuda: editingPayment.id_deuda,
        id_alumno: editingPayment.id_alumno,
      })
    } else {
      createPago(formData)
    }
  }

  // Function to handle payment type form submission
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

  // Function to handle deletion
  const handleDelete = () => {
    if (deleteType === "payment") {
      deletePago()
    } else if (deleteType === "debt") {
      deleteDeuda()
    } else {
      deleteTipoPago()
    }
  }

  // Function to notify overdue debts
  const handleNotifyLateDebts = async () => {
    try {
      setIsSubmitting(true)

      // Get all students with overdue debts
      const alumnosConDeudasVencidas = new Set()

      // Collect information about overdue debts by student
      const deudasPorAlumnoVencidas = {}

      Object.entries(deudasPorAlumno).forEach(([idAlumno, deudasAlumno]) => {
        const deudasVencidas = deudasAlumno.filter((deuda) => deuda.estado === "Vencido")

        if (deudasVencidas.length > 0) {
          alumnosConDeudasVencidas.add(Number(idAlumno))
          deudasPorAlumnoVencidas[idAlumno] = deudasVencidas
        }
      })

      // If there are no students with overdue debts, show message and exit
      if (alumnosConDeudasVencidas.size === 0) {
        setSuccessMessage("No hay alumnos con deudas vencidas para notificar")
        setShowNotifyModal(false)
        setTimeout(() => setSuccessMessage(""), 3000)
        return
      }

      // Prepare data to send emails
      const alumnosData = Array.from(alumnosConDeudasVencidas).map((idAlumno) => {
        const alumno = alumnos.find((a) => a.id_usuario === Number(idAlumno))
        const deudasVencidas = deudasPorAlumnoVencidas[idAlumno]

        return {
          id_alumno: idAlumno,
          nombre: alumno ? `${alumno.nombre} ${alumno.apellido}` : "Alumno",
          correo: alumno ? alumno.correo : "",
          deudas: deudasVencidas.map((deuda) => ({
            id_deuda: deuda.id_deuda,
            monto: deuda.monto,
            fecha_vencimiento: deuda.fecha_vencimiento,
          })),
        }
      })

      console.log("Enviando notificaciones a los siguientes alumnos:", alumnosData)

      // Here would be the logic to send emails
      // We simulate sending with a wait time
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Show details of sent emails
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

  // Function to get payment type name
  const getTipoPagoName = (id_tipo: number) => {
    const tipo = tiposPago.find((t) => t.id_tipo === id_tipo)
    return tipo ? tipo.tipo : "Desconocido"
  }

  // Function to get student full name
  const getAlumnoName = (id_alumno: number) => {
    const alumno = alumnos.find((a) => a.id_usuario === id_alumno)
    return alumno ? `${alumno.nombre} ${alumno.apellido}` : "Desconocido"
  }

  // Function to get badge color based on status
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

  // Function to get badge icon based on status
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

  // Filter students based on search term
  const filteredAlumnos = alumnos.filter((alumno) => {
    const fullName = `${alumno.nombre} ${alumno.apellido}`.toLowerCase()
    const dni = alumno.dni.toString()

    return fullName.includes(searchTerm.toLowerCase()) || dni.includes(searchTerm)
  })

  // Count overdue debts
  const countVencidos = deudas.filter((deuda) => deuda.estado === "Vencido").length

  // Add a function to calculate total debt for a student
  const calculateTotalDeuda = (alumnoId: number) => {
    const alumnoDebts = deudasPorAlumno[alumnoId] || []
    return alumnoDebts.reduce((total, deuda) => {
      // Add to total only if debt is not paid
      if (deuda.estado !== "Pagado") {
        return total + deuda.monto
      }
      return total
    }, 0)
  }

  // Add a function to calculate total payments made against a debt
  const calculateTotalPagos = (deudaId: number) => {
    const pagosDeuda = pagosPorDeuda[deudaId] || []
    return pagosDeuda.reduce((total, pago) => total + pago.monto, 0)
  }

  // Add a function to calculate remaining debt amount
  const calculateRemainingDebt = (deuda: Deuda) => {
    const totalPagado = calculateTotalPagos(deuda.id_deuda)
    return Math.max(0, deuda.monto - totalPagado)
  }

  
// Function to update debt status based on payments
const updateDebtStatus = useCallback(async (deuda: Deuda) => {
  try {
    const totalPagado = calculateTotalPagos(deuda.id_deuda);
  
  // Si el total pagado es igual o mayor al monto de la deuda y el estado no es "Pagado", actualizar
  if (totalPagado >= deuda.monto && deuda.estado !== "Pagado") {
    const updatedDeuda = { ...deuda, estado: "Pagado" };
    await makeRequest("PUT", "https://localhost:7213/UpdateDeuda", updatedDeuda);
    
    // Refresh debts list
    await fetchDeudas();
  }
} catch (error) {
  console.error("Error updating debt status:", error);
}
}, [makeRequest, fetchDeudas]);

  // Add a new component for displaying all payments for a specific debt
  const DebtPaymentsModal = ({
    isOpen,
    onClose,
    deuda,
    pagos,
    setEditingPayment,
    setSelectedDebtForPayment,
    setShowPaymentModal,
    setItemToDelete,
    setDeleteType,
    setShowDeleteModal,
  }) => {
    if (!isOpen || !deuda) return null

    const totalPagado = pagos.reduce((sum, pago) => sum + pago.monto, 0)
    

    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Pagos de la Deuda</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-blue-50 p-4 rounded-md mb-4">
            <h3 className="font-medium text-blue-800 mb-2">Detalles de la deuda</h3>
            <div className="grid grid-cols-2 gap-2">
              <p className="text-sm text-blue-700">Tipo:</p>
              <p className="text-sm font-medium">{getTipoPagoName(deuda.id_tipo)}</p>

              <p className="text-sm text-blue-700">Monto total:</p>
              <p className="text-sm font-medium">${deuda.monto.toLocaleString()}</p>

              <p className="text-sm text-blue-700">Pagado:</p>
              <p className="text-sm font-medium text-green-600">${totalPagado.toLocaleString()}</p>

          

              <p className="text-sm text-blue-700">Vencimiento:</p>
              <p className="text-sm font-medium">{formatDate(deuda.fecha_vencimiento)}</p>

              <p className="text-sm text-blue-700">Estado:</p>
              <p className="text-sm">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(deuda.estado)}`}
                >
                  {getStatusBadgeIcon(deuda.estado)}
                  {deuda.estado}
                </span>
              </p>
            </div>
          </div>

          <h3 className="font-medium text-gray-700 mb-2">Historial de pagos</h3>
          {pagos.length === 0 ? (
            <div className="text-center py-6 text-gray-500 border rounded-md">
              No hay pagos registrados para esta deuda.
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pagos.map((pago) => (
                    <tr key={pago.id_pago}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{formatDate(pago.fecha)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        ${pago.monto.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setEditingPayment(pago)
                              setSelectedDebtForPayment(deuda)
                              setShowPaymentModal(true)
                              onClose()
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
                              onClose()
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
          )}

          <div className="mt-4 flex justify-between">
            <div>
              {deuda.monto > 0 && (
                <button
                  onClick={() => {
                    setSelectedDebtForPayment(deuda)
                    setEditingPayment(null)
                    setShowPaymentModal(true)
                    onClose()
                  }}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Registrar Pago
                </button>
              )}
            </div>
            <button onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50">
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  // Add state for the debt payments modal
  const [showDebtPaymentsModal, setShowDebtPaymentsModal] = useState(false)
  const [selectedDebtForDetails, setSelectedDebtForDetails] = useState<Deuda | null>(null)

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
                    setShowNotifyModal(true)
                  }}
                  className="flex items-center px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Notificar Morosos ({countVencidos})
                </button>
                <button
                  onClick={() => {
                    setEditingDebt(null)
                    setSelectedAlumno(null)
                    setShowDebtModal(true)
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Deuda
                </button>
              </div>
            </div>

            {/* Filters and search */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            </div>

            {/* Loading state */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="ml-2 text-gray-600">Cargando datos...</span>
              </div>
            ) : (
              /* Payment type list */
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Tipos de Pago</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th hidden className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tiposPago.map((tipo) => (
                        <tr key={tipo.id_tipo}>
                          <td hidden className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{tipo.id_tipo}</td>
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

            {/* Student and debt list */}
            {!isLoading && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Deudas por Alumno</h2>

                {filteredAlumnos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron alumnos que coincidan con la búsqueda.
                  </div>
                ) : (
                  filteredAlumnos
                    .map((alumno) => {
                      const alumnoDebts = deudasPorAlumno[alumno.id_usuario] || []

                      // Filter debts based on selected filters
                      const filteredDebts = alumnoDebts.filter((deuda) => {
                        const matchesStatus = selectedStatus === "all" || deuda.estado === selectedStatus
                        return matchesStatus
                      })

                      // If there are no debts that match the filters, don't show this student
                      if (filteredDebts.length === 0 && selectedStatus !== "all") {
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
                              <p className="text-sm font-semibold text-red-600">
                                Deuda Total: ${calculateTotalDeuda(alumno.id_usuario).toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedAlumno(alumno)
                                setEditingDebt(null)
                                setShowDebtModal(true)
                              }}
                              className="mt-2 sm:mt-0 flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Nueva Deuda
                            </button>
                          </div>

                          {filteredDebts.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                              No hay deudas registradas para este alumno.
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Monto
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Pagado
                                    </th>
                                   
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Tipo
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Vencimiento
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Estado
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Pagos
                                    </th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                      Acciones
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {filteredDebts.map((deuda) => {
                                    const pagosDeuda = pagosPorDeuda[deuda.id_deuda] || []
                                    const totalPagado = calculateTotalPagos(deuda.id_deuda)
                                  

                                    return (
                                      <tr key={deuda.id_deuda}>
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                          ${deuda.monto.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-green-600">
                                          ${totalPagado.toLocaleString()}
                                        </td>
                                       
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                          {getTipoPagoName(deuda.id_tipo)}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                          {formatDate(deuda.fecha_vencimiento)}
                                        </td>
                                        <td className="px-4 py-2">
                                          <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(deuda.estado)}`}
                                          >
                                            {getStatusBadgeIcon(deuda.estado)}
                                            {deuda.estado}
                                          </span>
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                          {pagosDeuda.length > 0 ? (
                                            <button
                                              onClick={() => {
                                                setSelectedDebtForDetails(deuda)
                                                setShowDebtPaymentsModal(true)
                                              }}
                                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
                                            >
                                              <CreditCard className="w-3 h-3 mr-1" />
                                              Ver pagos ({pagosDeuda.length})
                                            </button>
                                          ) : (
                                            <button
                                              onClick={() => {
                                                setSelectedDebtForPayment(deuda)
                                                setEditingPayment(null)
                                                setShowPaymentModal(true)
                                              }}
                                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
                                            >
                                              <CreditCard className="w-3 h-3 mr-1" />
                                              Pagar
                                            </button>
                                          )}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                          <div className="flex justify-end space-x-2">
                                            <button
                                              onClick={() => {
                                                setEditingDebt(deuda)
                                                setSelectedAlumno(alumno)
                                                setShowDebtModal(true)
                                              }}
                                              className="text-blue-600 hover:text-blue-900"
                                            >
                                              <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                              onClick={() => {
                                                setItemToDelete(deuda)
                                                setDeleteType("debt")
                                                setShowDeleteModal(true)
                                              }}
                                              className="text-red-600 hover:text-red-900"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                            {deuda.monto > 0 && (
                                              <button
                                                onClick={() => {
                                                  setSelectedDebtForPayment(deuda)
                                                  setEditingPayment(null)
                                                  setShowPaymentModal(true)
                                                }}
                                                className="text-green-600 hover:text-green-800"
                                              >
                                                <CreditCard className="w-4 h-4" />
                                              </button>
                                            )}
                                            {pagosDeuda.length > 0 && (
                                              <button
                                                className="text-blue-600 hover:text-blue-800"
                                                onClick={() => {
                                                  /* Logic to download payment receipt */
                                                  alert("Descargando comprobante de pago...")
                                                }}
                                              >
                                                <Download className="w-4 h-4" />
                                              </button>
                                            )}
                                            <button
                                              onClick={() => {
                                                setSelectedDebtForDetails(deuda)
                                                setShowDebtPaymentsModal(true)
                                              }}
                                              className="text-blue-600 hover:text-blue-800"
                                              title="Ver todos los pagos"
                                            >
                                              <CreditCard className="w-4 h-4" />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )
                    })
                    .filter(Boolean) // Filter out null elements
                )}

                {filteredAlumnos.length > 0 &&
                  filteredAlumnos.every((alumno) => {
                    const alumnoDebts = deudasPorAlumno[alumno.id_usuario] || []
                    const filteredDebts = alumnoDebts.filter((deuda) => {
                      const matchesStatus = selectedStatus === "all" || deuda.estado === selectedStatus
                      return matchesStatus
                    })
                    return filteredDebts.length === 0
                  }) &&
                  selectedStatus !== "all" && (
                    <div className="text-center py-8 text-gray-500">
                      No hay deudas que coincidan con los filtros seleccionados.
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Debt registration/editing modal */}
          <Modal isOpen={showDebtModal} onClose={() => setShowDebtModal(false)}>
            <DebtForm
              isEditing={!!editingDebt}
              initialValues={
                editingDebt
                  ? {
                      ...editingDebt,
                      id_alumno: selectedAlumno ? selectedAlumno.id_usuario : editingDebt.id_alumno,
                    }
                  : {
                      ...initialDebt,
                      id_alumno: selectedAlumno ? selectedAlumno.id_usuario : 0,
                    }
              }
              onSubmit={handleDebtSubmit}
              onCancel={() => setShowDebtModal(false)}
              isSubmitting={isSubmitting}
              alumnos={alumnos}
              tiposPago={tiposPago}
              fetchingAlumnos={fetchingAlumnos}
              fetchingTiposPago={fetchingTiposPago}
            />
          </Modal>

          {/* Payment registration/editing modal */}
          <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
            <PaymentForm
              isEditing={!!editingPayment}
              initialValues={
                editingPayment
                  ? {
                      ...editingPayment,
                    }
                  : {
                      ...initialPayment,
                      id_alumno: selectedDebtForPayment ? selectedDebtForPayment.id_alumno : 0,
                      monto: selectedDebtForPayment ? selectedDebtForPayment.monto : 0,
                      id_deuda: selectedDebtForPayment ? selectedDebtForPayment.id_deuda : 0,
                    }
              }
              onSubmit={handlePaymentSubmit}
              onCancel={() => {
                setShowPaymentModal(false)
                setSelectedDebtForPayment(null)
              }}
              isSubmitting={isSubmitting}
              deuda={selectedDebtForPayment}
              pagosPorDeuda={pagosPorDeuda}
              calculateTotalPagos={calculateTotalPagos}
              calculateRemainingDebt={calculateRemainingDebt}
            />
          </Modal>

          {/* Payment type registration/editing modal */}
          <Modal isOpen={showPaymentTypeModal} onClose={() => setShowPaymentTypeModal(false)}>
            <PaymentTypeForm
              isEditing={!!editingPaymentType}
              initialValues={editingPaymentType || initialPaymentType}
              onSubmit={handlePaymentTypeSubmit}
              onCancel={() => setShowPaymentTypeModal(false)}
              isSubmitting={isSubmitting}
            />
          </Modal>

          {/* Delete confirmation modal */}
          <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
            <DeleteConfirmation
              item={itemToDelete}
              itemType={deleteType}
              onConfirm={handleDelete}
              onCancel={() => setShowDeleteModal(false)}
              isSubmitting={isSubmitting}
            />
          </Modal>

          {/* Notification to debtors modal */}
          <Modal isOpen={showNotifyModal} onClose={() => setShowNotifyModal(false)}>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Mail className="w-6 h-6 text-yellow-500 mr-2" />
                <h2 className="text-xl font-bold">Notificar Deudas Vencidas</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Se enviará un correo electrónico a todos los alumnos con deudas vencidas recordándoles sus obligaciones
                pendientes.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                  <div>
                    <p className="text-sm text-yellow-700">Hay {countVencidos} deudas vencidas en el sistema.</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      {
                        Object.entries(deudasPorAlumno).filter(([_, deudas]) =>
                          deudas.some((deuda) => deuda.estado === "Vencido"),
                        ).length
                      }{" "}
                      alumnos tienen deudas vencidas.
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
                        Deudas Vencidas
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(deudasPorAlumno)
                      .filter(([_, deudas]) => deudas.some((deuda) => deuda.estado === "Vencido"))
                      .map(([idAlumno, deudas]) => {
                        const alumno = alumnos.find((a) => a.id_usuario === Number(idAlumno))
                        const deudasVencidas = deudas.filter((deuda) => deuda.estado === "Vencido")
                        const totalVencido = deudasVencidas.reduce((sum, deuda) => sum + deuda.monto, 0)

                        return (
                          <tr key={idAlumno}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              {alumno ? `${alumno.nombre} ${alumno.apellido}` : "Alumno desconocido"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{deudasVencidas.length}</td>
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
                  onClick={handleNotifyLateDebts}
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

          {/* Debt payments modal */}
          <DebtPaymentsModal
            isOpen={showDebtPaymentsModal}
            onClose={() => setShowDebtPaymentsModal(false)}
            deuda={selectedDebtForDetails}
            pagos={selectedDebtForDetails ? pagosPorDeuda[selectedDebtForDetails.id_deuda] || [] : []}
            setEditingPayment={setEditingPayment}
            setSelectedDebtForPayment={setSelectedDebtForPayment}
            setShowPaymentModal={setShowPaymentModal}
            setItemToDelete={setItemToDelete}
            setDeleteType={setDeleteType}
            setShowDeleteModal={setShowDeleteModal}
          />
        </div>
      </div>
    </div>
  )
}

