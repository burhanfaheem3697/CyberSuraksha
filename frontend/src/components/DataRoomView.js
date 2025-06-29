import React, { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Adjust as needed

const DataRoomView = ({ contractId, onClose }) => {
  const [data, setData] = useState(null);
  const [consent, setConsent] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [copiedFields, setCopiedFields] = useState(new Set());

  // Function to log interactions
  const logInteraction = useCallback(async (action, details) => {
    try {
      await fetch(`http://localhost:5000/partner/log-interaction/${contractId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ action, details })
      });
    } catch (err) {
      console.error('Failed to log interaction:', err);
    }
  }, [contractId]);

  // Log when component mounts (data room entry)
  useEffect(() => {
    if (contractId) {
      logInteraction('ENTERED_DATA_ROOM', {
        description: 'Partner entered the data room',
        timestamp: new Date().toISOString()
      });
    }
  }, [contractId, logInteraction]);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/partner/data-room/${contractId}`, {
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) {
          return res.text().then(text => { throw new Error(`HTTP ${res.status}: ${text}`); });
        }
        return res.json();
      })
      .then(res => {
        if (res.error) throw new Error(res.error);
        setData(res.data);
        setConsent(res.consent);
        setContract(res.contract);
        setLoading(false);
        
        // Log data viewing
        logInteraction('VIEWED_DATA', {
          description: 'Partner viewed the data room contents',
          dataFields: Object.keys(res.data || {}),
          timestamp: new Date().toISOString()
        });
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
        console.error('DataRoomView fetch error:', err);
      });
  }, [contractId, logInteraction]);

  useEffect(() => {
    socket.emit('join_contract_room', contractId);
    socket.on('consent_revoked', (msg) => {
      if (msg.contractId === contractId && onClose) {
        alert('Consent has been revoked. Data room will be closed.');
        onClose();
      }
    });
    socket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err);
    });
    return () => {
      socket.emit('leave_contract_room', contractId);
      socket.off('consent_revoked');
      socket.off('connect_error');
    };
  }, [contractId, onClose]);

  const fetchLogs = () => {
    fetch(`http://localhost:5000/partner/interaction-logs/${contractId}`, {
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) {
          return res.text().then(text => { throw new Error(`HTTP ${res.status}: ${text}`); });
        }
        return res.json();
      })
      .then(res => setLogs(res.logs || []))
      .catch((err) => {
        setLogs([]);
        console.error('DataRoomView logs fetch error:', err);
      });
  };

  // Handle field copying
  const copyField = (fieldName, fieldValue) => {
    navigator.clipboard.writeText(fieldValue).then(() => {
      setCopiedFields(prev => new Set([...prev, fieldName]));
      logInteraction('COPIED_FIELD', {
        description: `Copied field: ${fieldName}`,
        fieldName,
        fieldValue: typeof fieldValue === 'string' ? fieldValue.substring(0, 10) + '...' : String(fieldValue).substring(0, 10) + '...',
        timestamp: new Date().toISOString()
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedFields(prev => {
          const newSet = new Set(prev);
          newSet.delete(fieldName);
          return newSet;
        });
      }, 2000);
    });
  };

  // Handle data room close
  const handleClose = () => {
    logInteraction('CLOSED_DATA_ROOM', {
      description: 'Partner closed the data room',
      sessionDuration: Date.now() - (window.dataRoomEntryTime || Date.now()),
      timestamp: new Date().toISOString()
    });
    onClose();
  };

  // Set entry time when component mounts
  useEffect(() => {
    window.dataRoomEntryTime = Date.now();
  }, []);

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '50vh',
      fontSize: '18px',
      color: '#666'
    }}>
      🔒 Loading secure data room...
    </div>
  );
  
  if (error) return (
    <div style={{ 
      color: 'red', 
      textAlign: 'center', 
      padding: '40px',
      fontSize: '16px'
    }}>
      ❌ Error: {error}
    </div>
  );

  const consentStatus = consent
    ? consent.revoked
      ? 'REVOKED'
      : consent.expiresIn !== null && consent.expiresIn < 0
        ? 'EXPIRED'
        : 'ACTIVE'
    : 'UNKNOWN';

  const getConsentStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return '#43a047';
      case 'EXPIRED': return '#fbc02d';
      case 'REVOKED': return '#e53935';
      default: return '#757575';
    }
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      padding: '20px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      overflow: 'auto'
    }}>
      {/* Secure Data Room Header */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '2px solid #e0e0e0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ margin: 0, color: '#1976d2', fontSize: '28px' }}>
            🔒 Secure Data Room
          </h1>
          <button 
            onClick={handleClose}
            style={{
              background: '#e53935',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🚪 Close Room
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{
            padding: '8px 16px',
            borderRadius: '20px',
            background: getConsentStatusColor(consentStatus),
          color: '#fff',
          fontWeight: 'bold',
            fontSize: '14px'
        }}>
          Consent: {consentStatus}
        </span>
          <span style={{
            padding: '8px 16px',
            borderRadius: '20px',
            background: '#1976d2',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            Contract: {contractId}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Contract Metadata Panel */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '2px solid #e0e0e0'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ margin: 0, color: '#1976d2', fontSize: '22px' }}>
              📋 Contract Information
            </h2>
          </div>
          
          {contract && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <strong>Bank:</strong>
                <span>{typeof contract.bankId === 'object' ? contract.bankId?.name || contract.bankId?._id : contract.bankId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <strong>Virtual User ID:</strong>
                <span>{typeof contract.virtualUserId === 'object' ? contract.virtualUserId?._id : contract.virtualUserId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <strong>Purpose:</strong>
                <span style={{ maxWidth: '200px', textAlign: 'right' }}>{contract.purpose}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <strong>Status:</strong>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  background: contract.status === 'ACTIVE' ? '#43a047' : '#fbc02d',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {contract.status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <strong>Created:</strong>
                <span>{new Date(contract.createdAt).toLocaleString()}</span>
              </div>
              <div style={{ padding: '8px 0' }}>
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
              {contract.documents && (
                <div style={{ padding: '8px 0' }}>
                  <strong>Documents:</strong>
                  <pre style={{ 
                    margin: '8px 0 0 0',
                    background: '#f8f8f8',
                    borderRadius: '4px',
                    padding: '8px',
                    fontSize: '12px',
                    overflow: 'auto',
                    maxHeight: '100px'
                  }}>
                    {JSON.stringify(contract.documents, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          {!contract && (
            <div style={{ 
              textAlign: 'center',
              color: '#6c757d',
              padding: '20px',
              fontSize: '16px'
            }}>
              📋 Contract information not available
            </div>
          )}
        </div>

        {/* Sandboxed Data Panel */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '2px solid #e0e0e0'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ margin: 0, color: '#1976d2', fontSize: '22px' }}>
              🔐 Sandboxed Data
            </h2>
          </div>
          
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px',
            border: '2px solid #e9ecef',
            minHeight: '200px'
          }}>
            {data && Object.keys(data).length > 0 ? (
              <div>
                {Object.entries(data).map(([key, value]) => (
                  <div key={key} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '8px 0',
                    borderBottom: '1px solid #dee2e6'
                  }}>
                    <strong style={{ color: '#495057', minWidth: '120px' }}>{key}:</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      {typeof value === 'object' && value !== null ? (
                        <pre style={{ 
                          margin: 0,
                          color: '#6c757d',
                          background: '#f8f9fa',
                          padding: '8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          width: '100%',
                          overflow: 'auto'
                        }}>
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        <span style={{ color: '#6c757d', flex: 1 }}>{String(value)}</span>
                      )}
                      <button
                        onClick={() => copyField(key, typeof value === 'object' ? JSON.stringify(value, null, 2) : value)}
                        style={{
                          background: copiedFields.has(key) ? '#28a745' : '#007bff',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '10px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {copiedFields.has(key) ? '✅ Copied' : '📋 Copy'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center',
                color: '#6c757d',
                fontSize: '16px',
                padding: '40px 20px'
              }}>
                📭 No data available in sandbox
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Access Logs Section */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginTop: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '2px solid #e0e0e0',
        maxWidth: '1400px',
        margin: '20px auto 0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, color: '#1976d2', fontSize: '22px' }}>
            📊 Access Logs
          </h2>
          <button 
            onClick={() => { setShowLogs(!showLogs); if (!showLogs) fetchLogs(); }}
            style={{
              background: showLogs ? '#6c757d' : '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {showLogs ? '👁️ Hide Logs' : '👁️ View Logs'}
      </button>
        </div>
        
      {showLogs && (
          <div>
            <h4 style={{ margin: '0 0 16px 0', color: '#495057' }}>Recent Activity Logs (Last 20)</h4>
            {logs.length === 0 ? (
              <div style={{ 
                textAlign: 'center',
                color: '#6c757d',
                padding: '20px',
                fontSize: '16px'
              }}>
                📝 No activity logs found
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {logs.map((log, idx) => (
                  <div key={idx} style={{
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '16px',
                    background: '#f8f9fa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ color: '#495057' }}>Action:</strong>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        background: getActionColor(log.action),
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {log.action}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ color: '#495057' }}>Timestamp:</strong>
                      <span style={{ color: '#6c757d' }}>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    {log.context && log.context.details && (
                      <div style={{ marginTop: '12px' }}>
                        <strong style={{ color: '#495057' }}>Details:</strong>
                        <pre style={{
                          margin: '8px 0 0 0',
                          background: '#fff',
                          borderRadius: '4px',
                          padding: '8px',
                          fontSize: '12px',
                          border: '1px solid #dee2e6',
                          maxHeight: '100px',
                          overflow: 'auto'
                        }}>
                          {JSON.stringify(log.context.details, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.dataSnapshot && (
                      <div style={{ marginTop: '12px' }}>
                        <strong style={{ color: '#495057' }}>Data Viewed:</strong>
                        <pre style={{
                          margin: '8px 0 0 0',
                          background: '#fff',
                          borderRadius: '4px',
                          padding: '8px',
                          fontSize: '12px',
                          border: '1px solid #dee2e6',
                          maxHeight: '100px',
                          overflow: 'auto'
                        }}>
                          {JSON.stringify(log.dataSnapshot, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
            ))}
              </div>
            )}
        </div>
      )}
      </div>
    </div>
  );
};

// Helper function to get action colors
const getActionColor = (action) => {
  switch (action) {
    case 'ENTERED_DATA_ROOM': return '#28a745';
    case 'VIEWED_DATA': return '#007bff';
    case 'COPIED_FIELD': return '#ffc107';
    case 'TOGGLED_SECTION': return '#17a2b8';
    case 'CLOSED_DATA_ROOM': return '#dc3545';
    default: return '#6c757d';
  }
};

export default DataRoomView; 