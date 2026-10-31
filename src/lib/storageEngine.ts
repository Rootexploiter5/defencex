import fs from "node:fs"
import path from "node:path"
import { ThreatAlert, ForensicEvent } from "@/types/defenx"
import { logError, logInfo } from "./logger"

export interface BaselineMetricStats {
  mean: number
  variance: number
  stdDev: number
  count: number
  lastUpdated: number
}

export interface BaselineRecord {
  features: Record<string, BaselineMetricStats>
  sampleCount: number
  lastUpdated: number
  status: "learning" | "stable" | "elevated" | "critical"
}

const DATA_DIR = path.join(process.cwd(), "data")
const ALERTS_FILE = path.join(DATA_DIR, "alerts.json")
const FORENSICS_FILE = path.join(DATA_DIR, "forensics.json")
const BASELINE_FILE = path.join(DATA_DIR, "baseline.json")

interface GlobalStorageState {
  alerts: ThreatAlert[] | null
  forensics: ForensicEvent[] | null
  baseline: BaselineRecord | null
}

const globalStorage = globalThis as unknown as {
  __defenx_storage?: GlobalStorageState
}

if (!globalStorage.__defenx_storage) {
  globalStorage.__defenx_storage = {
    alerts: null,
    forensics: null,
    baseline: null,
  }
}

const state = globalStorage.__defenx_storage

function ensureDataDir(): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    return true
  } catch (err) {
    logError("StorageEngine.ensureDataDir", err)
    return false
  }
}

function atomicWriteJson<T>(filePath: string, data: T): void {
  try {
    if (!ensureDataDir()) return
    const content = JSON.stringify(data, null, 2)
    const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}.tmp`
    fs.writeFileSync(tempPath, content, "utf-8")
    fs.renameSync(tempPath, filePath)
  } catch (err) {
    // Fallback: direct write if rename fails on Windows file locks
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
    } catch (innerErr) {
      logError(
        `StorageEngine.atomicWriteJson(${path.basename(filePath)})`,
        innerErr,
      )
    }
  }
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8")
      return JSON.parse(raw) as T
    }
  } catch (err) {
    logError(`StorageEngine.readJsonFile(${path.basename(filePath)})`, err)
  }
  return fallback
}

// Default initial alerts for security monitoring
function getInitialAlerts(): ThreatAlert[] {
  const now = Date.now()
  return [
    {
      id: "alert-baseline-init",
      timestamp: now - 120000,
      time: "2m ago",
      title: "Host Behavioral Anomaly Baseline Initialized",
      detail:
        "Adaptive EWMA baselining active across CPU, memory delta, and network sockets",
      severity: "Low",
      type: "info",
      symbol: "i",
      status: "Reviewed",
      mitreTactic: "Discovery (T1082)",
      anomalyBreakdown:
        "Baseline calibrating across 5 behavioral telemetry dimensions",
      reviewed: true,
      source: "BehavioralEngine",
      description:
        "DefenX v2.0 neural behavioral monitor is building real-time statistical distributions for this host.",
    },
    {
      id: "alert-containment-guard",
      timestamp: now - 60000,
      time: "1m ago",
      title: "Safe-Mode Containment Guard Verified",
      detail:
        "Critical Windows OS processes protected with immutable system whitelist",
      severity: "Medium",
      type: "warning",
      symbol: "△",
      status: "Active",
      mitreTactic: "Defense Evasion (T1562)",
      anomalyBreakdown:
        "Safe-Mode active (dry-run enforcement). Live firewall & process kill gated.",
      reviewed: false,
      source: "ContainmentGuard",
      description:
        "Dry-run safe mode is enabled by default to prevent accidental system interruption during threat assessment.",
    },
  ]
}

// Default initial forensics events
function getInitialForensics(): ForensicEvent[] {
  const now = Date.now()
  const t = (offsetSec: number) =>
    new Date(now - offsetSec * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

  return [
    {
      id: `fe-${now}-1`,
      timestamp: now - 300000,
      time: t(300),
      actor: "DefenX Core Daemon",
      category: "System",
      action: "DAEMON_STARTUP",
      target: "Windows Host",
      status: "Success",
      event: "DefenX v2.0 CIM Telemetry Daemon initialized",
      source: "collectorDaemon",
      result: "Normal",
    },
    {
      id: `fe-${now}-2`,
      timestamp: now - 180000,
      time: t(180),
      actor: "Anomaly Model",
      category: "Analysis",
      action: "BASELINE_CALIBRATION",
      target: "Rolling EWMA Store",
      status: "Verified",
      event:
        "Behavioral anomaly baseline calibrated for host processes and sockets",
      source: "anomalyEngine",
      result: "Verified",
    },
    {
      id: `fe-${now}-3`,
      timestamp: now - 60000,
      time: t(60),
      actor: "Containment Engine",
      category: "Security",
      action: "SAFE_MODE_CHECK",
      target: "OS Firewall & Process Manager",
      status: "Contained",
      event:
        "Containment safe-mode verified. Protected system whitelist loaded.",
      source: "containmentEngine",
      result: "Contained",
    },
  ]
}

export function loadAlerts(): ThreatAlert[] {
  if (state.alerts) return state.alerts
  const fromDisk = readJsonFile<ThreatAlert[]>(ALERTS_FILE, [])
  if (fromDisk.length > 0) {
    state.alerts = fromDisk
  } else {
    state.alerts = getInitialAlerts()
    atomicWriteJson(ALERTS_FILE, state.alerts)
  }
  return state.alerts
}

export function saveAlerts(alerts: ThreatAlert[]): void {
  state.alerts = alerts
  atomicWriteJson(ALERTS_FILE, alerts)
}

export function saveAlert(alert: ThreatAlert): void {
  const alerts = loadAlerts()
  const existingIdx = alerts.findIndex((a) => a.id === alert.id)
  if (existingIdx >= 0) {
    alerts[existingIdx] = alert
  } else {
    alerts.unshift(alert)
  }
  if (alerts.length > 100) alerts.pop()
  saveAlerts(alerts)
}

export function updateAlertStatus(
  alertId: string,
  status: ThreatAlert["status"],
  containmentAction?: string,
): boolean {
  const alerts = loadAlerts()
  const target = alerts.find((a) => a.id === alertId)
  if (target) {
    target.status = status
    target.reviewed =
      status === "Reviewed" ||
      status === "Quarantined" ||
      status === "Dismissed"
    if (containmentAction) {
      target.containmentAction = containmentAction
    }
    saveAlerts(alerts)
    return true
  }
  return false
}

export function loadForensics(): ForensicEvent[] {
  if (state.forensics) return state.forensics
  const fromDisk = readJsonFile<ForensicEvent[]>(FORENSICS_FILE, [])
  if (fromDisk.length > 0) {
    state.forensics = fromDisk
  } else {
    state.forensics = getInitialForensics()
    atomicWriteJson(FORENSICS_FILE, state.forensics)
  }
  return state.forensics
}

export function appendForensicEvent(eventData: {
  actor?: string
  category?: ForensicEvent["category"]
  action: string
  target: string
  status?: ForensicEvent["status"]
  event: string
  source: string
  result?: ForensicEvent["result"]
  metadata?: Record<string, unknown>
}): ForensicEvent {
  const forensics = loadForensics()
  const now = Date.now()
  const time = new Date(now).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  const newEntry: ForensicEvent = {
    id: `fe-${now}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: now,
    time,
    actor: eventData.actor || "Security Analyst",
    category: eventData.category || "Security",
    action: eventData.action,
    target: eventData.target,
    status: eventData.status || "Success",
    event: eventData.event,
    source: eventData.source,
    result: eventData.result || "Normal",
    metadata: eventData.metadata,
  }

  forensics.unshift(newEntry)
  if (forensics.length > 250) {
    forensics.pop()
  }

  state.forensics = forensics
  atomicWriteJson(FORENSICS_FILE, forensics)
  logInfo(
    "StorageEngine.appendForensicEvent",
    `${newEntry.action}: ${newEntry.target}`,
  )
  return newEntry
}

export function saveForensics(events: ForensicEvent[]): void {
  state.forensics = events
  atomicWriteJson(FORENSICS_FILE, events)
}

export function loadBaseline(): BaselineRecord | null {
  if (state.baseline) return state.baseline
  const fromDisk = readJsonFile<BaselineRecord | null>(BASELINE_FILE, null)
  if (fromDisk) {
    state.baseline = fromDisk
  }
  return state.baseline
}

export function saveBaseline(baseline: BaselineRecord): void {
  state.baseline = baseline
  atomicWriteJson(BASELINE_FILE, baseline)
}
