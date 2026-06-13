import { useState } from 'react';

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar',
  confirmColor = 'danger', // 'danger' | 'warn' | 'default'
  showReason = true,
  showDuration = false,
  onConfirm,
  onCancel,
}) {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('60');

  if (!isOpen) return null;

  function handleConfirm() {
    if (showReason && !reason.trim()) {
      alert('Indica um motivo.');
      return;
    }
    onConfirm({ reason, duration_minutes: showDuration ? Number(duration) : undefined });
    setReason('');
    setDuration('60');
  }

  function handleCancel() {
    setReason('');
    setDuration('60');
    onCancel();
  }

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        {description && <p className="modal-description">{description}</p>}

        {showReason && (
          <div className="form-group">
            <label>Motivo *</label>
            <textarea
              className="form-input form-textarea"
              rows={3}
              placeholder="Descreve o motivo desta ação..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              autoFocus
            />
          </div>
        )}

        {showDuration && (
          <div className="form-group">
            <label>Duração (minutos)</label>
            <input
              type="number"
              className="form-input"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              min="1"
              max="40320"
            />
            <span className="form-hint">Máximo permitido pelo Discord: 28 dias (40320 min)</span>
          </div>
        )}

        <div className="modal-actions">
          <button className="button button-outline" onClick={handleCancel}>Cancelar</button>
          <button className={`button button-${confirmColor}`} onClick={handleConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}