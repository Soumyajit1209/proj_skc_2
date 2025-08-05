"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface UseTokenValidationProps {
  role: "admin" | "superadmin"
  intervalMs?: number
}

export function useTokenValidation({ role, intervalMs = 5000 }: UseTokenValidationProps) {
  const router = useRouter()
  const { toast } = useToast()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isCheckingRef = useRef(false)

  const checkToken = async () => {
    // Prevent multiple simultaneous checks
    if (isCheckingRef.current) return

    const token = localStorage.getItem("token")
    const userRole = localStorage.getItem("role")

    // If no token or role mismatch, logout immediately
    if (!token || userRole !== role) {
      handleLogout("Session expired. Please login again.")
      return
    }

    isCheckingRef.current = true

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${role}/check-token`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      // Try to parse response as JSON
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError)
        data = { error: "Invalid response from server" }
      }

      if (!response.ok) {
        console.error("Token validation failed:", {
          status: response.status,
          statusText: response.statusText,
          data: data,
        })

        if (response.status === 401) {
          handleLogout(data.error || "Your session has expired. Please login again.")
        } else if (response.status === 403) {
          handleLogout(data.error || "Access denied. Please contact administrator.")
        } else if (response.status === 500) {
          console.error("Server error during token validation:", data.details || data.error)
          // Don't logout on server errors, just log them
        } else {
          console.error("Unexpected error during token validation:", data.error || "Unknown error")
        }
      } else {
        // Token is valid
        console.log("Token validation successful")
      }
    } catch (error) {
      console.error("Network error during token validation:", error)
      // Don't logout on network errors, just log the error
    } finally {
      isCheckingRef.current = false
    }
  }

  const handleLogout = (message: string) => {
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Clear storage
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("adminName")

    // Show toast
    toast({
      variant: "destructive",
      title: "Session Expired",
      description: message,
      duration: 5000,
    })

    // Redirect to login
    router.push("/login")
  }

  const startTokenValidation = () => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Initial check
    checkToken()

    // Set up periodic checks
    intervalRef.current = setInterval(checkToken, intervalMs)
  }

  const stopTokenValidation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    startTokenValidation()

    // Cleanup on unmount
    return () => {
      stopTokenValidation()
    }
  }, [role, intervalMs])

  // Also check when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      checkToken()
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  return {
    startTokenValidation,
    stopTokenValidation,
    checkToken,
  }
}
