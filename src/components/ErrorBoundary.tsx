import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Ocurrió un error inesperado en la aplicación.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught application error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      let displayDetail = this.state.message;
      try {
        const parsed = JSON.parse(this.state.message);
        if (parsed && typeof parsed.error === 'string') {
          displayDetail = `${parsed.error} (${parsed.operationType ?? 'operación'})`;
        }
      } catch {
        // Non-JSON error message
      }

      return (
        <div className="min-h-screen bg-[#0A0B0D] text-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#14161A] border border-[#F5B700]/40 rounded-lg p-7 space-y-4">
            <p className="text-xs font-semibold text-[#F5B700]">
              MECANICA DAKAR · Error de sistema
            </p>
            <h1 className="font-display text-3xl font-bold">
              No se pudo completar la operación
            </h1>
            <p className="text-sm text-[#C7CBD1] leading-relaxed break-words">
              {displayDetail}
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, message: '' })}
              className="px-5 py-2.5 text-sm font-bold text-[#0A0B0D] bg-[#F5B700] hover:bg-[#FFD028] rounded-md transition-colors cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
