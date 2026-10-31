import { SystemErrorLog } from "@/types/defenx"

// Maximum number of entries kept in memory ring buffer
const MAX_ERROR_LOGS = 150

// Use globalThis to persist ring buffer across Next.js Turbopack / HMR reloads
const globalLogger = globalThis as unknown as {
  __defenx_error_logs?: SystemErrorLog[]
}

if (!globalLogger.__defenx_error_logs) {
  globalLogger.__defenx_error_logs = [
    {
      id: "init-0",
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      level: "info",
      context: "SystemEngine",
      message: "DefenX v2.0 Structured Telemetry & Diagnostics initialized",
    },
  ]
}

const ringBuffer: SystemErrorLog[] = globalLogger.__defenx_error_logs

export function logError(
  context: string,
  error: unknown,
  metadata?: Record<string, unknown>,
): void {
  const errObj = error instanceof Error ? error : new Error(String(error))
  const entry: SystemErrorLog = {
    id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    level: "error",
    context,
    message: errObj.message || "Unknown error",
    stack: errObj.stack,
    metadata,
  }

  ringBuffer.unshift(entry)
  if (ringBuffer.length > MAX_ERROR_LOGS) {
    ringBuffer.pop()
  }

  // Also print to console for terminal diagnostics
  console.error(`[DefenX Logger][${context}]`, errObj.message, metadata || "")
}

export function logWarn(
  context: string,
  message: string,
  metadata?: Record<string, unknown>,
): void {
  const entry: SystemErrorLog = {
    id: `warn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    level: "warn",
    context,
    message,
    metadata,
  }

  ringBuffer.unshift(entry)
  if (ringBuffer.length > MAX_ERROR_LOGS) {
    ringBuffer.pop()
  }

  console.warn(`[DefenX Logger][${context}]`, message)
}

export function logInfo(
  context: string,
  message: string,
  metadata?: Record<string, unknown>,
): void {
  const entry: SystemErrorLog = {
    id: `info-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    level: "info",
    context,
    message,
    metadata,
  }

  ringBuffer.unshift(entry)
  if (ringBuffer.length > MAX_ERROR_LOGS) {
    ringBuffer.pop()
  }
}

export function getRecentSystemErrors(): SystemErrorLog[] {
  return [...ringBuffer]
}

export function clearSystemErrors(): void {
  ringBuffer.length = 0
}
