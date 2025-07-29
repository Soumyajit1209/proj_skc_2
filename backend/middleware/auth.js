const jwt = require('jsonwebtoken');
const { getDbConnection } = require('../config/db');
require('dotenv').config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

function restrictToRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

async function authenticateEmployee(req, res, next) {
  const { company_id, emp_id, emp_password } = req.body;
  if (!company_id || !emp_id || !emp_password) {
    return res.status(401).json({ error: 'Missing credentials' });
  }

  try {
    const connection = await getDbConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM employee_master WHERE company_id = ? AND emp_id = ? AND emp_password = ?',
      [company_id, emp_id, emp_password]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Attach user info to request
    req.user = { id: rows[0].emp_id, company_id: rows[0].company_id, role: 'employee' };

    // Override res.json to include company_id and emp_id in every response
    const originalJson = res.json;
    res.json = function (data) {
      return originalJson.call(this, {
        company_id: req.user.company_id,
        emp_id: req.user.id,
        data
      });
    };

    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { authenticateToken, restrictToRole, authenticateEmployee };