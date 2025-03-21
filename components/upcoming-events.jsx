"use client"

import { Calendar, Clock, FileText, DollarSign, Users } from "lucide-react"

export function UpcomingEvents({ role }) {
  // This would ideally come from an API based on your database
  const getEvents = () => {
    if (role === "administrativo") {
      return [
        {
          id: 1,
          title: "Vencimiento de Cuota Mensual",
          date: "15 de Junio, 2023",
          time: "23:59",
          icon: DollarSign,
        },
        {
          id: 2,
          title: "Cierre de Trimestre",
          date: "20 de Junio, 2023",
          time: "23:59",
          icon: Calendar,
        },
        {
          id: 3,
          title: "Entrega de Boletines",
          date: "25 de Junio, 2023",
          time: "10:00 - 13:00",
          icon: FileText,
        },
      ]
    } else if (role === "docente") {
      return [
        {
          id: 1,
          title: "Entrega de Notas Trimestrales",
          date: "16 de Junio, 2023",
          time: "23:59",
          icon: FileText,
        },
        {
          id: 2,
          title: "Registro de Asistencia Pendiente",
          date: "Diario",
          time: "Antes de las 12:00",
          icon: Users,
        },
        {
          id: 3,
          title: "Cierre de Trimestre",
          date: "20 de Junio, 2023",
          time: "23:59",
          icon: Calendar,
        },
      ]
    } else {
      // alumno
      return [
        {
          id: 1,
          title: "Examen de Matemáticas",
          date: "16 de Junio, 2023",
          time: "10:00 - 12:00",
          icon: FileText,
        },
        {
          id: 2,
          title: "Vencimiento de Cuota",
          date: "15 de Junio, 2023",
          time: "23:59",
          icon: DollarSign,
        },
        {
          id: 3,
          title: "Entrega de Boletín",
          date: "25 de Junio, 2023",
          time: "10:00 - 13:00",
          icon: FileText,
        },
      ]
    }
  }

  const events = getEvents()

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <event.icon className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">{event.title}</h3>
          </div>
          <div className="mt-2 space-y-1 ml-7">
            <p className="text-sm text-gray-600 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-blue-600" />
              {event.date}
            </p>
            <p className="text-sm text-gray-600 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-blue-600" />
              {event.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

