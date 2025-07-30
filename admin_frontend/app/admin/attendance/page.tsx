"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Clock, CheckCircle, XCircle, Trash2, User } from "lucide-react"

interface AttendanceRecord {
  attendance_id: number
  emp_id: number
  emp_name: string
  attendance_date: string
  in_time: string
  out_time: string | null
  in_status: "PRESENT" | "ABSENT" | "LATE"
  in_location: string
  out_location: string | null
  remarks: string | null
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
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
        setAttendance(data)
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
    if (!confirm("Are you sure you want to delete this attendance record?")) return

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Present
          </Badge>
        )
      case "ABSENT":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Absent
          </Badge>
        )
      case "LATE":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Late
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredAttendance = attendance.filter((record) => {
    const matchesSearch = record.emp_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || record.in_status === statusFilter
    return matchesSearch && matchesStatus
  })

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

  const presentCount = attendance.filter((a) => a.in_status === "PRESENT").length
  const absentCount = attendance.filter((a) => a.in_status === "ABSENT").length
  const lateCount = attendance.filter((a) => a.in_status === "LATE").length

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600 mt-2">Monitor employee attendance and manage records</p>
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

      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{attendance.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">{presentCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Late</p>
                <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>Employee attendance tracking and management</CardDescription>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
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
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>In Time</TableHead>
                <TableHead>Out Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendance.map((record) => (
                <TableRow key={record.attendance_id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {record.emp_name}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(record.attendance_date).toLocaleDateString()}</TableCell>
                  <TableCell>{record.in_time}</TableCell>
                  <TableCell>{record.out_time || "-"}</TableCell>
                  <TableCell>{getStatusBadge(record.in_status)}</TableCell>
                  <TableCell>{record.in_location}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {record.in_status === "PRESENT" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectAttendance(record.attendance_id, "LATE")}
                            className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                          >
                            Mark Late
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectAttendance(record.attendance_id, "ABSENT")}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Mark Absent
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteAttendance(record.attendance_id)}
                        className="text-red-600 hover:text-red-700"
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
