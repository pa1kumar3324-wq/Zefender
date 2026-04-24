// Centralised RBAC + session helpers
// All localStorage access goes through here

export const getUserRole = () => localStorage.getItem("user_role") || null
export const getToken    = () => localStorage.getItem("zef_token")  || null

export const getAllowedMachines = () => {
  try {
    return JSON.parse(localStorage.getItem("admin_allowed_machines") || "[]")
  } catch {
    return []
  }
}

export const isSuperAdmin = () => getUserRole() === "superadmin"

// Filter devices based on role
export const filterDevicesByRole = (devices = []) => {
  const role = getUserRole()
  if (role === "superadmin") return devices
  if (role === "admin") {
    const allowed = getAllowedMachines()
    return devices.filter(d => allowed.includes(d.id))
  }
  return []
}

// Called after successful login
export const saveSession = ({ token, role }) => {
  localStorage.setItem("zef_token", token)
  localStorage.setItem("user_role", role)
}

export const clearSession = () => {
  localStorage.removeItem("zef_token")
  localStorage.removeItem("user_role")
  localStorage.removeItem("admin_allowed_machines")
}
