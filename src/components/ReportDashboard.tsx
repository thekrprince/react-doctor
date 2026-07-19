import { useState } from 'react';
import { 
  Sparkles, CheckCircle, AlertTriangle, AlertCircle, Eye,
  Activity, Shield, Award, Package, FileCode
} from 'lucide-react';
import type { DiagnosticResult, DiagnosticIssue } from '../services/examples';

interface ReportDashboardProps {
  result: DiagnosticResult | null;
}

type TabType = 'performance' | 'a11y' | 'bestPractices' | 'security' | 'bundle';

export default function ReportDashboard({ result }: ReportDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('performance');

  if (!result) {
    return (
      <div className="report-empty glass-panel shimmer-bg">
        <Sparkles className="sparkle-icon" size={32} />
        <h3>Awaiting Component Diagnostic Scan</h3>
        <p>Enter your React component code above and hit "Run AI Diagnostics" to see complete audit metrics.</p>
      </div>
    );
  }

  const { score, summary, categories } = result;

  // Categories helper
  const tabConfig = {
    performance: { label: 'Performance', icon: Activity, count: categories.performance.length, color: 'var(--color-perf)', glow: 'var(--color-perf-glow)' },
    a11y: { label: 'Accessibility', icon: Eye, count: categories.a11y.length, color: 'var(--color-a11y)', glow: 'var(--color-a11y-glow)' },
    bestPractices: { label: 'Best Practices', icon: Award, count: categories.bestPractices.length, color: 'var(--color-best)', glow: 'var(--color-best-glow)' },
    security: { label: 'Security', icon: Shield, count: categories.security.length, color: 'var(--color-security)', glow: 'var(--color-security-glow)' },
    bundle: { label: 'Bundle Size', icon: Package, count: categories.bundle.length, color: 'var(--color-bundle)', glow: 'var(--color-bundle-glow)' },
  };

  const activeTabInfo = tabConfig[activeTab];
  const activeIssues = categories[activeTab];

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'var(--color-perf)';
    if (s >= 50) return 'var(--color-a11y)';
    return 'var(--color-security)';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertCircle className="icon-red" size={16} />;
      case 'medium': return <AlertTriangle className="icon-orange" size={16} />;
      default: return <AlertCircle className="icon-blue" size={16} />;
    }
  };

  // SVG Circular progress vars
  const radius = 60;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <section className="report-dashboard glass-panel">
      <div className="report-header">
        <div className="score-area">
          <svg height={radius * 2} width={radius * 2} className="score-svg">
            <circle
              stroke="rgba(255,255,255,0.03)"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke={getScoreColor(score)}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              strokeLinecap="round"
            />
          </svg>
          <div className="score-text">
            <span className="score-num">{score}</span>
            <span className="score-label">Health Score</span>
          </div>
        </div>

        <div className="summary-area">
          <h3>Doctor's Diagnosis Summary</h3>
          <p>{summary}</p>
        </div>
      </div>

      <div className="report-tabs">
        {(Object.keys(tabConfig) as TabType[]).map((tabKey) => {
          const config = tabConfig[tabKey];
          const Icon = config.icon;
          const isActive = activeTab === tabKey;
          const hasIssues = config.count > 0;

          return (
            <button
              key={tabKey}
              className={`tab-btn ${isActive ? 'active' : ''} ${hasIssues ? 'has-issues' : ''}`}
              onClick={() => setActiveTab(tabKey)}
              style={{
                borderBottomColor: isActive ? config.color : 'transparent',
              }}
            >
              <div className="tab-label-group">
                <Icon size={16} style={{ color: isActive ? config.color : 'var(--text-secondary)' }} />
                <span>{config.label}</span>
              </div>
              <span 
                className={`tab-count ${hasIssues ? 'warn' : 'ok'}`}
                style={{ 
                  backgroundColor: hasIssues ? config.glow : 'rgba(255,255,255,0.03)',
                  color: hasIssues ? config.color : 'var(--text-muted)'
                }}
              >
                {config.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="tab-pane-content">
        {activeIssues.length === 0 ? (
          <div className="empty-tab-state">
            <CheckCircle className="ok-icon" size={32} />
            <h4>Perfect Health</h4>
            <p>No {activeTabInfo.label} issues were detected in this component!</p>
          </div>
        ) : (
          <div className="issues-list">
            {activeIssues.map((issue: DiagnosticIssue, idx: number) => (
              <div key={idx} className="issue-card glass-panel">
                <div className="issue-card-header">
                  <div className="issue-title">
                    {getSeverityIcon(issue.severity)}
                    <h4>{issue.issue}</h4>
                  </div>
                  <div className="badge-row">
                    {issue.line && (
                      <span className="line-badge">
                        <FileCode size={11} />
                        Line {issue.line}
                      </span>
                    )}
                    <span className={`severity-badge ${issue.severity}`}>
                      {issue.severity}
                    </span>
                  </div>
                </div>
                <div className="issue-solution">
                  <h5>Prescription / Fix:</h5>
                  <p>{issue.solution}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .report-dashboard {
          display: flex;
          flex-direction: column;
          height: 600px;
          overflow: hidden;
        }

        .report-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 40px;
          height: 100%;
          text-align: center;
          color: var(--text-muted);
        }

        .sparkle-icon {
          color: var(--color-primary-bright);
          margin-bottom: 20px;
          opacity: 0.8;
        }

        .report-empty h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .report-empty p {
          font-size: 13px;
          max-width: 440px;
          line-height: 1.6;
        }

        .report-header {
          display: flex;
          align-items: center;
          padding: 24px;
          gap: 28px;
          border-bottom: 1px solid var(--border-color);
          background: rgba(10, 11, 16, 0.3);
        }

        .score-area {
          position: relative;
          width: 120px;
          height: 120px;
          flex-shrink: 0;
        }

        .score-svg {
          transform: rotate(-90deg);
        }

        .score-text {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .score-num {
          font-size: 32px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }

        .score-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .summary-area {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .summary-area h3 {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.2px;
        }

        .summary-area p {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .report-tabs {
          display: flex;
          overflow-x: auto;
          background: rgba(10, 11, 16, 0.5);
          border-bottom: 1px solid var(--border-color);
        }

        .tab-btn {
          flex: 1;
          min-width: 110px;
          padding: 14px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          border-bottom: 2px solid transparent;
          color: var(--text-secondary);
        }

        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-primary);
        }

        .tab-btn.active {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-primary);
        }

        .tab-label-group {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .tab-count {
          font-size: 10px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 10px;
        }

        .tab-count.ok {
          color: var(--text-muted);
        }

        .tab-pane-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: rgba(5, 5, 8, 0.2);
        }

        .empty-tab-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: var(--text-muted);
          padding: 40px;
        }

        .ok-icon {
          color: var(--color-perf);
          margin-bottom: 12px;
          filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.2));
        }

        .empty-tab-state h4 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .empty-tab-state p {
          font-size: 13px;
        }

        .issues-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .issue-card {
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.015);
          padding: 14px 18px;
        }

        .issue-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 10px;
        }

        .issue-title {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .issue-title h4 {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
          margin: 0;
        }

        .badge-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .line-badge {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 10px;
          font-family: var(--font-mono);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .severity-badge {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .severity-badge.high {
          background: rgba(244, 63, 94, 0.1);
          color: var(--color-security);
        }

        .severity-badge.medium {
          background: rgba(245, 158, 11, 0.1);
          color: var(--color-a11y);
        }

        .severity-badge.low {
          background: rgba(59, 130, 246, 0.1);
          color: var(--color-bundle);
        }

        .issue-solution {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          padding: 10px 14px;
          border-left: 2.5px solid var(--color-primary);
        }

        .issue-solution h5 {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-primary-bright);
          margin-bottom: 2px;
        }

        .issue-solution p {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .icon-red { color: var(--color-security); }
        .icon-orange { color: var(--color-a11y); }
        .icon-blue { color: var(--color-bundle); }
      `}</style>
    </section>
  );
}
