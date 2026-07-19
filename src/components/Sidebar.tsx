import { History, Trash2, Award, FileCode, CheckCircle } from 'lucide-react';
import type { DiagnosticResult } from '../services/examples';

export interface HistoryItem {
  id: string;
  timestamp: string;
  componentName: string;
  score: number;
  result: DiagnosticResult;
}

interface SidebarProps {
  history: HistoryItem[];
  selectedHistoryId: string | null;
  onSelectHistory: (id: string) => void;
  onClearHistory: () => void;
}

export default function Sidebar({
  history,
  selectedHistoryId,
  onSelectHistory,
  onClearHistory,
}: SidebarProps) {
  // Statistics calculations
  const totalScans = history.length;
  const averageScore = totalScans > 0 
    ? Math.round(history.reduce((acc, item) => acc + item.score, 0) / totalScans) 
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--color-perf)';
    if (score >= 50) return 'var(--color-a11y)';
    return 'var(--color-security)';
  };

  return (
    <aside className="app-sidebar glass-panel">
      <div className="sidebar-header">
        <div className="title-row">
          <History size={16} className="header-icon" />
          <h2>Diagnostic Registry</h2>
        </div>
        {history.length > 0 && (
          <button 
            className="clear-history-btn" 
            onClick={onClearHistory}
            title="Clear Registry"
            aria-label="Clear registry history"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="history-list">
        {history.length === 0 ? (
          <div className="empty-history">
            <FileCode size={28} className="empty-icon" />
            <p>No diagnostics recorded yet</p>
            <span>Scan a component to log results.</span>
          </div>
        ) : (
          history.map((item) => (
            <button
              key={item.id}
              className={`history-card ${selectedHistoryId === item.id ? 'active' : ''}`}
              onClick={() => onSelectHistory(item.id)}
            >
              <div className="card-top">
                <span className="component-name">{item.componentName}</span>
                <span 
                  className="score-badge"
                  style={{ color: getScoreColor(item.score), backgroundColor: `${getScoreColor(item.score)}12` }}
                >
                  {item.score}%
                </span>
              </div>
              <div className="card-bottom">
                <span className="card-timestamp">{item.timestamp}</span>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="sidebar-stats">
        <h3>Registry Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-box">
            <CheckCircle className="metric-icon green" size={16} />
            <div className="metric-info">
              <span className="metric-val">{totalScans}</span>
              <span className="metric-label">Audits Run</span>
            </div>
          </div>
          <div className="metric-box">
            <Award className="metric-icon purple" size={16} />
            <div className="metric-info">
              <span className="metric-val">{averageScore}%</span>
              <span className="metric-label">Avg Health</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .app-sidebar {
          width: 320px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          border-radius: 0;
          border-left: none;
          border-top: none;
          border-bottom: none;
          background: rgba(10, 11, 16, 0.7);
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-icon {
          color: var(--color-primary);
        }

        .sidebar-header h2 {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
          letter-spacing: -0.2px;
        }

        .clear-history-btn {
          color: var(--text-muted);
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
        }

        .clear-history-btn:hover {
          color: var(--color-security);
          background: rgba(244, 63, 94, 0.1);
        }

        .history-list {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .empty-history {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-top: auto;
          margin-bottom: auto;
        }

        .empty-icon {
          margin-bottom: 12px;
          color: var(--text-muted);
          opacity: 0.4;
        }

        .empty-history p {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .empty-history span {
          font-size: 11px;
          margin-top: 4px;
        }

        .history-card {
          width: 100%;
          text-align: left;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: transform 0.2s, background 0.2s;
        }

        .history-card:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: var(--border-hover);
          transform: translateX(2px);
        }

        .history-card.active {
          background: rgba(139, 92, 246, 0.08);
          border-color: var(--color-primary);
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.1);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .component-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .score-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 6px;
          flex-shrink: 0;
        }

        .card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-timestamp {
          font-size: 11px;
          color: var(--text-muted);
        }

        .sidebar-stats {
          padding: 20px 24px;
          border-top: 1px solid var(--border-color);
          background: rgba(10, 11, 16, 0.8);
        }

        .sidebar-stats h3 {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .metric-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .metric-icon.green {
          color: var(--color-perf);
        }

        .metric-icon.purple {
          color: var(--color-primary-bright);
        }

        .metric-info {
          display: flex;
          flex-direction: column;
        }

        .metric-val {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .metric-label {
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 2px;
        }
      `}</style>
    </aside>
  );
}
