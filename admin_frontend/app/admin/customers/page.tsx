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
import { Plus, Edit, Trash2, Search, User, MapPin } from "lucide-react"

interface Customer {
  customer_id: number
  customer_name: string
  customer_phone: string
  customer_email: string
  customer_address: string
  locality_id: number
  status: "ACTIVE" | "INACTIVE"
  created_at: string
}

interface Locality {
  locality_id: number
  locality_name: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [localities, setLocalities] = useState<Locality[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    customer_address: "",
    locality_id: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchCustomers()
    fetchLocalities()
  }, [])

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/admin/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCustomers(data.data?.customers || [])
      } else {
        setError("Failed to fetch customers")
      }
    } catch (error) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const fetchLocalities = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/admin/localities", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setLocalities(data)
      }
    } catch (error) {
      console.error("Error fetching localities:", error)
    }
  }

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/admin/customers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          locality_id: Number.parseInt(formData.locality_id),
        }),
      })

      if (response.ok) {
        setSuccess("Customer added successfully")
        setIsDialogOpen(false)
        resetForm()
        fetchCustomers()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to add customer")
      }
    } catch (error) {
      setError("Network error occurred")
    }
  }

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!selectedCustomer) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/admin/customers/${selectedCustomer.customer_id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          locality_id: Number.parseInt(formData.locality_id),
        }),
      })

      if (response.ok) {
        setSuccess("Customer updated successfully")
        setIsDialogOpen(false)
        resetForm()
        fetchCustomers()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update customer")
      }
    } catch (error) {
      setError("Network error occurred")
    }
  }

  const handleDeleteCustomer = async (customerId: number) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/admin/customers/${customerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setSuccess("Customer deleted successfully")
        fetchCustomers()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete customer")
      }
    } catch (error) {
      setError("Network error occurred")
    }
  }

  const resetForm = () => {
    setFormData({
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      customer_address: "",
      locality_id: "",
      status: "ACTIVE",
    })
    setSelectedCustomer(null)
    setIsEditMode(false)
  }

  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsEditMode(true)
    setFormData({
      customer_name: customer.customer_name,
      customer_phone: customer.customer_phone || "",
      customer_email: customer.customer_email || "",
      customer_address: customer.customer_address || "",
      locality_id: customer.locality_id.toString(),
      status: customer.status,
    })
    setIsDialogOpen(true)
  }

  const getLocalityName = (localityId: number) => {
    const locality = localities.find((l) => l.locality_id === localityId)
    return locality ? locality.locality_name : "Unknown"
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_phone?.includes(searchTerm),
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
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-2">Manage your customer database</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Customer" : "Add New Customer"}</DialogTitle>
              <DialogDescription>
                {isEditMode ? "Update the customer details below" : "Fill in the customer details below"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={isEditMode ? handleEditCustomer : handleAddCustomer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Customer Name</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_phone">Phone</Label>
                  <Input
                    id="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_email">Email</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_address">Address</Label>
                <Input
                  id="customer_address"
                  value={formData.customer_address}
                  onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locality_id">Locality</Label>
                <Select
                  value={formData.locality_id}
                  onValueChange={(value) => setFormData({ ...formData, locality_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select locality" />
                  </SelectTrigger>
                  <SelectContent>
                    {localities.map((locality) => (
                      <SelectItem key={locality.locality_id} value={locality.locality_id.toString()}>
                        {locality.locality_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as "ACTIVE" | "INACTIVE" })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{isEditMode ? "Update Customer" : "Add Customer"}</Button>
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
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>Total customers: {customers.length}</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers..."
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
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Locality</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.customer_id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {customer.customer_name}
                    </div>
                  </TableCell>
                  <TableCell>{customer.customer_phone || "-"}</TableCell>
                  <TableCell>{customer.customer_email || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      {getLocalityName(customer.locality_id)}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(customer.status)}</TableCell>
                  <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(customer)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 bg-transparent"
                        onClick={() => handleDeleteCustomer(customer.customer_id)}
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