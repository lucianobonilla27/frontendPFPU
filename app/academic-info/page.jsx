"use client"

import { useState } from "react"
import Navbar from "../../components/navbar"
import { BookOpen, Clock, TrendingUp } from "lucide-react"

export default function AcademicInfo() {
  const [selectedPeriod, setSelectedPeriod] = useState("current")

  // Datos de ejemplo
  const academicData = {
    current: {
      year: "2024",
      grade: "4° Grado",
      subjects: [
        {
          id: 1,
          name: "Matemáticas",
          teacher: "Prof. María González",
          grades: {
            1: [{ grade: 8, date: "2024-03-15", description: "Primer parcial" }],
            2: [{ grade: 7, date: "2024-06-20", description: "Trabajo práctico" }],
            3: [],
          },
          attendance: {
            total: 20,
            present: 18,
            late: 1,
            absent: 1,
          },
          average: 7.5,
        },
        {
          id: 2,
          name: "Lengua",
          teacher: "Prof. Juan Pérez",
          grades: {
            1: [{ grade: 9, date: "2024-03-10", description: "Exposición oral" }],
            2: [],
            3: [],
          },
          attendance: {
            total: 20,
            present: 19,
            late: 0,
            absent: 1,
          },
          average: 9,
        },
      ],
      generalAverage: 8.25,
    },
    past: [
      {
        year: "2023",
        grade: "3° Grado",
        finalAverage: 8.5,
        subjects: [
          {
            name: "Matemáticas",
            finalGrade: 8,
            attendance: "95%",
          },
          {
            name: "Lengua",
            finalGrade: 9,
            attendance: "98%",
          },
        ],
      },
    ],
  }

  const calculateAttendancePercentage = (attendance) => {
    const totalClasses = attendance.total
    const presentClasses = attendance.present + attendance.late * 0.5
    return ((presentClasses / totalClasses) * 100).toFixed(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Encabezado */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Información Académica</h1>
            <p className="text-gray-600">
              {academicData.current.grade} - Año Lectivo {academicData.current.year}
            </p>
          </div>

          {/* Selector de período */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setSelectedPeriod("current")}
                className={`px-4 py-2 rounded-md ${
                  selectedPeriod === "current" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Período Actual
              </button>
              <button
                onClick={() => setSelectedPeriod("past")}
                className={`px-4 py-2 rounded-md ${
                  selectedPeriod === "past" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Períodos Anteriores
              </button>
            </div>

            {selectedPeriod === "current" ? (
              <div className="space-y-6">
                {/* Resumen del período actual */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-sm font-medium text-blue-900">Promedio General</h3>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-blue-700">{academicData.current.generalAverage}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-green-600 mr-2" />
                      <h3 className="text-sm font-medium text-green-900">Materias Cursando</h3>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-green-700">{academicData.current.subjects.length}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-purple-600 mr-2" />
                      <h3 className="text-sm font-medium text-purple-900">Asistencia General</h3>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-purple-700">95%</p>
                  </div>
                </div>

                {/* Lista de materias actuales */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">Materias en Curso</h2>
                  {academicData.current.subjects.map((subject) => (
                    <div key={subject.id} className="bg-white border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{subject.name}</h3>
                          <p className="text-sm text-gray-600">{subject.teacher}</p>
                        </div>
                        <div className="mt-2 md:mt-0">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            Promedio: {subject.average}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Notas por trimestre */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Calificaciones</h4>
                          <div className="space-y-2">
                            {[1, 2, 3].map((trimester) => (
                              <div key={trimester} className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">{trimester}° Trimestre</span>
                                <div className="flex flex-wrap gap-2">
                                  {subject.grades[trimester].map((grade, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-1 rounded bg-gray-100"
                                      title={grade.description}
                                    >
                                      {grade.grade}
                                    </span>
                                  ))}
                                  {subject.grades[trimester].length === 0 && (
                                    <span className="text-sm text-gray-400">Sin notas</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Asistencia */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Asistencia</h4>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Presente</span>
                              <span className="text-sm text-gray-900">{subject.attendance.present}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Tarde</span>
                              <span className="text-sm text-gray-900">{subject.attendance.late}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Ausente</span>
                              <span className="text-sm text-gray-900">{subject.attendance.absent}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span className="text-sm text-gray-600">Porcentaje</span>
                              <span className="text-sm text-gray-900">
                                {calculateAttendancePercentage(subject.attendance)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Historial académico */}
                {academicData.past.map((year, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {year.grade} - {year.year}
                        </h3>
                        <p className="text-sm text-gray-600">Promedio Final: {year.finalAverage}</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Materia</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Nota Final
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Asistencia
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {year.subjects.map((subject, subIndex) => (
                            <tr key={subIndex}>
                              <td className="px-4 py-2 text-sm text-gray-900">{subject.name}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{subject.finalGrade}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{subject.attendance}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

