const express = require('express');
const router = express.Router();
const { authenticateEmployee } = require('../middleware/auth');
const {
  login,
  getLocalities,
  getCustomers,
  createCustomer,
  updateCustomer,
  createOrder,
  createPayment,
  getReports,
  getCustomerOrders,
    checkInAttendance,
    checkOutAttendance,
    getCheckInAttendance,
    getCheckOutAttendance,
    getAttendanceSummary
} = require('../controllers/employee');

router.post('/login', login);
router.get('/localities', authenticateEmployee, getLocalities);
router.get('/all_customers', authenticateEmployee, getCustomers);
router.post('/create_customers', authenticateEmployee, createCustomer);
router.put('/update_customers/:id', authenticateEmployee, updateCustomer);
router.post('/create_order', authenticateEmployee, createOrder);
router.post('/payments', authenticateEmployee, createPayment);
router.post('/reports', authenticateEmployee, getReports);
router.post('/customers/orders', authenticateEmployee, getCustomerOrders);

router.post('/attendance/in', authenticateEmployee, checkInAttendance);
router.post('/attendance/out', authenticateEmployee, checkOutAttendance);
router.get('/attendance/check-in', authenticateEmployee, getCheckInAttendance);
router.get('/attendance/check-out', authenticateEmployee, getCheckOutAttendance);
router.get('/attendance/summary', authenticateEmployee, getAttendanceSummary);

module.exports = router;