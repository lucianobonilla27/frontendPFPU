interface ApiError extends Error {
    status?: number
    statusText?: string
    responseText?: string
  }
  
  export async function apiCall<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })
  
      // Obtener el texto de la respuesta
      const responseText = await response.text()
  
      // Log en desarrollo
      if (process.env.NODE_ENV === "development") {
        console.log("API Response:", {
          url,
          status: response.status,
          statusText: response.statusText,
          responseText,
        })
      }
  
      // Intentar parsear como JSON
      let data
      try {
        data = responseText ? JSON.parse(responseText) : null
      } catch (parseError) {
        const error = new Error("Invalid JSON response") as ApiError
        error.status = response.status
        error.statusText = response.statusText
        error.responseText = responseText
        throw error
      }
  
      // Manejar errores HTTP
      if (!response.ok) {
        const error = new Error(data?.message || response.statusText) as ApiError
        error.status = response.status
        error.statusText = response.statusText
        throw error
      }
  
      return data
    } catch (error) {
      // Log en desarrollo
      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", error)
      }
      throw error
    }
  }
  
  