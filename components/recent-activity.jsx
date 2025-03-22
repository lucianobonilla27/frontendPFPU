"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, FileText, MessageSquare, BookOpen, Clock, DollarSign, Users, AlertCircle } from "lucide-react"

export function RecentActivity({ role }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        if (role === "administrativo") {
          // Consumir el endpoint para administradores
          const response = await fetch("https://localhost:7213/actividadRecienteAdmin", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) {
            throw new Error(`Error fetching activities: ${response.status}`)
          }

          const data = await response.json()

          // Transformar los datos al formato esperado por el componente
          const formattedActivities = data.map((activity, index) => ({
            id: index + 1,
            type: activity.tipo,
            description: activity.descripcion,
            time: formatTimeAgo(new Date(activity.fecha)),
            icon: getIconForType(activity.tipo),
          }))

          setActivities(formattedActivities)
        } else {
          // Para otros roles, usar datos de fallback por ahora
          setActivities(getActivities())
        }
        setError(null)
      } catch (err) {
        console.error("Error fetching activities:", err)
        setError("No se pudieron cargar las actividades recientes.")
        // Usar datos de fallback en caso de error
        setActivities(getActivities())
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [role])

  // Función para obtener el icono según el tipo de actividad
  const getIconForType = (type) => {
    switch (type) {
      case "pago":
        return DollarSign
      case "asistencia":
        return CheckCircle2
      case "nota":
        return FileText
      case "enrollment":
        return Users
      case "message":
        return MessageSquare
      case "material":
        return BookOpen
      case "assignment":
        return FileText
      case "attendance":
        return CheckCircle2
      default:
        return Clock
    }
  }

  // Función para formatear la fecha como "hace X tiempo"
  const formatTimeAgo = (date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) {
      return "Hace unos segundos"
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} ${diffInMinutes === 1 ? "minuto" : "minutos"}`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `Hace ${diffInHours} ${diffInHours === 1 ? "hora" : "horas"}`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) {
      return `Hace ${diffInDays} ${diffInDays === 1 ? "día" : "días"}`
    }

    // Para fechas más antiguas, mostrar la fecha formateada
    return date.toLocaleDateString()
  }

  // This would ideally come from an API
  const getActivities = () => {
    if (role === "administrativo") {
      return [
        {
          id: 1,
          type: "enrollment",
          description: "Nuevo alumno registrado: María García",
          time: "Hace 2 horas",
          icon: Users,
        },
        {
          id: 2,
          type: "grade",
          description: "Calificaciones finales publicadas para 3° año",
          time: "Hace 5 horas",
          icon: FileText,
        },
        {
          id: 3,
          type: "payment",
          description: "Pago de cuota recibido: Alumno #1024",
          time: "Hace 1 día",
          icon: DollarSign,
        },
        {
          id: 4,
          type: "attendance",
          description: "Registro de asistencia completado para 2° año",
          time: "Hace 2 días",
          icon: CheckCircle2,
        },
      ]
    } else if (role === "docente") {
      return [
        {
          id: 1,
          type: "grade",
          description: "Calificaciones cargadas para Matemáticas 2B",
          time: "Hace 3 horas",
          icon: FileText,
        },
        {
          id: 2,
          type: "material",
          description: "Material subido: Guía de ejercicios",
          time: "Hace 1 día",
          icon: BookOpen,
        },
        {
          id: 3,
          type: "attendance",
          description: "Asistencia registrada para Matemáticas 1A",
          time: "Hace 2 días",
          icon: CheckCircle2,
        },
        {
          id: 4,
          type: "attendance",
          description: "Asistencia registrada para Matemáticas 3B",
          time: "Hace 2 días",
          icon: CheckCircle2,
        },
      ]
    } else {
      // alumno
      return [
        {
          id: 1,
          type: "grade",
          description: "Nueva calificación: 8.5 en Matemáticas",
          time: "Hace 1 día",
          icon: FileText,
        },
        {
          id: 2,
          type: "attendance",
          description: "Asistencia registrada: Presente en Historia",
          time: "Hace 2 días",
          icon: CheckCircle2,
        },
        {
          id: 3,
          type: "payment",
          description: "Pago de cuota registrado: $5000",
          time: "Hace 3 días",
          icon: DollarSign,
        },
        {
          id: 4,
          type: "attendance",
          description: "Asistencia registrada: Tarde en Ciencias",
          time: "Hace 4 días",
          icon: CheckCircle2,
        },
      ]
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Clock className="h-5 w-5 text-blue-600 animate-spin" />
        <span className="ml-2 text-gray-600">Cargando actividades...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700 flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const IconComponent = activity.icon
        return (
          <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
            <div className="bg-blue-100 p-2 rounded-full">
              <IconComponent className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {activity.time}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

