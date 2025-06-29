const express = require('express');
const cors = require('cors');
const connectDB = require('./connectDB');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const userRoutes = require('./routes/user');
const partnerRoutes = require('./routes/partner');
const bankRoutes = require('./routes/bank');
const consentRoutes = require('./routes/consent');
const virtualIdRoutes = require('./routes/virtualid');
const loanRoutes = require('./routes/loan');
const insuranceRoutes = require('./routes/insurance');
const budgetingRoutes = require('./routes/budgeting');
const contractRoutes = require('./routes/contract');
const userBankDataRoutes = require('./routes/userbankdata');
const bankAuditLogRoutes = require('./routes/bankauditlog');
const userAuditLogRoutes = require('./routes/userauditlog');
const partnerAuditLogRoutes = require('./routes/partnerauditlog')

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } }); // Adjust CORS as needed

app.set('io', io);

app.use(cors({
  origin: 'http://localhost:3000', // or use an array for multiple origins
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Debug route to check cookies
app.get('/debug/cookies', (req, res) => {
  console.log('All cookies:', req.cookies);
  console.log('Bank token:', req.cookies.bankToken);
  console.log('User token:', req.cookies.userToken);
  console.log('Partner token:', req.cookies.partnerToken);
  res.json({ 
    allCookies: req.cookies,
    bankToken: req.cookies.bankToken ? 'present' : 'missing',
    userToken: req.cookies.userToken ? 'present' : 'missing',
    partnerToken: req.cookies.partnerToken ? 'present' : 'missing'
  });
});

connectDB();

app.use('/user', userRoutes);
app.use('/partner', partnerRoutes);
app.use('/bank', bankRoutes);
app.use('/consent', consentRoutes);
app.use('/virtualid', virtualIdRoutes);
app.use('/loan', loanRoutes);
app.use('/insurance', insuranceRoutes);
app.use('/budgeting', budgetingRoutes);
app.use('/contract', contractRoutes);
app.use('/userbankdata', userBankDataRoutes);
app.use('/bankauditlog', bankAuditLogRoutes);
app.use('/userauditlog', userAuditLogRoutes);
app.use('/partnerauditlog',partnerAuditLogRoutes)
// Example: handle socket connections
io.on('connection', (socket) => {
  socket.on('join_contract_room', (contractId) => {
    socket.join(`contract_${contractId}`);
  });
  socket.on('leave_contract_room', (contractId) => {
    socket.leave(`contract_${contractId}`);
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log('Server running...${PORT}');
});

module.exports = { app, server };