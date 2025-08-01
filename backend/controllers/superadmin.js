const { getDbConnection } = require('../config/db');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const connection = await getDbConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM superadmin WHERE username = ? AND password = ?',
      [username, password]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: rows[0].superadmin_id, role: 'superadmin' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );
    res.json({ token, role });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const changeSuperadminPassword = async (req, res) => {
  const { old_password, new_password } = req.body;
  const { id } = req.user;

  // Input validation
  if (!old_password || !new_password) {
    return res.status(400).json({ error: 'Old and new passwords are required' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  try {
    const connection = await getDbConnection();
    
    // Verify old password
    const [rows] = await connection.execute(
      'SELECT * FROM superadmin WHERE superadmin_id = ? AND password = ?',
      [id, old_password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid old password' });
    }

    // Update password
    const [result] = await connection.execute(
      'UPDATE superadmin SET password = ? WHERE superadmin_id = ?',
      [new_password, id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ error: 'Failed to update password' });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const createCompany = async (req, res) => {
  const { 
    company_name, 
    company_email, 
    company_phone_1, 
    company_phone_2, 
    company_address, 
    GST_no, 
    contact_person, 
    status, 
    admin_username, 
    admin_password, 
    admin_email 
  } = req.body;

  // Input validation
  if (!company_name || !admin_username || !admin_password || !admin_email) {
    return res.status(400).json({ error: 'Company name, admin username, admin password, and admin email are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(admin_email)) {
    return res.status(400).json({ error: 'Invalid admin email format' });
  }

  // Validate status
  const validStatuses = ['ACTIVE', 'INACTIVE'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status must be either ACTIVE or INACTIVE' });
  }

  // Validate phone numbers (if provided)
  const phoneRegex = /^[0-9]{10,15}$/;
  if (company_phone_1 && !phoneRegex.test(company_phone_1)) {
    return res.status(400).json({ error: 'Invalid company phone 1 format (10-15 digits)' });
  }
  if (company_phone_2 && !phoneRegex.test(company_phone_2)) {
    return res.status(400).json({ error: 'Invalid company phone 2 format (10-15 digits)' });
  }

  // Validate admin password length
  if (admin_password.length < 6) {
    return res.status(400).json({ error: 'Admin password must be at least 6 characters long' });
  }

  try {
    const connection = await getDbConnection();
    
    // Validate admin username and email uniqueness
    const [existingAdmins] = await connection.execute(
      'SELECT * FROM admin WHERE username = ? OR email_id = ?',
      [admin_username, admin_email]
    );
    if (existingAdmins.length > 0) {
      return res.status(400).json({ error: 'Admin username or email already exists' });
    }

    // Start transaction
    await connection.beginTransaction();

    try {
      // Insert company
      const [companyResult] = await connection.execute(
        'INSERT INTO company_master (superadmin_id, company_name, company_email, company_phone_1, company_phone_2, company_address, GST_no, contact_person, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          req.user.id, 
          company_name, 
          company_email || null, 
          company_phone_1 || null, 
          company_phone_2 || null, 
          company_address || null, 
          GST_no || null, 
          contact_person || null, 
          status || 'ACTIVE'
        ]
      );

      const company_id = companyResult.insertId;

      // Insert admin
      const [adminResult] = await connection.execute(
        'INSERT INTO admin (company_id, email_id, username, password) VALUES (?, ?, ?, ?)',
        [company_id, admin_email, admin_username, admin_password]
      );

      // Commit transaction
      await connection.commit();

      res.json({ 
        company_id: company_id, 
        admin_id: adminResult.insertId, 
        message: 'Company and admin created successfully' 
      });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getCompanies = async (req, res) => {
  try {
    const connection = await getDbConnection();
    const [rows] = await connection.execute(
      `SELECT 
        cm.company_id,
        cm.superadmin_id,
        cm.company_name,
        cm.company_email,
        cm.company_phone_1,
        cm.company_phone_2,
        cm.company_address,
        cm.GST_no,
        cm.contact_person,
        cm.status,
        cm.created_at AS company_created_at,
        cm.updated_at AS company_updated_at,
        a.id AS admin_id,
        a.email_id AS admin_email,
        a.username AS admin_username,
        a.password AS admin_password,
        a.created_at AS admin_created_at,
        a.updated_at AS admin_updated_at
      FROM company_master cm
      LEFT JOIN admin a ON cm.company_id = a.company_id
      WHERE cm.superadmin_id = ?`,
      [req.user.id]
    );

    // Group results by company, including admins in an array
    const companies = {};
    rows.forEach(row => {
      const companyId = row.company_id;
      if (!companies[companyId]) {
        companies[companyId] = {
          company_id: row.company_id,
          superadmin_id: row.superadmin_id,
          company_name: row.company_name,
          company_email: row.company_email,
          company_phone_1: row.company_phone_1,
          company_phone_2: row.company_phone_2,
          company_address: row.company_address,
          GST_no: row.GST_no,
          contact_person: row.contact_person,
          status: row.status,
          created_at: row.company_created_at,
          updated_at: row.company_updated_at,
          admins: []
        };
      }
      if (row.admin_id) {
        companies[companyId].admins.push({
          admin_id: row.admin_id,
          email: row.admin_email,
          username: row.admin_username,
          password: row.admin_password,
          created_at: row.admin_created_at,
          updated_at: row.admin_updated_at
        });
      }
    });

    // Convert companies object to array
    const result = Object.values(companies);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const updateCompany = async (req, res) => {
  const { company_name, company_email, company_phone, company_address, status } = req.body;
  try {
    const connection = await getDbConnection();
    await connection.execute(
      'UPDATE company_master SET company_name = ?, company_email = ?, company_phone_1 = ?, company_address = ?, status = ? WHERE company_id = ? AND superadmin_id = ?',
      [company_name, company_email || null, company_phone || null, company_address || null, status, req.params.id, req.user.id]
    );
    res.json({ message: 'Company updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const connection = await getDbConnection();
    await connection.execute('DELETE FROM company_master WHERE company_id = ? AND superadmin_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Company deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = { login, createCompany, getCompanies, updateCompany, deleteCompany, changeSuperadminPassword };