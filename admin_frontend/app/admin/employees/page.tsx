"use client"

import type React from "react"

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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Search, User, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Employee {
  emp_id: number
  emp_name: string
  emp_username: string
  emp_phone: string
  emp_password?: number | string
  emp_email: string
  emp_address: string
  emp_dob: string
  emp_hiring_date: string
  status: "ACTIVE" | "INACTIVE" | "TERMINATED"
  created_at: string
  profile_picture?: string | null
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState<any>({
    emp_name: "",
    emp_username: "",
    emp_password: "",
    emp_phone: "",
    emp_email: "",
    emp_address: "",
    emp_dob: "",
    emp_hiring_date: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "TERMINATED",
    profile_picture: null,
  })
  const { toast } = useToast()
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch employees data",
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

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("token")
      const formDataToSend = new FormData()
      formDataToSend.append("emp_name", formData.emp_name)
      formDataToSend.append("emp_username", formData.emp_username)
      formDataToSend.append("emp_password", formData.emp_password)
      formDataToSend.append("emp_phone", formData.emp_phone)
      formDataToSend.append("emp_email", formData.emp_email)
      formDataToSend.append("emp_address", formData.emp_address)
      formDataToSend.append("emp_dob", formData.emp_dob)
      formDataToSend.append("emp_hiring_date", formData.emp_hiring_date)
      formDataToSend.append("status", formData.status)

      if (formData.profile_picture) {
        formDataToSend.append("profile_picture", formData.profile_picture)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/employees`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (response.ok) {
        toast({
          variant: "success",
          title: "Success! 🎉",
          description: "Employee added successfully",
        })
        setIsAddDialogOpen(false)
        resetForm()
        fetchEmployees()
      } else {
        const data = await response.json()
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to add employee",
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

  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmployee) return

    try {
      const token = localStorage.getItem("token")
      const formDataToSend = new FormData()
      formDataToSend.append("emp_name", formData.emp_name)
      formDataToSend.append("emp_username", formData.emp_username)
      if (formData.emp_password) {
        formDataToSend.append("emp_password", formData.emp_password)
      }
      formDataToSend.append("emp_phone", formData.emp_phone)
      formDataToSend.append("emp_email", formData.emp_email)
      formDataToSend.append("emp_address", formData.emp_address)
      formDataToSend.append("emp_dob", formData.emp_dob)
      formDataToSend.append("emp_hiring_date", formData.emp_hiring_date)
      formDataToSend.append("status", formData.status)

      if (formData.profile_picture) {
        formDataToSend.append("profile_picture", formData.profile_picture)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/employees/${selectedEmployee.emp_id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (response.ok) {
        toast({
          variant: "success",
          title: "Success! ✨",
          description: "Employee updated successfully",
        })
        setIsEditDialogOpen(false)
        resetForm()
        fetchEmployees()
      } else {
        const data = await response.json()
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to update employee",
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

  const handleDeleteEmployee = async (empId: number) => {
    if (!confirm("Are you sure you want to terminate this employee?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/employees/${empId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        toast({
          variant: "success",
          title: "Employee Terminated",
          description: "Employee has been terminated successfully",
        })
        fetchEmployees()
      } else {
        const data = await response.json()
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to terminate employee",
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

  const resetForm = () => {
    setFormData({
      emp_name: "",
      emp_username: "",
      emp_password: "",
      emp_phone: "",
      emp_email: "",
      emp_address: "",
      emp_dob: "",
      emp_hiring_date: "",
      status: "ACTIVE",
      profile_picture: null,
    })
    setSelectedEmployee(null)
    setPhotoPreview(null)
    setEditPhotoPreview(null)
  }

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setFormData({
      emp_name: employee.emp_name,
      emp_username: employee.emp_username,
      emp_password: "",
      emp_phone: employee.emp_phone || "",
      emp_email: employee.emp_email || "",
      emp_address: employee.emp_address || "",
      emp_dob: employee.emp_dob ? employee.emp_dob.split("T")[0] : "",
      emp_hiring_date: employee.emp_hiring_date ? employee.emp_hiring_date.split("T")[0] : "",
      status: employee.status,
      profile_picture: null,
    })
    // Set existing photo preview for edit
    if (employee.profile_picture) {
      setEditPhotoPreview(`${process.env.NEXT_PUBLIC_API_URL}${employee.profile_picture}`)
    } else {
      setEditPhotoPreview(null)
    }
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (employee: Employee) => {
    setViewEmployee(employee)
    setIsViewDialogOpen(true)
  }

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.emp_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.emp_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.emp_email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "INACTIVE":
        return <Badge className="bg-yellow-100 text-yellow-800">Inactive</Badge>
      case "TERMINATED":
        return <Badge className="bg-red-100 text-red-800">Terminated</Badge>
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
    <div className="p-3 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-2">Manage your company employees</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>Fill in the employee details below</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEmployee} className="space-y-4" encType="multipart/form-data">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emp_name">Full Name</Label>
                  <Input
                    id="emp_name"
                    value={formData.emp_name}
                    onChange={(e) => setFormData({ ...formData, emp_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp_username">Username</Label>
                  <Input
                    id="emp_username"
                    value={formData.emp_username}
                    onChange={(e) => setFormData({ ...formData, emp_username: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emp_password">Password</Label>
                  <Input
                    id="emp_password"
                    type="password"
                    value={formData.emp_password}
                    onChange={(e) => setFormData({ ...formData, emp_password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp_phone">Phone</Label>
                  <Input
                    id="emp_phone"
                    value={formData.emp_phone}
                    onChange={(e) => setFormData({ ...formData, emp_phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp_email">Email</Label>
                <Input
                  id="emp_email"
                  type="email"
                  value={formData.emp_email}
                  onChange={(e) => setFormData({ ...formData, emp_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp_address">Address</Label>
                <Input
                  id="emp_address"
                  value={formData.emp_address}
                  onChange={(e) => setFormData({ ...formData, emp_address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emp_dob">Date of Birth</Label>
                  <Input
                    id="emp_dob"
                    type="date"
                    value={formData.emp_dob}
                    onChange={(e) => setFormData({ ...formData, emp_dob: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp_hiring_date">Hiring Date</Label>
                  <Input
                    id="emp_hiring_date"
                    type="date"
                    value={formData.emp_hiring_date}
                    onChange={(e) => setFormData({ ...formData, emp_hiring_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile_picture">Profile Picture</Label>
                <Input
                  id="profile_picture"
                  type="file"
                  accept="img/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFormData({ ...formData, profile_picture: file })
                      // Create preview URL
                      const reader = new FileReader()
                      reader.onload = (e) => {
                        setPhotoPreview(e.target?.result as string)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
                {photoPreview && (
                  <div className="mt-2">
                    <Label className="text-sm font-medium text-gray-600">Preview</Label>
                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
                      <img
                        src={photoPreview || "/placeholder.svg"}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Employee</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
          <CardDescription>Total employees: {employees.length}</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hiring Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.emp_id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {employee.emp_name}
                    </div>
                  </TableCell>
                  <TableCell>{employee.emp_username}</TableCell>
                  <TableCell>{employee.emp_phone || "-"}</TableCell>
                  <TableCell>{employee.emp_email || "-"}</TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell>
                    {employee.emp_hiring_date ? new Date(employee.emp_hiring_date).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openViewDialog(employee)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(employee)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteEmployee(employee.emp_id)}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update employee information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditEmployee} className="space-y-4" encType="multipart/form-data">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_emp_name">Full Name</Label>
                <Input
                  id="edit_emp_name"
                  value={formData.emp_name}
                  onChange={(e) => setFormData({ ...formData, emp_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_emp_username">Username</Label>
                <Input
                  id="edit_emp_username"
                  value={formData.emp_username}
                  onChange={(e) => setFormData({ ...formData, emp_username: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_emp_password">Password (leave blank to keep current)</Label>
                <Input
                  id="edit_emp_password"
                  type="password"
                  value={formData.emp_password}
                  onChange={(e) => setFormData({ ...formData, emp_password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_emp_phone">Phone</Label>
                <Input
                  id="edit_emp_phone"
                  value={formData.emp_phone}
                  onChange={(e) => setFormData({ ...formData, emp_phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_emp_email">Email</Label>
              <Input
                id="edit_emp_email"
                type="email"
                value={formData.emp_email}
                onChange={(e) => setFormData({ ...formData, emp_email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_emp_address">Address</Label>
              <Input
                id="edit_emp_address"
                value={formData.emp_address}
                onChange={(e) => setFormData({ ...formData, emp_address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_emp_dob">Date of Birth</Label>
                <Input
                  id="edit_emp_dob"
                  type="date"
                  value={formData.emp_dob}
                  onChange={(e) => setFormData({ ...formData, emp_dob: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_emp_hiring_date">Hiring Date</Label>
                <Input
                  id="edit_emp_hiring_date"
                  type="date"
                  value={formData.emp_hiring_date}
                  onChange={(e) => setFormData({ ...formData, emp_hiring_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "ACTIVE" | "INACTIVE" | "TERMINATED") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="TERMINATED">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile_picture">Profile Picture</Label>
              <Input
                id="profile_picture"
                type="file"
                accept="img/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setFormData({ ...formData, profile_picture: file })
                    // Create preview URL
                    const reader = new FileReader()
                    reader.onload = (e) => {
                      setEditPhotoPreview(e.target?.result as string)
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              />
              {editPhotoPreview && (
                <div className="mt-2">
                  <Label className="text-sm font-medium text-gray-600">Current/Preview</Label>
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
                    <img
                      src={editPhotoPreview || "/placeholder.svg"}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Employee</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* View Employee Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>Complete employee information</DialogDescription>
          </DialogHeader>
          {viewEmployee && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {viewEmployee.profile_picture ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${viewEmployee.profile_picture}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{viewEmployee.emp_name}</h3>
                  <p className="text-gray-600">@{viewEmployee.emp_username}</p>
                  <Badge
                    className={
                      viewEmployee.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : viewEmployee.status === "INACTIVE"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }
                  >
                    {viewEmployee.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Employee ID</Label>
                  <p className="text-sm">{viewEmployee.emp_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Username</Label>
                  <p className="text-sm">{viewEmployee.emp_username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Password</Label>
                  <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {viewEmployee.emp_password || "Not set"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone</Label>
                  <p className="text-sm">{viewEmployee.emp_phone || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-sm">{viewEmployee.emp_email || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date of Birth</Label>
                  <p className="text-sm">
                    {viewEmployee.emp_dob ? new Date(viewEmployee.emp_dob).toLocaleDateString() : "Not provided"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Hiring Date</Label>
                  <p className="text-sm">
                    {viewEmployee.emp_hiring_date
                      ? new Date(viewEmployee.emp_hiring_date).toLocaleDateString()
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created At</Label>
                  <p className="text-sm">{new Date(viewEmployee.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Address</Label>
                <p className="text-sm">{viewEmployee.emp_address || "Not provided"}</p>
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
