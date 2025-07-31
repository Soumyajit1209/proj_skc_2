"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Shield, User, Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [role, setRole] = useState<"admin" | "superadmin">("admin")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`http://localhost:3001/api/${role}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("role", role)

        toast({
          variant: "success",
          title: "Login Successful! 🎉",
          description: `Welcome back! Redirecting to ${role} dashboard...`,
        })

        setTimeout(() => {
          router.push(role === "admin" ? "/admin/dashboard" : "/superadmin/home")
        }, 1000)
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: data.error || "Invalid credentials. Please try again.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Unable to connect to server. Please check your connection.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/80 backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-500">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="flex justify-center mb-6 relative">
            <div className="relative">
              {role === "admin" ? (
                <div className="relative">
                  <Building2 className="h-16 w-16 text-blue-600 animate-in zoom-in-50 duration-300" />
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Shield className="h-16 w-16 text-purple-600 animate-in zoom-in-50 duration-300" />
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-xl animate-pulse"></div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {role === "admin" ? "Admin Portal" : "Super Admin Portal"}
          </CardTitle>
          <CardDescription className="text-gray-600 text-lg">Welcome back! Please sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-semibold text-gray-700">
                Role
              </Label>
              <Select value={role} onValueChange={(value: "admin" | "superadmin") => setRole(value)}>
                <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-200 hover:border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-3 py-1">
                      <User className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Admin</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="superadmin">
                    <div className="flex items-center gap-3 py-1">
                      <Shield className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Super Admin</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                required
              />
            </div>

            <Button
              type="submit"
              className={`w-full h-12 text-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                role === "admin"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-blue-500/25"
                  : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-purple-500/25"
              }`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <p className="text-center text-sm font-medium text-gray-700 mb-3">Demo Credentials:</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                <span className="font-semibold text-blue-600">Admin:</span>
                <span className="text-gray-600">admin / 123</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                <span className="font-semibold text-purple-600">Super Admin:</span>
                <span className="text-gray-600">superadmin / superadmin123</span>
              </div>
            </div>
          </div> */}
        </CardContent>
      </Card>
    </div>
  )
}
