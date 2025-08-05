"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BarChart3, Building2, Menu, LogOut, Shield, Crown, KeyRound } from "lucide-react"
import Link from "next/link"
import { useTokenValidation } from "@/hooks/useTokenValidation"

const navigation = [
  { name: "Dashboard", href: "/superadmin/dashboard", icon: BarChart3, color: "text-purple-600" },
  { name: "Companies", href: "/superadmin/companies", icon: Building2, color: "text-indigo-600" },
]

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminName, setAdminName] = useState("Super Admin")

  // Initialize token validation
  useTokenValidation({ role: "superadmin", intervalMs: 5000 })

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (!token || role !== "superadmin") {
      router.push("/login")
    }

    // Get admin name from localStorage or API
    const storedAdminName = localStorage.getItem("adminName")
    if (storedAdminName) {
      setAdminName(storedAdminName)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("adminName")
    router.push("/login")
  }

  const handleChangePassword = () => {
    router.push("/superadmin/change-password")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const Sidebar = ({ mobile = false }) => (
    <div
      className={`flex flex-col h-full ${mobile ? "w-full" : "w-64"} bg-gradient-to-b from-white to-purple-50 border-r border-purple-200 shadow-xl`}
    >
      <div className="flex items-center gap-3 px-4 py-4 border-b border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="relative">
          <Shield className="h-8 w-8 text-purple-600" />
          <Crown className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Super Admin
          </h1>
          <p className="text-xs text-gray-500 font-medium">SKC Marketing</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                isActive
                  ? "bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border border-purple-200 shadow-lg"
                  : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 hover:text-gray-900 hover:shadow-md"
              }`}
              onClick={() => mobile && setSidebarOpen(false)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <item.icon
                className={`h-4 w-4 transition-colors duration-300 ${isActive ? "text-purple-600" : item.color} group-hover:scale-110`}
              />
              <span className="font-semibold">{item.name}</span>
              {isActive && <div className="ml-auto w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-auto p-3 hover:bg-white hover:shadow-md transition-all duration-300"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt={adminName} />
                <AvatarFallback className="bg-purple-100 text-purple-600 text-sm font-semibold">
                  {getInitials(adminName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-900">{adminName}</span>
                <span className="text-xs text-gray-500">Super Administrator</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{adminName}</p>
                <p className="text-xs leading-none text-muted-foreground">Super Administrator</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleChangePassword} className="cursor-pointer">
              <KeyRound className="mr-2 h-4 w-4" />
              <span>Change Password</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex animate-in slide-in-from-left duration-500">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-purple-200 shadow-sm">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <span className="font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Super Admin
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-purple-50 transition-colors duration-200">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="/placeholder.svg?height=24&width=24" alt={adminName} />
                  <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                    {getInitials(adminName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{adminName}</p>
                  <p className="text-xs leading-none text-muted-foreground">Super Administrator</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleChangePassword} className="cursor-pointer">
                <KeyRound className="mr-2 h-4 w-4" />
                <span>Change Password</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto animate-in fade-in-0 duration-500">{children}</main>
      </div>
    </div>
  )
}
