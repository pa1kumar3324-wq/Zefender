import { useState } from "react"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("zef_token") || null)

  const handleLogin = (newToken) => {
    localStorage.setItem("zef_token", newToken)
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem("zef_token")
    setToken(null)
  }

  if (!token) {
    return <Login onLogin={handleLogin} />
  }

  return <Dashboard token={token} onLogout={handleLogout} />
}