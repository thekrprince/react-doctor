import { useState } from 'react';
import { Sparkles, Copy, Check, ArrowRightLeft, FileCode, CheckSquare } from 'lucide-react';

interface CodeRefactorPaneProps {
  refactoredCode: string | undefined;
  originalCode: string;
  onApplyRefactor: (code: string) => void;
}

export default function CodeRefactorPane({
  refactoredCode,
  originalCode,
  onApplyRefactor,
}: CodeRefactorPaneProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'refactored' | 'split'>('refactored');

  if (!refactoredCode) {
    return (
      <div className="refactor-empty glass-panel shimmer-bg">
        <Sparkles className="sparkle-icon" size={32} />
        <h3>Optimized Prescription</h3>
        <p>Run diagnostic analysis to receive code health recommendations and automated refactoring suggestions.</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(refactoredCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple line numbers helper
  const originalLineCount = originalCode.split('\n').length;
  const refactoredLineCount = refactoredCode.split('\n').length;

  const originalLines = Array.from({ length: originalLineCount }, (_, i) => i + 1);
  const refactoredLines = Array.from({ length: refactoredLineCount }, (_, i) => i + 1);

  return (
    <section className="code-refactor glass-panel full-width-grid">
      <div className="refactor-header">
        <div className="title-block">
          <Sparkles size={18} className="refactor-icon" />
          <h2>AI Prescribed Treatment</h2>
        </div>

        <div className="refactor-actions">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'refactored' ? 'active' : ''}`}
              onClick={() => setViewMode('refactored')}
            >
              <FileCode size={14} />
              <span>Optimized Code</span>
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'split' ? 'active' : ''}`}
              onClick={() => setViewMode('split')}
            >
              <ArrowRightLeft size={14} />
              <span>Compare Split</span>
            </button>
          </div>

          <button className="action-btn copy" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          <button 
            className="action-btn apply" 
            onClick={() => onApplyRefactor(refactoredCode)}
          >
            <CheckSquare size={14} />
            <span>Apply Treatment</span>
          </button>
        </div>
      </div>

      <div className={`refactor-body ${viewMode}`}>
        {viewMode === 'split' && (
          <div className="code-viewer-half original">
            <div className="viewer-label">Original Component</div>
            <div className="code-editor-sim">
              <div className="line-numbers">
                {originalLines.map(n => <div key={n}>{n}</div>)}
              </div>
              <pre className="code-display"><code>{originalCode}</code></pre>
            </div>
          </div>
        )}

        <div className="code-viewer-half refactored">
          {viewMode === 'split' && <div className="viewer-label text-green">Refactored & Clean</div>}
          <div className="code-editor-sim">
            <div className="line-numbers bg-green-line">
              {refactoredLines.map(n => <div key={n}>{n}</div>)}
            </div>
            <pre className="code-display text-green-glow"><code>{refactoredCode}</code></pre>
          </div>
        </div>
      </div>

      <style>{`
        .code-refactor {
          display: flex;
          flex-direction: column;
          border-radius: 16px;
          overflow: hidden;
          margin-top: 10px;
        }

        .refactor-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 40px;
          height: 100%;
          text-align: center;
          color: var(--text-muted);
          border-radius: 16px;
        }

        .refactor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-color);
          background: rgba(10, 11, 16, 0.4);
          flex-wrap: wrap;
          gap: 14px;
        }

        .refactor-icon {
          color: var(--color-primary-bright);
        }

        .refactor-header h2 {
          font-size: 15px;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
        }

        .refactor-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .view-toggle {
          display: flex;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 3px;
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .toggle-btn.active {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 500;
          transition: var(--transition-fast);
        }

        .action-btn.copy {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
        }

        .action-btn.copy:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.06);
        }

        .action-btn.apply {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: var(--color-perf);
        }

        .action-btn.apply:hover {
          background: rgba(16, 185, 129, 0.2);
          transform: translateY(-1px);
        }

        .refactor-body {
          display: flex;
          background: rgba(5, 5, 8, 0.5);
          overflow: hidden;
        }

        .refactor-body.refactored {
          flex-direction: column;
        }

        .code-viewer-half {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .refactor-body.split .original {
          border-right: 1px solid var(--border-color);
        }

        .viewer-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
          padding: 10px 20px;
          background: rgba(0, 0, 0, 0.15);
          border-bottom: 1px solid var(--border-color);
        }

        .viewer-label.text-green {
          color: var(--color-perf);
          border-bottom-color: rgba(16, 185, 129, 0.1);
        }

        .code-editor-sim {
          display: flex;
          flex: 1;
          overflow: auto;
          max-height: 500px;
        }

        .code-editor-sim .line-numbers {
          width: 48px;
          background: rgba(5, 5, 8, 0.4);
          border-right: 1px solid var(--border-color);
          padding: 16px 0;
          text-align: right;
          color: var(--text-muted);
          font-family: var(--font-mono);
          font-size: 12px;
          line-height: 20px;
          user-select: none;
          flex-shrink: 0;
        }

        .code-editor-sim .line-numbers div {
          padding-right: 12px;
        }

        .bg-green-line {
          border-right-color: rgba(16, 185, 129, 0.2) !important;
          background: rgba(16, 185, 129, 0.02) !important;
        }

        .code-display {
          flex: 1;
          padding: 16px 20px;
          margin: 0;
          overflow: auto;
        }

        .code-display code {
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 20px;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .text-green-glow {
          background: rgba(16, 185, 129, 0.01);
        }

        .text-green-glow code {
          color: var(--text-primary);
        }
      `}</style>
    </section>
  );
}
