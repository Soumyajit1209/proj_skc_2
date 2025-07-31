"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, TrendingUp, Activity } from "lucide-react"

interface Company {
  company_id: number
  company_name: string
  company_email: string
  company_phone_1: string
  status: "ACTIVE" | "INACTIVE"
  created_at: string
}

export default function SuperAdminDashboard() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/superadmin/companies", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
    } finally {
      setLoading(false)
    }
  }

  const activeCompanies = companies.filter((c) => c.status === "ACTIVE").length
  const inactiveCompanies = companies.filter((c) => c.status === "INACTIVE").length

  const statCards = [
    {
      title: "Total Companies",
      value: companies.length,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Companies",
      value: activeCompanies,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Inactive Companies",
      value: inactiveCompanies,
      icon: Users,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Growth Rate",
      value: "12%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
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
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage companies and monitor system-wide activities</p>
      </div>

      {/* Stats Cards */}
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

      {/* Recent Companies */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Companies</CardTitle>
          <CardDescription>Latest companies added to the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {companies.slice(0, 5).map((company) => (
              <div
                key={company.company_id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">{company.company_name}</h3>
                    <p className="text-sm text-gray-600">{company.company_email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      company.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {company.status}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">{new Date(company.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Overall system performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database Status</span>
                <span className="text-green-600 font-semibold">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Response Time</span>
                <span className="text-green-600 font-semibold">120ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uptime</span>
                <span className="text-green-600 font-semibold">99.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Sessions</span>
                <span className="text-blue-600 font-semibold">{companies.length * 2}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <Building2 className="h-6 w-6 text-blue-600 mb-2" />
                <h3 className="font-semibold">Add New Company</h3>
                <p className="text-sm text-gray-600">Register a new company in the system</p>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <Activity className="h-6 w-6 text-green-600 mb-2" />
                <h3 className="font-semibold">System Monitoring</h3>
                <p className="text-sm text-gray-600">Monitor system performance and health</p>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <TrendingUp className="h-6 w-6 text-purple-600 mb-2" />
                <h3 className="font-semibold">Analytics Report</h3>
                <p className="text-sm text-gray-600">Generate comprehensive system reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
