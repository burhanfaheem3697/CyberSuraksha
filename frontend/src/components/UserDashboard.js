import React, { useState, useEffect } from 'react';
import './UserDashboard.css';
import BlockchainVerification from './BlockchainVerification';
import BlockchainModal from './BlockchainModal';
import DataRoomView from './DataRoomView';
import Fuse from 'fuse.js';

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
  
  // Blockchain modal state
  const [showBlockchainModal, setShowBlockchainModal] = useState(false);
  const [blockchainTxData, setBlockchainTxData] = useState(null);

  // Add state to track verification results for each consent
  const [verificationResults, setVerificationResults] = useState({});

  // User contracts state
  const [userContracts, setUserContracts] = useState([]);
  const [userContractsLoading, setUserContractsLoading] = useState(false);
  const [userContractsErr, setUserContractsErr] = useState(null);
  const [openDataRoomContractId, setOpenDataRoomContractId] = useState(null);

  // Filter/search state for contracts
  const [filterPurpose, setFilterPurpose] = useState('');
  const [filterPartner, setFilterPartner] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Helper to get unique partners from contracts
  const uniquePartners = Array.from(new Set(userContracts.map(c => typeof c.partnerId === 'object' ? c.partnerId?.name || c.partnerId?._id : c.partnerId)));
  const statusOptions = Array.from(new Set(userContracts.map(c => c.status)));

  // Fuzzy search setup for contracts (purpose and partner)
  const fuse = new Fuse(userContracts, {
    keys: [
      { name: 'purpose', weight: 0.6 },
      { name: 'partnerId.name', weight: 0.4 },
      { name: 'partnerId', weight: 0.3 }, // fallback if partnerId is not populated
    ],
    threshold: 0.4, // adjust for fuzziness
    ignoreLocation: true,
  });

  let fuzzyContracts = userContracts;
  if (filterPurpose || filterPartner) {
    // Build a search pattern
    let searchPattern = '';
    if (filterPurpose) searchPattern += filterPurpose + ' ';
    if (filterPartner) searchPattern += filterPartner;
    fuzzyContracts = fuse.search(searchPattern.trim()).map(result => result.item);
  }

  // Filtered contracts (apply status/date filters after fuzzy search)
  const filteredContracts = fuzzyContracts.filter(contract => {
    // Status filter
    if (filterStatus && contract.status !== filterStatus) return false;
    // Date filter
    if (filterDateFrom && new Date(contract.createdAt) < new Date(filterDateFrom)) return false;
    if (filterDateTo && new Date(contract.createdAt) > new Date(filterDateTo)) return false;
    return true;
  });

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
    if (section === 'dataRoom' && user?._id) {
      setUserContractsLoading(true);
      setUserContractsErr(null);
      fetch('http://localhost:5000/contract/user', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          setUserContracts(data.contracts || []);
          setUserContractsLoading(false);
        })
        .catch(() => {
          setUserContractsErr('Failed to fetch contracts');
          setUserContractsLoading(false);
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
      // Set a loading state for this consent
      setConsents((prev) => prev.map(c => c._id === consentId ? { ...c, loading: true } : c));
      
      const res = await fetch(`http://localhost:5000/consent/approve/${consentId}`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        // Update the consent with blockchain info
        setConsents((prev) => prev.map(c => c._id === consentId ? { 
          ...c, 
          status: 'APPROVED',
          loading: false,
          txHash: data.blockchain?.txHash,
          blockchain: data.blockchain
        } : c));
        
        // Show blockchain modal if we have blockchain data
        if (data.blockchain) {
          const txStatus = data.blockchain.txHash ? 
            (data.blockchain.txHash.startsWith('blockchain-') ? 'error' : 'confirmed') : 
            'pending';
          
          setBlockchainTxData({
            ...data.blockchain,
            status: txStatus
          });
          setShowBlockchainModal(true);
        } else {
          // Fallback to simple alert if no blockchain data
          alert('Consent approved!');
        }
        
        // Optionally refresh logs
        if (section === 'logs' && user?.id) {
          fetch(`http://localhost:5000/userauditlog/my`,{credentials : 'include'})
            .then(res => res.json())
            .then(data => setLogs(data.logs || []));
        }
      } else {
        alert(data.message || 'Failed to approve consent');
        // Reset loading state
        setConsents((prev) => prev.map(c => c._id === consentId ? { ...c, loading: false } : c));
      }
    } catch (err) {
      alert('Network error');
      // Reset loading state
      setConsents((prev) => prev.map(c => c._id === consentId ? { ...c, loading: false } : c));
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
                  
                  {/* Blockchain transaction info (legacy) */}
                  {c.txHash && !c.txHash.startsWith('blockchain-') && (
                    <div className="blockchain-info" style={{ 
                      marginTop: 8, 
                      padding: 8, 
                      backgroundColor: '#f3f6ff', 
                      borderRadius: 4, 
                      border: '1px solidrgb(142, 13, 13)' 
                    }}>
                      <div style={{ fontSize: 12, wordBreak: 'break-all', color: '#d32f2f' }}><b>🔗 Blockchain Verification:</b></div>
                      <div style={{ fontSize: 12, wordBreak: 'break-all', color: '#d32f2f' }}>
                        TX: {c.txHash.substring(0, 18)}...
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <a 
                          href={c.blockchain?.explorerUrl || `https://www.oklink.com/amoy/tx/${c.txHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#2962ff', 
                            textDecoration: 'none', 
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 13
                          }}
                        >
                          <span>View on Blockchain Explorer</span>
                          <span style={{ fontSize: 10 }}>↗</span>
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* Verifiable Data Hash Proof */}
                  {c.blockchain?.documentHash && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <b>Data Hash:</b>
                      <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{c.blockchain.documentHash}</span>
                      {/* Visual check/cross */}
                      {verificationResults[c._id] === true && (
                        <span title="Verified on-chain" style={{ color: 'green', fontSize: 18 }}>✔️</span>
                      )}
                      {verificationResults[c._id] === false && (
                        <span title="Not found on-chain" style={{ color: 'red', fontSize: 18 }}>❌</span>
                      )}
                    </div>
                  )}
                  {c.blockchain?.documentTxHash && (
                    <div style={{ marginTop: 4 }}>
                      <a
                        href={c.blockchain.documentExplorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#1976d2', textDecoration: 'none', fontSize: 13 }}
                      >
                        View Data Hash on Blockchain Explorer ↗
                      </a>
                    </div>
                  )}
                  {c.blockchain?.documentHash && (
                    <button
                      style={{ marginTop: 6, fontSize: 12, padding: '4px 10px' }}
                      onClick={async () => {
                        const res = await fetch('http://localhost:5000/consent/verify-hash', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ data: {
                            virtualUserId: c.virtualUserId,
                            partnerId: c.partnerId?._id || c.partnerId,
                            purpose: c.purpose,
                            dataFields: c.dataFields,
                            duration: c.duration,
                            dataResidency: c.dataResidency,
                            crossBorder: c.crossBorder,
                            quantumSafe: c.quantumSafe,
                            anonymization: c.anonymization,
                            approvedAt: c.approvedAt,
                          } }),
                        });
                        const result = await res.json();
                        setVerificationResults(prev => ({ ...prev, [c._id]: !!result.verified }));
                        // Optionally, show an alert as well
                        // alert(result.verified ? '✅ Data is verifiable on-chain!' : '❌ Data not found on-chain!');
                      }}
                    >
                      Verify Data on Blockchain
                    </button>
                  )}
                  
                  {/* Transaction error message */}
                  {c.txHash && c.txHash.startsWith('blockchain-') && (
                    <div style={{ marginTop: 8, padding: 8, backgroundColor: '#fff9f9', borderRadius: 4, border: '1px solid #ffcdd2' }}>
                      <div style={{ color: '#d32f2f', fontSize: 13 }}>
                        ⚠️ Consent recorded in database, but blockchain verification unavailable
                      </div>
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  {c.status === 'PENDING' && (
                    <button 
                      style={{ 
                        marginTop: 8, 
                        background: '#43a047', 
                        color: '#fff', 
                        border: 'none', 
                        padding: '8px 18px', 
                        borderRadius: 4,
                        cursor: c.loading ? 'wait' : 'pointer',
                        opacity: c.loading ? 0.7 : 1
                      }} 
                      onClick={() => handleApproveConsent(c._id)}
                      disabled={c.loading}
                    >
                      {c.loading ? 'Processing...' : 'Approve'}
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
      case 'blockchain':
        return <BlockchainVerification />;
      case 'dataRoom':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>My Data Room Contracts</h3>
            {/* Filter/Search UI */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontWeight: 'bold' }}>Purpose<br/>
                  <input type="text" value={filterPurpose} onChange={e => setFilterPurpose(e.target.value)} placeholder="Search purpose..." style={{ padding: 6, width: 140 }} />
                </label>
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>Partner<br/>
                  <select value={filterPartner} onChange={e => setFilterPartner(e.target.value)} style={{ padding: 6, width: 140 }}>
                    <option value="">All</option>
                    {uniquePartners.map((p, idx) => <option key={idx} value={p}>{p}</option>)}
                  </select>
                </label>
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>Status<br/>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: 6, width: 120 }}>
                    <option value="">All</option>
                    {statusOptions.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                  </select>
                </label>
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>From<br/>
                  <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} style={{ padding: 6 }} />
                </label>
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>To<br/>
                  <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} style={{ padding: 6 }} />
                </label>
              </div>
              <button onClick={() => { setFilterPurpose(''); setFilterPartner(''); setFilterStatus(''); setFilterDateFrom(''); setFilterDateTo(''); }} style={{ padding: '8px 16px', background: '#eee', border: '1px solid #ccc', borderRadius: 4, fontWeight: 'bold', marginLeft: 8 }}>Clear Filters</button>
            </div>
            {userContractsLoading && <div>Loading...</div>}
            {userContractsErr && <div style={{ color: 'red' }}>{userContractsErr}</div>}
            {!userContractsLoading && !userContractsErr && filteredContracts.length === 0 && <div>No contracts found.</div>}
            {openDataRoomContractId ? (
              <DataRoomView 
                contractId={openDataRoomContractId} 
                onClose={() => setOpenDataRoomContractId(null)} 
                role="user"
              />
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {filteredContracts.map((contract) => (
                  <li key={contract._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, color: '#1976d2' }}>Contract {contract._id.slice(-8)}</h4>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        background: contract.status === 'ACTIVE' ? '#43a047' : '#fbc02d',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {contract.status}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div><strong>Bank:</strong> {typeof contract.bankId === 'object' ? contract.bankId?.name || contract.bankId?._id : contract.bankId}</div>
                      <div><strong>Virtual User ID:</strong> {typeof contract.virtualUserId === 'object' ? contract.virtualUserId?._id : contract.virtualUserId}</div>
                      <div><strong>Purpose:</strong> {contract.purpose}</div>
                      <div><strong>Created:</strong> {new Date(contract.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <strong>Allowed Fields:</strong>
                      <div style={{ 
                        marginTop: '8px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px'
                      }}>
                        {contract.allowedFields && contract.allowedFields.map((field, idx) => (
                          <span key={idx} style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            background: '#e3f2fd',
                            color: '#1976d2',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => setOpenDataRoomContractId(contract._id)}
                      style={{ 
                        background: '#1976d2', 
                        color: '#fff', 
                        border: 'none', 
                        padding: '12px 24px', 
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = '#1565c0';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = '#1976d2';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      🔒 Open Secure Data Room
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
          <button className={`dashboard-menu-btn${section === 'blockchain' ? ' active' : ''}`} onClick={() => setSection('blockchain')}>Blockchain Verification</button>
          <button className={`dashboard-menu-btn${section === 'dataRoom' ? ' active' : ''}`} onClick={() => setSection('dataRoom')}>View My Data Room</button>
        </div>
        <div className="dashboard-section">
          {renderSection()}
        </div>
      </div>
      
      {/* Blockchain Transaction Modal */}
      {showBlockchainModal && (
        <BlockchainModal 
          txData={blockchainTxData} 
          onClose={() => setShowBlockchainModal(false)}
        />
      )}
    </div>
  );
};

export default UserDashboard; 