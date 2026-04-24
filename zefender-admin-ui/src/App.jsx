import { useState } from "react"
import RoleSelect from "./pages/RoleSelect"
import AdminLogin from "./pages/AdminLogin"
import Dashboard from "./pages/Dashboard"
import { clearSession } from "./utils/auth"
import axios from "axios"

export default function App() {
  const [screen, setScreen] = useState("select")  // "select"|"admin-login"|"superadmin"|"admin"
  const [loading, setLoading] = useState(false)
  const [saError, setSaError] = useState("")

  // Superadmin — login with hardcoded credentials to get a JWT
  const enterSuperAdmin = async () => {
    setLoading(true); setSaError("")
    try {
      const res = await axios.post("/api/auth/login", {
        email: "superadmin@zefender.com",
        password: "Zefender@123",
        role: "superadmin",
      })
      localStorage.setItem("user_role", "superadmin")
      localStorage.setItem("zef_token", res.data.token)
      setScreen("superadmin")
    } catch (err) {
      setSaError(err.response?.data?.message || "Failed to connect to backend")
    }
    setLoading(false)
  }

  const handleAdminLogin = ({ token, email, allowed_devices }) => {
    localStorage.setItem("user_role", "admin")
    localStorage.setItem("zef_token", token)
    localStorage.setItem("admin_allowed_machines", JSON.stringify(allowed_devices || []))
    setScreen("admin")
  }

  const handleLogout = () => {
    clearSession()
    setScreen("select")
    setSaError("")
  }

  if (screen === "select")      return <RoleSelect onSuperAdmin={enterSuperAdmin} onAdmin={() => setScreen("admin-login")} loading={loading} error={saError} />
  if (screen === "admin-login") return <AdminLogin onLogin={handleAdminLogin} onBack={() => setScreen("select")} />
  if (screen === "superadmin")  return <Dashboard role="superadmin" onLogout={handleLogout} />
  if (screen === "admin")       return <Dashboard role="admin" onLogout={handleLogout} />
}
