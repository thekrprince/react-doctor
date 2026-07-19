import React, { useState } from 'react';
import { X, Eye, EyeOff, ExternalLink, Key } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string | null;
  onSaveApiKey: (key: string) => void;
  model: string;
  onChangeModel: (model: string) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  model,
  onChangeModel,
}: SettingsModalProps) {
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(keyInput.trim());
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-panel" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className="title-area">
            <Key size={18} className="title-icon" />
            <h2>Diagnostics Settings</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close settings">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="apiKeyInput">Gemini API Key</label>
            <div className="input-with-action">
              <input
                id="apiKeyInput"
                type={showKey ? 'text' : 'password'}
                placeholder="Paste your API key here..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowKey(!showKey)}
                aria-label={showKey ? "Hide API key" : "Show API key"}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="help-text">
              Key is stored locally in your browser's localStorage. 
              Get a free API key at{' '}
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Google AI Studio <ExternalLink size={10} />
              </a>.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="modelSelect">AI Model Selection</label>
            <select
              id="modelSelect"
              value={model}
              onChange={(e) => onChangeModel(e.target.value)}
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fastest, default)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deepest coding logic)</option>
            </select>
            <p className="help-text">
              Flash is recommended for instantaneous diagnostic reports. Use Pro if you want extremely exhaustive refactoring.
            </p>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => {
                setKeyInput('');
                onSaveApiKey('');
              }}
            >
              Clear Key
            </button>
            <button type="submit" className="btn btn-primary">
              Save Settings
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(5, 5, 8, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          width: 100%;
          max-width: 500px;
          background: #111218;
          border-radius: 16px;
          border: 1px solid var(--border-color);
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          animation: modalAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalAppear {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .title-area {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .title-icon {
          color: var(--color-primary);
        }

        .modal-header h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
        }

        .close-btn {
          color: var(--text-muted);
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.05);
        }

        .modal-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .input-with-action {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-action input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 10px 40px 10px 14px;
          color: var(--text-primary);
          font-family: var(--font-mono);
          font-size: 13px;
          transition: border-color 0.2s;
        }

        .input-with-action input:focus {
          outline: none;
          border-color: var(--color-primary);
          background: rgba(255,255,255,0.05);
        }

        .toggle-visibility {
          position: absolute;
          right: 12px;
          color: var(--text-muted);
        }

        .toggle-visibility:hover {
          color: var(--text-primary);
        }

        .form-group select {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 10px 12px;
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 14px;
          cursor: pointer;
        }

        .form-group select:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .help-text {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .help-text a {
          color: var(--color-primary-bright);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 2px;
        }

        .help-text a:hover {
          text-decoration: underline;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 10px;
          border-top: 1px solid var(--border-color);
          padding-top: 18px;
        }

        .btn {
          padding: 10px 18px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
        }

        .btn-secondary:hover {
          background: rgba(255,255,255,0.03);
          color: var(--text-primary);
        }

        .btn-primary {
          background: var(--color-primary);
          color: white;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
        }

        .btn-primary:hover {
          background: var(--color-primary-bright);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
