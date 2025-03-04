"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Pencil, Trash2, PlusCircle } from "lucide-react"

// Definición de tipos según la estructura real de la API
interface Alumno {
  direccion: string
  matricula: number
  fecha_nac: string
  id_curso: number
  id_usuario: number
  dni: number
  contrasenia: string | null
  correo: string
  nombre: string
  apellido: string
  tipo: string | null
  activo: number
  telefono: string | null
}

interface Curso {
  id_curso: number
  division: string
  cupo_restante: number
  id_anio: number
}

interface Teacher {
  id_usuario: number
  nombre: string
  apellido: string
  dni: string
  correo: string
  contrasenia: string
  telefono: string
  activo: number
  tipo: string
}

interface Admin {
  id_usuario: number
  nombre: string
  apellido: string
  dni: string
  correo: string
  contrasenia: string
  telefono: string
  activo: number
  tipo: string
}

interface Anio {
  id_anio: number
  anio: string
}

interface Materia {
  id_materia: number
  materia: string
  id_anio: number
  id_docente: number | null
}

interface NuevoDocente {
  id_usuario: number
  dni: number
  contrasenia: string
  correo: string
  nombre: string
  apellido: string
  tipo: string
  activo: number
  telefono: string
}

interface NuevaMateria {
  id_materia: number
  materia: string
  id_anio: number
  id_docente: number
}

// Estructura para crear un nuevo alumno según la API
interface NuevoAlumno {
  id_usuario: number
  dni: number
  contrasenia: string
  correo: string
  nombre: string
  apellido: string
  tipo: string
  activo: number
  telefono: string
  direccion: string
  matricula: number
  fecha_nac: string
  id_curso: number
}

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("students")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSubjects, setSelectedSubjects] = useState<Materia[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [docentes, setDocentes] = useState<Teacher[]>([])
  const [admins, setAdministrativos] = useState<Admin[]>([])
  const [anios, setAnios] = useState<Anio[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [selectedAnio, setSelectedAnio] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchingCursos, setFetchingCursos] = useState(true)
  const [fetchingAlumnos, setFetchingAlumnos] = useState(true)
  const [fetchingDocentes, setFetchingDocentes] = useState(true)
  const [fetchingAdmins, setFetchingAdministrativos] = useState(true)
  const [fetchingAnios, setFetchingAnios] = useState(false)
  const [fetchingMaterias, setFetchingMaterias] = useState(false)
  const [noMateriasAvailable, setNoMateriasAvailable] = useState(false)
  const [materiasSeleccionadasPorAnio, setMateriasSeleccionadasPorAnio] = useState<{ [key: number]: Materia[] }>({})

  // Actualizar el estado para incluir el usuario que se está editando
  const [editingUser, setEditingUser] = useState<Alumno | Teacher | Admin | null>(null)
  const [materiasDocente, setMateriasDocente] = useState<Materia[]>([])
  const [fetchingMateriasDocente, setFetchingMateriasDocente] = useState(false)
  const [materiasToAdd, setMateriasToAdd] = useState<Materia[]>([])
  const [materiasToRemove, setMateriasToRemove] = useState<Materia[]>([])

  // Estado para formulario nuevo alumno con valores por defecto según la API
  const [nuevoAlumno, setNuevoAlumno] = useState<NuevoAlumno>({
    id_usuario: 0,
    dni: 0,
    contrasenia: "",
    correo: "",
    nombre: "",
    apellido: "",
    tipo: "alumno", // Valor por defecto
    activo: 1, // Valor por defecto
    telefono: "",
    direccion: "",
    matricula: 0, // Se generará en el backend
    fecha_nac: new Date().toISOString().split("T")[0], // Fecha actual como valor por defecto
    id_curso: 0,
  })

  // Estado para formulario nuevo docente
  const [nuevoDocente, setNuevoDocente] = useState<NuevoDocente>({
    id_usuario: 0,
    dni: 0,
    contrasenia: "",
    correo: "",
    nombre: "",
    apellido: "",
    tipo: "docente", // Valor por defecto
    activo: 1, // Valor por defecto
    telefono: "",
  })

  // Agregar un nuevo estado para administradores
  const [nuevoAdmin, setNuevoAdmin] = useState<Admin>({
    id_usuario: 0,
    dni: "",
    contrasenia: "",
    correo: "",
    nombre: "",
    apellido: "",
    tipo: "admin", // Valor por defecto
    activo: 1, // Valor por defecto
    telefono: "",
  })

  // Función genérica para hacer peticiones
  const makeRequest = useCallback(async (method: string, url: string, data: any = null): Promise<any> => {
    try {
      console.log(`Realizando petición ${method} a ${url}`, data)
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
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Verificar si la respuesta es JSON o texto
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const responseData = await response.json()
        console.log(`Respuesta de ${url}:`, responseData)
        return responseData
      } else {
        // Si no es JSON, devolver el texto
        const text = await response.text()
        console.log(`Respuesta de texto de ${url}:`, text)
        return { message: text, success: true }
      }
    } catch (error) {
      console.error("Error in makeRequest:", error)
      throw error
    }
  }, [])

  // Cargar años escolares
  useEffect(() => {
    const fetchAnios = async () => {
      try {
        setFetchingAnios(true)
        const data = await makeRequest("GET", "https://localhost:7213/GetAllAnios")
        console.log("Años cargados:", data)
        setAnios(data)
      } catch (err) {
        console.error("Error fetching años:", err)
        setError("No se pudieron cargar los años escolares. Verifica la conexión con el servidor.")
      } finally {
        setFetchingAnios(false)
      }
    }

    fetchAnios()
  }, [makeRequest])

  // Cargar materias cuando se selecciona un año
  useEffect(() => {
    const fetchMaterias = async () => {
      if (!selectedAnio) return

      try {
        setFetchingMaterias(true)
        setNoMateriasAvailable(false)
        setMaterias([])

        const data = await makeRequest("GET", `https://localhost:7213/GetMateriasByAnio?id_anio=${selectedAnio}`)
        console.log("Materias cargadas:", data)

        if (Array.isArray(data) && data.length === 0) {
          setNoMateriasAvailable(true)
        } else {
          setMaterias(data)
        }
      } catch (err) {
        console.error("Error fetching materias:", err)
        setError("No se pudieron cargar las materias. Verifica la conexión con el servidor.")
        setNoMateriasAvailable(true)
      } finally {
        setFetchingMaterias(false)
      }
    }

    if (selectedAnio) {
      fetchMaterias()
    }
  }, [selectedAnio, makeRequest])

  // Cargar cursos desde la API
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        setFetchingCursos(true)
        const data = await makeRequest("GET", "https://localhost:7213/GetAllCursos")
        console.log("Cursos cargados:", data)
        setCursos(data)
      } catch (err) {
        console.error("Error fetching courses:", err)
        setError("No se pudieron cargar los cursos. Verifica la conexión con el servidor.")
      } finally {
        setFetchingCursos(false)
      }
    }

    fetchCursos()
  }, [makeRequest])

  // Cargar alumnos desde la API
  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        setFetchingAlumnos(true)
        const data = await makeRequest("GET", "https://localhost:7213/GetAlumnos")
        console.log("Alumnos cargados:", data)
        setAlumnos(data)
      } catch (err) {
        console.error("Error fetching students:", err)
        setError("No se pudieron cargar los alumnos. Verifica la conexión con el servidor.")
      } finally {
        setFetchingAlumnos(false)
      }
    }

    fetchAlumnos()
  }, [makeRequest])

  // Función para cargar docentes desde la API
  useEffect(() => {
    const fetchDocentes = async () => {
      try {
        setFetchingDocentes(true)
        const data = await makeRequest("GET", "https://localhost:7213/GetDocentes")
        console.log("Docentes cargados:", data)
        setDocentes(data)
      } catch (err) {
        console.error("Error fetching teachers:", err)
        setError("No se pudieron cargar los docentes. Verifica la conexión con el servidor.")
      } finally {
        setFetchingDocentes(false)
      }
    }

    fetchDocentes()
  }, [makeRequest])

  // Función para cargar administrativos desde la API
  useEffect(() => {
    const fetchAdministrativos = async () => {
      try {
        setFetchingAdministrativos(true)
        const data = await makeRequest("GET", "https://localhost:7213/GetAdministradores")
        console.log("Administrativos cargados:", data)
        setAdministrativos(data)
      } catch (err) {
        console.error("Error fetching administrators:", err)
        setError("No se pudieron cargar los administrativos. Verifica la conexión con el servidor.")
      } finally {
        setFetchingAdministrativos(false)
      }
    }

    fetchAdministrativos()
  }, [makeRequest])

  // Función para manejar cambios en el formulario de alumno
  const handleAlumnoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (editingUser && activeTab === "students") {
      const updatedUser = { ...editingUser } as Alumno

      if (name === "dni" || name === "id_curso" || name === "matricula") {
        updatedUser[name] = Number(value)
      } else if (name === "fecha_nac") {
        updatedUser[name] = new Date(value).toISOString()
      } else {
        updatedUser[name] = value
      }

      setEditingUser(updatedUser)
    } else {
      setNuevoAlumno((prev) => {
        const updatedAlumno = { ...prev }

        if (name === "dni" || name === "id_curso" || name === "matricula") {
          updatedAlumno[name] = Number(value)
        } else if (name === "fecha_nac") {
          updatedAlumno[name] = new Date(value).toISOString()
        } else {
          updatedAlumno[name] = value
        }

        return updatedAlumno
      })
    }
  }

  // Función para manejar cambios en el formulario de docente
  const handleDocenteInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (editingUser && activeTab === "teachers") {
      const updatedUser = { ...editingUser } as Teacher
      updatedUser[name] = name === "dni" ? Number(value) : value
      setEditingUser(updatedUser)
    } else {
      setNuevoDocente((prev) => ({
        ...prev,
        [name]: name === "dni" ? Number(value) : value,
      }))
    }
  }

  // Agregar una nueva función para manejar cambios en el formulario de administrador
  const handleAdminInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (editingUser && activeTab === "admins") {
      const updatedUser = { ...editingUser } as Admin
      updatedUser[name] = value
      setEditingUser(updatedUser)
    } else {
      setNuevoAdmin({ ...nuevoAdmin, [name]: value })
    }
  }

  // Función para manejar cambio de año seleccionado
  const handleAnioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const anioId = Number(e.target.value)

    // Guardar las materias seleccionadas del año actual antes de cambiar
    if (selectedAnio) {
      // Filtrar solo las materias que pertenecen al año actual y están seleccionadas
      const materiasDelAnioActual = selectedSubjects.filter((m) => m.id_anio === selectedAnio)

      setMateriasSeleccionadasPorAnio((prev) => ({
        ...prev,
        [selectedAnio]: materiasDelAnioActual,
      }))
    }

    // Cambiar el año seleccionado
    setSelectedAnio(anioId)
  }

  // Efecto para actualizar las materias seleccionadas cuando cambia el año
  useEffect(() => {
    if (!selectedAnio) return

    // Al cambiar de año, mantener todas las materias seleccionadas de otros años
    // y agregar las materias que ya estaban seleccionadas para este año
    const materiasDeOtrosAnios = selectedSubjects.filter((m) => m.id_anio !== selectedAnio)
    const materiasDelAnioSeleccionado = materiasSeleccionadasPorAnio[selectedAnio] || []

    // Combinar las materias
    const todasLasMaterias = [...materiasDeOtrosAnios, ...materiasDelAnioSeleccionado]

    // Eliminar duplicados (por si acaso)
    const materiasUnicas = todasLasMaterias.filter(
      (materia, index, self) => index === self.findIndex((m) => m.id_materia === materia.id_materia),
    )

    // Verificar si realmente hay cambios antes de actualizar el estado
    const materiasIguales =
      materiasUnicas.length === selectedSubjects.length &&
      materiasUnicas.every((m1) => selectedSubjects.some((m2) => m2.id_materia === m1.id_materia))

    if (!materiasIguales) {
      setSelectedSubjects(materiasUnicas)
    }
  }, [
    selectedAnio,
    materiasSeleccionadasPorAnio,
    selectedSubjects,
    selectedSubjects.filter,
    selectedSubjects.length,
    selectedSubjects.some,
  ])

  // Función para cargar las materias de un docente
  const loadDocenteMaterias = useCallback(
    async (docenteId: number) => {
      try {
        setFetchingMateriasDocente(true)
        const materias = await makeRequest("GET", `https://localhost:7213/GetMateriasByDocente?id_docente=${docenteId}`)
        console.log("Materias del docente:", materias)

        if (Array.isArray(materias) && materias.length > 0) {
          setMateriasDocente(materias)
          setSelectedSubjects(materias)

          // Organizar las materias por año
          const materiasPorAnio: { [key: number]: Materia[] } = {}
          materias.forEach((materia) => {
            if (!materiasPorAnio[materia.id_anio]) {
              materiasPorAnio[materia.id_anio] = []
            }
            materiasPorAnio[materia.id_anio].push(materia)
          })

          setMateriasSeleccionadasPorAnio(materiasPorAnio)

          // Agrupar materias por año
          const aniosMaterias = materias.reduce((acc: { [key: number]: number }, materia) => {
            acc[materia.id_anio] = (acc[materia.id_anio] || 0) + 1
            return acc
          }, {})

          // Seleccionar el año con más materias
          const anioConMasMaterias = Object.entries(aniosMaterias).reduce(
            (max, [anio, count]) => (count > max[1] ? [Number(anio), count] : max),
            [0, 0],
          )

          if (anioConMasMaterias[0] > 0) {
            setSelectedAnio(anioConMasMaterias[0])
          }
        } else {
          setMateriasDocente([])
          setSelectedSubjects([])
          setMateriasSeleccionadasPorAnio({})
        }
      } catch (err) {
        console.error("Error al cargar materias del docente:", err)
        setError("No se pudieron cargar las materias asignadas al docente.")
        setMateriasDocente([])
        setSelectedSubjects([])
        setMateriasSeleccionadasPorAnio({})
      } finally {
        setFetchingMateriasDocente(false)
      }
    },
    [makeRequest],
  )

  // Actualizar la función handleEdit para incluir administradores
  const handleEdit = async (usuario: Alumno | Teacher | Admin) => {
    setEditingUser(usuario)

    if ("direccion" in usuario) {
      setNuevoAlumno(usuario as Alumno)
    } else if (activeTab === "teachers") {
      setNuevoDocente(usuario as Teacher)

      // Cargar las materias asignadas al docente
      await loadDocenteMaterias(usuario.id_usuario)
    } else if (activeTab === "admins") {
      setNuevoAdmin(usuario as Admin)
    }

    setIsModalOpen(true)
  }

  // Agregar función para crear un nuevo administrador
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsLoading(true)
      setError(null)

      console.log("Enviando datos de nuevo administrador:", nuevoAdmin)

      // Crear el administrador
      await makeRequest("POST", "https://localhost:7213/PostAdministrador", nuevoAdmin)

      // Si todo salió bien, cerrar el modal y limpiar el formulario
      handleCloseModal()

      // Recargar la lista de administradores para ver el nuevo administrador
      const adminsActualizados = await makeRequest("GET", "https://localhost:7213/GetAdministradores")
      setAdministrativos(adminsActualizados)
    } catch (err) {
      console.error("Error creating administrator:", err)
      setError("Ocurrió un error al crear el administrador. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // Agregar función para actualizar un administrador
  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingUser) return

    try {
      setIsLoading(true)
      setError(null)

      console.log("Enviando datos de actualización de administrador:", editingUser)

      await makeRequest("PUT", "https://localhost:7213/UpdateAdministrador", editingUser)

      // Si todo salió bien, cerrar el modal y limpiar el formulario
      handleCloseModal()

      // Recargar la lista de administradores para ver los cambios
      const adminsActualizados = await makeRequest("GET", "https://localhost:7213/GetAdministradores")
      setAdministrativos(adminsActualizados)
    } catch (err) {
      console.error("Error updating administrator:", err)
      setError("Ocurrió un error al actualizar el administrador. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para actualizar un alumno
  const handleUpdateAlumno = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingUser) return

    try {
      setIsLoading(true)
      setError(null)

      console.log("Enviando datos de actualización de alumno:", editingUser)

      await makeRequest("PUT", "https://localhost:7213/UpdateAlumno", editingUser)

      // Si todo salió bien, cerrar el modal y limpiar el formulario
      handleCloseModal()

      // Recargar la lista de alumnos para ver los cambios
      const alumnosActualizados = await makeRequest("GET", "https://localhost:7213/GetAlumnos")
      setAlumnos(alumnosActualizados)
    } catch (err) {
      console.error("Error updating student:", err)
      setError("Ocurrió un error al actualizar el alumno. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para actualizar un docente
  const handleUpdateDocente = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingUser) return

    try {
      setIsLoading(true)
      setError(null)

      console.log("Enviando datos de actualización de docente:", editingUser)

      // Actualizar información del docente
      await makeRequest("PUT", "https://localhost:7213/UpdateDocente", editingUser)

      // Obtener las materias actuales del docente
      const materiasActuales = await makeRequest(
        "GET",
        `https://localhost:7213/GetMateriasByDocente?id_docente=${editingUser.id_usuario}`,
      )

      // Materias que están en selectedSubjects pero no en materiasActuales (agregar)
      const materiasAAgregar = selectedSubjects.filter(
        (selected) => !materiasActuales.some((actual: Materia) => actual.id_materia === selected.id_materia),
      )

      // Materias que están en materiasActuales pero no en selectedSubjects (quitar)
      const materiasAQuitar = materiasActuales.filter(
        (actual: Materia) => !selectedSubjects.some((selected) => selected.id_materia === actual.id_materia),
      )

      console.log("Materias a agregar:", materiasAAgregar)
      console.log("Materias a quitar:", materiasAQuitar)

      // Procesar las materias a quitar (actualizar con id_docente = null)
      for (const materia of materiasAQuitar) {
        try {
          const materiaUpdate = {
            id_materia: materia.id_materia,
            materia: materia.materia,
            id_anio: materia.id_anio,
            id_docente: null,
          }
          console.log("Quitando asignación de materia:", materiaUpdate)
          await makeRequest("PUT", "https://localhost:7213/UpdateMateria", materiaUpdate)
          await new Promise((resolve) => setTimeout(resolve, 300))
        } catch (err) {
          console.error(`Error al quitar asignación de materia ${materia.materia}:`, err)
        }
      }

      // Procesar las materias a agregar (actualizar con id_docente = editingUser.id_usuario)
      for (const materia of materiasAAgregar) {
        try {
          const materiaUpdate = {
            id_materia: materia.id_materia,
            materia: materia.materia,
            id_anio: materia.id_anio,
            id_docente: editingUser.id_usuario,
          }
          console.log("Asignando materia:", materiaUpdate)
          await makeRequest("PUT", "https://localhost:7213/UpdateMateria", materiaUpdate)
          await new Promise((resolve) => setTimeout(resolve, 300))
        } catch (err) {
          console.error(`Error al asignar materia ${materia.materia}:`, err)
        }
      }

      // Si todo salió bien, cerrar el modal y limpiar el formulario
      handleCloseModal()

      // Recargar la lista de docentes para ver los cambios
      const docentesActualizados = await makeRequest("GET", "https://localhost:7213/GetDocentes")
      setDocentes(docentesActualizados)
    } catch (err) {
      console.error("Error updating teacher:", err)
      setError("Ocurrió un error al actualizar el docente. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para crear un nuevo docente y asignar materias
  const handleCreateDocente = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsLoading(true)
      setError(null)

      console.log("Enviando datos de nuevo docente:", nuevoDocente)

      // Crear el docente
      const docenteResponse = await makeRequest("POST", "https://localhost:7213/PostDocente", nuevoDocente)
      console.log("Respuesta de creación de docente:", docenteResponse)

      // Obtener el ID del docente creado
      let docenteId: number

      if (typeof docenteResponse === "object" && docenteResponse !== null && "id_usuario" in docenteResponse) {
        docenteId = docenteResponse.id_usuario
      } else {
        // Si la respuesta no tiene el formato esperado, intentar obtener el ID del docente recién creado
        const docentes = await makeRequest("GET", "https://localhost:7213/GetDocentes")
        const docenteCreado = docentes.find(
          (d: Teacher) =>
            d.dni.toString() === nuevoDocente.dni.toString() &&
            d.nombre === nuevoDocente.nombre &&
            d.apellido === nuevoDocente.apellido,
        )

        if (!docenteCreado) {
          throw new Error("No se pudo obtener el ID del docente creado")
        }

        docenteId = docenteCreado.id_usuario
      }

      console.log("ID del docente creado:", docenteId)

      // Asignar materias al docente
      if (selectedSubjects.length > 0 && docenteId) {
        console.log(`Asignando ${selectedSubjects.length} materias al docente ID ${docenteId}:`, selectedSubjects)

        // Actualizar cada materia con el id del docente una por una
        for (const materia of selectedSubjects) {
          try {
            const materiaUpdate = {
              id_materia: materia.id_materia,
              materia: materia.materia,
              id_anio: materia.id_anio,
              id_docente: docenteId,
            }
            console.log("Actualizando materia:", materiaUpdate)

            // Usar un timeout para asegurar que las peticiones no se sobrepongan
            await new Promise((resolve) => setTimeout(resolve, 300))

            const resultado = await makeRequest("PUT", "https://localhost:7213/UpdateMateria", materiaUpdate)
            console.log(`Materia ${materia.materia} actualizada:`, resultado)
          } catch (err) {
            console.error(`Error al asignar materia ${materia.materia}:`, err)
          }
        }
      } else {
        console.warn("No hay materias seleccionadas para asignar o no se pudo obtener el ID del docente")
      }

      // Si todo salió bien, cerrar el modal y limpiar el formulario
      handleCloseModal()

      // Recargar la lista de docentes para ver el nuevo docente
      const docentesActualizados = await makeRequest("GET", "https://localhost:7213/GetDocentes")
      setDocentes(docentesActualizados)
    } catch (err) {
      console.error("Error creating teacher:", err)
      setError("Ocurrió un error al crear el docente. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // Actualizar la función handleSubmit para incluir administradores
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (activeTab === "students") {
      if (editingUser) {
        await handleUpdateAlumno(e)
      } else {
        try {
          setIsLoading(true)
          setError(null)

          console.log("Enviando datos de nuevo alumno:", nuevoAlumno)

          await makeRequest("POST", "https://localhost:7213/PostAlumno", nuevoAlumno)

          // Si todo salió bien, cerrar el modal y limpiar el formulario
          handleCloseModal()

          // Recargar la lista de alumnos para ver el nuevo alumno
          const alumnosActualizados = await makeRequest("GET", "https://localhost:7213/GetAlumnos")
          setAlumnos(alumnosActualizados)
        } catch (err) {
          console.error("Error creating student:", err)
          setError("Ocurrió un error al crear el alumno. Intenta nuevamente.")
        } finally {
          setIsLoading(false)
        }
      }
    } else if (activeTab === "teachers") {
      if (editingUser) {
        await handleUpdateDocente(e)
      } else {
        await handleCreateDocente(e)
      }
    } else if (activeTab === "admins") {
      if (editingUser) {
        await handleUpdateAdmin(e)
      } else {
        await handleCreateAdmin(e)
      }
    } else {
      console.log("La creación/edición de este tipo de usuario no está implementada aún")
    }
  }

  // Actualizar handleCloseModal para incluir limpieza de administradores
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSubjects([])
    setSelectedAnio(null)
    setEditingUser(null)
    setNuevoAlumno({
      id_usuario: 0,
      dni: 0,
      contrasenia: "",
      correo: "",
      nombre: "",
      apellido: "",
      tipo: "alumno",
      activo: 1,
      telefono: "",
      direccion: "",
      matricula: 0,
      fecha_nac: new Date().toISOString().split("T")[0],
      id_curso: 0,
    })
    setNuevoDocente({
      id_usuario: 0,
      dni: 0,
      contrasenia: "",
      correo: "",
      nombre: "",
      apellido: "",
      tipo: "docente",
      activo: 1,
      telefono: "",
    })
    setNuevoAdmin({
      id_usuario: 0,
      dni: "",
      contrasenia: "",
      correo: "",
      nombre: "",
      apellido: "",
      tipo: "admin",
      activo: 1,
      telefono: "",
    })
    setError(null)
    setMateriasDocente([])
    setNoMateriasAvailable(false)
    setMateriasSeleccionadasPorAnio({})
  }

  // Actualizar generateRandomPassword para incluir administradores
  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    if (activeTab === "students") {
      setNuevoAlumno({ ...nuevoAlumno, contrasenia: password })
    } else if (activeTab === "teachers") {
      setNuevoDocente({ ...nuevoDocente, contrasenia: password })
    } else if (activeTab === "admins") {
      setNuevoAdmin({ ...nuevoAdmin, contrasenia: password })
    }
  }

  // Función para generar una matrícula aleatoria
  const generateRandomMatricula = () => {
    const matricula = Math.floor(1000 + Math.random() * 9000)
    setNuevoAlumno({ ...nuevoAlumno, matricula })
  }

  // Función para obtener el año escolar a partir del id_anio
  const getAnioEscolar = (id_anio: number): string => {
    const anios = ["1°", "2°", "3°", "4°", "5°", "6°"]
    return anios[id_anio - 1] || `Año ${id_anio}`
  }

  // Función para eliminar un usuario
  const handleDelete = async (id_usuario: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        setIsLoading(true)

        let endpoint = ""
        if (activeTab === "students") {
          endpoint = "https://localhost:7213/DeleteAlumno"
        } else if (activeTab === "teachers") {
          endpoint = "https://localhost:7213/DeleteDocente"
        } else if (activeTab === "admins") {
          endpoint = "https://localhost:7213/DeleteAdministrativo"
        }

        await makeRequest("DELETE", `${endpoint}?id_usuario=${id_usuario}`)

        // Actualizar la lista correspondiente después de eliminar
        if (activeTab === "students") {
          const updatedAlumnos = await makeRequest("GET", "https://localhost:7213/GetAlumnos")
          setAlumnos(updatedAlumnos)
        } else if (activeTab === "teachers") {
          const updatedDocentes = await makeRequest("GET", "https://localhost:7213/GetDocentes")
          setDocentes(updatedDocentes)
        } else if (activeTab === "admins") {
          const updatedAdmins = await makeRequest("GET", "https://localhost:7213/GetAdministradores")
          setAdministrativos(updatedAdmins)
        }
      } catch (error) {
        console.error("Error al eliminar usuario:", error)
        setError("Ocurrió un error al eliminar el usuario. Por favor, inténtalo de nuevo.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Función para manejar la selección de materias
  const handleMateriaChange = (materia: Materia) => {
    // Verificar si la materia ya está seleccionada
    const isSelected = selectedSubjects.some((m) => m.id_materia === materia.id_materia)

    let nuevasMateriasSeleccionadas: Materia[]

    if (isSelected) {
      // Si ya está seleccionada, la quitamos
      nuevasMateriasSeleccionadas = selectedSubjects.filter((m) => m.id_materia !== materia.id_materia)
    } else {
      // Si no está seleccionada, la agregamos
      nuevasMateriasSeleccionadas = [...selectedSubjects, materia]
    }

    setSelectedSubjects(nuevasMateriasSeleccionadas)

    // Actualizar también el estado de materias seleccionadas por año
    if (materia.id_anio === selectedAnio) {
      const materiasDelAnioActual = nuevasMateriasSeleccionadas.filter((m) => m.id_anio === selectedAnio)

      setMateriasSeleccionadasPorAnio((prev) => ({
        ...prev,
        [selectedAnio]: materiasDelAnioActual,
      }))
    }
  }

  // Función para obtener el nombre del año a partir del id_anio
  const getAnioName = (id_anio: number): string => {
    const anio = anios.find((a) => a.id_anio === id_anio)
    return anio ? anio.anio : `Año ${id_anio}`
  }

  const Modal = ({
    isOpen,
    onClose,
    children,
  }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">{children}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Gestión de Usuarios</h1>

      {/* Tabs */}
      <div className="border-b mb-8 overflow-x-auto">
        <div className="flex space-x-8 whitespace-nowrap">
          {["students", "teachers", "admins"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 -mb-px ${
                activeTab === tab ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "students" && "Alumnos"}
              {tab === "teachers" && "Docentes"}
              {tab === "admins" && "Administrativos"}
            </button>
          ))}
        </div>
      </div>

      {/* Botón Agregar */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setEditingUser(null)
            setIsModalOpen(true)
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Usuario
        </button>
      </div>

      {/* Estado de carga */}
      {(fetchingAlumnos || fetchingCursos || fetchingDocentes || fetchingAdmins) && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando datos...</p>
        </div>
      )}

      {/* Mensaje de error */}
      {error && !isModalOpen && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Tablas */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-50">
              {activeTab === "students" ? (
                <>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Apellido</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">DNI</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                    Dirección
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                    Teléfono
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                    Fecha Nac.
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Correo</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Apellido</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">DNI</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                    Teléfono
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Correo</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {activeTab === "students" &&
              !fetchingAlumnos &&
              alumnos.map((alumno) => (
                <tr key={alumno.id_usuario}>
                  <td className="px-4 py-2">{alumno.nombre}</td>
                  <td className="px-4 py-2">{alumno.apellido}</td>
                  <td className="px-4 py-2">{alumno.dni}</td>
                  <td className="px-4 py-2 hidden sm:table-cell">{alumno.direccion}</td>
                  <td className="px-4 py-2 hidden sm:table-cell">{alumno.telefono || "-"}</td>
                  <td className="px-4 py-2 hidden sm:table-cell">{new Date(alumno.fecha_nac).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{alumno.correo}</td>
                  <td className="px-4 py-2">
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(alumno)} className="p-1 hover:bg-gray-100 rounded">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(alumno.id_usuario)} className="p-1 hover:bg-gray-100 rounded">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {activeTab === "teachers" &&
              !fetchingDocentes &&
              docentes.map((teacher) => (
                <tr key={teacher.id_usuario}>
                  <td className="px-6 py-4">{teacher.nombre}</td>
                  <td className="px-6 py-4">{teacher.apellido}</td>
                  <td className="px-6 py-4">{teacher.dni}</td>
                  <td className="px-4 py-2 hidden sm:table-cell">{teacher.telefono || "-"}</td>
                  <td className="px-6 py-4">{teacher.correo}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(teacher)} className="p-1 hover:bg-gray-100 rounded">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.id_usuario)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {activeTab === "admins" &&
              !fetchingAdmins &&
              admins.map((admin) => (
                <tr key={admin.id_usuario}>
                  <td className="px-6 py-4">{admin.nombre}</td>
                  <td className="px-6 py-4">{admin.apellido}</td>
                  <td className="px-6 py-4">{admin.dni}</td>
                  <td className="px-4 py-2 hidden sm:table-cell">{admin.telefono || "-"}</td>
                  <td className="px-6 py-4">{admin.correo}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(admin)} className="p-1 hover:bg-gray-100 rounded">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(admin.id_usuario)} className="p-1 hover:bg-gray-100 rounded">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal para crear/editar usuario */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="space-y-4">
          <h2 className="text-xl font-bold">
            {editingUser
              ? `Editar ${activeTab === "students" ? "Alumno" : activeTab === "teachers" ? "Docente" : "Administrativo"}`
              : `Nuevo ${activeTab === "students" ? "Alumno" : activeTab === "teachers" ? "Docente" : "Administrativo"}`}
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {activeTab === "students" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre(s)</label>
                    <input
                      type="text"
                      name="nombre"
                      value={editingUser ? (editingUser as Alumno).nombre : nuevoAlumno.nombre}
                      onChange={handleAlumnoInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellido(s)</label>
                    <input
                      type="text"
                      name="apellido"
                      value={editingUser ? (editingUser as Alumno).apellido : nuevoAlumno.apellido}
                      onChange={handleAlumnoInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">DNI</label>
                  <input
                    type="number"
                    name="dni"
                    value={editingUser ? (editingUser as Alumno).dni : nuevoAlumno.dni || ""}
                    onChange={handleAlumnoInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={editingUser ? (editingUser as Alumno).direccion : nuevoAlumno.direccion}
                    onChange={handleAlumnoInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={editingUser ? (editingUser as Alumno).telefono || "" : nuevoAlumno.telefono}
                    onChange={handleAlumnoInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    name="fecha_nac"
                    value={(editingUser ? (editingUser as Alumno).fecha_nac : nuevoAlumno.fecha_nac).split("T")[0]}
                    onChange={handleAlumnoInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                  <input
                    type="email"
                    name="correo"
                    value={editingUser ? (editingUser as Alumno).correo : nuevoAlumno.correo}
                    onChange={handleAlumnoInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        name="contrasenia"
                        value={nuevoAlumno.contrasenia}
                        onChange={handleAlumnoInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        required
                      />
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="mt-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Generar
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Matrícula</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      name="matricula"
                      value={editingUser ? (editingUser as Alumno).matricula : nuevoAlumno.matricula || ""}
                      onChange={handleAlumnoInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                    {!editingUser && (
                      <button
                        type="button"
                        onClick={generateRandomMatricula}
                        className="mt-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Generar
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Curso</label>
                  <select
                    name="id_curso"
                    value={editingUser ? (editingUser as Alumno).id_curso : nuevoAlumno.id_curso || ""}
                    onChange={handleAlumnoInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar curso</option>
                    {fetchingCursos ? (
                      <option disabled>Cargando cursos...</option>
                    ) : (
                      cursos.map((curso) => (
                        <option key={curso.id_curso} value={curso.id_curso}>
                          {`${getAnioEscolar(curso.id_anio)} ${curso.division}`}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </>
            ) : activeTab === "teachers" ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      value={editingUser ? (editingUser as Teacher).nombre : nuevoDocente.nombre}
                      onChange={handleDocenteInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellido</label>
                    <input
                      type="text"
                      name="apellido"
                      value={editingUser ? (editingUser as Teacher).apellido : nuevoDocente.apellido}
                      onChange={handleDocenteInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">DNI</label>
                  <input
                    type="number"
                    name="dni"
                    value={editingUser ? (editingUser as Teacher).dni : nuevoDocente.dni || ""}
                    onChange={handleDocenteInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={editingUser ? (editingUser as Teacher).telefono : nuevoDocente.telefono}
                    onChange={handleDocenteInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                  <input
                    type="email"
                    name="correo"
                    value={editingUser ? (editingUser as Teacher).correo : nuevoDocente.correo}
                    onChange={handleDocenteInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        name="contrasenia"
                        value={nuevoDocente.contrasenia}
                        onChange={handleDocenteInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        required
                      />
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="mt-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Generar
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Seleccionar Año</label>
                  <select
                    value={selectedAnio || ""}
                    onChange={handleAnioChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required={!editingUser}
                  >
                    <option value="">Seleccionar año</option>
                    {fetchingAnios ? (
                      <option disabled>Cargando años...</option>
                    ) : (
                      anios.map((anio) => (
                        <option key={anio.id_anio} value={anio.id_anio}>
                          {anio.anio}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Sección de materias */}
                {selectedAnio && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Asignar Materias</label>
                    {fetchingMaterias || fetchingMateriasDocente ? (
                      <div className="text-center py-2">
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <p className="mt-1 text-sm text-gray-600">Cargando materias...</p>
                      </div>
                    ) : noMateriasAvailable ? (
                      <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
                        <p className="text-sm">No hay materias disponibles para este año.</p>
                        <p className="text-sm mt-2">
                          Por favor, seleccione otro año o contacte al administrador para agregar materias.
                        </p>
                      </div>
                    ) : (
                      <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                        <div className="space-y-2">
                          {/* Mostrar las materias del docente de otros años */}
                          {editingUser && materiasDocente.filter((m) => m.id_anio !== selectedAnio).length > 0 && (
                            <div className="mb-2 pb-2 border-b">
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                Materias asignadas de otros años:
                              </p>
                              {materiasDocente
                                .filter((m) => m.id_anio !== selectedAnio)
                                .map((materia) => (
                                  <div key={materia.id_materia} className="flex items-center space-x-2 p-1">
                                    <input
                                      type="checkbox"
                                      checked={selectedSubjects.some((m) => m.id_materia === materia.id_materia)}
                                      onChange={() => handleMateriaChange(materia)}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                      {materia.materia}{" "}
                                      <span className="text-xs text-gray-500">({getAnioName(materia.id_anio)})</span>
                                    </span>
                                  </div>
                                ))}
                            </div>
                          )}

                          {/* Mostrar las materias del año seleccionado */}
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Materias de {getAnioName(selectedAnio)}:
                          </p>
                          {materias.length === 0 ? (
                            <p className="text-sm text-gray-500">No hay materias disponibles para este año.</p>
                          ) : (
                            materias.map((materia) => (
                              <label
                                key={materia.id_materia}
                                className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  value={materia.id_materia}
                                  checked={selectedSubjects.some((m) => m.id_materia === materia.id_materia)}
                                  onChange={() => handleMateriaChange(materia)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{materia.materia}</span>
                              </label>
                            ))
                          )}

                          {/* Mostrar las materias del docente del año seleccionado */}
                          {editingUser && materiasDocente.filter((m) => m.id_anio === selectedAnio).length > 0 && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-sm font-medium text-gray-700 mb-1">Materias ya asignadas:</p>
                              {materiasDocente
                                .filter((m) => m.id_anio === selectedAnio)
                                .map((materia) => (
                                  <label
                                    key={materia.id_materia}
                                    className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedSubjects.some((m) => m.id_materia === materia.id_materia)}
                                      onChange={() => handleMateriaChange(materia)}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{materia.materia}</span>
                                  </label>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedSubjects.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm text-gray-500">Materias seleccionadas: {selectedSubjects.length}</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedSubjects.map((materia) => (
                            <span
                              key={materia.id_materia}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {materia.materia}
                              {materia.id_anio !== selectedAnio && (
                                <span className="ml-1 text-xs text-blue-600">({getAnioName(materia.id_anio)})</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      value={editingUser ? (editingUser as Admin).nombre : nuevoAdmin.nombre}
                      onChange={handleAdminInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellido</label>
                    <input
                      type="text"
                      name="apellido"
                      value={editingUser ? (editingUser as Admin).apellido : nuevoAdmin.apellido}
                      onChange={handleAdminInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">DNI</label>
                  <input
                    type="text"
                    name="dni"
                    value={editingUser ? (editingUser as Admin).dni : nuevoAdmin.dni}
                    onChange={handleAdminInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={editingUser ? (editingUser as Admin).telefono : nuevoAdmin.telefono}
                    onChange={handleAdminInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                  <input
                    type="email"
                    name="correo"
                    value={editingUser ? (editingUser as Admin).correo : nuevoAdmin.correo}
                    onChange={handleAdminInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        name="contrasenia"
                        value={nuevoAdmin.contrasenia}
                        onChange={handleAdminInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        required
                      />
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="mt-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Generar
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : editingUser ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}

export default UserManagement

