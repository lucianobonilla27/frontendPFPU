import { AuthProvider } from "../contexts/auth-context"
import RouteGuard from "../components/route-guard"
import "./global.css"

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <RouteGuard>{children}</RouteGuard>
        </AuthProvider>
      </body>
    </html>
  )
}

