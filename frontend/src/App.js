import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import UserComponent from './components/UserComponent';
import RegisterComponent from './components/RegisterComponent';
import UserDashboard from './components/UserDashboard';
import PartnerComponent from './components/PartnerComponent';
import PartnerRegisterComponent from './components/PartnerRegisterComponent';
import PartnerDashboard from './components/PartnerDashboard';
import BankComponent from './components/BankComponent';
import BankRegisterComponent from './components/BankRegisterComponent';
import BankDashboard from './components/BankDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/user" element={<UserComponent />} />
        <Route path="/user/register" element={<RegisterComponent />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/partner" element={<PartnerComponent />} />
        <Route path="/partner/register" element={<PartnerRegisterComponent />} />
        <Route path="/partner/dashboard" element={<PartnerDashboard />} />
        <Route path="/bank" element={<BankComponent />} />
        <Route path="/bank/register" element={<BankRegisterComponent />} />
        <Route path="/bank/dashboard" element={<BankDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
