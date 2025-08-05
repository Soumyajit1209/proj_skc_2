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
import {
  BarChart3,
  Users,
  ShoppingCart,
  CreditCard,
  Package,
  MapPin,
  Clock,
  Menu,
  LogOut,
  Building2,
  Sparkles,
  KeyRound,
} from "lucide-react"
import Link from "next/link"
import { useTokenValidation } from "@/hooks/useTokenValidation"

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3, color: "text-blue-600" },
  { name: "Employees", href: "/admin/employees", icon: Users, color: "text-green-600" },
  { name: "Customers", href: "/admin/customers", icon: Users, color: "text-purple-600" },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart, color: "text-orange-600" },
  { name: "Payments", href: "/admin/payments", icon: CreditCard, color: "text-red-600" },
  { name: "Products", href: "/admin/products", icon: Package, color: "text-indigo-600" },
  { name: "Localities", href: "/admin/localities", icon: MapPin, color: "text-pink-600" },
  { name: "Attendance", href: "/admin/attendance", icon: Clock, color: "text-teal-600" },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminName, setAdminName] = useState("Admin User")

  // Initialize token validation
  useTokenValidation({ role: "admin", intervalMs: 5000 })

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (!token || role !== "admin") {
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
    router.push("/admin/change-password")
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
      className={`flex flex-col h-full ${mobile ? "w-full" : "w-64"} bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-xl`}
    >
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="relative">
          <Building2 className="h-8 w-8 text-blue-600" />
          <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Panel
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
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-lg"
                  : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900 hover:shadow-md"
              }`}
              onClick={() => mobile && setSidebarOpen(false)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <item.icon
                className={`h-4 w-4 transition-colors duration-300 ${isActive ? "text-blue-600" : item.color} group-hover:scale-110`}
              />
              <span className="font-semibold">{item.name}</span>
              {isActive && <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-auto p-3 hover:bg-white hover:shadow-md transition-all duration-300"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt={adminName} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-semibold">
                  {getInitials(adminName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-900">{adminName}</span>
                <span className="text-xs text-gray-500">Administrator</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{adminName}</p>
                <p className="text-xs leading-none text-muted-foreground">Administrator</p>
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
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Panel
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-blue-50 transition-colors duration-200">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="/placeholder.svg?height=24&width=24" alt={adminName} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                    {getInitials(adminName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{adminName}</p>
                  <p className="text-xs leading-none text-muted-foreground">Administrator</p>
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
