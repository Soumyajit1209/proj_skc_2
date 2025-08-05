const express = require('express');
const router = express.Router();
const { authenticateToken, restrictToRole } = require('../middleware/auth');
const { login, createCompany, getCompanies, updateCompany, deleteCompany, changeSuperadminPassword, checkToken } = require('../controllers/superadmin');

router.post('/login', login);
router.post('/companies', authenticateToken, restrictToRole('superadmin'), createCompany);
router.get('/companies', authenticateToken, restrictToRole('superadmin'), getCompanies);
router.put('/companies/:id', authenticateToken, restrictToRole('superadmin'), updateCompany);
router.delete('/companies/:id', authenticateToken, restrictToRole('superadmin'), deleteCompany);

router.post('/change-password', authenticateToken, changeSuperadminPassword);
router.get('/check-token', authenticateToken, restrictToRole('superadmin'), checkToken);

module.exports = router;