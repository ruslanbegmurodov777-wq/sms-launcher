import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { phonesAPI } from '../services/api';
import AddPhoneModal from '../components/AddPhoneModal';
import MyPhoneModal from '../components/MyPhoneModal';

const MAX_SELECTED = 20;

const Dashboard = () => {
  const { user, logout, updateUserPhone } = useAuth();
  const [phones, setPhones] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMyPhoneModal, setShowMyPhoneModal] = useState(false);
  const [sendMode, setSendMode] = useState('single'); // 'single' or 'group'

  useEffect(() => {
    fetchPhones();
  }, []);

  const fetchPhones = async () => {
    try {
      setLoading(true);
      const data = await phonesAPI.getAll();
      setPhones(data.phones);
    } catch (err) {
      setError('Failed to load phone numbers');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      if (newSelected.size >= MAX_SELECTED) {
        setError(`Maximum ${MAX_SELECTED} numbers can be selected`);
        return;
      }
      newSelected.add(id);
    }
    setSelected(newSelected);
    setError('');
  };

  const toggleSelectAll = () => {
    if (selected.size === phones.length) {
      setSelected(new Set());
    } else {
      const toSelect = phones.slice(0, MAX_SELECTED).map((p) => p._id);
      setSelected(new Set(toSelect));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return;
    try {
      await phonesAPI.delete(id);
      setPhones(phones.filter((p) => p._id !== id));
      selected.delete(id);
      setSelected(new Set(selected));
    } catch (err) {
      setError('Failed to delete contact');
    }
  };

  // Send SMS to each number individually (one by one)
  const handleSendSingle = () => {
    if (selected.size === 0) {
      setError('Please select at least one phone number');
      return;
    }

    const selectedPhones = phones.filter((p) => selected.has(p._id));
    const encodedMessage = encodeURIComponent(message);

    // Open SMS for first number, show instructions for others
    selectedPhones.forEach((phone, index) => {
      const smsUri = message
        ? `sms:${phone.number}?body=${encodedMessage}`
        : `sms:${phone.number}`;

      if (index === 0) {
        window.location.href = smsUri;
      } else {
        // For subsequent numbers, open in new window after delay
        setTimeout(() => {
          window.open(smsUri, '_blank');
        }, index * 500);
      }
    });
  };

  // Send SMS to group (comma-separated)
  const handleSendGroup = () => {
    if (selected.size === 0) {
      setError('Please select at least one phone number');
      return;
    }

    const selectedPhones = phones
      .filter((p) => selected.has(p._id))
      .map((p) => p.number);

    // Android format: sms:number1,number2?body=message
    const numbers = selectedPhones.join(',');
    const encodedMessage = encodeURIComponent(message);
    const smsUri = message
      ? `sms:${numbers}?body=${encodedMessage}`
      : `sms:${numbers}`;

    window.location.href = smsUri;
  };

  const handleSendSMS = () => {
    if (sendMode === 'single') {
      handleSendSingle();
    } else {
      handleSendGroup();
    }
  };

  const handlePhoneAdded = (newPhone) => {
    setPhones([newPhone, ...phones]);
    setShowAddModal(false);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1>📱 SMS Launcher</h1>
        <button className="btn btn-outline btn-sm" onClick={logout}>
          Logout
        </button>
      </header>

      {/* My Phone Number */}
      <div 
        className="card" 
        style={{ 
          padding: '12px 16px', 
          marginBottom: '16px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onClick={() => setShowMyPhoneModal(true)}
      >
        <div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>My Number (Sender)</div>
          <div style={{ fontWeight: '500' }}>
            {user?.phoneNumber || 'Tap to add your number'}
          </div>
        </div>
        <span style={{ color: '#6b7280' }}>✏️</span>
      </div>

      {/* Error message */}
      {error && (
        <div className="alert alert-error">
          {error}
          <button
            onClick={() => setError('')}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Add phone button */}
      <button
        className="btn btn-primary"
        onClick={() => setShowAddModal(true)}
        style={{ marginBottom: '16px' }}
      >
        + Add Contact
      </button>

      {/* Phone list */}
      {phones.length === 0 ? (
        <div className="card empty-state">
          <p>No contacts yet</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            Add your first contact to get started
          </p>
        </div>
      ) : (
        <>
          {/* Selection info */}
          <div className="selection-info">
            <span>
              {selected.size} of {phones.length} selected
            </span>
            <button
              className="btn btn-outline btn-sm"
              onClick={toggleSelectAll}
              style={{ width: 'auto' }}
            >
              {selected.size === phones.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Phone list card */}
          <div className="card" style={{ padding: 0 }}>
            {phones.map((phone) => (
              <div key={phone._id} className="phone-item">
                <input
                  type="checkbox"
                  className="phone-checkbox"
                  checked={selected.has(phone._id)}
                  onChange={() => toggleSelect(phone._id)}
                  aria-label={`Select ${phone.name}`}
                />
                <div className="phone-info">
                  <div className="phone-name">{phone.name}</div>
                  <div className="phone-number">{phone.number}</div>
                </div>
                <button
                  className="phone-delete"
                  onClick={() => handleDelete(phone._id)}
                  aria-label={`Delete ${phone.name}`}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* SMS Section */}
      <div className="sms-section">
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <textarea
            className="input textarea"
            placeholder="Type your message here (optional)..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
        </div>

        {/* Send mode toggle */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '12px',
          fontSize: '14px'
        }}>
          <label style={{ 
            flex: 1, 
            padding: '10px', 
            border: `2px solid ${sendMode === 'single' ? '#4f46e5' : '#e5e7eb'}`,
            borderRadius: '8px',
            textAlign: 'center',
            cursor: 'pointer',
            background: sendMode === 'single' ? '#eef2ff' : 'white'
          }}>
            <input
              type="radio"
              name="sendMode"
              value="single"
              checked={sendMode === 'single'}
              onChange={() => setSendMode('single')}
              style={{ display: 'none' }}
            />
            📤 One by One
          </label>
          <label style={{ 
            flex: 1, 
            padding: '10px', 
            border: `2px solid ${sendMode === 'group' ? '#4f46e5' : '#e5e7eb'}`,
            borderRadius: '8px',
            textAlign: 'center',
            cursor: 'pointer',
            background: sendMode === 'group' ? '#eef2ff' : 'white'
          }}>
            <input
              type="radio"
              name="sendMode"
              value="group"
              checked={sendMode === 'group'}
              onChange={() => setSendMode('group')}
              style={{ display: 'none' }}
            />
            👥 Group SMS
          </label>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSendSMS}
          disabled={selected.size === 0}
        >
          📤 Open SMS App ({selected.size} selected)
        </button>
        <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', marginTop: '8px' }}>
          {sendMode === 'single' 
            ? 'Opens SMS for each contact separately' 
            : 'Opens group SMS (may require phone verification)'}
        </p>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddPhoneModal
          onClose={() => setShowAddModal(false)}
          onAdd={handlePhoneAdded}
        />
      )}
      {showMyPhoneModal && (
        <MyPhoneModal
          currentPhone={user?.phoneNumber || ''}
          onClose={() => setShowMyPhoneModal(false)}
          onSave={(phone) => {
            updateUserPhone(phone);
            setShowMyPhoneModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
