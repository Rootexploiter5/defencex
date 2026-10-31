export interface FeatureContribution {
  feature: string
  zScore: number
  impact: number
  detail: string
}

export interface TelemetrySnapshot {
  cpuUsage: number
  cpuCores: number
  cpuModel: string
  memoryUsage: number
  totalMemoryBytes: number
  freeMemoryBytes: number
  usedMemoryBytes: number
  totalMemoryGB: number
  usedMemoryGB: number
  freeMemoryGB: number
  platform: string
  arch: string
  hostname: string
  username: string
  uptimeSeconds: number
  uptimeFormatted: string
  networkLatencyMs: number
  downloadSpeedMbps: number
  uploadSpeedMbps: number
  anomalyScore: number
  baselineStatus: "learning" | "stable" | "elevated" | "critical"
  featureContributions: FeatureContribution[]
  timestamp: number
}

// Backward-compatible alias for existing frontend references
export type SystemTelemetry = TelemetrySnapshot

export interface TelemetryPoint {
  time: string
  timestamp: number
  cpu: number
  memory: number
  network: number
}

export interface ProcessInfo {
  pid: number
  ppid: number
  name: string
  cpu: string
  cpuPercent: number
  memory: string
  memoryBytes: number
  memoryMB: number
  executablePath: string
  commandLine: string
  riskScore: number
  riskReasons: string[]
  status: "Normal" | "Elevated" | "Warning"
  category: "System" | "Application" | "Service" | "Background"
  verified: boolean
}

// Backward-compatible alias
export type RealProcess = ProcessInfo

export interface NetworkConnection {
  protocol: string
  localAddress: string
  localPort: number
  remoteAddress: string
  remotePort: number
  state: string
  pid: number
  processName?: string
  isSuspicious: boolean
}

// Backward-compatible alias
export type RealTcpConnection = NetworkConnection

export interface RealNetworkInterface {
  name: string
  ip: string
  mac: string
  family: string
  type: string
  status: "Active" | "Quarantined" | "Internal"
}

export interface ThreatAlert {
  id: string
  timestamp: number
  time: string
  title: string
  detail: string
  severity: "High" | "Medium" | "Low"
  type: "danger" | "warning" | "info"
  symbol: string
  status: "Active" | "Reviewed" | "Quarantined" | "Dismissed"
  mitreTactic: string
  pid?: number
  remoteIp?: string
  anomalyBreakdown: string
  containmentAction?: string
  reviewed: boolean
  source: string
  description: string
}

// Backward-compatible alias
export type RealAlert = ThreatAlert

export interface ForensicEvent {
  id: string
  timestamp: number
  time: string
  actor: string
  category: "Process" | "Network" | "Analysis" | "System" | "Security"
  action: string
  target: string
  status: "Success" | "Failed" | "Blocked" | "Quarantined" | "Warning" | "Contained" | "Normal" | "Verified" | "Review"
  metadata?: Record<string, unknown>
  event: string
  source: string
  result: "Contained" | "Blocked" | "Review" | "Normal" | "Verified"
}

// Backward-compatible alias
export type RealEvent = ForensicEvent

export interface LoadBalancerNode {
  name: string
  region: string
  latencyMs: number
  loadPercent: number
  status: "Healthy" | "Degraded" | "Offline"
  reqPerSec: number
}

export interface SystemErrorLog {
  id: string
  timestamp: number
  time: string
  level: "error" | "warn" | "info"
  context: string
  message: string
  stack?: string
  metadata?: Record<string, unknown>
}

export interface ContainmentResult {
  success: boolean
  mode: "live" | "dry-run"
  targetType: "process" | "ip"
  targetValue: string | number
  message: string
  timestamp: number
}

export interface MitreTechnique {
  id: string
  tactic: string
  name: string
  description: string
  detected: boolean
  alertCount: number
  pids?: number[]
}

export interface PlaybookPolicy {
  id: string
  name: string
  description: string
  enabled: boolean
  condition: "high_entropy" | "c2_socket" | "anomaly_spike" | "shadow_purge"
  action: "quarantine_process" | "block_ip" | "alert_analyst"
  triggerCount: number
  lastTriggered?: number
}


