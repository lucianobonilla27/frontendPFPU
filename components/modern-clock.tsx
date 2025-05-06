"use client"

import { useEffect, useState } from "react"

export function ModernClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  // Formato de 2 dígitos para horas, minutos y segundos
  const hours = time.getHours().toString().padStart(2, "0")
  const minutes = time.getMinutes().toString().padStart(2, "0")
  const seconds = time.getSeconds().toString().padStart(2, "0")

  // Obtener fecha en español
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }
  const dateString = time.toLocaleDateString("es-ES", options)

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-6xl font-light tracking-wider text-gray-800 mb-4">
        <span>{hours}</span>
        <span className="animate-pulse">:</span>
        <span>{minutes}</span>
        <span className="text-4xl text-gray-500">:{seconds}</span>
      </div>

      <div className="text-lg text-gray-600 capitalize">{dateString}</div>

      <div className="mt-6 grid grid-cols-3 gap-4 w-full max-w-md">
        {[
          { label: "Hora", value: hours },
          { label: "Minutos", value: minutes },
          { label: "Segundos", value: seconds },
        ].map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
            <div className="text-2xl font-semibold text-blue-600">{item.value}</div>
            <div className="text-xs text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
