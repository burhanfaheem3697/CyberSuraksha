import React, { useState, useEffect } from 'react';

const UserDashboard = ({ user }) => {
  const [section, setSection] = useState('home');
  const [loanForm, setLoanForm] = useState({ purpose: '', partnerId: '' });
  const [loanLoading, setLoanLoading] = useState(false);
  const [loanMsg, setLoanMsg] = useState(null);
  const [loanErr, setLoanErr] = useState(null);
  const [partners, setPartners] = useState([]);

  // Fetch partners for dropdown
  useEffect(() => {
    fetch('http://localhost:5000/partner/list')
      .then(res => res.json())
      .then(data => setPartners(data.partners || []));
  }, []);

  // Consent requests state
  const [consents, setConsents] = useState([]);
  const [consentsLoading, setConsentsLoading] = useState(false);
  const [consentsErr, setConsentsErr] = useState(null);

  // Audit logs state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsErr, setLogsErr] = useState(null);

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
    if (section === 'logs' && user?.id) {
      setLogsLoading(true);
      setLogsErr(null);
      fetch(`http://localhost:5000/audit/user`,{credentials : 'include'})
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
          fetch(`http://localhost:5000/audit/user`,{credentials : 'include'})
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
    let revokeReason = window.prompt('Please provide a reason for revoking this consent (optional):', '');
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
          fetch(`http://localhost:5000/audit/user`,{credentials : 'include'})
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
                  <div><b>Action:</b> {log.action}</div>
                  <div><b>Purpose:</b> {log.purpose}</div>
                  <div><b>Status:</b> {log.status}</div>
                  <div><b>Timestamp:</b> {new Date(log.timestamp).toLocaleString()}</div>
                  <div><b>Partner:</b> {log.partnerId?.name || '-'}</div>
                  <div><b>Virtual ID:</b> {log.virtualUserId || '-'}</div>
                </li>
              ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', marginTop: 40 }}>
      <h2>Welcome, {user?.name || 'User'}!</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
        <button onClick={() => setSection('loan')} style={{ padding: '16px 24px', fontSize: 16 }}>Apply for Loan</button>
        <button onClick={() => setSection('consents')} style={{ padding: '16px 24px', fontSize: 16 }}>View Consent Requests</button>
        <button onClick={() => setSection('logs')} style={{ padding: '16px 24px', fontSize: 16 }}>View Logs</button>
      </div>
      {renderSection()}
    </div>
  );
};

export default UserDashboard; 