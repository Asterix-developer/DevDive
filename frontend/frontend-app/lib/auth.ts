import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000" // adjust as needed

export function getToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("jwt")
}

export function getRoles() {
  if (typeof window === "undefined") return []
  const roles = localStorage.getItem("roles")
  return roles ? JSON.parse(roles) : []
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("jwt")
    localStorage.removeItem("roles")
  }
}

export async function login(userName: string, password: string) {
  try {
    const res = await axios.post(`${API_URL}/api/auth/login`, { userName, password })
    if (res.data && res.data.token) {
      localStorage.setItem("jwt", res.data.token)
      localStorage.setItem("roles", JSON.stringify(res.data.roles || []))
      return { success: true }
    }
    return { success: false, message: "Invalid response from server" }
  } catch (e: any) {
    return { success: false, message: e.response?.data?.message || "Login failed" }
  }
}

export async function register(userName: string, password: string) {
  try {
    const res = await axios.post(`${API_URL}/api/auth/register`, { userName, password })
    if (res.data && res.data.success) {
      return { success: true }
    }
    return { success: false, message: res.data?.message || "Registration failed" }
  } catch (e: any) {
    return { success: false, message: e.response?.data?.message || "Registration failed" }
  }
}

// Axios interceptor to add JWT to all requests
if (typeof window !== "undefined") {
  axios.interceptors.request.use(
    config => {
      const token = getToken()
      if (token) {
        config.headers = config.headers || {}
        config.headers["Authorization"] = `Bearer ${token}`
      }
      return config
    },
    error => Promise.reject(error)
  )

  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logout()
        window.location.href = "/login"
      }
      return Promise.reject(error)
    }
  )
}
