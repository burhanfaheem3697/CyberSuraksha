const express = require('express');
const cors = require('cors');
const connectDB = require('./connectDB');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();

const userRoutes = require('./routes/user');
const partnerRoutes = require('./routes/partner');
const bankRoutes = require('./routes/bank');
const consentRoutes = require('./routes/consent');
const virtualIdRoutes = require('./routes/virtualid');
const auditRoutes = require('./routes/audit');
const loanRoutes = require('./routes/loan');
const insuranceRoutes = require('./routes/insurance');
const budgetingRoutes = require('./routes/budgeting');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // or use an array for multiple origins
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

connectDB();

app.use('/user', userRoutes);
app.use('/partner', partnerRoutes);
app.use('/bank', bankRoutes);
app.use('/consent', consentRoutes);
app.use('/virtualid', virtualIdRoutes);
app.use('/audit', auditRoutes);
app.use('/loan', loanRoutes);
app.use('/insurance', insuranceRoutes);
app.use('/budgeting', budgetingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});