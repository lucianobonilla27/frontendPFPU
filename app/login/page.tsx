"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "../../contexts/auth-context"
import { useRouter } from "next/navigation"
import { School, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    dni: "",
    password: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const xhr = new XMLHttpRequest()
    xhr.open("POST", "https://localhost:7213/api/auth/login", true)
    xhr.setRequestHeader("Content-Type", "application/json")

    xhr.onload = () => {
      console.log("Status:", xhr.status)
      console.log("Response:", xhr.responseText)

      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText)
          console.log("Parsed response:", response)

          login({
            token: response.token,
            role: response.tipo.toLowerCase(),
            name: response.nombre + " " + response.apellido,
            id_usuario: response.id_usuario
           

          })
       

          // Redirigir según el tipo de usuario
          if (response.tipo.toLowerCase() === "administrativo") {
            router.push("/")
          } else if (response.tipo.toLowerCase() === "docente") {
            router.push("/")
          } else if (response.tipo.toLowerCase() === "alumno") {
            router.push("/")
          } else {
            router.push("/")
          }
        } catch (err) {
          console.error("Error parsing response:", err)
          setError("Error procesando la respuesta del servidor")
        }
      } else {
        console.error("Error response:", xhr.responseText)
        setError(xhr.responseText || "Error en la autenticación")
      }
      setIsLoading(false)
    }

    xhr.onerror = () => {
      console.error("Network Error:", xhr.statusText)
      setError("Error de conexión con el servidor")
      setIsLoading(false)
    }

    xhr.send(JSON.stringify(formData))
    console.log("Request sent with data:", formData)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <School className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Sistema de Gestión Educativa</h2>
          <p className="mt-2 text-sm text-gray-600">Ingresa tus credenciales para acceder</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="dni" className="block text-sm font-medium text-gray-700">
                DNI
              </label>
              <Input
                id="dni"
                name="dni"
                type="text"
                required
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                className="mt-1"
                placeholder="Ingresa tu DNI"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1"
                placeholder="Ingresa tu contraseña"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>

        {/* Panel de debug */}
        {/* {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h3 className="text-sm font-semibold mb-2">Debug Info:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(
                {
                  formData,
                  isLoading,
                  error,
                },
                null,
                2,
              )}
            </pre>
          </div>
        )} */}
      </div>
    </div>
  )
}

