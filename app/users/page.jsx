import Navbar from "../../components/navbar"
import UserManagement from "../../components/user-management"

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <UserManagement />
    </div>
  )
}

