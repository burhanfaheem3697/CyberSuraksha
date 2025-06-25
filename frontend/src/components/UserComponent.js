import React, { useState } from 'react';
import RegisterComponent from './RegisterComponent';
import UserDashboard from './UserDashboard';

const UserComponent = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch('http://localhost:5000/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setLoggedIn(true);
      } else {
        setLoginError(data.message || 'Login failed');
      }
    } catch (err) {
      setLoginError('Network error');
    }
  };

  if (showRegister) {
    return <RegisterComponent onBack={() => setShowRegister(false)} />;
  }

  if (loggedIn) {
    return <UserDashboard user={user} />;
  }

  return (
    <div>
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <div style={{ fontWeight: 'bold', fontSize: 24 }}>CyberSuraksha</div>
        <div>
          <button style={{ marginRight: 16, padding: '8px 18px' }} onClick={() => setShowRegister(true)}>Register</button>
          <button style={{ padding: '8px 18px' }} onClick={() => window.location.reload()}>Back to Home</button>
        </div>
      </nav>

      {/* Hero Section with Login Form */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10vh' }}>
        <h2>User Login</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: 300, gap: 16 }}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ padding: 10, fontSize: 16 }}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ padding: 10, fontSize: 16 }}
          />
          <button type="submit" style={{ padding: '10px 0', fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>Login</button>
        </form>
        {loginError && <div style={{ color: 'red', marginTop: 16 }}>{loginError}</div>}
      </div>
    </div>
  );
};

export default UserComponent; 