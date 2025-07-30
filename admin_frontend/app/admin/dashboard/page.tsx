"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingCart, CreditCard, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react"

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
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Payments",
      value: stats.totalPayments,
      icon: CreditCard,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const paymentStats = [
    {
      title: "Pending Payments",
      value: stats.pendingPayments,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Approved Payments",
      value: stats.approvedPayments,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Rejected Payments",
      value: stats.rejectedPayments,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Today's Attendance",
      value: stats.attendanceToday,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your admin dashboard</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment & Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paymentStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-semibold">Manage Employees</h3>
              <p className="text-sm text-gray-600">Add, edit, or remove employees</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <CreditCard className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-semibold">Review Payments</h3>
              <p className="text-sm text-gray-600">Approve or reject pending payments</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Clock className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-semibold">Attendance Report</h3>
              <p className="text-sm text-gray-600">View employee attendance records</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
