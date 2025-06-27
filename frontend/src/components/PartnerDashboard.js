import React, { useState, useEffect } from 'react';

const PartnerDashboard = ({ partner }) => {
  const [section, setSection] = useState('home');
  const [consentForm, setConsentForm] = useState({
    virtualUserId: '',
    purpose: '',
    dataFields: '',
    duration: '',
  });
  const [consentLoading, setConsentLoading] = useState(false);
  const [consentMsg, setConsentMsg] = useState(null);
  const [consentErr, setConsentErr] = useState(null);

  // Loan requests state
  const [loans, setLoans] = useState([]);
  const [loansLoading, setLoansLoading] = useState(false);
  const [loansErr, setLoansErr] = useState(null);

  // Approved consents state
  const [approvedConsents, setApprovedConsents] = useState([]);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [approvedErr, setApprovedErr] = useState(null);

  // Logs state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsErr, setLogsErr] = useState(null);

  // Insurance requests state
  const [insuranceRequests, setInsuranceRequests] = useState([]);
  const [insuranceLoading, setInsuranceLoading] = useState(false);
  const [insuranceErr, setInsuranceErr] = useState(null);

  // Budget requests state
  const [budgetRequests, setBudgetRequests] = useState([]);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetErr, setBudgetErr] = useState(null);

  // Partner contracts state
  const [partnerContracts, setPartnerContracts] = useState([]);
  const [partnerContractsLoading, setPartnerContractsLoading] = useState(false);
  const [partnerContractsErr, setPartnerContractsErr] = useState(null);

  useEffect(() => {
    if (section === 'loans') {
      setLoansLoading(true);
      setLoansErr(null);
      fetch('http://localhost:5000/loan/view-loan-requests', {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          setLoans(data.loanRequests || []);
          setLoansLoading(false);
        })
        .catch(() => {
          setLoansErr('Failed to fetch loan requests');
          setLoansLoading(false);
        });
    }
    if (section === 'approved') {
      setApprovedLoading(true);
      setApprovedErr(null);
      fetch('http://localhost:5000/consent/consents-approved',{credentials : 'include'})
        .then(res => res.json())
        .then(data => {
          setApprovedConsents(data.consents || []);
          setApprovedLoading(false);
        })
        .catch(() => {
          setApprovedErr('Failed to fetch approved consents');
          setApprovedLoading(false);
        });
    }
    if (section === 'logs' && partner?.id) {
      setLogsLoading(true);
      setLogsErr(null);
      fetch(`http://localhost:5000/audit/partner`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          setLogs(data.logs || []);
          setLogsLoading(false);
        })
        .catch(() => {
          setLogsErr('Failed to fetch logs');
          setLogsLoading(false);
        });
    }
    if (section === 'insurance') {
      setInsuranceLoading(true);
      setInsuranceErr(null);
      fetch('http://localhost:5000/insurance/view-insurance-requests', {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          setInsuranceRequests(data.insuranceRequests || []);
          setInsuranceLoading(false);
        })
        .catch(() => {
          setInsuranceErr('Failed to fetch insurance requests');
          setInsuranceLoading(false);
        });
    }
    if (section === 'budgeting') {
      setBudgetLoading(true);
      setBudgetErr(null);
      fetch('http://localhost:5000/budgeting/view-budgeting-requests', {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          setBudgetRequests(data.budgetingRequests || []);
          setBudgetLoading(false);
        })
        .catch(() => {
          setBudgetErr('Failed to fetch budget requests');
          setBudgetLoading(false);
        });
    }
    if (section === 'partnerContracts') {
      setPartnerContractsLoading(true);
      setPartnerContractsErr(null);
      fetch('http://localhost:5000/contract/partner', {
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          setPartnerContracts(data.contracts || []);
          setPartnerContractsLoading(false);
        })
        .catch(() => {
          setPartnerContractsErr('Failed to fetch contracts');
          setPartnerContractsLoading(false);
        });
    }
  }, [section, partner]);

  const handleConsentChange = (e) => {
    setConsentForm({ ...consentForm, [e.target.name]: e.target.value });
  };

  const handleConsentSubmit = async (e) => {
    e.preventDefault();
    setConsentLoading(true);
    setConsentMsg(null);
    setConsentErr(null);
    try {
      const res = await fetch('http://localhost:5000/consent/create-consent-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...consentForm,
          dataFields: consentForm.dataFields.split(',').map(f => f.trim()),
          duration: Number(consentForm.duration),
        }),
        credentials : 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setConsentMsg('Consent request created successfully!');
        setConsentForm({ virtualUserId: '', purpose: '', dataFields: '', duration: '' });
      } else {
        setConsentErr(data.message || 'Failed to create consent request');
      }
    } catch (err) {
      setConsentErr('Network error');
    }
    setConsentLoading(false);
  };

  // Approve loan handler
  const handleApproveLoan = async (loanRequestId) => {
    try {
      const res = await fetch('http://localhost:5000/loan/approve-loan-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ loanRequestId }),
      });
      const data = await res.json();
      if (res.ok) {
        setLoans((prev) => prev.map(l => l._id === loanRequestId ? { ...l, status: 'APPROVED' } : l));
        // Optionally refresh logs
        if (section === 'logs' && partner?.id) {
          fetch(`http://localhost:5000/audit/partner`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => setLogs(data.logs || []));
        }
      } else {
        alert(data.message || 'Failed to approve loan request');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  // Approve insurance handler
  const handleApproveInsurance = async (insuranceRequestId) => {
    try {
      const res = await fetch('http://localhost:5000/insurance/approve-insurance-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ insuranceRequestId }),
      });
      const data = await res.json();
      if (res.ok) {
        setInsuranceRequests((prev) => prev.map(i => i._id === insuranceRequestId ? { ...i, status: 'APPROVED' } : i));
        // Optionally refresh logs
        if (section === 'logs' && partner?.id) {
          fetch(`http://localhost:5000/audit/partner`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => setLogs(data.logs || []));
        }
      } else {
        alert(data.message || 'Failed to approve insurance request');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  // Approve budget handler
  const handleApproveBudget = async (budgetingRequestId) => {
    try {
      const res = await fetch('http://localhost:5000/budgeting/approve-budgeting-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ budgetingRequestId }),
      });
      const data = await res.json();
      if (res.ok) {
        setBudgetRequests((prev) => prev.map(b => b._id === budgetingRequestId ? { ...b, status: 'APPROVED' } : b));
        // Optionally refresh logs
        if (section === 'logs' && partner?.id) {
          fetch(`http://localhost:5000/audit/partner`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => setLogs(data.logs || []));
        }
      } else {
        alert(data.message || 'Failed to approve budget request');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const renderSection = () => {
    switch (section) {
      case 'consent':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>Generate Consent Request</h3>
            <form onSubmit={handleConsentSubmit} style={{ display: 'flex', flexDirection: 'column', width: 350, gap: 14 }}>
              <input
                name="virtualUserId"
                placeholder="Virtual User ID"
                value={consentForm.virtualUserId}
                onChange={handleConsentChange}
                required
                style={{ padding: 10, fontSize: 16 }}
              />
              <input
                name="purpose"
                placeholder="Purpose"
                value={consentForm.purpose}
                onChange={handleConsentChange}
                required
                style={{ padding: 10, fontSize: 16 }}
              />
              <input
                name="dataFields"
                placeholder="Data Fields (comma separated)"
                value={consentForm.dataFields}
                onChange={handleConsentChange}
                required
                style={{ padding: 10, fontSize: 16 }}
              />
              <input
                name="duration"
                type="number"
                placeholder="Duration (days)"
                value={consentForm.duration}
                onChange={handleConsentChange}
                required
                style={{ padding: 10, fontSize: 16 }}
              />
              <button type="submit" disabled={consentLoading} style={{ padding: '10px 0', fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>
                {consentLoading ? 'Submitting...' : 'Create Consent Request'}
              </button>
            </form>
            {consentMsg && <div style={{ color: 'green', marginTop: 16 }}>{consentMsg}</div>}
            {consentErr && <div style={{ color: 'red', marginTop: 16 }}>{consentErr}</div>}
          </div>
        );
      case 'loans':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>View Loan Requests</h3>
            {loansLoading && <div>Loading...</div>}
            {loansErr && <div style={{ color: 'red' }}>{loansErr}</div>}
            {!loansLoading && !loansErr && loans.length === 0 && <div>No loan requests found.</div>}
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {loans.map((loan) => (
                <li key={loan._id} style={{ border: '1px solid #ddd', borderRadius: 6, margin: '12px 0', padding: 16 }}>
                  <div><b>Virtual ID:</b> {loan.virtualId}</div>
                  <div><b>Purpose:</b> {loan.purpose}</div>
                  <div><b>Status:</b> {loan.status}</div>
                  <div><b>Created At:</b> {new Date(loan.createdAt).toLocaleString()}</div>
                  {loan.status !== 'APPROVED' && (
                    <button style={{ marginTop: 8, background: '#43a047', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 4 }} onClick={() => handleApproveLoan(loan._id)}>
                      Approve
                    </button>
                  )}
                  {loan.status === 'APPROVED' && (
                    <span style={{ marginTop: 8, color: '#43a047', fontWeight: 'bold' }}>Approved</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      case 'approved':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>View Approved Consents</h3>
            {approvedLoading && <div>Loading...</div>}
            {approvedErr && <div style={{ color: 'red' }}>{approvedErr}</div>}
            {!approvedLoading && !approvedErr && approvedConsents.length === 0 && <div>No approved consents found.</div>}
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {approvedConsents.map((consent) => (
                <li key={consent._id} style={{ border: '1px solid #ddd', borderRadius: 6, margin: '12px 0', padding: 16 }}>
                  <div><b>Virtual User ID:</b> {consent.virtualUserId}</div>
                  <div><b>Purpose:</b> {consent.purpose}</div>
                  <div><b>Fields:</b> {consent.dataFields?.join(', ')}</div>
                  <div><b>Status:</b> {consent.status}</div>
                  <div><b>Approved At:</b> {consent.approvedAt ? new Date(consent.approvedAt).toLocaleString() : '-'}</div>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'insurance':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>View Insurance Requests</h3>
            {insuranceLoading && <div>Loading...</div>}
            {insuranceErr && <div style={{ color: 'red' }}>{insuranceErr}</div>}
            {!insuranceLoading && !insuranceErr && insuranceRequests.length === 0 && <div>No insurance requests found.</div>}
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {insuranceRequests.map((req) => (
                <li key={req._id} style={{ border: '1px solid #ddd', borderRadius: 6, margin: '12px 0', padding: 16 }}>
                  <div><b>Virtual ID:</b> {req.virtualId}</div>
                  <div><b>Insurance Type:</b> {req.insuranceType}</div>
                  <div><b>Coverage Amount:</b> {req.coverageAmount}</div>
                  <div><b>Tenure (years):</b> {req.tenureYears}</div>
                  <div><b>Purpose:</b> {req.purpose}</div>
                  <div><b>Status:</b> {req.status}</div>
                  <div><b>Created At:</b> {new Date(req.createdAt).toLocaleString()}</div>
                  {req.status !== 'APPROVED' && (
                    <button style={{ marginTop: 8, background: '#43a047', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 4 }} onClick={() => handleApproveInsurance(req._id)}>
                      Approve
                    </button>
                  )}
                  {req.status === 'APPROVED' && (
                    <span style={{ marginTop: 8, color: '#43a047', fontWeight: 'bold' }}>Approved</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      case 'budgeting':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>View Budget Requests</h3>
            {budgetLoading && <div>Loading...</div>}
            {budgetErr && <div style={{ color: 'red' }}>{budgetErr}</div>}
            {!budgetLoading && !budgetErr && budgetRequests.length === 0 && <div>No budget requests found.</div>}
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {budgetRequests.map((req) => (
                <li key={req._id} style={{ border: '1px solid #ddd', borderRadius: 6, margin: '12px 0', padding: 16 }}>
                  <div><b>Virtual ID:</b> {req.virtualId}</div>
                  <div><b>Purpose:</b> {req.purpose}</div>
                  <div><b>Duration:</b> {req.duration}</div>
                  <div><b>Status:</b> {req.status}</div>
                  <div><b>Created At:</b> {new Date(req.createdAt).toLocaleString()}</div>
                  <div><b>Categories:</b>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {req.categories.map((cat, idx) => (
                        <li key={idx}>{cat.name}: {cat.plannedAmount}</li>
                      ))}
                    </ul>
                  </div>
                  <div><b>Total Planned Amount:</b> {req.totalPlannedAmount}</div>
                  {req.notes && <div><b>Notes:</b> {req.notes}</div>}
                  {req.status !== 'APPROVED' && (
                    <button style={{ marginTop: 8, background: '#43a047', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 4 }} onClick={() => handleApproveBudget(req._id)}>
                      Approve
                    </button>
                  )}
                  {req.status === 'APPROVED' && (
                    <span style={{ marginTop: 8, color: '#43a047', fontWeight: 'bold' }}>Approved</span>
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
                  <div><b>Action:</b> {log.action}</div>
                  <div><b>Purpose:</b> {log.purpose}</div>
                  <div><b>Status:</b> {log.status}</div>
                  <div><b>Timestamp:</b> {new Date(log.timestamp).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'partnerContracts':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>My Contracts</h3>
            {partnerContractsLoading && <div>Loading...</div>}
            {partnerContractsErr && <div style={{ color: 'red' }}>{partnerContractsErr}</div>}
            {!partnerContractsLoading && !partnerContractsErr && partnerContracts.length === 0 && <div>No contracts found.</div>}
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {partnerContracts.map((contract) => (
                <li key={contract._id} style={{ border: '1px solid #ddd', borderRadius: 6, margin: '12px 0', padding: 16 }}>
                  <div><b>Contract ID:</b> {contract._id}</div>
                  <div><b>Bank:</b> {typeof contract.bankId === 'object' ? contract.bankId?.name || contract.bankId?._id || JSON.stringify(contract.bankId) : contract.bankId}</div>
                  <div><b>Virtual User ID:</b> {typeof contract.virtualUserId === 'object' ? contract.virtualUserId?._id || JSON.stringify(contract.virtualUserId) : contract.virtualUserId}</div>
                  <div><b>Purpose:</b> {contract.purpose}</div>
                  <div><b>Status:</b> {contract.status}</div>
                  <div><b>Allowed Fields:</b> {contract.allowedFields && contract.allowedFields.join(', ')}</div>
                  <div><b>Created At:</b> {new Date(contract.createdAt).toLocaleString()}</div>
                  <div><b>Documents:</b> <pre style={{ margin: 0 }}>{JSON.stringify(contract.documents, null, 2)}</pre></div>
                  {contract.data && <div><b>Data:</b> <pre style={{ margin: 0 }}>{JSON.stringify(contract.data, null, 2)}</pre></div>}
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
      <h2>Welcome, {partner?.name || 'Partner'}!</h2>
      <div style={{ color: '#555', marginBottom: 24 }}>{partner?.email}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
        <button onClick={() => setSection('consent')} style={{ padding: '16px 24px', fontSize: 16 }}>Generate Consent Request</button>
        <button onClick={() => setSection('loans')} style={{ padding: '16px 24px', fontSize: 16 }}>View Loan Requests</button>
        <button onClick={() => setSection('insurance')} style={{ padding: '16px 24px', fontSize: 16 }}>View Insurance Requests</button>
        <button onClick={() => setSection('budgeting')} style={{ padding: '16px 24px', fontSize: 16 }}>View Budget Requests</button>
        <button onClick={() => setSection('approved')} style={{ padding: '16px 24px', fontSize: 16 }}>View Approved Consents</button>
        <button onClick={() => setSection('logs')} style={{ padding: '16px 24px', fontSize: 16 }}>View Logs</button>
        <button onClick={() => setSection('partnerContracts')} style={{ padding: '16px 24px', fontSize: 16 }}>View My Contracts</button>
      </div>
      {renderSection()}
    </div>
  );
};

export default PartnerDashboard; 