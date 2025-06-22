"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/lib/auth"

export default function LoginPage() {
    const [userName, setUserName] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        const result = await login(userName, password)
        if (result.success) {
            router.push("/")
        } else {
            setError(result.message)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
            <form onSubmit={handleSubmit} className="bg-black/60 p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center">Login</h2>
                {error && <div className="text-red-400 mb-4 text-center">{error}</div>}
                <input
                    className="w-full p-2 mb-4 rounded bg-slate-800 text-white"
                    placeholder="Username"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    required
                />
                <input
                    className="w-full p-2 mb-6 rounded bg-slate-800 text-white"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 rounded" type="submit">
                    Login
                </button>
                <div className="text-center mt-4 text-sm text-gray-400">
                    Don't have an account? <a href="/register" className="text-cyan-400 underline">Register</a>
                </div>
            </form>
        </div>
    )
}
