import { useState } from 'react';

const SendSMSModal = ({ phones, message, onClose, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentCount, setSentCount] = useState(0);

  const currentPhone = phones[currentIndex];
  const isLast = currentIndex === phones.length - 1;
  const progress = Math.round(((currentIndex) / phones.length) * 100);

  // Open SMS app for current contact
  const openSMS = () => {
    const encodedMessage = encodeURIComponent(message);
    const smsUri = message
      ? `sms:${currentPhone.number}?body=${encodedMessage}`
      : `sms:${currentPhone.number}`;
    
    window.location.href = smsUri;
  };

  // Handle "Send & Next" button
  const handleSendAndNext = () => {
    openSMS();
    setSentCount(prev => prev + 1);
    
    // Small delay then move to next
    setTimeout(() => {
      if (!isLast) {
        setCurrentIndex(prev => prev + 1);
      }
    }, 300);
  };

  // Handle "Send & Finish"
  const handleSendAndFinish = () => {
    openSMS();
    setSentCount(prev => prev + 1);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  // Skip current contact
  const handleSkip = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        {/* Progress */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '14px',
            marginBottom: '8px'
          }}>
            <span>Contact {currentIndex + 1} of {phones.length}</span>
            <span>{sentCount} sent</span>
          </div>
          <div style={{ 
            height: '6px', 
            background: '#e5e7eb', 
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              height: '100%', 
              width: `${progress}%`, 
              background: '#4f46e5',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>

        {/* Current contact */}
        <div style={{ 
          background: '#f9fafb', 
          padding: '16px', 
          borderRadius: '8px',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>👤</div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>{currentPhone.name}</div>
          <div style={{ color: '#6b7280' }}>{currentPhone.number}</div>
        </div>

        {/* Message preview */}
        {message && (
          <div style={{ 
            background: '#eef2ff', 
            padding: '12px', 
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Message:</div>
            <div style={{ color: '#374151' }}>{message}</div>
          </div>
        )}

        {/* Instructions */}
        <div style={{ 
          background: '#fef3c7', 
          padding: '12px', 
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#92400e'
        }}>
          📱 SMS app will open. Press SEND in your SMS app, then come back and tap "Next".
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {isLast ? (
            <button className="btn btn-primary" onClick={handleSendAndFinish}>
              📤 Open SMS & Finish
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSendAndNext}>
              📤 Open SMS → Next ({phones.length - currentIndex - 1} left)
            </button>
          )}
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-outline" 
              onClick={handleSkip}
              style={{ flex: 1 }}
            >
              Skip
            </button>
            <button 
              className="btn btn-outline" 
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendSMSModal;
