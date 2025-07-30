const { getDbConnection } = require('../config/db');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { username, password , role } = req.body;
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
    res.json({ token , role });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createCompany = async (req, res) => {
  const { company_name, company_email, company_phone, company_address } = req.body;
  try {
    const connection = await getDbConnection();
    const [result] = await connection.execute(
      'INSERT INTO company_master (superadmin_id, company_name, company_email, company_phone, company_address, status) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, company_name, company_email, company_phone, company_address, 'ACTIVE']
    );
    res.json({ company_id: result.insertId, message: 'Company created' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getCompanies = async (req, res) => {
  try {
    const connection = await getDbConnection();
    const [rows] = await connection.execute('SELECT * FROM company_master WHERE superadmin_id = ?', [req.user.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateCompany = async (req, res) => {
  const { company_name, company_email, company_phone, company_address, status } = req.body;
  try {
    const connection = await getDbConnection();
    await connection.execute(
      'UPDATE company_master SET company_name = ?, company_email = ?, company_phone = ?, company_address = ?, status = ? WHERE company_id = ? AND superadmin_id = ?',
      [company_name, company_email, company_phone, company_address, status, req.params.id, req.user.id]
    );
    res.json({ message: 'Company updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const connection = await getDbConnection();
    await connection.execute('DELETE FROM company_master WHERE company_id = ? AND superadmin_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Company deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { login, createCompany, getCompanies, updateCompany, deleteCompany };