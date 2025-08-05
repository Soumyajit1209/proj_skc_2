"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, User, Calendar, Printer, FileText } from "lucide-react";

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

// Company details - you can modify these as per your company
const COMPANY_DETAILS = {
  name: "Your Company Name",
  address: "123 Business Street, City, State - 123456",
  phone: "+91-9876543210",
  email: "info@yourcompany.com",
  website: "www.yourcompany.com",
  gstin: "22AAAAA0000A1Z5", // Add your GST number
  logo: "🏢" // You can replace with actual logo
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders`, {
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${orderId}/details`, {
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

  const handleRowClick = (order: Order) => {
    setSelectedOrderId(order.order_id);
    setSelectedOrder(order);
    fetchOrderDetails(order.order_id);
  };

  const generateReceiptHTML = (order: Order, details: OrderDetail[]) => {
    const subtotal = details.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
    const taxRate = 0.18; // 18% GST
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    const shipping = 0; // Set shipping cost if needed

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt - ${order.order_id}</title>
        <style>
          @page {
            size: A4;
            margin: 0.5in;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.2;
            color: #000;
            background: #fff;
            font-size: 12px;
          }
          .receipt {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
            padding: 15px;
            border: 2px solid #000;
            background: #fff;
            page-break-after: avoid;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
          }
          .receipt-title {
            font-size: 28px;
            font-weight: bold;
            color: #000;
          }
          .company-info {
            text-align: right;
            font-size: 11px;
            line-height: 1.3;
            color: #000;
          }
          .company-name {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 3px;
          }
          .receipt-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-size: 11px;
          }
          .receipt-number, .receipt-date {
            display: flex;
            flex-direction: column;
          }
          .label {
            font-weight: bold;
            margin-bottom: 2px;
            color: #000;
          }
          .customer-section {
            margin-bottom: 20px;
            border: 1px solid #000;
          }
          .customer-header {
            background-color: #d3d3d3;
            padding: 6px 10px;
            font-weight: bold;
            font-size: 11px;
            text-align: center;
            border-bottom: 1px solid #000;
            color: #000;
          }
          .customer-details {
            padding: 10px;
            font-size: 11px;
            background: #fff;
          }
          .customer-row {
            display: flex;
            margin-bottom: 6px;
            align-items: center;
          }
          .customer-row:last-child {
            margin-bottom: 0;
          }
          .customer-label {
            font-weight: bold;
            width: 50px;
            margin-right: 10px;
            color: #000;
          }
          .customer-email-phone {
            display: flex;
            width: 100%;
            justify-content: space-between;
          }
          .items-section {
            margin-bottom: 20px;
            border: 1px solid #000;
          }
          .items-header {
            background-color: #d3d3d3;
            padding: 6px 10px;
            font-weight: bold;
            font-size: 11px;
            text-align: center;
            border-bottom: 1px solid #000;
            color: #000;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          .items-table th {
            background-color: #d3d3d3;
            padding: 6px 8px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #000;
            color: #000;
          }
          .items-table th:first-child {
            text-align: left;
          }
          .items-table td {
            padding: 6px 8px;
            text-align: center;
            border-left: 1px solid #000;
            border-right: 1px solid #000;
            border-bottom: 1px solid #000;
            height: 25px;
            vertical-align: middle;
          }
          .items-table td:first-child {
            text-align: left;
          }
          .items-table td:last-child {
            text-align: right;
          }
          .bottom-section {
            display: flex;
            justify-content: space-between;
            gap: 15px;
          }
          .notes-section {
            width: 48%;
            border: 1px solid #000;
          }
          .notes-header {
            background-color: #d3d3d3;
            padding: 6px 10px;
            font-weight: bold;
            font-size: 11px;
            text-align: center;
            border-bottom: 1px solid #000;
            color: #000;
          }
          .notes-content {
            padding: 10px;
            height: 80px;
            font-size: 10px;
            background-color: #fff;
            color: #000;
          }
          .totals-section {
            width: 48%;
          }
          .totals-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            border: 1px solid #000;
          }
          .totals-table td {
            padding: 6px 10px;
            border: 1px solid #000;
            color: #000;
          }
          .totals-table td:first-child {
            text-align: right;
            font-weight: bold;
            background-color: #f5f5f5;
            width: 60%;
          }
          .totals-table td:last-child {
            text-align: right;
            width: 40%;
          }
          .total-row td {
            font-weight: bold;
            background-color: #e0e0e0;
          }
          @media print {
            body { 
              margin: 0; 
              background: white;
            }
            .receipt { 
              margin: 0; 
              padding: 15px; 
              border: 2px solid #000; 
              page-break-inside: avoid;
            }
            .no-print { 
              display: none !important; 
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="receipt-title">Receipt</div>
            <div class="company-info">
              <div class="company-name">${COMPANY_DETAILS.name}</div>
              <div>${COMPANY_DETAILS.address.split(',')[0]}</div>
              <div>${COMPANY_DETAILS.address.split(',').slice(1).join(',').trim()}</div>
            </div>
          </div>

          <div class="receipt-details">
            <div class="receipt-number">
              <div class="label">Receipt Number</div>
              <div>${String(order.order_id).padStart(8, '0')}</div>
            </div>
            <div class="receipt-date">
              <div class="label">Receipt Date</div>
              <div>${new Date(order.order_date).toLocaleDateString('en-US', { 
                month: '2-digit', 
                day: '2-digit', 
                year: 'numeric' 
              })}</div>
            </div>
          </div>

          <div class="customer-section">
            <div class="customer-header">Customer Details</div>
            <div class="customer-details">
              <div class="customer-row">
                <div class="customer-label">Name</div>
                <div>${order.customer_name}</div>
              </div>
              <div class="customer-row">
                <div class="customer-label">Address</div>
                <div>100 New Road, New Hampshire</div>
              </div>
              <div class="customer-row">
                <div class="customer-email-phone">
                  <div>
                    <span class="customer-label">Email</span>
                    <span>customer@example.com</span>
                  </div>
                  <div>
                    <span class="customer-label">Phone</span>
                    <span>631 555 123</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="items-section">
            <div class="items-header">Item Description</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 50%;">Item Description</th>
                  <th style="width: 15%;">QTY</th>
                  <th style="width: 15%;">Price</th>
                  <th style="width: 20%;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${details.map((item) => `
                  <tr>
                    <td>${item.product_name}</td>
                    <td>${item.quantity}</td>
                    <td>${parseFloat(item.unit_price).toFixed(2)}</td>
                    <td>${parseFloat(item.total_price).toFixed(2)}</td>
                  </tr>
                `).join('')}
                ${Array.from({ length: Math.max(0, 8 - details.length) }, (_, i) => `
                  <tr>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="bottom-section">
            <div class="notes-section">
              <div class="notes-header">Notes</div>
              <div class="notes-content">
                Thank you for your order. This is a computer-generated receipt and does not require a signature.
              </div>
            </div>
            
            <div class="totals-section">
              <table class="totals-table">
                <tr>
                  <td>Sub Total</td>
                  <td>${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>GST(18%)</td>
                  <td>${taxAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Shipping</td>
                  <td>${shipping.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                  <td>Total</td>
                  <td>${total.toFixed(2)}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const printReceipt = () => {
    if (!selectedOrder || !orderDetails.length) return;

    const receiptContent = generateReceiptHTML(selectedOrder, orderDetails);
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const exportToPDF = () => {
    if (!selectedOrder || !orderDetails.length) return;

    // Create a temporary window for PDF generation
    const receiptContent = generateReceiptHTML(selectedOrder, orderDetails);
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      
      // Add PDF export functionality
      const script = printWindow.document.createElement('script');
      script.innerHTML = `
        setTimeout(() => {
          window.print();
        }, 500);
      `;
      printWindow.document.body.appendChild(script);
    }
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
    <div className="p-3 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
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
                      onClick={() => handleRowClick(order)}
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
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center justify-between">
                        <span>Order #{order.order_id} Details</span>
                        <div className="flex gap-2">
                          <Button
                            onClick={printReceipt}
                            disabled={!orderDetails.length || detailsLoading}
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <Printer className="h-4 w-4" />
                            Print Receipt
                          </Button>
                          <Button
                            onClick={exportToPDF}
                            disabled={!orderDetails.length || detailsLoading}
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            Export PDF
                          </Button>
                        </div>
                      </DialogTitle>
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
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-600">Customer Name</p>
                            <p className="font-semibold">{order.customer_name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Order Date</p>
                            <p className="font-semibold">{new Date(order.order_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Order Status</p>
                            <div className="mt-1">{getOrderStatusBadge(order.order_status)}</div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Payment Status</p>
                            <div className="mt-1">{getPaymentStatusBadge(order.payment_status)}</div>
                          </div>
                        </div>
                        
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
                        
                        <div className="flex justify-end">
                          <div className="w-64 space-y-2 p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span className="font-semibold">
                                {formatCurrency(
                                  orderDetails.reduce((sum, item) => sum + parseFloat(item.total_price), 0).toString()
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                              <span>Total:</span>
                              <span>{formatCurrency(order.order_total_value)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
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