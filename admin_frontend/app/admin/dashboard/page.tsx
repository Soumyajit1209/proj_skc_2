"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingCart, CreditCard, TrendingUp, Clock, CheckCircle, XCircle, Sparkles, Currency, Calendar, BarChart3, Activity, Target } from "lucide-react"
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useRouter } from "next/navigation"

interface DashboardStats {
  totalEmployees: number
  totalCustomers: number
  totalOrders: number
  totalPayments: number
  pendingPayments: number
  approvedPayments: number
  rejectedPayments: number
  attendanceToday: number
  totalRevenue: number
  monthlyGrowth: number
}

interface MonthlyData {
  month: string
  orders: number
  revenue: number
  customers: number
}

interface PaymentStatusData {
  name: string
  value: number
  color: string
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
    totalRevenue: 0,
    monthlyGrowth: 0,
  })
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)

  // Conversion rate: 1 USD = 83.5 INR
  const USD_TO_INR = 83.5

  // Generate monthly data from orders and payments
  const generateMonthlyData = (orders: any[], payments: any[], customers: any[]) => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]
    
    const currentYear = new Date().getFullYear()
    const monthlyStats: MonthlyData[] = []

    for (let i = 0; i < 12; i++) {
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.order_date)
        return orderDate.getMonth() === i && orderDate.getFullYear() === currentYear
      })

      const monthPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.created_at)
        return paymentDate.getMonth() === i && 
               paymentDate.getFullYear() === currentYear &&
               payment.payment_status === 'APPROVED'
      })

      const monthCustomers = customers.filter(customer => {
        const customerDate = new Date(customer.created_at)
        return customerDate.getMonth() === i && customerDate.getFullYear() === currentYear
      })

      const monthRevenue = monthPayments.reduce((sum, payment) => 
        sum + (parseFloat(payment.payment_amount || 0) * USD_TO_INR), 0
      )

      monthlyStats.push({
        month: months[i],
        orders: monthOrders.length,
        revenue: Math.round(monthRevenue),
        customers: monthCustomers.length
      })
    }

    return monthlyStats
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
      if (!token) {
        console.error("No authentication token found")
        setLoading(false)
        return
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      const [employeesRes, customersRes, ordersRes, paymentsRes, attendanceRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/employees`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/customers`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/payments`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/attendance`, { headers }),
      ])

      const [employees, customersData, orders, payments, attendance] = await Promise.all([
        employeesRes.json(),
        customersRes.json(),
        ordersRes.json(),
        paymentsRes.json(),
        attendanceRes.json(),
      ])

      const customers = customersData?.data?.customers || []

      const pendingPayments = payments.filter((p: any) => p.payment_status === "PENDING").length
      const approvedPayments = payments.filter((p: any) => p.payment_status === "APPROVED").length
      const rejectedPayments = payments.filter((p: any) => p.payment_status === "REJECTED").length

      const totalRevenue = payments
        .filter((p: any) => p.payment_status === "APPROVED")
        .reduce((sum: number, p: any) => sum + (parseFloat(p.payment_amount || 0) * USD_TO_INR), 0)

      const today = new Date().toISOString().split("T")[0]
      const todayAttendance = attendance.filter((a: any) => 
        a.attendance_date.startsWith(today)
      ).length

      const currentMonth = new Date().getMonth()
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const currentMonthOrders = orders.filter((o: any) => 
        new Date(o.order_date).getMonth() === currentMonth
      ).length
      const lastMonthOrders = orders.filter((o: any) => 
        new Date(o.order_date).getMonth() === lastMonth
      ).length
      const monthlyGrowth = lastMonthOrders > 0 ? 
        ((currentMonthOrders - lastMonthOrders) / lastMonthOrders * 100) : 0

      setStats({
        totalEmployees: employees.length,
        totalCustomers: customers.length,
        totalOrders: orders.length,
        totalPayments: payments.length,
        pendingPayments,
        approvedPayments,
        rejectedPayments,
        attendanceToday: todayAttendance,
        totalRevenue: totalRevenue,
        monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
      })

      const generatedMonthlyData = generateMonthlyData(orders, payments, customers)
      setMonthlyData(generatedMonthlyData)

    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setStats({
        totalEmployees: 0,
        totalCustomers: 0,
        totalOrders: 0,
        totalPayments: 0,
        pendingPayments: 0,
        approvedPayments: 0,
        rejectedPayments: 0,
        attendanceToday: 0,
        totalRevenue: 0,
        monthlyGrowth: 0,
      })
      setMonthlyData([])
    } finally {
      setLoading(false)
    }
  }

  const router = useRouter()

  const handleManageEmployeesClick = () => {
    router.push("/admin/employees")
  }

  const handleReviewPaymentsClick = () => {
    router.push("/admin/payments")
  }

  const handleAttendanceReportClick = () => {
    router.push("/admin/attendance")
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      icon: Currency,
      color: "text-gray-600",
      bgColor: "bg-gradient-to-br from-gray-50 to-gray-100",
      borderColor: "border-gray-200",
      change: `${stats.monthlyGrowth >= 0 ? '+' : ''}${stats.monthlyGrowth}%`,
      changeColor: stats.monthlyGrowth >= 0 ? "text-gray-600" : "text-gray-800",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString('en-IN'),
      icon: ShoppingCart,
      color: "text-gray-600",
      bgColor: "bg-gradient-to-br from-gray-50 to-gray-100",
      borderColor: "border-gray-200",
      change: "+8.2%",
      changeColor: "text-gray-600",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toLocaleString('en-IN'),
      icon: Users,
      color: "text-gray-600",
      bgColor: "bg-gradient-to-br from-gray-50 to-gray-100",
      borderColor: "border-gray-200",
      change: "+15.3%",
      changeColor: "text-gray-600",
    },
    {
      title: "Total Employees",
      value: stats.totalEmployees.toLocaleString('en-IN'),
      icon: Users,
      color: "text-gray-600",
      bgColor: "bg-gradient-to-br from-gray-50 to-gray-100",
      borderColor: "border-gray-200",
      change: "+2.1%",
      changeColor: "text-gray-600",
    },
  ]

  const paymentStats = [
    {
      title: "Pending Payments",
      value: stats.pendingPayments,
      icon: Clock,
      color: "text-gray-600",
      bgColor: "bg-gradient-to-br from-gray-50 to-gray-100",
      borderColor: "border-gray-200",
    },
    {
      title: "Approved Payments",
      value: stats.approvedPayments,
      icon: CheckCircle,
      color: "text-gray-600",
      bgColor: "bg-gradient-to-br from-gray-50 to-gray-100",
      borderColor: "border-gray-200",
    },
    {
      title: "Rejected Payments",
      value: stats.rejectedPayments,
      icon: XCircle,
      color: "text-gray-600",
      bgColor: "bg-gradient-to-br from-gray-50 to-gray-100",
      borderColor: "border-gray-200",
    },
    {
      title: "Today's Attendance",
      value: stats.attendanceToday,
      icon: Activity,
      color: "text-gray-600",
      bgColor: "bg-gradient-to-br from-gray-50 to-gray-100",
      borderColor: "border-gray-200",
    },
  ]

  const paymentStatusData: PaymentStatusData[] = [
    { name: "Approved", value: stats.approvedPayments, color: "#6b7280" }, // Gray
    { name: "Pending", value: stats.pendingPayments, color: "#9ca3af" }, // Light gray
    { name: "Rejected", value: stats.rejectedPayments, color: "#4b5563" }, // Dark gray
  ]

  const chartConfig = {
    orders: {
      label: "Orders",
      color: "#6b7280", // Gray
    },
    revenue: {
      label: "Revenue",
      color: "#4b5563", // Dark gray
    },
    customers: {
      label: "Customers",
      color: "#9ca3af", // Light gray
    },
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-80 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="relative">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-2 text-lg">Analytics & Business Intelligence</p>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleDateString('en-IN')}</span>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-102 animate-in slide-in-from-bottom duration-500 relative overflow-hidden`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-12 -mt-12"></div>
            <CardContent className="p-5 relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <div className="flex items-center gap-1 text-xs">
                    <TrendingUp className="h-3 w-3 text-gray-500" />
                    <span className={`font-medium ${stat.changeColor}`}>{stat.change}</span>
                    <span className="text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-white shadow-sm`}>
                  <stat.icon className={`h-7 w-7 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment & Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {paymentStats.map((stat, index) => (
          <Card
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-102 animate-in slide-in-from-bottom duration-500`}
            style={{ animationDelay: `${(index + 4) * 100}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{stat.title}</p>
                  <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-full bg-white shadow-sm`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Orders Trend */}
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm animate-in slide-in-from-left duration-700">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                Sales Trends
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-gray-500">Monthly revenue and orders performance</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => name === 'revenue' ? `₹${value.toLocaleString('en-IN')}` : value} />} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#4b5563" 
                    strokeWidth={2}
                    dot={{ fill: "#4b5563", strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 5, stroke: "#4b5563", strokeWidth: 1 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#6b7280" 
                    strokeWidth={2}
                    dot={{ fill: "#6b7280", strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 5, stroke: "#6b7280", strokeWidth: 1 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Payment Status Distribution */}
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm animate-in slide-in-from-right duration-700">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                Payment Status
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-gray-500">Distribution of payment statuses</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius="50"
                    outerRadius="100"
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-2 border border-gray-200 rounded-md shadow-sm">
                            <p className="font-semibold text-gray-800">{data.name}</p>
                            <p className="text-xs text-gray-600">Count: {data.value}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-3">
              {paymentStatusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs font-medium text-gray-700">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Orders Bar Chart */}
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm animate-in slide-in-from-bottom duration-700 delay-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                Monthly Orders
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-gray-500">Order volume by month</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="orders" 
                    fill="#6b7280"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Customer Growth Area Chart */}
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm animate-in slide-in-from-bottom duration-700 delay-300">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                Customer Growth
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-gray-500">New customers acquired monthly</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6b7280" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6b7280" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="customers"
                    stroke="#6b7280"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCustomers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white border border-gray-200 rounded-lg shadow-sm animate-in slide-in-from-bottom duration-500 delay-700">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
              Quick Actions
            </CardTitle>
          </div>
          <CardDescription className="text-sm text-gray-500">Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className="group p-5 border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 cursor-pointer transition-all duration-300 transform hover:scale-102 hover:shadow-sm"
              onClick={handleManageEmployeesClick}
            >
              <Users className="h-8 w-8 text-gray-600 mb-3 group-hover:scale-105 transition-transform duration-300" />
              <h3 className="font-bold text-base mb-1 text-gray-800">Manage Employees</h3>
              <p className="text-xs text-gray-600">Add, edit, or remove employees</p>
            </div>
            <div
              className="group p-5 border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 cursor-pointer transition-all duration-300 transform hover:scale-102 hover:shadow-sm"
              onClick={handleReviewPaymentsClick}
            >
              <CreditCard className="h-8 w-8 text-gray-600 mb-3 group-hover:scale-105 transition-transform duration-300" />
              <h3 className="font-bold text-base mb-1 text-gray-800">Review Payments</h3>
              <p className="text-xs text-gray-600">Approve or reject pending payments</p>
            </div>
            <div
              className="group p-5 border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 cursor-pointer transition-all duration-300 transform hover:scale-102 hover:shadow-sm"
              onClick={handleAttendanceReportClick}
            >
              <Clock className="h-8 w-8 text-gray-600 mb-3 group-hover:scale-105 transition-transform duration-300" />
              <h3 className="font-bold text-base mb-1 text-gray-800">Attendance Report</h3>
              <p className="text-xs text-gray-600">View employee attendance records</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}