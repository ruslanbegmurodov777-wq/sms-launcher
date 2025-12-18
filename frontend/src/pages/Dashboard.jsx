import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { phonesAPI } from '../services/api';
import AddPhoneModal from '../components/AddPhoneModal';
import SendSMSModal from '../components/SendSMSModal';

const MAX_SELECTED = 50;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [phones, setPhones] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);

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

  const handleStartSending = () => {
    if (selected.size === 0) {
      setError('Please select at least one phone number');
      return;
    }
    setShowSendModal(true);
  };

  const handlePhoneAdded = (newPhone) => {
    setPhones([newPhone, ...phones]);
    setShowAddModal(false);
  };

  const getSelectedPhones = () => {
    return phones.filter((p) => selected.has(p._id));
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
          <div className="card" style={{ padding: 0, marginBottom: '140px' }}>
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
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleStartSending}
          disabled={selected.size === 0}
        >
          📤 Send SMS ({selected.size} contacts)
        </button>
        <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', marginTop: '8px' }}>
          Opens SMS app for each contact one by one
        </p>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddPhoneModal
          onClose={() => setShowAddModal(false)}
          onAdd={handlePhoneAdded}
        />
      )}
      
      {showSendModal && (
        <SendSMSModal
          phones={getSelectedPhones()}
          message={message}
          onClose={() => setShowSendModal(false)}
          onComplete={() => {
            setShowSendModal(false);
            setSelected(new Set());
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
