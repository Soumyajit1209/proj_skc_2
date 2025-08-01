
export const adminApi = {
  // Employee operations
  async getEmployee(id: number) {
    const token = localStorage.getItem("token")
    const response = await fetch(`http://localhost:3001/api/admin/employees/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch employee")
    }

    return response.json()
  },

  async createEmployee(formData: FormData) {
    const token = localStorage.getItem("token")
    const response = await fetch("http://localhost:3001/api/admin/employees", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to create employee")
    }

    return response.json()
  },

  async updateEmployee(id: number, formData: FormData) {
    const token = localStorage.getItem("token")
    const response = await fetch(`http://localhost:3001/api/admin/employees/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to update employee")
    }

    return response.json()
  },

  // Attendance operations
  async getAttendanceDetails(id: number) {
    const token = localStorage.getItem("token")
    const response = await fetch(`http://localhost:3001/api/admin/attendance/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch attendance details")
    }

    return response.json()
  },

  async approveAttendance(id: number) {
    const token = localStorage.getItem("token")
    const response = await fetch(`http://localhost:3001/api/admin/attendance/${id}/approve`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to approve attendance")
    }

    return response.json()
  },
}
