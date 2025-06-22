import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AuthGuard from "./AuthGuard"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DevDive Universe Journey",
  description: "Learn programming through gamified space exploration",
  generator: 'v0.dev'
}

// Suppress ResizeObserver errors globally
if (typeof window !== "undefined") {
  const originalError = console.error
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("ResizeObserver loop completed with undelivered notifications")
    ) {
      return
    }
    originalError(...args)
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div id="resize-observer-error-suppressor" className="resize-observer-error" />
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  )
}
