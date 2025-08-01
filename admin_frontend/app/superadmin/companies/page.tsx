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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Search, Building2, Eye, User, Mail, Phone, MapPin, FileText, Users } from "lucide-react"

interface Admin {
  admin_id: number
  email: string
  username: string
  password: string
  created_at: string
  updated_at: string
}

interface Company {
  company_id: number
  superadmin_id: number
  company_name: string
  company_email?: string
  company_phone_1?: string
  company_phone_2?: string
  company_address?: string
  GST_no?: string
  contact_person?: string
  status: "ACTIVE" | "INACTIVE"
  created_at: string
  updated_at: string
  admins: Admin[]
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [formData, setFormData] = useState({
    company_name: "",
    company_email: "",
    company_phone_1: "",
    company_phone_2: "",
    company_address: "",
    GST_no: "",
    contact_person: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    admin_username: "",
    admin_password: "",
    admin_email: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/companies`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      } else {
        setError("Failed to fetch companies")
      }
    } catch (error) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/companies`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess("Company added successfully")
        setIsAddDialogOpen(false)
        resetForm()
        fetchCompanies()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to add company")
      }
    } catch (error) {
      setError("Network error occurred")
    }
  }

  const handleEditCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCompany) return

    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/companies/${selectedCompany.company_id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_name: formData.company_name,
          company_email: formData.company_email,
          company_phone_1: formData.company_phone_1,
          company_phone_2: formData.company_phone_2,
          company_address: formData.company_address,
          GST_no: formData.GST_no,
          contact_person: formData.contact_person,
          status: formData.status,
        }),
      })

      if (response.ok) {
        setSuccess("Company updated successfully")
        setIsEditDialogOpen(false)
        resetForm()
        fetchCompanies()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update company")
      }
    } catch (error) {
      setError("Network error occurred")
    }
  }

  const handleDeleteCompany = async (companyId: number) => {
    if (!confirm("Are you sure you want to delete this company? This action cannot be undone.")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/companies/${companyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setSuccess("Company deleted successfully")
        fetchCompanies()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete company")
      }
    } catch (error) {
      setError("Network error occurred")
    }
  }

  const resetForm = () => {
    setFormData({
      company_name: "",
      company_email: "",
      company_phone_1: "",
      company_phone_2: "",
      company_address: "",
      GST_no: "",
      contact_person: "",
      status: "ACTIVE",
      admin_username: "",
      admin_password: "",
      admin_email: "",
    })
    setSelectedCompany(null)
  }

  const openEditDialog = (company: Company) => {
    setSelectedCompany(company)
    setFormData({
      company_name: company.company_name,
      company_email: company.company_email || "",
      company_phone_1: company.company_phone_1 || "",
      company_phone_2: company.company_phone_2 || "",
      company_address: company.company_address || "",
      GST_no: company.GST_no || "",
      contact_person: company.contact_person || "",
      status: company.status,
      admin_username: "",
      admin_password: "",
      admin_email: "",
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (company: Company) => {
    setSelectedCompany(company)
    setIsViewDialogOpen(true)
  }

  const filteredCompanies = companies.filter(
    (company) =>
      company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.company_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "INACTIVE":
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600 mt-1">Manage companies in the system</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
              <DialogDescription>Fill in the company and admin details below</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCompany} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Details */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Company Information</h3>

                  <div className="space-y-1">
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="company_email">Company Email</Label>
                    <Input
                      id="company_email"
                      type="email"
                      value={formData.company_email}
                      onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="company_phone_1">Phone 1</Label>
                    <Input
                      id="company_phone_1"
                      value={formData.company_phone_1}
                      onChange={(e) => setFormData({ ...formData, company_phone_1: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="company_phone_2">Phone 2</Label>
                    <Input
                      id="company_phone_2"
                      value={formData.company_phone_2}
                      onChange={(e) => setFormData({ ...formData, company_phone_2: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="GST_no">GST Number</Label>
                    <Input
                      id="GST_no"
                      value={formData.GST_no}
                      onChange={(e) => setFormData({ ...formData, GST_no: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="contact_person">Contact Person</Label>
                    <Input
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="company_address">Address</Label>
                    <Textarea
                      id="company_address"
                      value={formData.company_address}
                      onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Admin Details */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Admin Account</h3>

                  <div className="space-y-1">
                    <Label htmlFor="admin_username">Admin Username *</Label>
                    <Input
                      id="admin_username"
                      value={formData.admin_username}
                      onChange={(e) => setFormData({ ...formData, admin_username: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="admin_password">Admin Password *</Label>
                    <Input
                      id="admin_password"
                      type="password"
                      value={formData.admin_password}
                      onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500">Minimum 6 characters</p>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="admin_email">Admin Email *</Label>
                    <Input
                      id="admin_email"
                      type="email"
                      value={formData.admin_email}
                      onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "ACTIVE" | "INACTIVE") => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Company</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
        <CardHeader className="pb-3">
          <CardTitle>Company List</CardTitle>
          <CardDescription>Total companies: {companies.length}</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Admins</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.company_id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      {company.company_name}
                    </div>
                  </TableCell>
                  <TableCell>{company.company_email || "-"}</TableCell>
                  <TableCell>{company.company_phone_1 || "-"}</TableCell>
                  <TableCell>{company.contact_person || "-"}</TableCell>
                  <TableCell>{getStatusBadge(company.status)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {company.admins.length} admin{company.admins.length !== 1 ? "s" : ""}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => openViewDialog(company)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(company)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCompany(company.company_id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Details
            </DialogTitle>
            <DialogDescription>Complete information about the company and its administrators</DialogDescription>
          </DialogHeader>

          {selectedCompany && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Company Information</h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Company Name</p>
                      <p className="text-sm text-gray-900">{selectedCompany.company_name}</p>
                    </div>
                  </div>

                  {selectedCompany.company_email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">{selectedCompany.company_email}</p>
                      </div>
                    </div>
                  )}

                  {(selectedCompany.company_phone_1 || selectedCompany.company_phone_2) && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone Numbers</p>
                        {selectedCompany.company_phone_1 && (
                          <p className="text-sm text-gray-900">Primary: {selectedCompany.company_phone_1}</p>
                        )}
                        {selectedCompany.company_phone_2 && (
                          <p className="text-sm text-gray-900">Secondary: {selectedCompany.company_phone_2}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedCompany.company_address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Address</p>
                        <p className="text-sm text-gray-900">{selectedCompany.company_address}</p>
                      </div>
                    </div>
                  )}

                  {selectedCompany.GST_no && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-4 w-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">GST Number</p>
                        <p className="text-sm text-gray-900">{selectedCompany.GST_no}</p>
                      </div>
                    </div>
                  )}

                  {selectedCompany.contact_person && (
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Contact Person</p>
                        <p className="text-sm text-gray-900">{selectedCompany.contact_person}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="h-4 w-4 mt-6 px-2">{getStatusBadge(selectedCompany.status)}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 pt-2 border-t">
                    <p>Created: {new Date(selectedCompany.created_at).toLocaleString()}</p>
                    <p>Updated: {new Date(selectedCompany.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Admin Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Administrator Accounts ({selectedCompany.admins.length})
                </h3>

                {selectedCompany.admins.length > 0 ? (
                  <div className="space-y-4">
                    {selectedCompany.admins.map((admin, index) => (
                      <Card key={admin.admin_id} className="p-4 bg-gray-50">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-gray-900">Admin #{index + 1}</span>
                          </div>

                          <div className="grid grid-cols-1 gap-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-500">Username:</span>
                              <span className="ml-2 text-gray-900 font-mono bg-white px-2 py-1 rounded border">
                                {admin.username}
                              </span>
                            </div>

                            <div>
                              <span className="font-medium text-gray-500">Password:</span>
                              <span className="ml-2 text-gray-900 font-mono bg-white px-2 py-1 rounded border">
                                {admin.password}
                              </span>
                            </div>

                            <div>
                              <span className="font-medium text-gray-500">Email:</span>
                              <span className="ml-2 text-gray-900">{admin.email}</span>
                            </div>
                          </div>

                          <div className="text-xs text-gray-500 pt-2 border-t">
                            <p>Created: {new Date(admin.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No administrators found for this company</p>
                  </div>
                )}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>Update company information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditCompany} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Company Information</h3>

                <div className="space-y-1">
                  <Label htmlFor="edit_company_name">Company Name *</Label>
                  <Input
                    id="edit_company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit_company_email">Company Email</Label>
                  <Input
                    id="edit_company_email"
                    type="email"
                    value={formData.company_email}
                    onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit_company_phone_1">Phone 1</Label>
                  <Input
                    id="edit_company_phone_1"
                    value={formData.company_phone_1}
                    onChange={(e) => setFormData({ ...formData, company_phone_1: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit_company_phone_2">Phone 2</Label>
                  <Input
                    id="edit_company_phone_2"
                    value={formData.company_phone_2}
                    onChange={(e) => setFormData({ ...formData, company_phone_2: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Details</h3>

                <div className="space-y-1">
                  <Label htmlFor="edit_GST_no">GST Number</Label>
                  <Input
                    id="edit_GST_no"
                    value={formData.GST_no}
                    onChange={(e) => setFormData({ ...formData, GST_no: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit_contact_person">Contact Person</Label>
                  <Input
                    id="edit_contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit_status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "ACTIVE" | "INACTIVE") => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit_company_address">Address</Label>
              <Textarea
                id="edit_company_address"
                value={formData.company_address}
                onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Company</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
