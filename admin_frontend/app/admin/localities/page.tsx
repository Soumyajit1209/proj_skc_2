"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Search, MapPin } from "lucide-react"

interface Locality {
  locality_id: number
  locality_name: string
  created_at: string
  updated_at: string
}

export default function LocalitiesPage() {
  const [localities, setLocalities] = useState<Locality[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedLocality, setSelectedLocality] = useState<Locality | null>(null)
  const [formData, setFormData] = useState({
    locality_name: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchLocalities()
  }, [])

  const fetchLocalities = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/localities`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setLocalities(data)
      } else {
        setError("Failed to fetch localities")
      }
    } catch (error) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleAddLocality = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/localities`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess("Locality added successfully")
        setIsAddDialogOpen(false)
        resetForm()
        fetchLocalities()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to add locality")
      }
    } catch (error) {
      setError("Network error occurred")
    }
  }

  const handleEditLocality = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLocality) return

    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/localities/${selectedLocality.locality_id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess("Locality updated successfully")
        setIsEditDialogOpen(false)
        resetForm()
        fetchLocalities()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update locality")
      }
    } catch (error) {
      setError("Network error occurred")
    }
  }

  const handleDeleteLocality = async (localityId: number) => {
    if (!confirm("Are you sure you want to delete this locality?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/localities/${localityId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setSuccess("Locality deleted successfully")
        fetchLocalities()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete locality")
      }
    } catch (error) {
      setError("Network error occurred")
    }
  }

  const resetForm = () => {
    setFormData({
      locality_name: "",
    })
    setSelectedLocality(null)
  }

  const openEditDialog = (locality: Locality) => {
    setSelectedLocality(locality)
    setFormData({
      locality_name: locality.locality_name,
    })
    setIsEditDialogOpen(true)
  }

  const filteredLocalities = localities.filter((locality) =>
    locality.locality_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
          <h1 className="text-2xl font-bold text-gray-900">Localities</h1>
          <p className="text-gray-600 mt-2">Manage service areas and localities</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Locality
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Locality</DialogTitle>
              <DialogDescription>Enter the locality name below</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddLocality} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="locality_name">Locality Name</Label>
                <Input
                  id="locality_name"
                  value={formData.locality_name}
                  onChange={(e) => setFormData({ ...formData, locality_name: e.target.value })}
                  placeholder="Enter locality name"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Locality</Button>
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
          <CardTitle>Locality List</CardTitle>
          <CardDescription>Total localities: {localities.length}</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search localities..."
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
                <TableHead>Locality Name</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLocalities.map((locality) => (
                <TableRow key={locality.locality_id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {locality.locality_name}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(locality.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(locality.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(locality)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteLocality(locality.locality_id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Locality</DialogTitle>
            <DialogDescription>Update the locality name</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditLocality} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_locality_name">Locality Name</Label>
              <Input
                id="edit_locality_name"
                value={formData.locality_name}
                onChange={(e) => setFormData({ ...formData, locality_name: e.target.value })}
                placeholder="Enter locality name"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Locality</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
