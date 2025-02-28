import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Acceso No Autorizado</h1>
        <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        <Link href="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
}

