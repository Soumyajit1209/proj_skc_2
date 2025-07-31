"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Trash2 } from "lucide-react"

interface AttendanceRecord {
  attendance_id: number
  emp_id: number
  emp_name: string
  attendance_date: string
  in_time: string | null
  out_time: string | null
  in_status: "PRESENT" | "ABSENT" | "LATE"
  created_at: string
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "PRESENT" | "ABSENT" | "LATE">("all")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/admin/attendance", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAttendance(data || [])
      } else {
        setError("Failed to fetch attendance records")
      }
    } catch (error) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAttendance = async (attendanceId: number) => {
    if (!window.confirm("Are you sure you want to delete this attendance record?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/admin/attendance/${attendanceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setSuccess("Attendance record deleted successfully")
        fetchAttendance()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete attendance record")
      }
    } catch (error) {
      setError("Network error occurred")
    }
  }

  const handleRejectAttendance = async (attendanceId: number, status: "ABSENT" | "LATE") => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/admin/attendance/${attendanceId}/reject`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        setSuccess(`Attendance status updated to ${status}`)
        fetchAttendance()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update attendance status")
      }
    } catch (error) {
      setError("Network error occurred")
    }
  }

  const filteredAttendance = attendance.filter((record) => {
    const matchesSearch = record.emp_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    const matchesStatus = statusFilter === "all" || record.in_status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <Badge className="bg-green-100 text-green-800">Present</Badge>
      case "ABSENT":
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>
      case "LATE":
        return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-2">Manage employee attendance records</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>Total records: {attendance.length}</CardDescription>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by employee name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PRESENT">Present</SelectItem>
                <SelectItem value="ABSENT">Absent</SelectItem>
                <SelectItem value="LATE">Late</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>In Time</TableHead>
                <TableHead>Out Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendance.map((record) => (
                <TableRow key={record.attendance_id}>
                  <TableCell className="font-medium">{record.emp_name || "Unknown"}</TableCell>
                  <TableCell>{new Date(record.attendance_date).toLocaleDateString()}</TableCell>
                  <TableCell>{record.in_time || "-"}</TableCell>
                  <TableCell>{record.out_time || "-"}</TableCell>
                  <TableCell>{getStatusBadge(record.in_status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        onValueChange={(value) => handleRejectAttendance(record.attendance_id, value as "ABSENT" | "LATE")}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ABSENT">Mark Absent</SelectItem>
                          <SelectItem value="LATE">Mark Late</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 bg-transparent"
                        onClick={() => handleDeleteAttendance(record.attendance_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}