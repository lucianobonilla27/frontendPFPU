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
  id: number
  firstName: string
  lastName: string
  dni: string
  email: string
  password: string
}

interface Admin {
  id: number
  firstName: string
  lastName: string
  dni: string
  email: string
  password: string
}

interface Subject {
  id: number
  name: string
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
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchingCursos, setFetchingCursos] = useState(true)
  const [fetchingAlumnos, setFetchingAlumnos] = useState(true)

  // Actualizar el estado para incluir el usuario que se está editando
  const [editingUser, setEditingUser] = useState<Alumno | null>(null)

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

  // Datos de ejemplo para profesores y administradores (que no estamos modificando ahora)
  const teachers = [
    {
      id: 1,
      firstName: "María",
      lastName: "González",
      dni: "87654321",
      email: "maria@escuela.com",
      password: "********",
    },
  ]

  const admins = [
    {
      id: 1,
      firstName: "Carlos",
      lastName: "Rodríguez",
      dni: "98765432",
      email: "carlos@admin.com",
      password: "********",
    },
  ]

  // Ejemplo de materias (mantenemos los datos de ejemplo para esta parte)
  const subjects = [
    { id: 1, name: "Matemáticas" },
    { id: 2, name: "Lengua" },
    { id: 3, name: "Ciencias Naturales" },
    { id: 4, name: "Ciencias Sociales" },
    { id: 5, name: "Inglés" },
    { id: 6, name: "Educación Física" },
    { id: 7, name: "Música" },
    { id: 8, name: "Plástica" },
    { id: 9, name: "Tecnología" },
    { id: 10, name: "Formación Ética" },
  ]

  // Función genérica para hacer peticiones XMLHttpRequest
  const makeRequest = useCallback((method: string, url: string, data: any = null): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open(method, url, true)
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          resolve(JSON.parse(xhr.response))
        } else {
          reject({
            status: this.status,
            statusText: this.statusText,
          })
        }
      }
      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: this.statusText,
        })
      }
      if (data) {
        xhr.send(JSON.stringify(data))
      } else {
        xhr.send()
      }
    })
  }, [])

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

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const updatedValue =
      name === "dni" || name === "id_curso" || name === "matricula"
        ? Number(value)
        : name === "fecha_nac"
          ? new Date(value).toISOString()
          : value
  
    if (editingUser) {
      setEditingUser((prev) => prev ? { ...prev, [name]: updatedValue } : null)
    } else {
      setNuevoAlumno((prev) => ({ ...prev, [name]: updatedValue }))
    }
  }

  // Función para editar un alumno
  const handleEdit = (alumno: Alumno) => {
    setEditingUser(alumno)
    setNuevoAlumno(alumno)
    setIsModalOpen(true)
  }

  // Función para actualizar un alumno
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingUser) return

    try {
      setIsLoading(true)
      setError(null)

      console.log("Enviando datos de actualización:", editingUser)

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

  // Actualizar la función handleSubmit para manejar tanto creación como actualización
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (activeTab !== "students") {
      console.log("La creación/edición de este tipo de usuario no está implementada aún")
      return
    }

    if (editingUser) {
      await handleUpdate(e)
    } else {
      try {
        setIsLoading(true)
        setError(null)

        console.log("Enviando datos:", nuevoAlumno)

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
  }

  // Actualizar handleCloseModal para limpiar editingUser
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSubjects([])
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
    setError(null)
  }

  // Función para generar una contraseña aleatoria
  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNuevoAlumno({ ...nuevoAlumno, contrasenia: password })
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

  // Función para eliminar un alumno
  const handleDelete = async (id_usuario: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este alumno?")) {
      try {
        setIsLoading(true)
        await makeRequest("DELETE", `https://localhost:7213/DeleteAlumno?id_usuario=${id_usuario}`)
        // Actualizar la lista de alumnos después de eliminar
        const updatedAlumnos = alumnos.filter((alumno) => alumno.id_usuario !== id_usuario)
        setAlumnos(updatedAlumnos)
      } catch (error) {
        console.error("Error al eliminar alumno:", error)
        setError("Ocurrió un error al eliminar el alumno. Por favor, inténtalo de nuevo.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSubjectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const subjectId = Number.parseInt(event.target.value, 10)
    if (event.target.checked) {
      setSelectedSubjects([...selectedSubjects, subjectId])
    } else {
      setSelectedSubjects(selectedSubjects.filter((id) => id !== subjectId))
    }
  }

  const Modal = ({
    isOpen,
    onClose,
    children,
  }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md">{children}</div>
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
      {(fetchingAlumnos || fetchingCursos) && (
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
              teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td className="px-6 py-4">{teacher.firstName}</td>
                  <td className="px-6 py-4">{teacher.lastName}</td>
                  <td className="px-6 py-4">{teacher.dni}</td>
                  <td className="px-6 py-4">{teacher.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(teacher)} className="p-1 hover:bg-gray-100 rounded">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(teacher.id)} className="p-1 hover:bg-gray-100 rounded">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {activeTab === "admins" &&
              admins.map((admin) => (
                <tr key={admin.id}>
                  <td className="px-6 py-4">{admin.firstName}</td>
                  <td className="px-6 py-4">{admin.lastName}</td>
                  <td className="px-6 py-4">{admin.dni}</td>
                  <td className="px-6 py-4">{admin.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(admin)} className="p-1 hover:bg-gray-100 rounded">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(admin.id)} className="p-1 hover:bg-gray-100 rounded">
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
          <h2 className="text-xl font-bold">{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</h2>
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
                      value={editingUser ? editingUser.nombre : nuevoAlumno.nombre}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellido(s)</label>
                    <input
                      type="text"
                      name="apellido"
                      value={editingUser ? editingUser.apellido : nuevoAlumno.apellido}
                      onChange={handleInputChange}
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
                    value={editingUser ? editingUser.dni : nuevoAlumno.dni || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={editingUser ? editingUser.direccion : nuevoAlumno.direccion}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={editingUser ? editingUser.telefono || "" : nuevoAlumno.telefono}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    name="fecha_nac"
                    value={(editingUser ? editingUser.fecha_nac : nuevoAlumno.fecha_nac).split("T")[0]}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                  <input
                    type="email"
                    name="correo"
                    value={editingUser ? editingUser.correo : nuevoAlumno.correo}
                    onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                      value={editingUser ? editingUser.matricula : nuevoAlumno.matricula || ""}
                      onChange={handleInputChange}
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
                    value={editingUser ? editingUser.id_curso : nuevoAlumno.id_curso || ""}
                    onChange={handleInputChange}
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
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellido</label>
                    <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">DNI</label>
                  <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input type="tel" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                  <input type="email" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                  <input type="password" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
                </div>
                {activeTab === "teachers" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Asignar Materias</label>
                    <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                      <div className="space-y-2">
                        {subjects.map((subject) => (
                          <label
                            key={subject.id}
                            className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              value={subject.id}
                              checked={selectedSubjects.includes(subject.id)}
                              onChange={handleSubjectChange}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{subject.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {selectedSubjects.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm text-gray-500">Materias seleccionadas: {selectedSubjects.length}</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedSubjects.map((id) => (
                            <span
                              key={id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {subjects.find((s) => s.id === id)?.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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

