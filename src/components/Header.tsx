import { HeartPulse, Settings, Cpu, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  apiKey: string | null;
  model: string;
}

export default function Header({ onOpenSettings, apiKey, model }: HeaderProps) {
  const isMockMode = !apiKey && !import.meta.env.VITE_GEMINI_API_KEY;

  return (
    <header className="app-header glass-panel">
      <div className="header-brand">
        <div className="brand-logo pulse-border">
          <HeartPulse className="logo-icon" size={24} />
        </div>
        <div className="brand-text">
          <h1>React Doctor</h1>
          <p>Instant static analysis & AI component optimizer</p>
        </div>
      </div>

      <div className="header-actions">
        <div className={`mode-badge ${isMockMode ? 'mock-mode' : 'ai-mode'}`}>
          {isMockMode ? (
            <>
              <ShieldAlert size={14} />
              <span>Simulated Audits</span>
            </>
          ) : (
            <>
              <Cpu size={14} />
              <span>AI Active: {model}</span>
            </>
          )}
        </div>

        <button 
          className="icon-btn settings-btn" 
          onClick={onOpenSettings}
          title="Open Diagnostics Settings"
          aria-label="Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      <style>{`
        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 28px;
          margin: 20px 24px 0 24px;
          border-radius: 16px;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .brand-logo {
          background: linear-gradient(135deg, var(--color-primary) 0%, #a78bfa 100%);
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .logo-icon {
          animation: heartbeat 2s infinite ease-in-out;
        }

        .brand-text h1 {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.5px;
          margin: 0;
          color: var(--text-primary);
        }

        .brand-text p {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .mode-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid transparent;
        }

        .mode-badge.mock-mode {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.2);
          color: var(--color-a11y);
        }

        .mode-badge.ai-mode {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.2);
          color: var(--color-perf);
        }

        .settings-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
        }

        .settings-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.08);
          transform: rotate(30deg);
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.1); }
          40% { transform: scale(1); }
          55% { transform: scale(1.1); }
        }
      `}</style>
    </header>
  );
}
