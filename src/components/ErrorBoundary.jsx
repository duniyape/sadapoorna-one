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
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-rose-100 p-8 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8 text-rose-600" />
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
