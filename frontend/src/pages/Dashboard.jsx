import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { phonesAPI } from '../services/api';
import AddPhoneModal from '../components/AddPhoneModal';

const MAX_SELECTED = 20;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [phones, setPhones] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch phone numbers on mount
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

  // Toggle phone selection
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

  // Select/deselect all
  const toggleSelectAll = () => {
    if (selected.size === phones.length) {
      setSelected(new Set());
    } else {
      const toSelect = phones.slice(0, MAX_SELECTED).map((p) => p._id);
      setSelected(new Set(toSelect));
    }
  };

  // Delete phone number
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

  // Generate SMS URI and open
  const handleSendSMS = () => {
    if (selected.size === 0) {
      setError('Please select at least one phone number');
      return;
    }

    // Get selected phone numbers
    const selectedPhones = phones
      .filter((p) => selected.has(p._id))
      .map((p) => p.number);

    // Build SMS URI
    // Format: sms:+1234567890,+0987654321?body=Hello
    const numbers = selectedPhones.join(',');
    const encodedMessage = encodeURIComponent(message);
    const smsUri = message
      ? `sms:${numbers}?body=${encodedMessage}`
      : `sms:${numbers}`;

    // Open SMS app
    window.location.href = smsUri;
  };

  // Handle new phone added
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
              {selected.size >= MAX_SELECTED && ` (max ${MAX_SELECTED})`}
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

      {/* SMS Section - sticky at bottom */}
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
        <button
          className="btn btn-primary"
          onClick={handleSendSMS}
          disabled={selected.size === 0}
        >
          📤 Open SMS App ({selected.size} selected)
        </button>
        <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', marginTop: '8px' }}>
          Opens your phone's SMS app. You send manually.
        </p>
      </div>

      {/* Add Phone Modal */}
      {showAddModal && (
        <AddPhoneModal
          onClose={() => setShowAddModal(false)}
          onAdd={handlePhoneAdded}
        />
      )}
    </div>
  );
};

export default Dashboard;
