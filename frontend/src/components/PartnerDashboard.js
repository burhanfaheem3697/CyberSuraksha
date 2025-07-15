import React, { useState, useEffect } from 'react';
import './UserDashboard.css';
import DataRoomView from './DataRoomView';
import {
  Box,
  Container,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { AddIcon, ViewIcon } from '@chakra-ui/icons';
import ConsentDraftForm from '../components/ConsentDraftForm';
import ConsentDraftList from '../components/ConsentDraftList';
const PartnerDashboard = () => {
  //  const [partner, setPartner] = useState(null);
  // const [isLoading, setIsLoading] = useState(true);
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [section, setSection] = useState('home'); 
  const [uploadedModels, setUploadedModels] = useState([]);
  const [uploadingModel, setUploadingModel] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [executionResult, setExecutionResult] = useState(null);
  const [modelName, setModelName] = useState('');               // 
  const [allowedPurposes, setAllowedPurposes] = useState('');   // 

  const [modelFile, setModelFile] = useState(null);
  const [modelType, setModelType] = useState('detection');

  const [partnerContracts, setPartnerContracts] = useState([]);
  const [partnerContractsLoading, setPartnerContractsLoading] = useState(false);
  const [partnerContractsErr, setPartnerContractsErr] = useState(null);

  const [partner, setPartner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [section, setSection] = useState('home'); 
  const [consentForm, setConsentForm] = useState({
    virtualUserId: '',
    rawPurpose: '',
    dataFields: '',
    duration: '',
    jurisdiction: '',
    dataResidency: '',
    crossBorder: false,
    quantumSafe: false,
    anonymization: false,
  });
  const [consentLoading, setConsentLoading] = useState(false);
  const [consentMsg, setConsentMsg] = useState(null);
  const [consentErr, setConsentErr] = useState(null);
  const [consentBlockchain, setConsentBlockchain] = useState(null);

  const [virtualUserId, setVirtualUserId] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const toast = useToast();

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
  // const [partnerContracts, setPartnerContracts] = useState([]);
  // const [partnerContractsLoading, setPartnerContractsLoading] = useState(false);
  // const [partnerContractsErr, setPartnerContractsErr] = useState(null);

  // Data room state
  const [openDataRoomContractId, setOpenDataRoomContractId] = useState(null);

  // Add state to track verification results for each consent
  const [verificationResults, setVerificationResults] = useState({});

  // In a real application, you would fetch the virtual user ID from a dropdown or search
  // For this example, we'll use a hardcoded value
  const handleSetVirtualUserId = () => {
    // This would typically come from a form or selection
    setVirtualUserId('60f1a5c5e6b3f32d8c9e4b7a'); // Example ID
    toast({
      title: 'Virtual User Selected',
      description: 'You can now create consent drafts for this user.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Function to handle creating a draft from any request type (loan, insurance, budgeting)
  const handleCreateDraftFromRequest = (virtualId) => {
    setVirtualUserId(virtualId);
    setSection('consentDrafts');
    setTabIndex(0); // Switch to the Create Draft tab
    toast({
      title: 'Virtual User Selected',
      description: 'You can now create consent drafts for this user.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleConsentCreated = () => {
    // Switch to the list tab after creating a consent
    setTabIndex(1);
    toast({
      title: 'Success',
      description: 'Consent has been created successfully.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  // Check authentication status on component mount
  // Fetch partner's uploaded models
  const fetchUploadedModels = async () => {
    try {
      const response = await fetch('http://localhost:5000/model/list', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUploadedModels(data.models || []);
        }
      } else {
        console.error('Failed to fetch models:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };




  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // For partners, we'll check if they have a valid session
        // You might need to create a /partner/profile endpoint or use a different approach
        const res = await fetch('http://localhost:5000/partner/list', {
          credentials: 'include'
        });
        if (res.ok) {
          // For now, we'll assume the partner is authenticated if they can access partner endpoints
          // You should implement proper partner authentication checking
          setIsAuthenticated(true);
          // Set a dummy partner object for now - you should fetch actual partner data
          const partnerData = await res.json();
          setPartner(partnerData);
          
          // If we're on the model execution section, fetch the models
          if (section === 'modelExec') {
            fetchUploadedModels();
          }
        } else {
          // Redirect to login if not authenticated
          window.location.href = '/partner';
        }
      } catch (err) {
        // Redirect to login if network error
        window.location.href = '/partner';
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (section === 'loans') {
      setLoansLoading(true);
      setLoansErr(null);
      fetch('http://localhost:5000/loan/view-loan-requests', {
        credentials: 'include'
      })
        .then(res => {
          if (!res.ok) {
            return res.text().then(text => { throw new Error(`HTTP ${res.status}: ${text}`); });
          }
          return res.json();
        })
        .then(data => {
          setLoans(data.loanRequests || []);
          setLoansLoading(false);
        })
        .catch((err) => {
          setLoansErr('Failed to fetch loan requests');
          setLoansLoading(false);
          console.error('Loan requests fetch error:', err);
        });
    }
    if (section === 'approved') {
      setApprovedLoading(true);
      setApprovedErr(null);
      fetch('http://localhost:5000/consent/consents-approved',{credentials : 'include'})
        .then(res => {
          if (!res.ok) {
            return res.text().then(text => { throw new Error(`HTTP ${res.status}: ${text}`); });
          }
          return res.json();
        })
        .then(data => {
          setApprovedConsents(data.consents || []);
          setApprovedLoading(false);
        })
        .catch((err) => {
          setApprovedErr('Failed to fetch approved consents');
          setApprovedLoading(false);
          console.error('Approved consents fetch error:', err);
        });
    }
    if (section === 'logs') {
      setLogsLoading(true);
      setLogsErr(null);
      fetch(`http://localhost:5000/partnerauditlog/my`, { credentials: 'include' })
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

  // Fetch uploaded models when model execution section is active
  useEffect(() => {
    if (section === 'modelExec') {
      const fetchUploadedModels = async () => {
        try {
          const res = await fetch('http://localhost:5000/model/list', {
            credentials: 'include'
          });
          const data = await res.json();
          if (res.ok) {
            setUploadedModels(data.models || []);
          }
        } catch (err) {
          console.error('Failed to fetch uploaded models:', err);
        }
      };
      fetchUploadedModels();
    }
  }, [section]);

  const handleConsentChange = (e) => {
    setConsentForm({ ...consentForm, [e.target.name]: e.target.value });
  };

  const handleModelUpload = async (e) => {
    e.preventDefault();
    if (!modelFile || !modelName || !allowedPurposes) return;
    setUploadingModel(true);
    const formData = new FormData();
    formData.append('modelFile', modelFile);
    formData.append('modelName', modelName);
    
    // turn the comma-sep string into an array on the backend
    const purposesArray = allowedPurposes
    .split(',')
    .map(s => s.trim())
    .filter(s => s);
  formData.append('allowedPurposes', JSON.stringify(purposesArray));  
  
    try {
      const res = await fetch('http://localhost:5000/model/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setUploadedModels(prev => [...prev, data.model]);
      alert('Model uploaded successfully!');
    } catch (err) {
      console.error('Model upload error:', err);
      alert(err.message);
    } finally {
      setUploadingModel(false);
    }
  };

  const handleRunModel = async () => {
    if (!selectedContractId || !selectedModelId) {
      alert('Please select both a contract and a model');
      return;
    }
    
    setExecutionResult(null);
    try {
      const res = await fetch(`http://localhost:5000/execution/${selectedContractId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ modelId: selectedModelId })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to execute model');
      }
      
      const data = await res.json();
      setExecutionResult(data);
    } catch (err) {
      console.error('Execution error:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleConsentSubmit = async (e) => {
    e.preventDefault();
    setConsentLoading(true);
    setConsentMsg(null);
    setConsentErr(null);
    setConsentBlockchain(null);
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
        // Format success message with blockchain info if available
        let successMsg = 'Consent request created successfully!';
        
        if (data.blockchain) {
          if (data.blockchain.status === 'confirmed') {
            successMsg += ' Recorded on blockchain.';
            
            // Add blockchain explorer link if available
            if (data.blockchain.explorerUrl) {
              const txHash = data.blockchain.txHash;
              const shortTxHash = txHash.length > 10 ? 
                `${txHash.substring(0, 6)}...${txHash.substring(txHash.length - 4)}` : 
                txHash;
                
              successMsg += ` TX: ${shortTxHash}`;
            }
          } else if (data.blockchain.status === 'error') {
            successMsg += ' (Blockchain recording failed but request is saved in the system)';
          }
        }
        
        setConsentMsg(successMsg);
        setConsentBlockchain(data.blockchain);
        
        // Reset form
        setConsentForm({
          virtualUserId: '',
          rawPurpose: '',
          dataFields: '',
          duration: '',
          jurisdiction: '',
          dataResidency: '',
          crossBorder: false,
          quantumSafe: false,
          anonymization: false,
        });
      } else {
        setConsentErr(data.message || 'Failed to create consent request');
      }
    } catch (err) {
      console.error("Error submitting consent request:", err);
      setConsentErr('Network error: ' + (err.message || 'Failed to connect to server'));
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
          fetch(`http://localhost:5000/partnerauditlog/my`, { credentials: 'include' })
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
          fetch(`http://localhost:5000/partnerauditlog/my`, { credentials: 'include' })
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
          fetch(`http://localhost:5000/partnerauditlog/my`, { credentials: 'include' })
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

  const handleLogout = () => {
    // Call logout endpoint to clear server-side session
    fetch('http://localhost:5000/partner/logout', {
      credentials: 'include',
    })
      .then(() => {
        // Clear partnerToken and userToken cookies
        document.cookie = 'partnerToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'userToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        // Redirect to login page
        window.location.href = '/partner';
      })
      .catch(() => {
        // Still clear cookies and redirect even if fetch fails
        document.cookie = 'partnerToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'userToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = '/partner';
      });
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
              <textarea
                name="rawPurpose"
                placeholder="Describe the purpose of this consent"
                value={consentForm.rawPurpose}
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
              
              <select
                name="dataResidency"
                value={consentForm.dataResidency}
                onChange={handleConsentChange}
                style={{ padding: 10, fontSize: 16 }}
              >
                <option value="">Select Data Residency</option>
                <option value="IN">IN</option>
                <option value="EU">EU</option>
                <option value="US">US</option>
                <option value="ANY">ANY</option>
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  name="crossBorder"
                  checked={consentForm.crossBorder}
                  onChange={e => setConsentForm(f => ({ ...f, crossBorder: e.target.checked }))}
                />
                Cross-border Transfer
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  name="quantumSafe"
                  checked={consentForm.quantumSafe}
                  onChange={e => setConsentForm(f => ({ ...f, quantumSafe: e.target.checked }))}
                />
                Quantum-safe Required
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  name="anonymization"
                  checked={consentForm.anonymization}
                  onChange={e => setConsentForm(f => ({ ...f, anonymization: e.target.checked }))}
                />
                Anonymization Required
              </label>
              <button type="submit" disabled={consentLoading} style={{ padding: '10px 0', fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>
                {consentLoading ? 'Submitting...' : 'Create Consent Request'}
              </button>
            {consentLoading && <div style={{ marginTop: 16 }}>Processing...</div>}
            {consentMsg && (
              <div style={{ 
                marginTop: 16, 
                padding: '12px', 
                backgroundColor: '#e8f5e9', 
                color: '#2e7d32',
                borderRadius: '4px'
              }}>
                <div><strong> Success:</strong> {consentMsg}</div>
                
                {/* If we have blockchain data from the response */}
                {consentBlockchain && consentBlockchain.txHash && !consentBlockchain.txHash.startsWith('blockchain-') && (
                  <div style={{ marginTop: 8 }}>
                    <a 
                      href={consentBlockchain.explorerUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        color: '#1976d2',
                        textDecoration: 'none',
                        display: 'inline-block',
                        marginTop: '8px',
                        fontSize: '14px'
                      }}
                    >
                      View on blockchain explorer →
                    </a>
                  </div>
                )}
              </div>
            )}
            {consentErr && (
              <div style={{ 
                marginTop: 16, 
                padding: '12px', 
                backgroundColor: '#ffebee', 
                color: '#c62828',
                borderRadius: '4px' 
              }}>
                <strong> Error:</strong> {consentErr}
              </div>
            )}
            </form>
          </div>
        );
      case 'consentDrafts':
      return (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ color: '#00bfff', fontSize: '1.3rem', marginBottom: 18, fontWeight: 700 }}>
            Consent Draft Management
          </h3>
          <p style={{ color: '#a0a0a0', marginBottom: 24 }}>
            Create, validate, and manage consent drafts for your users
          </p>

          {!virtualUserId ? (
            <div
              style={{
                background: 'rgba(30, 32, 60, 0.6)',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #23234a',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <span style={{ color: '#00bfff', fontWeight: 600 }}>ℹ Select a Virtual User</span>
              <span style={{ color: '#eaf6ff' }}>
                You need to select a virtual user before creating consent drafts.
              </span>
              <button
                style={{
                  marginLeft: 'auto',
                  background: 'linear-gradient(135deg, #1976d2 0%, #00bfff 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,191,255,0.18)',
                }}
                onClick={handleSetVirtualUserId}
              >
                Select User
              </button>
            </div>
          ) : (
            <Tabs
              variant="enclosed"
              index={tabIndex}
              onChange={(index) => setTabIndex(index)}
              mb={5}
            >
              <TabList mb="1em">
                <Tab>
                  <AddIcon mr={2} /> Create Draft
                </Tab>
                <Tab>
                  <ViewIcon mr={2} /> View Drafts
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel p={0}>
                  <ConsentDraftForm
                    virtualUserId={virtualUserId}
                    onSuccess={handleConsentCreated}
                  />
                </TabPanel>
                <TabPanel p={0}>
                  <ConsentDraftList virtualUserId={virtualUserId} />
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}

          <div
            style={{
              marginTop: 32,
              background: 'rgba(30, 32, 60, 0.6)',
              padding: 24,
              borderRadius: 12,
              border: '1px solid #23234a',
            }}
          >
            <h4 style={{ color: '#00bfff', margin: '0 0 12px 0' }}>About Consent Drafts</h4>
            <p style={{ color: '#eaf6ff', marginBottom: 8 }}>
              Consent drafts allow partners to create and validate consent requests before sending them to
              users. The validation process ensures compliance with India's DPDP Act and other privacy
              regulations.
            </p>
            <p style={{ color: '#eaf6ff' }}>
              The workflow includes purpose classification, field normalization, rule validation, and
              LLM-based justification validation. Only validated drafts can be finalized and sent to users for
              approval.
            </p>
          </div>
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
                    <div style={{ display: 'flex', gap: '10px', marginTop: 8, alignItems: 'center' }}>
                      <span style={{ color: '#43a047', fontWeight: 'bold' }}>Approved</span>
                      <button 
                        style={{ 
                          background: '#1976d2', 
                          color: '#fff', 
                          border: 'none', 
                          padding: '8px 18px', 
                          borderRadius: 4,
                          cursor: 'pointer'
                        }} 
                        onClick={() => handleCreateDraftFromRequest(loan.virtualId)}
                      >
                        Create Draft
                      </button>
                    </div>
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
                  {/* Blockchain Proof for Data Hash */}
                  {consent.blockchain?.documentHash && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <b>Data Hash:</b>
                      <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{consent.blockchain.documentHash}</span>
                      {/* Visual check/cross with tooltips */}
                      {verificationResults[consent._id] === true && (
                        <span
                          title="This data hash is verifiable on-chain. The data has been registered and proven on the blockchain."
                          style={{ color: 'green', fontSize: 18, cursor: 'help' }}
                        >✔️</span>
                      )}
                      {verificationResults[consent._id] === false && (
                        <span
                          title="This data hash is NOT found on-chain. The data is not registered or does not match the blockchain record."
                          style={{ color: 'red', fontSize: 18, cursor: 'help' }}
                        >❌</span>
                      )}
                    </div>
                  )}
                  {consent.blockchain?.documentTxHash && (
                    <div style={{ marginTop: 4 }}>
                      <a
                        href={consent.blockchain.documentExplorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#1976d2', textDecoration: 'none', fontSize: 13 }}
                      >
                        View Data Hash on Blockchain Explorer ↗
                      </a>
                    </div>
                  )}
                  {consent.blockchain?.documentHash && (
                    <button
                      style={{ marginTop: 6, fontSize: 12, padding: '4px 10px' }}
                      onClick={async () => {
                        const res = await fetch('http://localhost:5000/consent/verify-hash', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ data: {
                            virtualUserId: consent.virtualUserId,
                            partnerId: consent.partnerId?._id || consent.partnerId,
                            purpose: consent.purpose,
                            dataFields: consent.dataFields,
                            duration: consent.duration,
                            dataResidency: consent.dataResidency,
                            crossBorder: consent.crossBorder,
                            quantumSafe: consent.quantumSafe,
                            anonymization: consent.anonymization,
                            approvedAt: consent.approvedAt,
                          } }),
                        });
                        const result = await res.json();
                        setVerificationResults(prev => ({ ...prev, [consent._id]: !!result.verified }));
                      }}
                    >
                      Verify Data on Blockchain
                    </button>
                  )}
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
              <div style={{ display: 'flex', gap: '10px', marginTop: 8, alignItems: 'center' }}>
                <span style={{ color: '#43a047', fontWeight: 'bold' }}>Approved</span>
                <button 
                  style={{ 
                    background: '#1976d2', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '8px 18px', 
                    borderRadius: 4,
                    cursor: 'pointer'
                  }} 
                  onClick={() => handleCreateDraftFromRequest(req.virtualId)}
                >
                  Create Draft
                </button>
              </div>
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
              <div style={{ display: 'flex', gap: '10px', marginTop: 8, alignItems: 'center' }}>
                <span style={{ color: '#43a047', fontWeight: 'bold' }}>Approved</span>
                <button 
                  style={{ 
                    background: '#1976d2', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '8px 18px', 
                    borderRadius: 4,
                    cursor: 'pointer'
                  }} 
                  onClick={() => handleCreateDraftFromRequest(req.virtualId)}
                >
                  Create Draft
                </button>
              </div>
            )}
                  {req.status === 'APPROVED' && (
              <div style={{ display: 'flex', gap: '10px', marginTop: 8, alignItems: 'center' }}>
                <span style={{ color: '#43a047', fontWeight: 'bold' }}>Approved</span>
                <button 
                  style={{ 
                    background: '#1976d2', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '8px 18px', 
                    borderRadius: 4,
                    cursor: 'pointer'
                  }} 
                  onClick={() => handleCreateDraftFromRequest(req.virtualId)}
                >
                  Create Draft
                </button>
              </div>
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
                  <div><b>Virtual User ID:</b> {log.virtualUserId || (log.details && log.details.virtualUserId) || '-'}</div>
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
      case 'partnerContracts':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>My Contracts</h3>
            {partnerContractsLoading && <div>Loading...</div>}
            {partnerContractsErr && <div style={{ color: 'red' }}>{partnerContractsErr}</div>}
            {!partnerContractsLoading && !partnerContractsErr && partnerContracts.length === 0 && <div>No contracts found.</div>}
            {openDataRoomContractId ? (
            <DataRoomView 
              contractId={openDataRoomContractId} 
              onClose={() => setOpenDataRoomContractId(null)} 
              role="partner"
            />
            ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {partnerContracts.map((contract) => (
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
      case 'modelUpload':
          return (
            <div style={{ marginTop: 32 }}>
              <h3>Upload Model</h3>
              <form onSubmit={handleModelUpload} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 400 }}>
                {/* Model Name */}
                <input
                  type="text"
                  placeholder="Model name (e.g. LoanScorerV1)"
                  value={modelName}
                  onChange={e => setModelName(e.target.value)}
                  required
                  style={{ padding: 8, fontSize: 14 }}
                />
        
                {/* Allowed Purposes */}
                <input
                  type="text"
                  placeholder="Allowed purposes (comma separated)"
                  value={allowedPurposes}
                  onChange={e => setAllowedPurposes(e.target.value)}
                  required
                  style={{ padding: 8, fontSize: 14 }}
                />
        
                {/* File picker */}
                <input
                  type="file"
                  accept=".onnx,.pkl,.js"
                  onChange={e => setModelFile(e.target.files[0])}
                  required
                />
        
                <button
                  type="submit"
                  disabled={uploadingModel}
                  style={{ padding: '10px 0', fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}
                >
                  {uploadingModel ? 'Uploading…' : 'Upload Model'}
                </button>
              </form>
            </div>
          );        
      case 'modelExec':
        return (
          <div style={{ 
            maxWidth: '800px', 
            margin: '32px auto', 
            padding: '24px', 
            backgroundColor: '#fff', 
            borderRadius: '8px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginBottom: '24px', color: 'black' }}>Run Model on Contract</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'black' }}>Select Contract</label>
              <select 
                value={selectedContractId} 
                onChange={e => setSelectedContractId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  marginBottom: '16px',
                  color: 'black'
                }}
              >
                <option value=''>-- Select a contract --</option>
                {partnerContracts.map(c => (
                  <option key={c._id} value={c._id}>
                    Contract {c._id.slice(-8)} - {c.purpose || 'No description'}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: '24px', color: 'black' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'black' }}>Select Model</label>
              <select 
                value={selectedModelId} 
                onChange={e => setSelectedModelId(e.target.value)}
                disabled={uploadedModels.length === 0}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  marginBottom: '16px',
                  color: 'black',
                  backgroundColor: uploadedModels.length === 0 ? '#f5f5f5' : '#fff'
                }}
              >
                <option value=''>
                  {uploadedModels.length === 0 ? 'No models available. Upload a model first.' : '-- Select a model --'}
                </option>
                {uploadedModels.map(model => (
                  <option key={model._id} value={model._id}>
                    {model.modelName || `Model ${model._id.slice(-6)}`} ({model.modelFormat || 'unknown'})
                  </option>
                ))}
              </select>
              
              {uploadedModels.length === 0 && (
                <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
                  You haven't uploaded any models yet. Go to "Upload Model" to add a new model.
                </p>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleRunModel}
                disabled={!selectedContractId || !selectedModelId || uploadedModels.length === 0}
                style={{
                  padding: '10px 24px',
                  backgroundColor: (!selectedContractId || !selectedModelId || uploadedModels.length === 0) ? '#ccc' : '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (!selectedContractId || !selectedModelId || uploadedModels.length === 0) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s',
                  ':hover': {
                    backgroundColor: (!selectedContractId || !selectedModelId || uploadedModels.length === 0) ? '#ccc' : '#1565c0'
                  }
                }}
              >
                Run Model
              </button>
            </div>
            
            {executionResult && (
              <div style={{ 
                marginTop: '32px', 
                padding: '16px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '4px',
                borderLeft: '4px solid #1976d2'
              }}>
                <h4 style={{ marginTop: 0, color: '#1976d2' }}>Execution Results</h4>
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-word',
                  margin: 0,
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  maxHeight: '400px',
                  overflow: 'auto',
                  padding: '12px',
                  backgroundColor: '#fff',
                  border: '1px solid #eee',
                  borderRadius: '4px'
                }}>
                  {JSON.stringify(executionResult, null, 2)}
                </pre>
              </div>
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
            <i className="fa-solid fa-handshake"></i>
          </div>
          <div className="dashboard-title">Welcome, {partner?.name || 'Partner'}!</div>
        </div>
        <div className="dashboard-menu">
          <button className={`dashboard-menu-btn${section === 'consent' ? ' active' : ''}`} onClick={() => setSection('consent')}>Generate Consent Request</button>
          <button className={`dashboard-menu-btn${section === 'consentDrafts' ? ' active' : ''}`} onClick={() => setSection('consentDrafts')}>Consent Drafts</button>
          <button className={`dashboard-menu-btn${section === 'loans' ? ' active' : ''}`} onClick={() => setSection('loans')}>View Loan Requests</button>
          <button className={`dashboard-menu-btn${section === 'insurance' ? ' active' : ''}`} onClick={() => setSection('insurance')}>View Insurance Requests</button>
          <button className={`dashboard-menu-btn${section === 'budgeting' ? ' active' : ''}`} onClick={() => setSection('budgeting')}>View Budget Requests</button>
          <button className={`dashboard-menu-btn${section === 'approved' ? ' active' : ''}`} onClick={() => setSection('approved')}>View Approved Consents</button>
          <button className={`dashboard-menu-btn${section === 'logs' ? ' active' : ''}`} onClick={() => setSection('logs')}>View Logs</button>
          <button className={`dashboard-menu-btn${section === 'partnerContracts' ? ' active' : ''}`} onClick={() => setSection('partnerContracts')}>View My Contracts</button>
          <button className={`dashboard-menu-btn${section === 'modelUpload' ? ' active' : ''}`} onClick={() => setSection('modelUpload')}>Upload Model</button>
          <button className={`dashboard-menu-btn${section === 'modelExec' ? ' active' : ''}`} onClick={() => setSection('modelExec')}>Run Model</button>
          <button className="dashboard-menu-btn" onClick={handleLogout}>Logout</button>
        </div>
        </div>
        <div className="dashboard-section">``
          {renderSection()}
        </div>
      </div>
  );
};

export default PartnerDashboard;