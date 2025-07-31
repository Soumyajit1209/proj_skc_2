const { getDbConnection } = require('../config/db');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');



// Multer configuration for profile picture uploads
const storage = multer.diskStorage({
  destination: './Uploads/profile_pictures',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-profile-${req.user.id}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

const login = async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const connection = await getDbConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM admin WHERE username = ? AND password   = ?',
            [username, password]
        );
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { id: rows[0].id, company_id: rows[0].company_id, role: 'admin' },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '4h' }
        );
        res.json({ token , role });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const createEmployee = [
  upload.single('profile_picture'),
  async (req, res) => {
    const { emp_name, emp_username, emp_password, emp_phone, emp_email, emp_address, emp_dob, emp_hiring_date } = req.body;
    try {
      const profilePicturePath = req.file ? `/Uploads/${req.file.filename}` : null;
      const connection = await getDbConnection();
      const [result] = await connection.execute(
        'INSERT INTO employee_master (company_id, emp_name, emp_username, emp_password, profile_picture, emp_phone, emp_email, emp_address, emp_dob, emp_hiring_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [req.user.company_id, emp_name, emp_username, emp_password, profilePicturePath, emp_phone, emp_email, emp_address, emp_dob, emp_hiring_date, 'ACTIVE']
      );
      res.json({ emp_id: result.insertId, message: 'Employee created' });
    } catch (error) {
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  }
];

const getEmployees = async (req, res) => {
    try {
        const connection = await getDbConnection();
        const [rows] = await connection.execute('SELECT * FROM employee_master WHERE company_id = ?', [req.user.company_id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const updateEmployee = [
  upload.single('profile_picture'),
  async (req, res) => {
    const { emp_name, emp_username, emp_password, emp_phone, emp_email, emp_address, emp_dob, emp_hiring_date, status } = req.body;
    try {
      const connection = await getDbConnection();
      const profilePicturePath = req.file ? `/uploads/profile_pictures/${req.file.filename}` : null;

      // Fetch current employee data to retain existing profile picture if not updated
      const [currentEmployee] = await connection.execute(
        'SELECT profile_picture FROM employee_master WHERE emp_id = ? AND company_id = ?',
        [req.params.id, req.user.company_id]
      );
      if (currentEmployee.length === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      const updates = {
        emp_name,
        emp_username,
        emp_password,
        emp_phone,
        emp_email,
        emp_address,
        emp_dob,
        emp_hiring_date,
        status,
        profile_picture: profilePicturePath || currentEmployee[0].profile_picture
      };
      const setClause = Object.keys(updates)
        .filter(key => updates[key] !== undefined && updates[key] !== null)
        .map(key => `${key} = ?`)
        .join(', ');
      const values = Object.values(updates)
        .filter(val => val !== undefined && val !== null)
        .concat([req.params.id, req.user.company_id]);

      const [result] = await connection.execute(
        `UPDATE employee_master SET ${setClause} WHERE emp_id = ? AND company_id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'No changes made or employee not found' });
      }

      res.json({ message: 'Employee updated' });
    } catch (error) {
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  }
];

const deleteEmployee = async (req, res) => {
  try {
    const connection = await getDbConnection();
    const [result] = await connection.execute(
      'UPDATE employee_master SET status = "TERMINATED", profile_picture = NULL WHERE emp_id = ? AND company_id = ?',
      [req.params.id, req.user.company_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ message: 'Employee terminated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// const createLocality = async (req, res) => {
//   const { locality_name } = req.body;
//   try {
//     const connection = await getDbConnection();
//     const [result] = await connection.execute(
//       'INSERT INTO locality_master (company_id, locality_name) VALUES (?, ?)',
//       [req.user.company_id, locality_name]
//     );
//     res.json({ locality_id: result.insertId, message: 'Locality created' });
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };

const getLocalities = async (req, res) => {
    try {
        const connection = await getDbConnection();
        const [rows] = await connection.execute('SELECT * FROM locality_master WHERE company_id = ?', [req.user.company_id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// // Updated getOrders to match frontend Order interface
// const getOrders = async (req, res) => {
//   try {
//     const connection = await getDbConnection();
//     const [rows] = await connection.execute(
//       `SELECT 
//         s.order_id,
//         s.order_date,
//         c.customer_name,
//         s.order_total_value,
//         s.order_status,
//         s.payment_status,
//         s.created_at
//       FROM sales_order s
//       JOIN customer_master c ON s.customer_id = c.customer_id
//       WHERE s.company_id = ?`,
//       [req.user.company_id]
//     );
//     // Format data to ensure compatibility with frontend
//     const formattedOrders = rows.map(order => ({
//       order_id: order.order_id,
//       order_date: order.order_date,
//       customer_name: order.customer_name,
//       order_total_value: order.order_total_value.toString(), // Convert to string for frontend
//       order_status: order.order_status,
//       payment_status: order.payment_status,
//       created_at: order.created_at
//     }));
//     res.json(formattedOrders);
//   } catch (error) {
//     res.status(500).json({ error: 'Server error', details: error.message });
//   }
// };
// Get all customers
const getCustomers = async (req, res) => {
    try {
        const connection = await getDbConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM customer_master WHERE company_id = ?',
            [req.user.company_id]
        );
        res.json({
            company_id: req.user.company_id,
            admin_id: req.user.id,
            data: { customers: rows }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};
//create customer
const createCustomer = async (req, res) => {
    const { customer_name, customer_phone, customer_email, customer_address, locality_name, status } = req.body;
    try {
        if (!customer_name || !locality_name || !status || !customer_phone) {
            return res.status(400).json({ error: 'customer_name, locality_name, phone number and status are required' });
        }

        const connection = await getDbConnection();
        const [locality] = await connection.execute(
            'SELECT locality_id FROM locality_master WHERE locality_name = ? AND company_id = ?',
            [locality_name, req.user.company_id]
        );
        if (!locality.length) {
            return res.status(404).json({ error: 'Locality not found' });
        }

        const [result] = await connection.execute(
            'INSERT INTO customer_master (company_id, locality_id, customer_name, customer_phone, customer_email, customer_address, status, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.company_id, locality[0].locality_id, customer_name, customer_phone || null, customer_email || null, customer_address || null, status, req.user.id, req.user.id]
        );
        res.json({
            company_id: req.user.company_id,
            admin_id: req.user.id,
            data: { customer_id: result.insertId, message: 'Customer created successfully' }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

// Update a customer
const updateCustomer = async (req, res) => {
    const { customer_name, customer_phone, customer_email, customer_address, locality_name, status } = req.body;
    try {
        if (!customer_name && !customer_phone && !customer_email && !customer_address && !locality_name && !status) {
            return res.status(400).json({ error: 'At least one field is required for update' });
        }

        const connection = await getDbConnection();
        const [currentCustomer] = await connection.execute(
            'SELECT * FROM customer_master WHERE customer_id = ? AND company_id = ?',
            [req.params.id, req.user.company_id]
        );
        if (!currentCustomer.length) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        let locality_id = currentCustomer[0].locality_id;
        if (locality_name) {
            const [locality] = await connection.execute(
                'SELECT locality_id FROM locality_master WHERE locality_name = ? AND company_id = ?',
                [locality_name, req.user.company_id]
            );
            if (!locality.length) {
                return res.status(404).json({ error: 'Locality not found' });
            }
            locality_id = locality[0].locality_id;
        }

        const setClause = ['updated_at = CURRENT_TIMESTAMP', 'updated_by = ?'].concat(
            Object.keys({ customer_name, customer_phone, customer_email, customer_address, locality_id, status })
                .filter(key => eval(key) !== undefined)
                .map(key => `${key} = ?`)
        ).join(', ');
        const values = [req.user.id].concat(
            Object.values({ customer_name, customer_phone, customer_email, customer_address, locality_id, status })
                .filter(val => val !== undefined)
        ).concat([req.params.id, req.user.company_id]);

        const [result] = await connection.execute(
            `UPDATE customer_master SET ${setClause} WHERE customer_id = ? AND company_id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'No changes made or customer not found' });
        }

        res.json({
            company_id: req.user.company_id,
            admin_id: req.user.id,
            data: { message: 'Customer updated successfully' }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

// Delete a customer
const deleteCustomer = async (req, res) => {
    try {
        const connection = await getDbConnection();
        const [result] = await connection.execute(
            'DELETE FROM customer_master WHERE customer_id = ? AND company_id = ?',
            [req.params.id, req.user.company_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json({
            company_id: req.user.company_id,
            admin_id: req.user.id,
            data: { message: 'Customer deleted successfully' }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};


// Create a new locality
const createLocality = async (req, res) => {
  const { locality_name } = req.body;
  try {
    if (!locality_name) {
      return res.status(400).json({ error: 'locality_name is required' });
    }

    const connection = await getDbConnection();
    const [result] = await connection.execute(
      'INSERT INTO locality_master (company_id, locality_name) VALUES (?, ?)',
      [req.user.company_id, locality_name]
    );
    res.json({
      company_id: req.user.company_id,
      admin_id: req.user.id,
      data: { locality_id: result.insertId, message: 'Locality created successfully' }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Update a locality
const updateLocality = async (req, res) => {
    const { locality_name } = req.body;
    try {
        if (!locality_name) {
            return res.status(400).json({ error: 'locality_name is required' });
        }

        const connection = await getDbConnection();
        const [result] = await connection.execute(
            'UPDATE locality_master SET locality_name = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE locality_id = ? AND company_id = ?',
            [locality_name, req.user.id, req.params.id, req.user.company_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Locality not found' });
        }
        res.json({
            company_id: req.user.company_id,
            admin_id: req.user.id,
            data: { message: 'Locality updated successfully' }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

// Delete a locality
const deleteLocality = async (req, res) => {
    try {
        const connection = await getDbConnection();
        const [result] = await connection.execute(
            'DELETE FROM locality_master WHERE locality_id = ? AND company_id = ?',
            [req.params.id, req.user.company_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Locality not found' });
        }
        res.json({
            company_id: req.user.company_id,
            admin_id: req.user.id,
            data: { message: 'Locality deleted successfully' }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

// Get all orders
const getOrders = async (req, res) => {
  try {
    const connection = await getDbConnection();
    const [rows] = await connection.execute(
      `SELECT 
        s.order_id,
        s.order_date,
        c.customer_name,
        s.order_total_value,
        s.order_status,
        s.payment_status,
        s.created_at
      FROM sales_order s
      JOIN customer_master c ON s.customer_id = c.customer_id
      WHERE s.company_id = ?`,
      [req.user.company_id]
    );
    const formattedOrders = rows.map(order => ({
      order_id: order.order_id,
      order_date: order.order_date,
      customer_name: order.customer_name,
      order_total_value: order.order_total_value.toString(),
      order_status: order.order_status,
      payment_status: order.payment_status,
      created_at: order.created_at
    }));
    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const connection = await getDbConnection();
    const [rows] = await connection.execute(
      `SELECT 
        p.product_name,
        od.item_qty AS quantity,
        od.item_unit_price AS unit_price,
        od.item_total_price AS total_price
      FROM order_details od
      JOIN product_master p ON od.product_id = p.product_id
      JOIN sales_order s ON od.order_id = s.order_id
      WHERE od.order_id = ? AND od.company_id = ?`,
      [req.params.id, req.user.company_id]
    );
    const formattedDetails = rows.map(detail => ({
      product_name: detail.product_name,
      quantity: detail.quantity,
      unit_price: detail.unit_price.toString(),
      total_price: detail.total_price.toString()
    }));
    res.json(formattedDetails);
  } catch (error) {
    console.error("GetOrderDetails error:", error);
    res.status(500).json([]);
  }
};;

const createProduct = async (req, res) => {
    const { product_name, unit_price, remarks } = req.body;
    try {
        const connection = await getDbConnection();
        const [result] = await connection.execute(
            'INSERT INTO product_master (company_id, product_name, unit_price, remarks) VALUES (?, ?, ?, ?)',
            [req.user.company_id, product_name, unit_price, remarks]
        );
        res.json({ product_id: result.insertId, message: 'Product created' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getProducts = async (req, res) => {
    try {
        const connection = await getDbConnection();
        const [rows] = await connection.execute('SELECT * FROM product_master WHERE company_id = ?', [req.user.company_id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const updateProduct = async (req, res) => {
    const { product_name, unit_price, remarks } = req.body;
    try {
        const connection = await getDbConnection();
        await connection.execute(
            'UPDATE product_master SET product_name = ?, unit_price = ?, remarks = ? WHERE product_id = ? AND company_id = ?',
            [product_name, unit_price, remarks, req.params.id, req.user.company_id]
        );
        res.json({ message: 'Product updated' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const connection = await getDbConnection();
        await connection.execute('DELETE FROM product_master WHERE product_id = ? AND company_id = ?', [req.params.id, req.user.company_id]);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const approvePayment = async (req, res) => {
    const { payment_status } = req.body;
    try {
        const connection = await getDbConnection();
        await connection.execute(
            'UPDATE payment SET payment_status = ?, approved_by = ? WHERE payment_id = ? AND company_id = ?',
            [payment_status, req.user.id, req.params.id, req.user.company_id]
        );
        await connection.execute(
            'INSERT INTO payment_log (company_id, payment_id, action, action_by, remarks) VALUES (?, ?, ?, ?, ?)',
            [req.user.company_id, req.params.id, payment_status, req.user.id, `Payment ${payment_status} by admin`]
        );
        if (payment_status === 'APPROVED') {
            const [order] = await connection.execute(
                'SELECT order_id, order_total_value FROM sales_order WHERE order_id = (SELECT order_id FROM payment WHERE payment_id = ?)',
                [req.params.id]
            );
            const [payments] = await connection.execute(
                'SELECT SUM(payment_amount) as total_paid FROM payment WHERE order_id = ? AND payment_status = "APPROVED"',
                [order[0].order_id]
            );
            const payment_status = payments[0].total_paid >= order[0].order_total_value ? 'PAID' : 'PARTIALLY_PAID';
            await connection.execute(
                'UPDATE sales_order SET payment_status = ? WHERE order_id = ?',
                [payment_status, order[0].order_id]
            );
        }
        res.json({ message: `Payment ${payment_status.toLowerCase()}` });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getPayments = async (req, res) => {
    try {
        const connection = await getDbConnection();
        const [rows] = await connection.execute(
            'SELECT p.*, c.customer_name FROM payment p JOIN customer_master c ON p.customer_id = c.customer_id WHERE p.company_id = ?',
            [req.user.company_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getAllAttendance = async (req, res) => {
  const { start_date, end_date } = req.query;
  try {
    const connection = await getDbConnection();
    let query = `
      SELECT 
        a.*,
        e.emp_name
      FROM attendance_register a
      JOIN employee_master e ON a.emp_id = e.emp_id
      WHERE a.company_id = ?`;
    let params = [req.user.company_id];
    if (start_date) {
      query += ' AND DATE(a.attendance_date) >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND DATE(a.attendance_date) <= ?';
      params.push(end_date);
    }
    const [rows] = await connection.execute(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const connection = await getDbConnection();
    await connection.execute(
      'DELETE FROM attendance_register WHERE attendance_id = ? AND company_id = ?',
      [req.params.id, req.user.company_id]
    );
    res.json({ message: 'Attendance record deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const rejectAttendance = async (req, res) => {
  const { status } = req.body;
  if (!['ABSENT', 'LATE'].includes(status)) {
    return res.status(400).json({ error: 'Status must be ABSENT or LATE' });
  }
  try {
    const connection = await getDbConnection();
    await connection.execute(
      'UPDATE attendance_register SET in_status = ?, updated_at = NOW() WHERE attendance_id = ? AND company_id = ?',
      [status, req.params.id, req.user.company_id]
    );
    res.json({ message: `Attendance status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getAttendanceReport = async (req, res) => {
  const { start_date, end_date } = req.query;
  try {
    const connection = await getDbConnection();
    let query = `
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN in_time IS NOT NULL THEN 1 ELSE 0 END) as total_check_ins,
        SUM(CASE WHEN out_time IS NOT NULL THEN 1 ELSE 0 END) as total_check_outs,
        SUM(CASE WHEN in_status = 'PRESENT' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN in_status = 'ABSENT' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN in_status = 'LATE' THEN 1 ELSE 0 END) as late_count
      FROM attendance_register 
      WHERE company_id = ?`;
    let params = [req.user.company_id];
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
      company_id: req.user.company_id,
      total_records: rows[0].total_records,
      total_check_ins: rows[0].total_check_ins,
      total_check_outs: rows[0].total_check_outs,
      status_summary: {
        present: rows[0].present_count,
        absent: rows[0].absent_count,
        late: rows[0].late_count
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = {
    login,
    createEmployee,
    getEmployees,
    updateEmployee,
    deleteEmployee,
    createLocality,
    getLocalities,
    updateLocality,
    deleteLocality,
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
    getOrders,
    getOrderDetails


};