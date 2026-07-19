import { useRef, useState } from 'react';
import { Upload, Play, RefreshCw, FileText, Code } from 'lucide-react';
import { EXAMPLES } from '../services/examples';
import type { CodeExample } from '../services/examples';

interface CodeWorkspaceProps {
  code: string;
  onChangeCode: (code: string) => void;
  onRunDiagnosis: () => void;
  isLoading: boolean;
}

export default function CodeWorkspace({
  code,
  onChangeCode,
  onRunDiagnosis,
  isLoading,
}: CodeWorkspaceProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleExampleClick = (example: CodeExample) => {
    onChangeCode(example.code);
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onChangeCode(e.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Simple line numbers helper
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <section className="code-workspace glass-panel">
      <div className="workspace-header">
        <div className="title-block">
          <Code size={18} className="workspace-icon" />
          <h2>Component Input</h2>
        </div>
        <div className="example-selectors">
          <span className="label">Try Examples:</span>
          {EXAMPLES.map(ex => (
            <button
              key={ex.id}
              className="example-pill"
              onClick={() => handleExampleClick(ex)}
              title={ex.description}
            >
              {ex.name.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="editor-controls">
        <button 
          className="control-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Upload component file"
        >
          <Upload size={14} />
          <span>Upload File</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".js,.jsx,.ts,.tsx,.json"
          style={{ display: 'none' }}
        />
        {code && (
          <button 
            className="control-btn clear"
            onClick={() => onChangeCode('')}
          >
            <RefreshCw size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div 
        className={`editor-wrapper ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="line-numbers">
          {lineNumbers.map(n => (
            <div key={n} className="line-number">{n}</div>
          ))}
        </div>
        
        <textarea
          className="editor-textarea"
          value={code}
          onChange={(e) => onChangeCode(e.target.value)}
          placeholder={`// Paste your React component here or drag and drop a file...\n\nexport default function MyComponent() {\n  return <div>Hello World</div>;\n}`}
          spellCheck="false"
        />

        {isDragOver && (
          <div className="dropzone-overlay">
            <div className="dropzone-box">
              <Upload size={32} className="overlay-icon" />
              <p>Drop React component file here</p>
            </div>
          </div>
        )}
      </div>

      <div className="workspace-footer">
        <div className="code-stats">
          <FileText size={12} />
          <span>{code.length} characters</span>
          <span className="dot">•</span>
          <span>{lineCount} lines</span>
        </div>

        <button 
          className="diagnose-button pulse-border"
          onClick={onRunDiagnosis}
          disabled={isLoading || !code.trim()}
        >
          {isLoading ? (
            <>
              <RefreshCw size={16} className="spin-icon" />
              <span>Analyzing Component...</span>
            </>
          ) : (
            <>
              <Play size={16} />
              <span>Run AI Diagnostics</span>
            </>
          )}
        </button>
      </div>

      <style>{`
        .code-workspace {
          display: flex;
          flex-direction: column;
          height: 600px;
          overflow: hidden;
        }

        .workspace-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .title-block {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .workspace-icon {
          color: var(--color-primary);
        }

        .workspace-header h2 {
          font-size: 15px;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
        }

        .example-selectors {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .example-selectors .label {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
          text-transform: uppercase;
        }

        .example-pill {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .example-pill:hover {
          color: var(--text-primary);
          background: rgba(139, 92, 246, 0.08);
          border-color: var(--border-hover);
        }

        .editor-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          background: rgba(10, 11, 16, 0.4);
          border-bottom: 1px solid var(--border-color);
        }

        .control-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .control-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.06);
        }

        .control-btn.clear:hover {
          color: var(--color-security);
          background: rgba(244, 63, 94, 0.08);
          border-color: rgba(244, 63, 94, 0.2);
        }

        .editor-wrapper {
          flex: 1;
          display: flex;
          position: relative;
          background: rgba(5, 5, 8, 0.4);
          overflow: hidden;
        }

        .line-numbers {
          width: 48px;
          background: rgba(5, 5, 8, 0.6);
          border-right: 1px solid var(--border-color);
          padding: 16px 0;
          text-align: right;
          color: var(--text-muted);
          font-family: var(--font-mono);
          font-size: 12px;
          line-height: 20px;
          user-select: none;
          overflow: hidden;
        }

        .line-number {
          padding-right: 12px;
        }

        .editor-textarea {
          flex: 1;
          background: transparent;
          border: none;
          resize: none;
          color: var(--text-primary);
          font-family: var(--font-mono);
          font-size: 13px;
          line-height: 20px;
          padding: 16px 20px;
          outline: none;
          overflow-y: auto;
        }

        .editor-textarea::placeholder {
          color: var(--text-muted);
          opacity: 0.7;
        }

        .dropzone-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(10, 11, 16, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 10;
        }

        .dropzone-box {
          border: 2px dashed var(--color-primary);
          border-radius: 12px;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(139, 92, 246, 0.03);
          color: var(--text-primary);
          gap: 12px;
        }

        .overlay-icon {
          color: var(--color-primary-bright);
          animation: bounce 1.5s infinite;
        }

        .workspace-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-top: 1px solid var(--border-color);
          background: rgba(10, 11, 16, 0.5);
        }

        .code-stats {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .code-stats .dot {
          opacity: 0.5;
        }

        .diagnose-button {
          background: linear-gradient(135deg, var(--color-primary) 0%, #6d28d9 100%);
          color: white;
          font-weight: 600;
          font-size: 14px;
          padding: 10px 20px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        }

        .diagnose-button:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--color-primary-bright) 0%, var(--color-primary) 100%);
          transform: translateY(-1px);
        }

        .diagnose-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .spin-icon {
          animation: spin 1s infinite linear;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </section>
  );
}
