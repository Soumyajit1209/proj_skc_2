"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingCart, CreditCard, TrendingUp, Clock, CheckCircle, XCircle, Sparkles } from "lucide-react"

interface DashboardStats {
  totalEmployees: number
  totalCustomers: number
  totalOrders: number
  totalPayments: number
  pendingPayments: number
  approvedPayments: number
  rejectedPayments: number
  attendanceToday: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalPayments: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    rejectedPayments: 0,
    attendanceToday: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      // Fetch all data in parallel
      const [employeesRes, paymentsRes, attendanceRes] = await Promise.all([
        fetch("http://localhost:3001/api/admin/employees", { headers }),
        fetch("http://localhost:3001/api/admin/payments", { headers }),
        fetch("http://localhost:3001/api/admin/attendance", { headers }),
      ])

      const [employees, payments, attendance] = await Promise.all([
        employeesRes.json(),
        paymentsRes.json(),
        attendanceRes.json(),
      ])

      // Calculate stats
      const pendingPayments = payments.filter((p: any) => p.payment_status === "PENDING").length
      const approvedPayments = payments.filter((p: any) => p.payment_status === "APPROVED").length
      const rejectedPayments = payments.filter((p: any) => p.payment_status === "REJECTED").length

      // Get unique customers and orders from payments
      const uniqueCustomers = new Set(payments.map((p: any) => p.customer_id)).size
      const uniqueOrders = new Set(payments.map((p: any) => p.order_id)).size

      // Today's attendance
      const today = new Date().toISOString().split("T")[0]
      const todayAttendance = attendance.filter((a: any) => a.attendance_date.startsWith(today)).length

      setStats({
        totalEmployees: employees.length,
        totalCustomers: uniqueCustomers,
        totalOrders: uniqueOrders,
        totalPayments: payments.length,
        pendingPayments,
        approvedPayments,
        rejectedPayments,
        attendanceToday: todayAttendance,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      shadowColor: "shadow-blue-500/10",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-gradient-to-br from-green-50 to-green-100",
      borderColor: "border-green-200",
      shadowColor: "shadow-green-500/10",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
      shadowColor: "shadow-purple-500/10",
    },
    {
      title: "Total Payments",
      value: stats.totalPayments,
      icon: CreditCard,
      color: "text-orange-600",
      bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
      borderColor: "border-orange-200",
      shadowColor: "shadow-orange-500/10",
    },
  ]

  const paymentStats = [
    {
      title: "Pending Payments",
      value: stats.pendingPayments,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-gradient-to-br from-yellow-50 to-yellow-100",
      borderColor: "border-yellow-200",
      shadowColor: "shadow-yellow-500/10",
    },
    {
      title: "Approved Payments",
      value: stats.approvedPayments,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-gradient-to-br from-green-50 to-green-100",
      borderColor: "border-green-200",
      shadowColor: "shadow-green-500/10",
    },
    {
      title: "Rejected Payments",
      value: stats.rejectedPayments,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-gradient-to-br from-red-50 to-red-100",
      borderColor: "border-red-200",
      shadowColor: "shadow-red-500/10",
    },
    {
      title: "Today's Attendance",
      value: stats.attendanceToday,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100",
      borderColor: "border-indigo-200",
      shadowColor: "shadow-indigo-500/10",
    },
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in-0 duration-500">
      <div className="relative">
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Welcome back! Here's what's happening today</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} ${stat.shadowColor} border-2 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-in slide-in-from-bottom duration-500`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-full bg-white shadow-lg`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment & Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paymentStats.map((stat, index) => (
          <Card
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} ${stat.shadowColor} border-2 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-in slide-in-from-bottom duration-500`}
            style={{ animationDelay: `${(index + 4) * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-white shadow-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 shadow-xl animate-in slide-in-from-bottom duration-500 delay-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Quick Actions
            </CardTitle>
          </div>
          <CardDescription className="text-lg">Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              <Users className="h-10 w-10 text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-bold text-lg mb-2">Manage Employees</h3>
              <p className="text-sm text-gray-600">Add, edit, or remove employees</p>
            </div>
            <div className="group p-6 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              <CreditCard className="h-10 w-10 text-green-600 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-bold text-lg mb-2">Review Payments</h3>
              <p className="text-sm text-gray-600">Approve or reject pending payments</p>
            </div>
            <div className="group p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              <Clock className="h-10 w-10 text-purple-600 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-bold text-lg mb-2">Attendance Report</h3>
              <p className="text-sm text-gray-600">View employee attendance records</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
