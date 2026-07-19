import { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import type { HistoryItem } from './components/Sidebar';
import CodeWorkspace from './components/CodeWorkspace';
import ReportDashboard from './components/ReportDashboard';
import CodeRefactorPane from './components/CodeRefactorPane';
import SettingsModal from './components/SettingsModal';
import { analyzeReactComponent } from './services/analyzer';
import { EXAMPLES } from './services/examples';
import type { DiagnosticResult } from './services/examples';

export default function App() {
  const [code, setCode] = useState<string>('');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [model, setModel] = useState<string>('gemini-2.5-flash');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load config & history from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('react_doctor_gemini_key');
    if (savedKey) setApiKey(savedKey);

    const savedModel = localStorage.getItem('react_doctor_gemini_model');
    if (savedModel) setModel(savedModel);

    const savedHistory = localStorage.getItem('react_doctor_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error parsing history", e);
      }
    }

    // Load initial code example
    setCode(EXAMPLES[0].code);
  }, []);

  const handleSaveApiKey = (key: string) => {
    if (key) {
      localStorage.setItem('react_doctor_gemini_key', key);
      setApiKey(key);
    } else {
      localStorage.removeItem('react_doctor_gemini_key');
      setApiKey(null);
    }
  };

  const handleChangeModel = (newModel: string) => {
    localStorage.setItem('react_doctor_gemini_model', newModel);
    setModel(newModel);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('react_doctor_history');
    setHistory([]);
    setSelectedHistoryId(null);
  };

  const handleSelectHistory = (id: string) => {
    const historyItem = history.find(item => item.id === id);
    if (historyItem) {
      setSelectedHistoryId(id);
      setCode(historyItem.result.refactoredCode || '');
      setDiagnosticResult(historyItem.result);
      setErrorMessage(null);
    }
  };

  const handleApplyRefactor = (newCode: string) => {
    setCode(newCode);
  };

  const runDiagnostics = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setDiagnosticResult(null);

    try {
      const result = await analyzeReactComponent(code, apiKey, model);
      setDiagnosticResult(result);

      // Extract a plausible component name from the code
      let componentName = 'ReactComponent';
      const functionMatch = code.match(/export\s+default\s+(?:function|class)\s+([a-zA-Z0-9_]+)/) ||
                            code.match(/(?:const|function|class)\s+([a-zA-Z0-9_]+)\s*=\s*(?:React\.)?(?:memo|forwardRef)?\(/) ||
                            code.match(/export\s+default\s+([a-zA-Z0-9_]+)/);
      if (functionMatch && functionMatch[1]) {
        componentName = functionMatch[1];
      } else {
        // Fallback to checking line 1
        const firstLine = code.split('\n')[0];
        if (firstLine.includes('function') || firstLine.includes('const')) {
          const wordMatch = firstLine.match(/(?:const|function)\s+([a-zA-Z0-9_]+)/);
          if (wordMatch && wordMatch[1]) componentName = wordMatch[1];
        }
      }

      // Add to history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
        componentName,
        score: result.score,
        result
      };

      const updatedHistory = [newHistoryItem, ...history].slice(0, 20); // Keep max 20 items
      setHistory(updatedHistory);
      localStorage.setItem('react_doctor_history', JSON.stringify(updatedHistory));
      setSelectedHistoryId(newHistoryItem.id);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during diagnosis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        history={history}
        selectedHistoryId={selectedHistoryId}
        onSelectHistory={handleSelectHistory}
        onClearHistory={handleClearHistory}
      />

      <main className="main-content">
        <Header
          onOpenSettings={() => setIsSettingsOpen(true)}
          apiKey={apiKey}
          model={model}
        />

        <div className="dashboard-grid">
          {errorMessage && (
            <div className="error-banner full-width-grid">
              <span className="error-title">Diagnostic Error:</span> {errorMessage}
            </div>
          )}

          <CodeWorkspace
            code={code}
            onChangeCode={(newCode) => {
              setCode(newCode);
              setSelectedHistoryId(null);
            }}
            onRunDiagnosis={runDiagnostics}
            isLoading={isLoading}
          />

          <ReportDashboard result={diagnosticResult} />

          <CodeRefactorPane
            refactoredCode={diagnosticResult?.refactoredCode}
            originalCode={code}
            onApplyRefactor={handleApplyRefactor}
          />
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        model={model}
        onChangeModel={handleChangeModel}
      />

      <style>{`
        .error-banner {
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.25);
          color: #fda4af;
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 13.5px;
        }

        .error-banner .error-title {
          font-weight: 700;
          color: var(--color-security);
        }
      `}</style>
    </div>
  );
}
