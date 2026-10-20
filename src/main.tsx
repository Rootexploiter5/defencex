import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('DefenX Uncaught Exception:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1a0a0d',
            color: '#ffedd5',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #2c0e14, #180507)',
              border: '1px solid #7c1a24',
              borderRadius: '20px',
              padding: '36px',
              maxWidth: '520px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
          >
            <h2 style={{ color: '#ff6b7a', fontSize: '24px', marginBottom: '12px' }}>
              System Exception Intercepted
            </h2>
            <p
              style={{
                color: '#d8b4b8',
                fontSize: '14px',
                lineHeight: '1.6',
                marginBottom: '20px',
              }}
            >
              DefenX containment caught an unexpected runtime error.
            </p>
            <pre
              style={{
                background: '#0d0204',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#fca5a5',
                overflowX: 'auto',
                textAlign: 'left',
                marginBottom: '20px',
              }}
            >
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #a81c2d, #6c0a15)',
                color: '#fff',
                border: '1px solid #e05d6b',
                padding: '10px 24px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Restart DefenX Shield
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
