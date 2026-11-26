import React from 'react';
import { AlertTriangle, RotateCcw, Copy, Check } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, copied: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Apon ErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleCopy = () => {
    const errorDetails = [
      `Apon Runtime Error: ${this.state.error?.toString() || 'Unknown error'}`,
      `Message: ${this.state.error?.message || ''}`,
      `Stack:\n${this.state.error?.stack || ''}`,
      `Component Stack:\n${this.state.errorInfo?.componentStack || ''}`,
      `Time: ${new Date().toISOString()}`,
      `User Agent: ${navigator.userAgent}`
    ].join('\n\n');

    navigator.clipboard?.writeText(errorDetails);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#0F172A] text-slate-100 p-6 select-none font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Apon Runtime Error</h1>
            <p className="text-sm text-slate-400 mb-4">
              An unexpected error prevented the application from rendering normally.
            </p>

            <div className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-left mb-5 overflow-auto max-h-52 text-xs font-mono text-red-300">
              <p className="font-semibold text-red-400 mb-1 break-words">
                {this.state.error?.toString() || 'Unknown Runtime Exception'}
              </p>
              {this.state.error?.stack && (
                <p className="text-slate-500 whitespace-pre-wrap break-all text-[11px] leading-relaxed">
                  {this.state.error.stack}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 w-full">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm transition-colors shadow-lg shadow-sky-500/20 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Reload App
              </button>
              <button
                onClick={this.handleCopy}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors border border-slate-700 active:scale-95"
                title="Copy error details"
              >
                {this.state.copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {this.state.copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
