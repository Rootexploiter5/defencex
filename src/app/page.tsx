"use client"

import App from "@/App"
import { ErrorBoundary } from "@/components/common/ErrorBoundary"

export default function Page() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  )
}
