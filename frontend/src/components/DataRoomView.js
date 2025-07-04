import React, { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import './DataRoomView.css';

const socket = io('http://localhost:5000'); // Adjust as needed

const DataRoomView = ({ contractId, onClose, role = "partner" }) => {
  const [data, setData] = useState(null);
  const [consent, setConsent] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [copiedFields, setCopiedFields] = useState(new Set());
  const [lastAction, setLastAction] = useState(null);

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
      
      // Set the last action timestamp to trigger logs refresh
      setLastAction(Date.now());
    } catch (err) {
      console.error('Failed to log interaction:', err);
    }
  }, [contractId]);

  // Only set up logging and copy/drag prevention for partners
  useEffect(() => {
    if (role !== 'partner') return;
    // Function to prevent copy, cut, paste operations
    const preventCopyPaste = (e) => {
      if (e.target.classList.contains('data-room-copy-btn')) {
        return true;
      }
      e.preventDefault();
      logInteraction('ATTEMPTED_UNAUTHORIZED_COPY', {
        description: 'Partner attempted to copy data through browser shortcuts or context menu',
        timestamp: new Date().toISOString(),
        element: e.target.tagName
      });
      return false;
    };
    const preventDrag = (e) => {
      e.preventDefault();
      logInteraction('ATTEMPTED_DRAG', {
        description: 'Partner attempted to drag content',
        timestamp: new Date().toISOString()
      });
      return false;
    };
    document.addEventListener('copy', preventCopyPaste);
    document.addEventListener('cut', preventCopyPaste);
    document.addEventListener('paste', preventCopyPaste);
    document.addEventListener('dragstart', preventDrag);
    document.addEventListener('contextmenu', preventCopyPaste);
    return () => {
      document.removeEventListener('copy', preventCopyPaste);
      document.removeEventListener('cut', preventCopyPaste);
      document.removeEventListener('paste', preventCopyPaste);
      document.removeEventListener('dragstart', preventDrag);
      document.removeEventListener('contextmenu', preventCopyPaste);
    };
  }, [logInteraction, role]);

  // Only log partner entry/view actions for partners
  useEffect(() => {
    if (role !== 'partner') return;
    if (contractId) {
      logInteraction('ENTERED_DATA_ROOM', {
        description: 'Partner entered the data room',
        timestamp: new Date().toISOString()
      });
    }
  }, [contractId, logInteraction, role]);

  useEffect(() => {
    if (role !== 'partner') return;
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
  }, [contractId, logInteraction, role]);

  // For users, fetch data from the user endpoint (no logging)
  useEffect(() => {
    if (role === 'partner') return;
    setLoading(true);
    fetch(`http://localhost:5000/user/data-room/${contractId}`, {
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
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
        console.error('DataRoomView fetch error:', err);
      });
  }, [contractId, role]);

  // Auto-refresh logs when visible and after actions
  useEffect(() => {
    if (showLogs) {
      fetchLogs();
      
      // Set up an interval to refresh logs every 5 seconds while they're visible
      const intervalId = setInterval(fetchLogs, 5000);
      
      return () => clearInterval(intervalId);
    }
  }, [showLogs, lastAction, contractId]);

  // Socket connection for consent updates
  useEffect(() => {
    socket.emit('join_contract_room', contractId);
    socket.on('consent_revoked', (msg) => {
      if (msg.contractId === contractId && onClose) {
        alert('Consent has been revoked. Data room will be closed.');
        onClose();
      }
    });
    socket.off('connect_error', (err) => {
      console.error('Socket.IO connection error:', err);
    });
    return () => {
      socket.emit('leave_contract_room', contractId);
      socket.off('consent_revoked');
      socket.off('connect_error');
    };
  }, [contractId, onClose]);

  const fetchLogs = useCallback(() => {
    if (role === 'user') {
      fetch(`http://localhost:5000/user/data-room-logs/${contractId}`, {
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
    } else {
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
    }
  }, [contractId, role]);

  // Only log copyField for partners
  const copyField = (fieldName, fieldValue) => {
    if (role !== 'partner') return;
    navigator.clipboard.writeText(fieldValue).then(() => {
      setCopiedFields(prev => new Set([...prev, fieldName]));
      logInteraction('COPIED_FIELD', {
        description: `Copied field: ${fieldName}`,
        fieldName,
        fieldValue: typeof fieldValue === 'string' ? fieldValue.substring(0, 10) + '...' : String(fieldValue).substring(0, 10) + '...',
        timestamp: new Date().toISOString()
      });
      setTimeout(() => {
        setCopiedFields(prev => {
          const newSet = new Set(prev);
          newSet.delete(fieldName);
          return newSet;
        });
      }, 2000);
    });
  };

  // Only log close for partners
  const handleClose = () => {
    if (role === 'partner') {
      logInteraction('CLOSED_DATA_ROOM', {
        description: 'Partner closed the data room',
        sessionDuration: Date.now() - (window.dataRoomEntryTime || Date.now()),
        timestamp: new Date().toISOString()
      });
    }
    onClose();
  };

  // Set entry time when component mounts
  useEffect(() => {
    window.dataRoomEntryTime = Date.now();
  }, []);

  // Toggle logs visibility and fetch logs when shown
  const toggleLogs = () => {
    const newShowLogs = !showLogs;
    setShowLogs(newShowLogs);
    if (newShowLogs) {
      fetchLogs();
    }
  };

  // Helper to download data as JSON file
  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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

  // When displaying logs, filter for partner logs if role === 'user'
  const filteredLogs = role === 'user'
    ? logs.filter(log => log.actor === 'partner' || !log.actor) // fallback: if no actor, show only known partner actions
    : logs;

  return (
    <div className="data-room-overlay" onCopy={(e) => e.preventDefault()}>
      {/* Secure Data Room Header */}
      <div className="data-room-header">
        <div className="data-room-title">
          🔒 Secure Data Room
        </div>
        <button 
          onClick={handleClose}
          className="data-room-close-btn"
        >
          🚪 Close Room
        </button>
      </div>
      
      <div className="data-room-status-badges">
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
        <span className="data-room-badge">
          Contract: {contractId}
        </span>
      </div>

      <div className="data-room-content-grid">
        {/* Contract Metadata Panel */}
        <div className="data-room-card">
          <div className="data-room-section-title">
            📋 Contract Information
          </div>
          
          {contract && (
            <div className="data-room-fields-list">
              <div className="data-room-field-row">
                <strong className="data-room-field-label">Bank:</strong>
                <span className="data-room-field-value" draggable="false">{typeof contract.bankId === 'object' ? contract.bankId?.name || contract.bankId?._id : contract.bankId}</span>
              </div>
              <div className="data-room-field-row">
                <strong className="data-room-field-label">Virtual User ID:</strong>
                <span className="data-room-field-value" draggable="false">{typeof contract.virtualUserId === 'object' ? contract.virtualUserId?._id : contract.virtualUserId}</span>
              </div>
              <div className="data-room-field-row">
                <strong className="data-room-field-label">Purpose:</strong>
                <span className="data-room-field-value" style={{ maxWidth: '200px', textAlign: 'right' }}>{contract.purpose}</span>
              </div>
              <div className="data-room-field-row">
                <strong className="data-room-field-label">Status:</strong>
                <span className="data-room-field-value" style={{
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
              <div className="data-room-field-row">
                <strong className="data-room-field-label">Created:</strong>
                <span className="data-room-field-value">{new Date(contract.createdAt).toLocaleString()}</span>
              </div>
              <div className="data-room-field-row">
                <strong className="data-room-field-label">Allowed Fields:</strong>
                <div className="data-room-fields-list">
                  {contract.allowedFields && contract.allowedFields.map((field, idx) => (
                    <span key={idx} className="data-room-field-value">
                      {field}{idx < contract.allowedFields.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>
              {contract.documents && (
                <div className="data-room-field-row">
                  <strong className="data-room-field-label">Documents:</strong>
                  <pre className="data-room-field-value">
                    {JSON.stringify(contract.documents, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          {!contract && (
            <div className="data-room-empty">
              📋 Contract information not available
            </div>
          )}
        </div>

        {/* Sandboxed Data Panel */}
        <div className="data-room-card">
          <div className="data-room-section-title">
            🔐 Sandboxed Data
          </div>
          
          <div className="data-room-fields-list">
            {data && Object.keys(data).length > 0 ? (
              <div>
                {Object.entries(data).map(([key, value]) => (
                  <div key={key} className="data-room-field-row">
                    <strong className="data-room-field-label">{key}:</strong>
                    <div className="data-room-field-value">
                      {typeof value === 'object' && value !== null ? (
                        <pre className="data-room-field-value" draggable="false">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        <span className="data-room-field-value" draggable="false">{String(value)}</span>
                      )}
                      <button
                        onClick={() => copyField(key, typeof value === 'object' ? JSON.stringify(value, null, 2) : value)}
                        className={`data-room-copy-btn ${copiedFields.has(key) ? 'copied' : ''}`}
                      >
                        {copiedFields.has(key) ? '✅ Copied' : '📋 Copy'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="data-room-empty">
                📭 No data available in sandbox
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Access Logs Section */}
      <div className="data-room-logs-card">
        <div className="data-room-logs-header">
          <h2 className="data-room-section-title">
            📊 Access Logs
            {role === 'user' && filteredLogs.length > 0 && (
              <button
                style={{ marginLeft: 16, padding: '4px 12px', fontSize: 14, borderRadius: 4, border: '1px solid #1976d2', background: '#e3f2fd', color: '#1976d2', cursor: 'pointer' }}
                onClick={() => downloadJSON(filteredLogs, `contract_${contractId}_logs.json`)}
              >
                ⬇️ Export Logs
              </button>
            )}
          </h2>
          <button 
            onClick={toggleLogs}
            className={`data-room-logs-toggle-btn ${showLogs ? 'active' : ''}`}
          >
            {showLogs ? '👁️ Hide Logs' : '👁️ View Logs'}
          </button>
        </div>
        
        {showLogs && (
          <div className="data-room-log-list">
            <h4 className="data-room-section-title">Recent Activity Logs (Last 20)</h4>
            {filteredLogs.length === 0 ? (
              <div className="data-room-empty">
                📝 No activity logs found
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {filteredLogs.map((log, idx) => (
                  <li key={idx} className="data-room-log-item">
                    <div><b>Action:</b> {log.action}</div>
                    <div><b>Timestamp:</b> {new Date(log.timestamp).toLocaleString()}</div>
                    {log.context && log.context.details && (
                      <div><b>Details:</b> <pre style={{ margin: 0 }}>{JSON.stringify(log.context.details, null, 2)}</pre></div>
                    )}
                    {log.dataSnapshot && (
                      <div><b>Data Viewed:</b> <pre style={{ margin: 0 }}>{JSON.stringify(log.dataSnapshot, null, 2)}</pre></div>
                    )}
                  </li>
                ))}
              </ul>
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