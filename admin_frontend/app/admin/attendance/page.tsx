"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, CheckCircle, XCircle, Clock, MapPin, Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"


interface AttendanceRecord {
  attendance_id: number
  emp_id: number
  emp_name: string
  attendance_date: string
  in_time: string
  out_time?: string
  in_status: "PRESENT" | "ABSENT" | "LATE"
  in_location?: string
  out_location?: string
  in_latitude?: string
  in_longitude?: string
  out_latitude?: string
  out_longitude?: string
  in_pic?: string
  out_picture?: string
  remarks?: string
  created_at: string
  updated_at: string
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState("")
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem("token")
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/attendance`
      const params = new URLSearchParams()

      if (dateFilter) {
        params.append("start_date", dateFilter)
        params.append("end_date", dateFilter)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAttendance(data)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch attendance data",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Unable to connect to server",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveAttendance = async (attendanceId: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/attendance/${attendanceId}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "PRESENT" }),
      })

      if (response.ok) {
        toast({
          variant: "success",
          title: "Success! ✅",
          description: "Attendance approved successfully",
        })
        fetchAttendance()
        setIsViewDialogOpen(false)
      } else {
        const data = await response.json()
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to approve attendance",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Unable to connect to server",
      })
    }
  }

  const handleRejectAttendance = async (attendanceId: number, status: "ABSENT" | "LATE") => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/attendance/${attendanceId}/reject`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          variant: "success",
          title: "Success! ⚠️",
          description: `Attendance marked as ${status.toLowerCase()}`,
        })
        fetchAttendance()
        setIsViewDialogOpen(false)
      } else {
        const data = await response.json()
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to update attendance",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Unable to connect to server",
      })
    }
  }

  const openViewDialog = (record: AttendanceRecord) => {
    setSelectedRecord(record)
    setIsViewDialogOpen(true)
  }

  const filteredAttendance = attendance.filter((record) => {
    const matchesSearch = record.emp_name.toLowerCase().includes(searchTerm.toLowerCase())
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

  const formatTime = (timeString: string) => {
    if (!timeString) return "-"
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
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
    <div className="p-3 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage employee attendance</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>Total records: {attendance.length}</CardDescription>
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
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PRESENT">Present</SelectItem>
                <SelectItem value="ABSENT">Absent</SelectItem>
                <SelectItem value="LATE">Late</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value)
                // Automatically fetch when date changes
                setTimeout(fetchAttendance, 100)
              }}
              className="w-40"
            />
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
                  <TableCell className="font-medium">{record.emp_name}</TableCell>
                  <TableCell>{formatDate(record.attendance_date)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {formatTime(record.in_time)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {record.out_time ? formatTime(record.out_time) : "-"}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(record.in_status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {record.in_location || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => openViewDialog(record)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Attendance Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Attendance Details</DialogTitle>
            <DialogDescription>Complete attendance information for {selectedRecord?.emp_name}</DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-6">
              {/* Employee Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Employee Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Employee Name(ID)</Label>
                    <p className="text-sm">{selectedRecord.emp_name}({selectedRecord.emp_id})</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date</Label>
                    <p className="text-sm">{formatDate(selectedRecord.attendance_date)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedRecord.in_status)}</div>
                  </div>
                </div>
              </div>

              {/* Check-in and Check-out Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Check-in Details */}
                <div className="border rounded-lg p-4">
                  <h4 className="text-md font-semibold mb-3 text-green-700 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Check-in Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Time</Label>
                      <p className="text-sm flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {formatTime(selectedRecord.in_time)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Location</Label>
                      <p className="text-sm flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {selectedRecord.in_location || "Not recorded"}
                      </p>
                    </div>
                    {selectedRecord.in_latitude && selectedRecord.in_longitude && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Coordinates</Label>
                        <p className="text-sm">
                          {selectedRecord.in_latitude}, {selectedRecord.in_longitude}
                        </p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Check-in Photo</Label>
                      <div className="mt-2">
                        {selectedRecord.in_pic ? (
                          <div className="relative">
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL}${selectedRecord.in_pic}`}
                              alt="Check-in"
                              className="w-full max-w-xs h-48 object-cover rounded-lg border"
                            />
                            <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                              <Camera className="h-4 w-4" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full max-w-xs h-48 bg-gray-100 rounded-lg border flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <Camera className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-sm">No photo available</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Check-out Details */}
                <div className="border rounded-lg p-4">
                  <h4 className="text-md font-semibold mb-3 text-red-700 flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    Check-out Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Time</Label>
                      <p className="text-sm flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {selectedRecord.out_time ? formatTime(selectedRecord.out_time) : "Not checked out"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Location</Label>
                      <p className="text-sm flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {selectedRecord.out_location || "Not recorded"}
                      </p>
                    </div>
                    {selectedRecord.out_latitude && selectedRecord.out_longitude && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Coordinates</Label>
                        <p className="text-sm">
                          {selectedRecord.out_latitude}, {selectedRecord.out_longitude}
                        </p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Check-out Photo</Label>
                      <div className="mt-2">
                        {selectedRecord.out_picture ? (
                          <div className="relative">
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL}${selectedRecord.out_picture}`}
                              alt="Check-out"
                              className="w-full max-w-xs h-48 object-cover rounded-lg border"
                            />
                            <div className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full">
                              <Camera className="h-4 w-4" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full max-w-xs h-48 bg-gray-100 rounded-lg border flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <Camera className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-sm">No photo available</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              {selectedRecord.remarks && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Label className="text-sm font-medium text-gray-600">Remarks</Label>
                  <p className="text-sm mt-1">{selectedRecord.remarks}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-4 border-t">
                <Button
                  onClick={() => handleApproveAttendance(selectedRecord.attendance_id)}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={selectedRecord.in_status === "PRESENT"}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleRejectAttendance(selectedRecord.attendance_id, "LATE")}
                  variant="outline"
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                  disabled={selectedRecord.in_status === "LATE"}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Mark as Late
                </Button>
                <Button
                  onClick={() => handleRejectAttendance(selectedRecord.attendance_id, "ABSENT")}
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  disabled={selectedRecord.in_status === "ABSENT"}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark as Absent
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


