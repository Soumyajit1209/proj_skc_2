const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const superadminRoutes = require('./routes/superadmin');
const adminRoutes = require('./routes/admin');
const employeeRoutes = require('./routes/employee');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(bodyParser.json());


const frontendOrigins = process.env.FRONTEND_ORIGINS?.split(',') || [];
const appOrigins = process.env.APP_ORIGINS?.split(',') || [];
const allowedOrigins = [...frontendOrigins, ...appOrigins, '*'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));


// Mount routes
//app.use('/api/superadmin', superadminRoutes);
//app.use('/api/admin', adminRoutes);
app.use('/api/employee', employeeRoutes);



app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy: Origin not allowed' });
  }
  next(err);
}); 

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});