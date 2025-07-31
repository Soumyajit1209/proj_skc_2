const express = require('express');
const router = express.Router();
const { authenticateToken, restrictToRole } = require('../middleware/auth');
const {
  login,
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
  createLocality,
  getLocalities,
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  approvePayment,
  getPayments,
  getAllAttendance,
  deleteAttendance,
  rejectAttendance,
  getAttendanceReport,
   createCustomer,
    getCustomers,
    updateCustomer,
    deleteCustomer,
    deleteLocality,
    updateLocality,
    getOrders,
    getOrderDetails
} = require('../controllers/admin');

router.post('/login', login);


router.post('/employees', authenticateToken, restrictToRole('admin'), createEmployee);
router.get('/employees', authenticateToken, restrictToRole('admin'), getEmployees);
router.put('/employees/:id', authenticateToken, restrictToRole('admin'), updateEmployee);
router.delete('/employees/:id', authenticateToken, restrictToRole('admin'), deleteEmployee);

router.get('/customers', authenticateToken, restrictToRole('admin'), getCustomers);
router.post('/customers', authenticateToken, restrictToRole('admin'), createCustomer);
router.put('/customers/:id', authenticateToken, restrictToRole('admin'), updateCustomer);
router.delete('/customers/:id', authenticateToken, restrictToRole('admin'), deleteCustomer);

router.post('/localities', authenticateToken, restrictToRole('admin'), createLocality);
router.get('/localities', authenticateToken, restrictToRole('admin'), getLocalities);
router.put('/localities/:id', authenticateToken, restrictToRole('admin'), updateLocality);
router.delete('/localities/:id', authenticateToken, restrictToRole('admin'), deleteLocality);



router.post('/products', authenticateToken, restrictToRole('admin'), createProduct);
router.get('/products', authenticateToken, restrictToRole('admin'), getProducts);
router.put('/products/:id', authenticateToken, restrictToRole('admin'), updateProduct);
router.delete('/products/:id', authenticateToken, restrictToRole('admin'), deleteProduct);


router.put('/payments/:id/approve', authenticateToken, restrictToRole('admin'), approvePayment);
router.get('/payments', authenticateToken, restrictToRole('admin'), getPayments);


router.get('/attendance', authenticateToken, restrictToRole('admin'), getAllAttendance);
router.delete('/attendance/:id', authenticateToken, restrictToRole('admin'), deleteAttendance);
router.put('/attendance/:id/reject', authenticateToken, restrictToRole('admin'), rejectAttendance);
router.get('/attendance/report', authenticateToken, restrictToRole('admin'), getAttendanceReport);

router.get('/orders', authenticateToken, restrictToRole('admin'), getOrders);
router.get('/orders/:id/details', authenticateToken, restrictToRole('admin'), getOrderDetails);



module.exports = router;