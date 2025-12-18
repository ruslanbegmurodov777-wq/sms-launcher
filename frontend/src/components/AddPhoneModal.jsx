import { useState } from 'react';
import { phonesAPI } from '../services/api';

const AddPhoneModal = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!name.trim()) {
      setError('Contact name is required');
      return;
    }

    if (!number.trim()) {
      setError('Phone number is required');
      return;
    }

    // Simple phone validation
    const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;
    if (!phoneRegex.test(number)) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      const data = await phonesAPI.add(name.trim(), number.trim());
      onAdd(data.phone);
    } catch (err) {
      setError(err.message || 'Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal">
        <h2 className="modal-title">Add Contact</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="number">Phone Number</label>
            <input
              id="number"
              type="tel"
              className="input"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="+998901234567"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPhoneModal;
