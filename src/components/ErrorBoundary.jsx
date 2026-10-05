import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Check if it's a dynamic import failure (new version deployed while user had app open, or network error)
    const errorMsg = error?.message?.toLowerCase() || '';
    const isChunkLoadError = error?.name === 'ChunkLoadError' || 
      errorMsg.includes('failed to fetch dynamically imported module') ||
      errorMsg.includes('importing a module script failed') ||
      errorMsg.includes('networkerror') ||
      errorMsg.includes('network error') ||
      errorMsg.includes('failed to fetch') ||
      errorMsg.includes('load failed');

    if (isChunkLoadError) {
      const reloadKey = 'chunk_reload_attempt';
      const lastReload = sessionStorage.getItem(reloadKey);
      
      // Auto-reload to fetch the new code, but prevent infinite reload loops (wait at least 10s before trying again)
      if (!lastReload || Date.now() - parseInt(lastReload) > 10000) {
        sessionStorage.setItem(reloadKey, Date.now().toString());
        window.location.reload();
        return;
      }
    }

    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-rose-100 p-6 text-center">
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-500 text-sm font-medium mb-6">
              An unexpected error occurred. Please try reloading the page.
            </p>

            <details className="text-left mb-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
              <summary className="text-xs font-bold text-slate-500 cursor-pointer uppercase tracking-wider">
                Error Details
              </summary>
              <pre className="mt-3 text-[11px] text-rose-700 whitespace-pre-wrap break-words font-mono">
                {this.state.error && this.state.error.toString()}
              </pre>
            </details>

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-sm border border-slate-200 transition-all"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
