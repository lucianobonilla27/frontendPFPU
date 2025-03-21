"use client"

import { CheckCircle2, FileText, BookOpen, Clock, DollarSign, Users } from "lucide-react"

export function RecentActivity({ role }) {
  // This would ideally come from an API based on your database
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
          description: "Calificaciones finales registradas para 3° año",
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

  const activities = getActivities()

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
          <div className="bg-blue-100 p-2 rounded-full">
            <activity.icon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-800">{activity.description}</p>
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {activity.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

