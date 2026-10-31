/**
 * Shared formatting and styling utilities for DefenX v2.0
 */

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"]
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k))
  const idx = Math.min(i, sizes.length - 1)
  return `${parseFloat((bytes / Math.pow(k, idx)).toFixed(dm))} ${sizes[idx]}`
}

export function formatUptime(seconds: number): string {
  if (!seconds || seconds < 0) return "0s"
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  if (days > 0) return `${days}d ${hours}h ${mins}m`
  if (hours > 0) return `${hours}h ${mins}m`
  if (mins > 0) return `${mins}m ${secs}s`
  return `${secs}s`
}

export function formatTimestamp(ts: number | string | Date): string {
  const date =
    typeof ts === "number" || typeof ts === "string" ? new Date(ts) : ts
  if (isNaN(date.getTime())) return "Unknown"
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function formatDateFull(ts: number | string | Date): string {
  const date =
    typeof ts === "number" || typeof ts === "string" ? new Date(ts) : ts
  if (isNaN(date.getTime())) return "Unknown"
  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function getSeverityBadgeColor(
  severity: "High" | "Medium" | "Low" | string,
): {
  bg: string
  text: string
  border: string
  dot: string
} {
  switch (severity?.toLowerCase()) {
    case "critical":
    case "high":
      return {
        bg: "rgba(220, 38, 38, 0.15)",
        text: "#ef4444",
        border: "rgba(220, 38, 38, 0.35)",
        dot: "#ef4444",
      }
    case "medium":
    case "warning":
    case "elevated":
      return {
        bg: "rgba(234, 179, 8, 0.15)",
        text: "#eab308",
        border: "rgba(234, 179, 8, 0.35)",
        dot: "#eab308",
      }
    case "low":
    case "info":
    default:
      return {
        bg: "rgba(59, 130, 246, 0.15)",
        text: "#3b82f6",
        border: "rgba(59, 130, 246, 0.35)",
        dot: "#3b82f6",
      }
  }
}

export function getRiskColor(riskScore: number): string {
  if (riskScore >= 75) return "#ef4444"
  if (riskScore >= 45) return "#f59e0b"
  if (riskScore >= 20) return "#3b82f6"
  return "#10b981"
}

export function getRiskLabel(riskScore: number): string {
  if (riskScore >= 75) return "CRITICAL"
  if (riskScore >= 45) return "HIGH"
  if (riskScore >= 20) return "MEDIUM"
  return "LOW"
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num)
}

export function truncate(str: string, maxLength: number): string {
  if (!str) return ""
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + "..."
}
