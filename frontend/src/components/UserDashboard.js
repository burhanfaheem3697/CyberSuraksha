import React, { useState, useEffect } from 'react';
import './UserDashboard.css';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [section, setSection] = useState('home');
  const [loanForm, setLoanForm] = useState({ purpose: '', partnerId: '' });
  const [loanLoading, setLoanLoading] = useState(false);
  const [loanMsg, setLoanMsg] = useState(null);
  const [loanErr, setLoanErr] = useState(null);
  const [partners, setPartners] = useState([]);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [resendMsg, setResendMsg] = useState(null);
  const [resendError, setResendError] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordToken, setChangePasswordToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changePasswordMsg, setChangePasswordMsg] = useState(null);
  const [changePasswordError, setChangePasswordError] = useState(null);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch('http://localhost:5000/user/profile', {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.data);
          setIsAuthenticated(true);
        } else {
          // Redirect to login if not authenticated
          window.location.href = '/user';
        }
      } catch (err) {
        // Redirect to login if network error
        window.location.href = '/user';
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Fetch partners for dropdown
  useEffect(() => {
    if (isAuthenticated) {
      fetch('http://localhost:5000/partner/list')
        .then(res => res.json())
        .then(data => setPartners(data.partners || []));
    }
  }, [isAuthenticated]);

  // Consent requests state
  const [consents, setConsents] = useState([]);
  const [consentsLoading, setConsentsLoading] = useState(false);
  const [consentsErr, setConsentsErr] = useState(null);

  // Audit logs state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsErr, setLogsErr] = useState(null);

  const [insuranceForm, setInsuranceForm] = useState({ insuranceType: '', coverageAmount: '', tenureYears: '', purpose: '', partnerId: '' });
  const [insuranceLoading, setInsuranceLoading] = useState(false);
  const [insuranceMsg, setInsuranceMsg] = useState(null);
  const [insuranceErr, setInsuranceErr] = useState(null);

  const [budgetingForm, setBudgetingForm] = useState({ categories: [{ name: '', plannedAmount: '' }], totalPlannedAmount: '', duration: '', purpose: '', partnerId: '', notes: '' });
  const [budgetingLoading, setBudgetingLoading] = useState(false);
  const [budgetingMsg, setBudgetingMsg] = useState(null);
  const [budgetingErr, setBudgetingErr] = useState(null);

  useEffect(() => {
    if (section === 'consents') {
      setConsentsLoading(true);
      setConsentsErr(null);
      fetch('http://localhost:5000/consent/view-consents',{
        credentials : 'include'
      })
        .then(res => res.json())
        .then(data => {
          setConsents(data.consents || []);
          setConsentsLoading(false);
        })
        .catch(() => {
          setConsentsErr('Failed to fetch consent requests');
          setConsentsLoading(false);
        });
    }
    if (section === 'logs' && user?._id) {
      setLogsLoading(true);
      setLogsErr(null);
      fetch(`http://localhost:5000/userauditlog/my`,{credentials : 'include'})
        .then(res => res.json())
        .then(data => {
          setLogs(data.logs || []);
          setLogsLoading(false);
        })
        .catch(() => {
          setLogsErr('Failed to fetch audit logs');
          setLogsLoading(false);
        });
    }
    if (section === 'profile') {
      setProfileLoading(true);
      setProfileError(null);
      fetch('http://localhost:5000/user/profile', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          setProfile(data.data || null);
          setProfileLoading(false);
        })
        .catch(() => {
          setProfileError('Failed to fetch profile');
          setProfileLoading(false);
        });
    }
  }, [section, user]);

  const handleLoanChange = (e) => {
    setLoanForm({ ...loanForm, [e.target.name]: e.target.value });
  };

  const handleLoanSubmit = async (e) => {
    console.log('handleLoanSubmit called');
    e.preventDefault();
    setLoanLoading(true);
    setLoanMsg(null);
    setLoanErr(null);
    console.log('Loan form state before fetch:', loanForm);
    try {
      const fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose: loanForm.purpose, partnerId: loanForm.partnerId, userId: user?.id }),
        credentials: 'include'
      };
      console.log('Fetch options:', fetchOptions);
      const res = await fetch('http://localhost:5000/loan/loan-request', fetchOptions);
      console.log('Fetch response:', res);
      const data = await res.json();
      console.log('Response data:', data);
      if (res.ok) {
        setLoanMsg('Loan request submitted successfully!');
        setLoanForm({ purpose: '', partnerId: '' });
        console.log('Loan request success');
      } else {
        setLoanErr(data.message || 'Failed to submit loan request');
        console.log('Loan request error:', data.message || 'Failed to submit loan request');
      }
    } catch (err) {
      setLoanErr('Network error');
      console.log('Network error:', err);
    }
    setLoanLoading(false);
    console.log('Loan loading set to false');
  };

  // Approve consent handler
  const handleApproveConsent = async (consentId) => {
    try {
      const res = await fetch(`http://localhost:5000/consent/approve/${consentId}`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setConsents((prev) => prev.map(c => c._id === consentId ? { ...c, status: 'APPROVED' } : c));
        // Optionally refresh logs
        if (section === 'logs' && user?.id) {
          fetch(`http://localhost:5000/userauditlog/my`,{credentials : 'include'})
            .then(res => res.json())
            .then(data => setLogs(data.logs || []));
        }
      } else {
        alert(data.message || 'Failed to approve consent');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  // Revoke consent handler
  const handleRevokeConsent = async (consentId) => {
    let revokeReason = '';
    while (!revokeReason) {
      revokeReason = window.prompt('Please provide a reason for revoking this consent (required):', '');
      if (revokeReason === null) return; // User cancelled
      if (!revokeReason.trim()) revokeReason = '';
    }
    try {
      const res = await fetch(`http://localhost:5000/consent/revoke/${consentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ revokeReason }),
      });
      const data = await res.json();
      if (res.ok) {
        setConsents((prev) => prev.map(c => c._id === consentId ? { ...c, status: 'REVOKED', revokeReason } : c));
        // Optionally refresh logs
        if (section === 'logs' && user?.id) {
          fetch(`http://localhost:5000/userauditlog/my`,{credentials : 'include'})
            .then(res => res.json())
            .then(data => setLogs(data.logs || []));
        }
      } else {
        alert(data.message || 'Failed to revoke consent');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleInsuranceChange = (e) => {
    setInsuranceForm({ ...insuranceForm, [e.target.name]: e.target.value });
  };

  const handleInsuranceSubmit = async (e) => {
    e.preventDefault();
    setInsuranceLoading(true);
    setInsuranceMsg(null);
    setInsuranceErr(null);
    try {
      const fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insuranceType: insuranceForm.insuranceType,
          coverageAmount: Number(insuranceForm.coverageAmount),
          tenureYears: Number(insuranceForm.tenureYears),
          purpose: insuranceForm.purpose,
          partnerId: insuranceForm.partnerId,
          userId: user?.id
        }),
        credentials: 'include'
      };
      const res = await fetch('http://localhost:5000/insurance/insurance-request', fetchOptions);
      const data = await res.json();
      if (res.ok) {
        setInsuranceMsg('Insurance request submitted successfully!');
        setInsuranceForm({ insuranceType: '', coverageAmount: '', tenureYears: '', purpose: '', partnerId: '' });
      } else {
        setInsuranceErr(data.message || 'Failed to submit insurance request');
      }
    } catch (err) {
      setInsuranceErr('Network error');
    }
    setInsuranceLoading(false);
  };

  const handleBudgetingChange = (e) => {
    setBudgetingForm({ ...budgetingForm, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (idx, field, value) => {
    const newCategories = budgetingForm.categories.map((cat, i) => i === idx ? { ...cat, [field]: value } : cat);
    setBudgetingForm({ ...budgetingForm, categories: newCategories });
  };

  const handleAddCategory = () => {
    setBudgetingForm({ ...budgetingForm, categories: [...budgetingForm.categories, { name: '', plannedAmount: '' }] });
  };

  const handleRemoveCategory = (idx) => {
    setBudgetingForm({ ...budgetingForm, categories: budgetingForm.categories.filter((_, i) => i !== idx) });
  };

  const handleBudgetingSubmit = async (e) => {
    e.preventDefault();
    setBudgetingLoading(true);
    setBudgetingMsg(null);
    setBudgetingErr(null);
    try {
      const totalPlannedAmount = budgetingForm.categories.reduce((sum, cat) => sum + Number(cat.plannedAmount || 0), 0);
      const fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: budgetingForm.categories,
          totalPlannedAmount,
          duration: budgetingForm.duration,
          purpose: budgetingForm.purpose,
          partnerId: budgetingForm.partnerId,
          notes: budgetingForm.notes,
          userId: user?.id
        }),
        credentials: 'include'
      };
      const res = await fetch('http://localhost:5000/budgeting/budgeting-request', fetchOptions);
      const data = await res.json();
      if (res.ok) {
        setBudgetingMsg('Budgeting request submitted successfully!');
        setBudgetingForm({ categories: [{ name: '', plannedAmount: '' }], totalPlannedAmount: '', duration: '', purpose: '', partnerId: '', notes: '' });
      } else {
        setBudgetingErr(data.message || 'Failed to submit budgeting request');
      }
    } catch (err) {
      setBudgetingErr('Network error');
    }
    setBudgetingLoading(false);
  };

  const handleResendVerification = async () => {
    setResendMsg(null);
    setResendError(null);
    try {
      const res = await fetch('http://localhost:5000/user/resendEmail', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setResendMsg('Verification email sent! Check your inbox.');
      } else {
        setResendError(data.message || 'Failed to resend verification email');
      }
    } catch (err) {
      setResendError('Network error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePasswordMsg(null);
    setChangePasswordError(null);
    try {
      const res = await fetch(`http://localhost:5000/user/changeCurrentPassword/${changePasswordToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setChangePasswordMsg('Password changed successfully!');
        setChangePasswordToken('');
        setNewPassword('');
      } else {
        setChangePasswordError(data.message || 'Failed to change password');
      }
    } catch (err) {
      setChangePasswordError('Network error');
    }
  };

  const handleLogout = () => {
    // Call logout endpoint to clear server-side session
    fetch('http://localhost:5000/user/logout', {
      credentials: 'include'
    }).finally(() => {
      // Redirect to user login page
      window.location.href = '/user';
    });
  };

  const renderSection = () => {
    switch (section) {
      case 'loan':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>Apply for Loan</h3>
            <form onSubmit={handleLoanSubmit} style={{ display: 'flex', flexDirection: 'column', width: 350, gap: 14 }}>
              <input
                name="purpose"
                placeholder="Purpose"
                value={loanForm.purpose}
                onChange={handleLoanChange}
                required
                style={{ padding: 10, fontSize: 16 }}
              />
              <select
                name="partnerId"
                value={loanForm.partnerId}
                onChange={handleLoanChange}
                required
                style={{ padding: 10, fontSize: 16 }}
              >
                <option value="">Select a Partner</option>
                {partners.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
              <button type="submit" disabled={loanLoading} style={{ padding: '10px 0', fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>
                {loanLoading ? 'Submitting...' : 'Submit Loan Request'}
              </button>
            </form>
            {loanMsg && <div style={{ color: 'green', marginTop: 16 }}>{loanMsg}</div>}
            {loanErr && <div style={{ color: 'red', marginTop: 16 }}>{loanErr}</div>}
          </div>
        );
      case 'insurance':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>Apply for Insurance</h3>
            <form onSubmit={handleInsuranceSubmit} style={{ display: 'flex', flexDirection: 'column', width: 350, gap: 14 }}>
              <select
                name="insuranceType"
                value={insuranceForm.insuranceType}
                onChange={handleInsuranceChange}
                required
                style={{ padding: 10, fontSize: 16 }}
              >
                <option value="">Select Insurance Type</option>
                <option value="HEALTH">Health</option>
                <option value="LIFE">Life</option>
                <option value="CAR">Car</option>
                <option value="TRAVEL">Travel</option>
                <option value="HOME">Home</option>
              </select>
              <input
                name="coverageAmount"
                type="number"
                placeholder="Coverage Amount"
                value={insuranceForm.coverageAmount}
                onChange={handleInsuranceChange}
                required
                style={{ padding: 10, fontSize: 16 }}
              />
              <input
                name="tenureYears"
                type="number"
                placeholder="Tenure (years)"
                value={insuranceForm.tenureYears}
                onChange={handleInsuranceChange}
                required
                style={{ padding: 10, fontSize: 16 }}
              />
              <input
                name="purpose"
                placeholder="Purpose"
                value={insuranceForm.purpose}
                onChange={handleInsuranceChange}
                required
                style={{ padding: 10, fontSize: 16 }}
              />
              <select
                name="partnerId"
                value={insuranceForm.partnerId}
                onChange={handleInsuranceChange}
                required
                style={{ padding: 10, fontSize: 16 }}
              >
                <option value="">Select a Partner</option>
                {partners.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
              <button type="submit" disabled={insuranceLoading} style={{ padding: '10px 0', fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>
                {insuranceLoading ? 'Submitting...' : 'Submit Insurance Request'}
              </button>
            </form>
            {insuranceMsg && <div style={{ color: 'green', marginTop: 16 }}>{insuranceMsg}</div>}
            {insuranceErr && <div style={{ color: 'red', marginTop: 16 }}>{insuranceErr}</div>}
          </div>
        );
      case 'budgeting':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>Budgeting</h3>
            <form onSubmit={handleBudgetingSubmit} style={{ display: 'flex', flexDirection: 'column', width: 350, gap: 14 }}>
              {budgetingForm.categories.map((cat, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    name={`category-name-${idx}`}
                    placeholder="Category Name"
                    value={cat.name}
                    onChange={e => handleCategoryChange(idx, 'name', e.target.value)}
                    required
                    style={{ padding: 10, fontSize: 16, flex: 1 }}
                  />
                  <input
                    name={`category-amount-${idx}`}
                    type="number"
                    placeholder="Planned Amount"
                    value={cat.plannedAmount}
                    onChange={e => handleCategoryChange(idx, 'plannedAmount', e.target.value)}
                    required
                    style={{ padding: 10, fontSize: 16, width: 120 }}
                  />
                  {budgetingForm.categories.length > 1 && (
                    <button type="button" onClick={() => handleRemoveCategory(idx)} style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px' }}>Remove</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={handleAddCategory} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 0', marginBottom: 8 }}>Add Category</button>
              <select
                name="duration"
                value={budgetingForm.duration}
                onChange={handleBudgetingChange}
                required
                style={{ padding: 10, fontSize: 16 }}
              >
                <option value="">Select Duration</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
              <input
                name="purpose"
                placeholder="Purpose"
                value={budgetingForm.purpose}
                onChange={handleBudgetingChange}
                required
                style={{ padding: 10, fontSize: 16 }}
              />
              <select
                name="partnerId"
                value={budgetingForm.partnerId}
                onChange={handleBudgetingChange}
                required
                style={{ padding: 10, fontSize: 16 }}
              >
                <option value="">Select a Partner</option>
                {partners.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
              <textarea
                name="notes"
                placeholder="Notes (optional)"
                value={budgetingForm.notes}
                onChange={handleBudgetingChange}
                style={{ padding: 10, fontSize: 16, minHeight: 60 }}
              />
              <button type="submit" disabled={budgetingLoading} style={{ padding: '10px 0', fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>
                {budgetingLoading ? 'Submitting...' : 'Submit Budgeting Request'}
              </button>
            </form>
            {budgetingMsg && <div style={{ color: 'green', marginTop: 16 }}>{budgetingMsg}</div>}
            {budgetingErr && <div style={{ color: 'red', marginTop: 16 }}>{budgetingErr}</div>}
          </div>
        );
      case 'consents':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>Consent Requests</h3>
            {consentsLoading && <div>Loading...</div>}
            {consentsErr && <div style={{ color: 'red' }}>{consentsErr}</div>}
            {!consentsLoading && !consentsErr && consents.length === 0 && <div>No consent requests found.</div>}
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {consents.map((c) => (
                <li key={c._id} style={{ border: '1px solid #ddd', borderRadius: 6, margin: '12px 0', padding: 16 }}>
                  <div><b>Purpose:</b> {c.purpose}</div>
                  <div><b>Partner:</b> {c.partnerId?.name || c.partnerId}</div>
                  <div><b>Status:</b> {c.status}</div>
                  <div><b>Required Data Fields:</b> {Array.isArray(c.dataFields) ? c.dataFields.join(', ') : '-'}</div>
                  <div><b>Duration:</b> {c.duration} days</div>
                  {c.status === 'PENDING' && (
                    <button style={{ marginTop: 8, background: '#43a047', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 4 }} onClick={() => handleApproveConsent(c._id)}>
                      Approve
                    </button>
                  )}
                  {c.status === 'APPROVED' && (
                    <button style={{ marginTop: 8, background: '#d32f2f', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 4 }} onClick={() => handleRevokeConsent(c._id)}>
                      Revoke
                    </button>
                  )}
                  {c.status === 'REVOKED' && (
                    <button style={{ marginTop: 8, background: '#43a047', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 4 }} onClick={() => handleApproveConsent(c._id)}>
                      Approve
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      case 'logs':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>View Logs</h3>
            {logsLoading && <div>Loading...</div>}
            {logsErr && <div style={{ color: 'red' }}>{logsErr}</div>}
            {!logsLoading && !logsErr && logs.length === 0 && <div>No logs found.</div>}
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {logs.map((log) => (
                <li key={log._id} style={{ border: '1px solid #ddd', borderRadius: 6, margin: '12px 0', padding: 16 }}>
                  <div><b>Virtual ID:</b> {log.virtualUserId || '-'}</div>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <div><b>Details:</b> <pre style={{ margin: 0 }}>{JSON.stringify(log.details, null, 2)}</pre></div>
                  )}
                  {log.context && Object.keys(log.context).length > 0 && (
                    <div><b>Context:</b> <pre style={{ margin: 0 }}>{JSON.stringify(log.context, null, 2)}</pre></div>
                  )}
                  <div><b>Action:</b> {log.action}</div>
                  <div><b>Status:</b> {log.status}</div>
                  <div><b>Timestamp:</b> {new Date(log.timestamp).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'profile':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>Profile</h3>
            {profileLoading && <div>Loading...</div>}
            {profileError && <div style={{ color: 'red' }}>{profileError}</div>}
            {profile && (
              <div className="dashboard-profile-box">
                <div><b>Username:</b> {profile.username}</div>
                <div><b>Full Name:</b> {profile.fullname}</div>
                <div><b>Email:</b> {profile.email}</div>
                <div><b>Email Verified:</b> {profile.isEmailVerified ? 'Yes' : 'No'}</div>
                <div><b>Phone:</b> {profile.phone || '-'}</div>
                <div><b>Aadhaar:</b> {profile.aadhaar || '-'}</div>
                <div><b>Data Residency:</b> {profile.dataResidency || '-'}</div>
                {profile.avatar && <div style={{ marginTop: 12 }}><img src={profile.avatar} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%' }} /></div>}
                {!profile.isEmailVerified && (
                  <div style={{ marginTop: 16 }}>
                    <button onClick={handleResendVerification} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px' }}>Resend Verification Email</button>
                    {resendMsg && <div style={{ color: 'green', marginTop: 8 }}>{resendMsg}</div>}
                    {resendError && <div style={{ color: 'red', marginTop: 8 }}>{resendError}</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case 'changePassword':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>Change Password</h3>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', width: 350, gap: 14 }}>
              <input
                type="text"
                placeholder="Enter token from email link"
                value={changePasswordToken}
                onChange={e => setChangePasswordToken(e.target.value)}
                required
                style={{ padding: 10, fontSize: 16 }}
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                style={{ padding: 10, fontSize: 16 }}
              />
              <button type="submit" style={{ padding: '10px 0', fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>Change Password</button>
            </form>
            {changePasswordMsg && <div style={{ color: 'green', marginTop: 16 }}>{changePasswordMsg}</div>}
            {changePasswordError && <div style={{ color: 'red', marginTop: 16 }}>{changePasswordError}</div>}
            <div style={{ marginTop: 12, color: '#555', fontSize: 14 }}>
              To change your password, use the token you received in your password reset email.
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="dashboard-bg">
      <nav className="dashboard-navbar">
        <div className="dashboard-logo">CyberSuraksha</div>
        <div>
          <button className="dashboard-link" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div className="dashboard-avatar">
            <i className="fa-solid fa-user"></i>
          </div>
          <div className="dashboard-title">Welcome, {user?.fullname || user?.username || 'User'}!</div>
          <div className="dashboard-email">{user?.email}</div>
        </div>
        <div className="dashboard-menu">
          <button className={`dashboard-menu-btn${section === 'home' ? ' active' : ''}`} onClick={() => setSection('home')}>Home</button>
          <button className={`dashboard-menu-btn${section === 'loan' ? ' active' : ''}`} onClick={() => setSection('loan')}>Loan</button>
          <button className={`dashboard-menu-btn${section === 'insurance' ? ' active' : ''}`} onClick={() => setSection('insurance')}>Insurance</button>
          <button className={`dashboard-menu-btn${section === 'budgeting' ? ' active' : ''}`} onClick={() => setSection('budgeting')}>Budgeting</button>
          <button className={`dashboard-menu-btn${section === 'consents' ? ' active' : ''}`} onClick={() => setSection('consents')}>Consents</button>
          <button className={`dashboard-menu-btn${section === 'logs' ? ' active' : ''}`} onClick={() => setSection('logs')}>Logs</button>
          <button className={`dashboard-menu-btn${section === 'profile' ? ' active' : ''}`} onClick={() => setSection('profile')}>Profile</button>
          <button className={`dashboard-menu-btn${section === 'changePassword' ? ' active' : ''}`} onClick={() => setSection('changePassword')}>Change Password</button>
        </div>
        <div className="dashboard-section">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 