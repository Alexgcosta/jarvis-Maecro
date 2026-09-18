import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  name?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('macrodesk_current_view');
    } catch (e) {}
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 w-full">
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 shadow-2xl max-w-lg w-full text-center flex flex-col items-center gap-4">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 mb-1">
                {this.props.fallbackTitle || 'Falha ao renderizar este painel'}
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ocorreu uma oscilação na montagem dos dados em tempo real. Clique abaixo para restaurar os painéis padrão.
              </p>
              {this.state.error?.message && (
                <div className="mt-3 p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] font-mono text-rose-300/80 text-left overflow-x-auto max-h-24">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Restaurar Painéis
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
