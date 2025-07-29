const { getDbConnection } = require('../config/db');


const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.fieldname}-${req.user.emp_id}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

const login = async (req, res) => {
  const { company_id,emp_id, emp_password } = req.body;
  try {
    const connection = await getDbConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM employee_master WHERE company_id = ? AND emp_id = ? AND emp_password = ?',
      [company_id, emp_id, emp_password]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ emp_id: rows[0].emp_id, company_id: rows[0].company_id, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getLocalities = async (req, res) => {
  try {
    const connection = await getDbConnection();
    const [rows] = await connection.execute('SELECT * FROM locality_master WHERE company_id = ?', [req.user.company_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getCustomers = async (req, res) => {
  const { locality_name } = req.body;
  try {
    const connection = await getDbConnection();
    const [localityRows] = await connection.execute(
      'SELECT locality_id FROM locality_master WHERE company_id = ? AND locality_name = ?',
      [req.user.company_id, locality_name]
    );
    if (localityRows.length === 0) {
      return res.status(400).json({ error: 'Locality not found' });
    }
    const locality_id = localityRows[0].locality_id;
    const [rows] = await connection.execute(
      'SELECT * FROM customer_master WHERE company_id = ? AND locality_id = ?',
      [req.user.company_id, locality_id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};


const createCustomer = async (req, res) => {
  const { customer_name, customer_phone, customer_email, customer_address, locality_name } = req.body;
  try {
    const connection = await getDbConnection();
    await connection.beginTransaction();

    // Check if locality exists
    let [localityRows] = await connection.execute(
      'SELECT locality_id FROM locality_master WHERE company_id = ? AND locality_name = ?',
      [req.user.company_id, locality_name]
    );

    let locality_id;
    if (localityRows.length === 0) {
      // Create new locality
      const [localityResult] = await connection.execute(
        'INSERT INTO locality_master (company_id, locality_name) VALUES (?, ?)',
        [req.user.company_id, locality_name]
      );
      locality_id = localityResult.insertId;
    } else {
      locality_id = localityRows[0].locality_id;
    }

    // Create customer
    const [result] = await connection.execute(
      'INSERT INTO customer_master (company_id, locality_id, customer_name, customer_phone, customer_email, customer_address, status, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.company_id, locality_id, customer_name, customer_phone, customer_email, customer_address, 'ACTIVE', req.user.id, req.user.id]
    );

    await connection.commit();
    res.json({ customer_id: result.insertId, locality_id, message: 'Customer created' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Server error' });
  }
};

const updateCustomer = async (req, res) => {
  const { customer_name, customer_phone, customer_email, customer_address, locality_name, status } = req.body;
  try {
    const connection = await getDbConnection();
    const [localityRows] = await connection.execute(
      'SELECT locality_id FROM locality_master WHERE company_id = ? AND locality_name = ?',
      [req.user.company_id, locality_name]
    );
    if (localityRows.length === 0) {
      return res.status(400).json({ error: 'Locality not found' });
    }
    const locality_id = localityRows[0].locality_id;
    await connection.execute(
      'UPDATE customer_master SET customer_name = ?, customer_phone = ?, customer_email = ?, customer_address = ?, locality_id = ?, status = ?, updated_by = ? WHERE customer_id = ? AND company_id = ?',
      [customer_name, customer_phone, customer_email, customer_address, locality_id, status, req.user.id, req.params.id, req.user.company_id]
    );
    res.json({ message: 'Customer updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createOrder = async (req, res) => {
  const { customer_id, items } = req.body;
  let connection;
  try {
    connection = await getDbConnection();
    await connection.beginTransaction();
    
    let order_total_value = 0;
    for (const item of items) {
      const [products] = await connection.execute('SELECT unit_price FROM product_master WHERE product_id = ? AND company_id = ?', [item.product_id, req.user.company_id]);
      if (products.length === 0) throw new Error('Invalid product');
      order_total_value += products[0].unit_price * item.item_qty;
    }

    const [orderResult] = await connection.execute(
      'INSERT INTO sales_order (company_id, emp_id, customer_id, order_total_value, order_status, payment_status, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.company_id, req.user.id, customer_id, order_total_value, 'PENDING', 'UNPAID', req.user.id, req.user.id]
    );

    for (const item of items) {
      const [products] = await connection.execute('SELECT unit_price FROM product_master WHERE product_id = ? AND company_id = ?', [item.product_id, req.user.company_id]);
      await connection.execute(
        'INSERT INTO order_details (company_id, order_id, product_id, item_qty, item_unit_price, item_total_price) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.company_id, orderResult.insertId, item.product_id, item.item_qty, products[0].unit_price, products[0].unit_price * item.item_qty]
      );
    }

    await connection.commit();
    res.json({ order_id: orderResult.insertId, message: 'Order placed' });
  } catch (error) {
    if (connection) await connection.rollback();
    res.status(500).json({ error: 'Server error' });
  }
};

const createPayment = async (req, res) => {
  const { order_id, customer_id, payment_amount } = req.body;
  try {
    const connection = await getDbConnection();
    const [result] = await connection.execute(
      'INSERT INTO payment (company_id, order_id, customer_id, payment_amount, payment_status, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.company_id, order_id, customer_id, payment_amount, 'PENDING', req.user.id, req.user.id]
    );
    await connection.execute(
      'INSERT INTO payment_log (company_id, payment_id, action, action_by, remarks) VALUES (?, ?, ?, ?, ?)',
      [
        req.user.company_id,
        result.insertId,
        'SUBMITTED',
        req.user.id,
        'Payment submitted by employee'
      ]
    );
    res.json({ payment_id: result.insertId, message: 'Payment submitted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getReports = async (req, res) => {
  const { report_type, order_id, customer_id } = req.body;
  try {
    const connection = await getDbConnection();
    let report_data = {};
    if (report_type === 'ORDER_REPORT' || report_type === 'BILL') {
      const [order] = await connection.execute(
        'SELECT s.*, c.customer_name FROM sales_order s JOIN customer_master c ON s.customer_id = c.customer_id WHERE s.order_id = ? AND s.company_id = ?',
        [order_id, req.user.company_id]
      );
      const [items] = await connection.execute(
        'SELECT od.*, p.product_name FROM order_details od JOIN product_master p ON od.product_id = p.product_id WHERE od.order_id = ? AND od.company_id = ?',
        [order_id, req.user.company_id]
      );
      report_data = { order: order[0], items };
    } else if (report_type === 'PAYMENT_RECEIPT') {
      const [payment] = await connection.execute(
        'SELECT p.*, c.customer_name FROM payment p JOIN customer_master c ON p.customer_id = c.customer_id WHERE p.payment_id = ? AND p.company_id = ?',
        [order_id, req.user.company_id]
      );
      report_data = payment[0];
    }
    const [result] = await connection.execute(
      'INSERT INTO report_log (company_id, report_type, order_id, customer_id, generated_by, report_data) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.company_id, report_type, order_id, customer_id, req.user.id, JSON.stringify(report_data)]
    );
    res.json({ report_id: result.insertId, report_data, message: 'Report generated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getCustomerOrders = async (req, res) => {
  try {
    const { customer_id } = req.body; // Get customer_id from body
    if (!customer_id) {
      return res.status(400).json({ error: 'customer_id is required' });
    }

    const connection = await getDbConnection();
    const [orders] = await connection.execute(
      'SELECT * FROM sales_order WHERE customer_id = ? AND company_id = ?',
      [customer_id, req.user.company_id]
    );
    const [payments] = await connection.execute(
      'SELECT SUM(payment_amount) as total_paid FROM payment WHERE customer_id = ? AND company_id = ? AND payment_status = "APPROVED"',
      [customer_id, req.user.company_id]
    );

    const totalOrderValue = orders.reduce((sum, order) => {
      return sum + (order.payment_status !== 'PAID' ? parseFloat(order.order_total_value) : 0);
    }, 0);
    const totalPaid = payments[0].total_paid ? parseFloat(payments[0].total_paid) : 0;
    const total_due = totalOrderValue - totalPaid;

    res.json({
      company_id: req.user.company_id,
      emp_id: req.user.id,
      data: {
        orders,
        total_due: isNaN(total_due) ? 0 : total_due
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const checkInAttendance = [
  upload.single('in_pic'),
  async (req, res) => {
    try {
      const connection = await getDbConnection();
      const today = new Date().toISOString().split('T')[0]; // e.g., 2025-07-29
      const [existing] = await connection.execute(
        'SELECT * FROM attendance_register WHERE company_id = ? AND emp_id = ? AND DATE(attendance_date) = ?',
        [req.user.company_id, req.user.id, today]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Already checked in today' });
      }

      const inTime = new Date().toTimeString().split(' ')[0]; // e.g., 12:33:00
      const inPicPath = req.file ? `/uploads/${req.file.filename}` : null;
      const { in_location, in_latitude, in_longitude } = req.body;

      const [result] = await connection.execute(
        'INSERT INTO attendance_register (company_id, emp_id, attendance_date, in_time, in_location, in_latitude, in_longitude, in_pic, in_status) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?)',
        [req.user.company_id, req.user.id, today, inTime, in_location || null, in_latitude || null, in_longitude || null, inPicPath, 'PRESENT']
      );

      res.json({ attendance_id: result.insertId, message: 'Checked in successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
];

const checkOutAttendance = [
  upload.single('out_picture'),
  async (req, res) => {
    try {
      const connection = await getDbConnection();
      const today = new Date().toISOString().split('T')[0]; // e.g., 2025-07-29
      const [existing] = await connection.execute(
        'SELECT * FROM attendance_register WHERE company_id = ? AND emp_id = ? AND DATE(attendance_date) = ?',
        [req.user.company_id, req.user.id, today]
      );

      if (existing.length === 0) {
        return res.status(400).json({ error: 'No check-in record found for today' });
      }

      const outTime = new Date().toTimeString().split(' ')[0]; // e.g., 12:33:00
      const outPicPath = req.file ? `/uploads/${req.file.filename}` : null;
      const { out_location, out_latitude, out_longitude, remarks } = req.body;

      await connection.execute(
        'UPDATE attendance_register SET out_time = ?, out_location = ?, out_latitude = ?, out_longitude = ?, out_picture = ?, remarks = ?, updated_at = NOW() WHERE attendance_id = ? AND company_id = ? AND emp_id = ?',
        [outTime, out_location || null, out_latitude || null, out_longitude || null, outPicPath, remarks || null, existing[0].attendance_id, req.user.company_id, req.user.id]
      );

      res.json({ message: 'Checked out successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
];

const getCheckInAttendance = async (req, res) => {
  try {
    const connection = await getDbConnection();
    const today = new Date().toISOString().split('T')[0]; // e.g., 2025-07-29
    const [rows] = await connection.execute(
      'SELECT COUNT(*) as count FROM attendance_register WHERE company_id = ? AND emp_id = ? AND DATE(attendance_date) = ? AND in_time IS NOT NULL',
      [req.user.company_id, req.user.id, today]
    );
    res.json({ isCheckIn: rows[0].count > 0 });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};


const getCheckOutAttendance = async (req, res) => {
  try {
    const connection = await getDbConnection();
    const today = new Date().toISOString().split('T')[0]; // e.g., 2025-07-29
    const [rows] = await connection.execute(
      'SELECT COUNT(*) as count FROM attendance_register WHERE company_id = ? AND emp_id = ? AND DATE(attendance_date) = ? AND out_time IS NOT NULL',
      [req.user.company_id, req.user.id, today]
    );
    res.json({ isCheckOut: rows[0].count > 0 });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getAttendanceSummary = async (req, res) => {
  const { start_date, end_date } = req.query;
  try {
    const connection = await getDbConnection();
    let query = `
      SELECT attendance_date, in_time, out_time, in_pic, out_picture as out_pic, in_status
      FROM attendance_register 
      WHERE company_id = ? AND emp_id = ?`;
    let params = [req.user.company_id, req.user.id];

    if (start_date) {
      query += ' AND DATE(attendance_date) >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND DATE(attendance_date) <= ?';
      params.push(end_date);
    }

    const [rows] = await connection.execute(query, params);
    res.json({
      emp_id: req.user.id,
      attendance_records: rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
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
}
