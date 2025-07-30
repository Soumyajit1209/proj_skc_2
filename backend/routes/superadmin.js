const express = require('express');
const router = express.Router();
const { authenticateToken, restrictToRole } = require('../middleware/auth');
const { login, createCompany, getCompanies, updateCompany, deleteCompany } = require('../controllers/superadmin');

router.post('/login', login);
router.post('/companies', authenticateToken, restrictToRole('superadmin'), createCompany);
router.get('/companies', authenticateToken, restrictToRole('superadmin'), getCompanies);
router.put('/companies/:id', authenticateToken, restrictToRole('superadmin'), updateCompany);
router.delete('/companies/:id', authenticateToken, restrictToRole('superadmin'), deleteCompany);

module.exports = router;