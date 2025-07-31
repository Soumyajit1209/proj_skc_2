"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
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
} from "lucide-react"
import Link from "next/link"

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

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (!token || role !== "admin") {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    router.push("/login")
  }

  const Sidebar = ({ mobile = false }) => (
    <div
      className={`flex flex-col h-full ${mobile ? "w-full" : "w-64"} bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-xl`}
    >
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="relative">
          <Building2 className="h-10 w-10 text-blue-600" />
          <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-sm text-gray-500 font-medium">SKC Marketing</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                isActive
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-lg"
                  : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900 hover:shadow-md"
              }`}
              onClick={() => mobile && setSidebarOpen(false)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <item.icon
                className={`h-5 w-5 transition-colors duration-300 ${isActive ? "text-blue-600" : item.color} group-hover:scale-110`}
              />
              <span className="font-semibold">{item.name}</span>
              {isActive && <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span className="font-semibold">Logout</span>
        </Button>
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
        <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
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
            <Building2 className="h-6 w-6 text-blue-600" />
            <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Panel
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto animate-in fade-in-0 duration-500">{children}</main>
      </div>
    </div>
  )
} 
