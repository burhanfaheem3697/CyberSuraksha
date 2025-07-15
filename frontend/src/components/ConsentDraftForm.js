import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConsentDraftForm = ({ virtualUserId, onSuccess }) => {
  const [formData, setFormData] = useState({
    virtualUserId,
    rawPurpose: '',
    dataFields: [],
    duration: 30,
    dataResidency: 'IN',
    crossBorder: false,
    quantumSafe: false,
    anonymization: false,
    justification: ''
  });

  const [availableFields] = useState([
    'name', 'email', 'phone', 'address', 'accounts', 'income', 'monthly_expenses',
    'credit_score', 'loan_history', 'employment_status', 'bank_balance',
    'transaction_summary', 'insurance_history', 'medical_history','loans','cards'
  ]);

  const [selectedFields, setSelectedFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [draftId, setDraftId] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [validationStatus, setValidationStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFieldSelect = (field) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      dataFields: selectedFields,
      virtualUserId
    }));
  }, [selectedFields, virtualUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post('http://localhost:5000/consent-draft/create', formData, { withCredentials: true });
      setDraftId(response.data.data._id);
      setSuccess('Consent draft created successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error while creating draft');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!draftId) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`http://localhost:5000/consent-draft/validate/${draftId}`, {}, { withCredentials: true });
      setValidationResult(response.data.data.validation);
      setValidationStatus(response.data.data.draft.status);

      if (response.data.data.validation.approved) {
        setSuccess('Validation successful!');
      } else {
        setError(`Validation failed: ${response.data.data.validation.reason}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Validation error');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!draftId || validationStatus !== 'VALIDATED') return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`http://localhost:5000/consent-draft/finalize/${draftId}`, {}, { withCredentials: true });
      setSuccess('Draft finalized and consent created!');
      onSuccess?.(response.data.data.consent);
    } catch (err) {
      setError(err.response?.data?.message || 'Finalization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ fontSize: '20px', marginBottom: 16 }}>Create Consent Draft</h3>

      {error && (
        <div style={{ background: '#ffebee', padding: 12, color: '#c62828', marginBottom: 16, borderRadius: 4 }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#e8f5e9', padding: 12, color: '#2e7d32', marginBottom: 16, borderRadius: 4 }}>
          <strong>Success:</strong> {success}
        </div>
      )}
      {validationResult && (
        <div style={{
          padding: 12,
          backgroundColor: validationResult.approved ? '#e8f5e9' : '#ffebee',
          border: `1px solid ${validationResult.approved ? '#2e7d32' : '#c62828'}`,
          marginBottom: 16,
          borderRadius: 4
        }}>
          <strong>{validationResult.approved ? '✅ Validation Passed' : '❌ Validation Failed'}</strong><br />
          <span>{validationResult.reason}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <textarea
          name="rawPurpose"
          placeholder="Purpose (free text)"
          value={formData.rawPurpose}
          onChange={handleInputChange}
          required
          style={{ padding: 10, fontSize: 14, height: 80 }}
        />
        <textarea
          name="justification"
          placeholder="Justification"
          value={formData.justification}
          onChange={handleInputChange}
          required
          style={{ padding: 10, fontSize: 14, height: 80 }}
        />
        <div>
          <label style={{ fontWeight: 'bold', marginBottom: 6 }}>Data Fields</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {availableFields.map((field) => (
              <div
                key={field}
                onClick={() => handleFieldSelect(field)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 16,
                  background: selectedFields.includes(field) ? '#1976d2' : '#eee',
                  color: selectedFields.includes(field) ? 'white' : 'black',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                {field}
              </div>
            ))}
          </div>
        </div>
        <input
          type="number"
          name="duration"
          placeholder="Duration (days)"
          value={formData.duration}
          onChange={handleInputChange}
          required
          style={{ padding: 10, fontSize: 14 }}
        />
        <select
          name="dataResidency"
          value={formData.dataResidency}
          onChange={handleInputChange}
          required
          style={{ padding: 10, fontSize: 14 }}
        >
          <option value="IN">India</option>
          <option value="EU">European Union</option>
          <option value="US">United States</option>
          <option value="ANY">Any</option>
        </select>

        <div style={{ display: 'flex', gap: 24 }}>
          <label>
            <input type="checkbox" name="crossBorder" checked={formData.crossBorder} onChange={handleInputChange} />
            {' '}Cross Border Transfer
          </label>
          <label>
            <input type="checkbox" name="quantumSafe" checked={formData.quantumSafe} onChange={handleInputChange} />
            {' '}Quantum Safe
          </label>
          <label>
            <input type="checkbox" name="anonymization" checked={formData.anonymization} onChange={handleInputChange} />
            {' '}Anonymization
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
          {!draftId && (
            <button
              type="submit"
              disabled={selectedFields.length === 0 || loading}
              style={{
                background: '#1976d2',
                color: 'white',
                padding: '10px 20px',
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Submitting...' : 'Create Draft'}
            </button>
          )}
          {draftId && validationStatus !== 'VALIDATED' && validationStatus !== 'FINALIZED' && (
            <button
              onClick={handleValidate}
              type="button"
              disabled={loading}
              style={{
                background: '#ffa726',
                color: 'white',
                padding: '10px 20px',
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Validating...' : 'Validate Draft'}
            </button>
          )}
          {draftId && validationStatus === 'VALIDATED' && (
            <button
              onClick={handleFinalize}
              type="button"
              disabled={loading}
              style={{
                background: '#43a047',
                color: 'white',
                padding: '10px 20px',
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Finalizing...' : 'Finalize Draft'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ConsentDraftForm;
