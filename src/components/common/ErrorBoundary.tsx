"use client"

import React, { Component, type ErrorInfo, type ReactNode } from "react"

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("DefenX Uncaught Exception:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#1a0a0d",
            color: "#ffedd5",
            fontFamily: "system-ui, -apple-system, sans-serif",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #2c0e14, #180507)",
              border: "1px solid #7c1a24",
              borderRadius: "20px",
              padding: "40px",
              maxWidth: "520px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            }}
          >
            <h1
              style={{ color: "#ef4444", fontSize: "28px", margin: "0 0 16px" }}
            >
              DefenX Guardrail Intercept
            </h1>
            <p
              style={{
                color: "#fca5a5",
                fontSize: "15px",
                lineHeight: "1.6",
                margin: "0 0 24px",
              }}
            >
              A runtime anomaly occurred within the presentation layer.
              Telemetry daemon and OS containment guards remain active.
            </p>
            <div
              style={{
                background: "rgba(0,0,0,0.4)",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontFamily: "monospace",
                color: "#fecaca",
                textAlign: "left",
                marginBottom: "24px",
                overflowX: "auto",
              }}
            >
              {this.state.error?.message || "Unknown client error"}
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "linear-gradient(135deg, #a62029, #700d14)",
                color: "#fff",
                border: "1px solid #e0b25c",
                borderRadius: "10px",
                padding: "12px 24px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reload Platform
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
