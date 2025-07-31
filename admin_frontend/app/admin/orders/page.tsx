"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ShoppingCart, User, Calendar } from "lucide-react";

interface Order {
  order_id: number;
  order_date: string;
  customer_name: string;
  order_total_value: string;
  order_status: "PENDING" | "APPROVED" | "CANCELLED";
  payment_status: "UNPAID" | "PARTIALLY_PAID" | "PAID";
  created_at: string;
}

interface OrderDetail {
  product_name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:3001/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("API Response (Orders):", data);
      if (!response.ok) {
        setError(data.error || "Failed to fetch orders");
        setOrders([]);
        setLoading(false);
        return;
      }

      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setError("Invalid response format: Expected an array of orders");
        setOrders([]);
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
      setError("Network error occurred");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: number) => {
    setDetailsLoading(true);
    setDetailsError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setDetailsError("No authentication token found");
        setDetailsLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:3001/api/admin/orders/${orderId}/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("API Response (Order Details):", data);
      if (!response.ok) {
        setDetailsError(data.error || "Failed to fetch order details");
        setOrderDetails([]);
        setDetailsLoading(false);
        return;
      }

      if (Array.isArray(data)) {
        setOrderDetails(data);
      } else {
        setDetailsError("Invalid response format: Expected an array of order details");
        setOrderDetails([]);
      }
    } catch (error) {
      console.error("Fetch order details error:", error);
      setDetailsError("Network error occurred");
      setOrderDetails([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleRowClick = (orderId: number) => {
    setSelectedOrderId(orderId);
    fetchOrderDetails(orderId);
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "UNPAID":
        return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>;
      case "PARTIALLY_PAID":
        return <Badge className="bg-yellow-100 text-yellow-800">Partially Paid</Badge>;
      case "PAID":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(Number.parseFloat(amount));
  };

  const filteredOrders = Array.isArray(orders)
    ? orders.filter(
        (order) =>
          order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.order_id?.toString().includes(searchTerm)
      )
    : [];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const pendingOrders = filteredOrders.filter((o) => o.order_status === "PENDING").length;
  const approvedOrders = filteredOrders.filter((o) => o.order_status === "APPROVED").length;
  const totalValue = filteredOrders.reduce((sum, order) => sum + Number.parseFloat(order.order_total_value), 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-2">Track and manage customer orders</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{filteredOrders.length}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Orders</p>
                <p className="text-2xl font-bold text-green-600">{approvedOrders}</p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalValue.toString())}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
          <CardDescription>All customer orders and their status</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search orders..."
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
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Payment Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <Dialog key={order.order_id}>
                  <DialogTrigger asChild>
                    <TableRow
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleRowClick(order.order_id)}
                    >
                      <TableCell className="font-medium">#{order.order_id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {order.customer_name}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(order.order_total_value)}</TableCell>
                      <TableCell>{getOrderStatusBadge(order.order_status)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                    </TableRow>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Order #{order.order_id} Details</DialogTitle>
                    </DialogHeader>
                    {detailsLoading ? (
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ) : detailsError ? (
                      <Alert variant="destructive">
                        <AlertDescription>{detailsError}</AlertDescription>
                      </Alert>
                    ) : orderDetails.length === 0 ? (
                      <p>No products found for this order.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Total Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderDetails.map((detail, index) => (
                            <TableRow key={index}>
                              <TableCell>{detail.product_name}</TableCell>
                              <TableCell>{detail.quantity}</TableCell>
                              <TableCell>{formatCurrency(detail.unit_price)}</TableCell>
                              <TableCell>{formatCurrency(detail.total_price)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </DialogContent>
                </Dialog>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}