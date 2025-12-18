import { useState } from 'react';
import { authAPI } from '../services/api';

const MyPhoneModal = ({ currentPhone, onClose, onSave }) => {
  const [phone, setPhone] = useState(currentPhone);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.updatePhone(phone);
      onSave(phone);
    } catch (err) {
      setError(err.message || 'Failed to save phone number');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal">
        <h2 className="modal-title">My Phone Number</h2>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
          This is your sender number. Some SMS apps require it for group messaging.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="myPhone">Phone Number</label>
            <input
              id="myPhone"
              type="tel"
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998901234567"
              autoFocus
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
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyPhoneModal;
