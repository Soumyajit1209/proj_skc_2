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
  getAttendanceSummary,
  fetchEmployeeData,
  updateEmployeeDetails,
  changeEmployeePassword
} = require('../controllers/employee');

router.post('/login', login);
router.post('/localities', authenticateEmployee, getLocalities);
router.post('/all_customers', authenticateEmployee, getCustomers);
router.post('/create_customers', authenticateEmployee, createCustomer);
router.put('/update_customers/:id', authenticateEmployee, updateCustomer);
router.post('/create_order', authenticateEmployee, createOrder);
router.post('/payments', authenticateEmployee, createPayment);
router.post('/reports', authenticateEmployee, getReports);
router.post('/customers/orders', authenticateEmployee, getCustomerOrders);
router.post('/employee_data', authenticateEmployee, fetchEmployeeData);
router.put('/update_employee', authenticateEmployee, updateEmployeeDetails); // Update employee details
router.put('/change_password', authenticateEmployee, changeEmployeePassword); // Change password

router.post('/attendance/in', authenticateEmployee, checkInAttendance);
router.post('/attendance/out', authenticateEmployee, checkOutAttendance);
router.post('/attendance/check-in', authenticateEmployee, getCheckInAttendance);
router.post('/attendance/check-out', authenticateEmployee, getCheckOutAttendance);
router.post('/attendance/report', authenticateEmployee, getAttendanceSummary);

module.exports = router;