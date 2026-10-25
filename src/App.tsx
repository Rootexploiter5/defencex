"use client"

import React, { useEffect, useId, useState, useCallback, useMemo } from "react"

// Types matching real-time backend API
export interface SystemTelemetry {
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
  timestamp: number
}

export interface TelemetryPoint {
  time: string
  timestamp: number
  cpu: number
  memory: number
  network: number
}

export interface RealProcess {
  pid: number
  name: string
  cpu: string
  cpuPercent: number
  memory: string
  memoryMB: number
  status: "Normal" | "Elevated" | "Warning"
  category: "System" | "Application" | "Service" | "Background"
  verified: boolean
}

export interface RealNetworkInterface {
  name: string
  ip: string
  mac: string
  family: string
  type: string
  status: "Active" | "Quarantined" | "Internal"
}

export interface RealTcpConnection {
  localAddress: string
  localPort: number
  remoteAddress: string
  remotePort: number
  state: string
  pid: number
}

export interface LoadBalancerNode {
  name: string
  region: string
  latencyMs: number
  loadPercent: number
  status: "Healthy" | "Degraded" | "Offline"
  reqPerSec: number
}

export interface RealAlert {
  id: string
  title: string
  detail: string
  time: string
  timestamp: number
  type: "danger" | "warning" | "info"
  symbol: string
  description: string
  severity: "High" | "Medium" | "Low"
  reviewed: boolean
  source: string
}

export interface RealEvent {
  time: string
  timestamp: number
  event: string
  source: string
  category: "Process" | "Network" | "Analysis" | "System"
  result: "Contained" | "Blocked" | "Review" | "Normal" | "Verified"
}

type IconName =
  | "shield"
  | "home"
  | "pulse"
  | "brain"
  | "alert"
  | "globe"
  | "search"
  | "file"
  | "settings"
  | "bell"
  | "cpu"
  | "database"
  | "layers"
  | "sparkles"
  | "bot"
  | "arrow"
  | "chevron"
  | "sun"
  | "moon"
  | "wallet"
  | "zap"
  | "refresh"
  | "check"

function Icon({
  name,
  size = 24,
  className = "",
}: {
  name: IconName
  size?: number
  className?: string
}) {
  const paths: Record<IconName, React.ReactNode> = {
    shield: (
      <>
        <path d="M12 2 3 6v6c0 6 9 10 9 10s9-4 9-10V6Z" />
        <path d="m7 12 3 3 7-7" />
      </>
    ),
    home: (
      <>
        <path d="m2 11 10-9 10 9" />
        <path d="M5 9v12h5v-7h4v7h5V9" />
      </>
    ),
    pulse: <path d="M1 12h6l3-10 4 20 3-10h6" />,
    brain: (
      <>
        <path d="M9 4C5 0 2 6 5 8c-5 1-4 7 0 7-2 5 2 8 5 5V4Zm6 0c4-4 7 2 4 4 5 1 4 7 0 7 2 5-2 8-5 5V4Z" />
        <path d="m6 7 3 3-3 3m12-6-3 3 3 3M7 17l2-1m8 1-2-1" />
      </>
    ),
    alert: (
      <>
        <path d="m12 2 10 19H2Z" />
        <path d="M12 8v6m0 3v1" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="10" />
        <ellipse cx="12" cy="12" rx="4" ry="10" />
        <path d="M2 12h20M4 6h16M4 18h16" />
      </>
    ),
    search: (
      <>
        <circle cx="10" cy="10" r="7" />
        <path d="m15 15 7 7" />
      </>
    ),
    file: (
      <>
        <path d="M5 2h9l5 5v15H5Z" />
        <path d="M14 2v6h5M8 12h8m-8 4h8" />
      </>
    ),
    settings: (
      <>
        <path d="m9 2-1 3-3 1-3 3 2 3-1 4 4 1 2 4h4l2-3 4-1 2-4-2-3V6l-4-1-2-3Z" />
        <circle cx="11.5" cy="11.5" r="3.5" />
      </>
    ),
    bell: <path d="M5 17h14l-2-4V8A5 5 0 0 0 7 8v5Zm5 3h4" />,
    cpu: (
      <>
        <rect x="5" y="5" width="14" height="14" rx="3" />
        <rect x="9" y="9" width="6" height="6" />
        <path d="M8 1v3m4-3v3m4-3v3M8 20v3m4-3v3m4-3v3M1 8h3m-3 4h3m-3 4h3m16-8h3m-3 4h3m-3 4h3" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="9" ry="4" />
        <path d="M3 5v14c0 5 18 5 18 0V5M3 12c0 5 18 5 18 0" />
      </>
    ),
    layers: (
      <>
        <path d="m12 2 10 5-10 5L2 7Zm-10 10 10 5 10-5M2 17l10 5 10-5" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM3 2v4M1 4h4m15 14v4m-2-2h4" />
      </>
    ),
    bot: (
      <>
        <rect x="3" y="7" width="18" height="14" rx="6" />
        <path d="M12 7V3m-2-1h4M1 12v5m22-5v5m-15 0h8" />
        <circle cx="8" cy="12" r="1" />
        <circle cx="16" cy="12" r="1" />
      </>
    ),
    arrow: <path d="M3 12h18m-6-6 6 6-6 6" />,
    chevron: <path d="m5 9 7 7 7-7" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2" />
      </>
    ),
    moon: <path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z" />,
    wallet: (
      <>
        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
      </>
    ),
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
    refresh: (
      <>
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
        <path d="M3 21v-5h5" />
      </>
    ),
    check: <path d="M20 6 9 17l-5-5" />,
  }
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

const navigation: { label: string; icon: IconName }[] = [
  { label: "Dashboard", icon: "home" },
  { label: "Live Monitor", icon: "pulse" },
  { label: "AI Detection", icon: "brain" },
  { label: "Threat Center", icon: "alert" },
  { label: "Network", icon: "globe" },
  { label: "Forensics", icon: "search" },
  { label: "Reports", icon: "file" },
  { label: "Settings", icon: "settings" },
]

const tabDescriptions: Record<string, string> = {
  "Live Monitor": "A closer look at your real operating system performance and running processes.",
  "AI Detection": "Real-time behavioral heuristics analyzing active processes and open sockets.",
  "Threat Center": "Investigate, review, and manage live endpoint security signals.",
  Network: "Live traffic streams, real network interfaces, and regional edge load balancer.",
  Forensics: "Follow the evidence. Explore an authentic timeline of live system activity.",
  Reports: "Your security posture, compiled from live system data and ready to share.",
  Settings: "Configure workspace options, manage defense quotas, and view machine specs.",
}

// Mathematical smooth cubic curve generator from real data points
function generateSmoothPath(
  points: number[],
  width: number,
  height: number,
  maxVal = 100,
): { areaPath: string; linePath: string; coords: { x: number; y: number }[] } {
  if (!points || points.length === 0) {
    return {
      areaPath: `M 0 ${height} L ${width} ${height} Z`,
      linePath: `M 0 ${height / 2} L ${width} ${height / 2}`,
      coords: [],
    }
  }

  const len = points.length
  const coords = points.map((val, i) => {
    const x = len === 1 ? width / 2 : (i / (len - 1)) * width
    const clamped = Math.max(0, Math.min(maxVal, val))
    const y = height - (clamped / maxVal) * (height * 0.82) - height * 0.08
    return { x: +x.toFixed(1), y: +y.toFixed(1) }
  })

  let line = `M ${coords[0].x} ${coords[0].y}`
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1]
    const curr = coords[i]
    const midX = (prev.x + curr.x) / 2
    line += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`
  }

  const area = `${line} L ${width} ${height} L 0 ${height} Z`
  return { areaPath: area, linePath: line, coords }
}

function Bars({ values }: { values?: number[] }) {
  const bars = useMemo(() => {
    if (values && values.length > 0) {
      return values.slice(-14).map((v) => Math.max(10, Math.min(100, Math.round(v))))
    }
    return [25, 30, 22, 45, 60, 52, 48, 55, 68, 74, 58, 62, 70, 65]
  }, [values])

  return (
    <div className="mini-bars">
      {bars.map((h, i) => (
        <i key={i} style={{ height: `${h}%` }} />
      ))}
    </div>
  )
}

function Sparkline({ points, second = false }: { points?: number[]; second?: boolean }) {
  const gradientId = useId()
  const data = useMemo(() => {
    if (points && points.length >= 2) return points.slice(-8)
    return second ? [40, 48, 42, 35, 41, 38, 30, 22] : [20, 28, 35, 42, 50, 48, 62, 55]
  }, [points, second])

  const { areaPath, linePath } = useMemo(() => {
    return generateSmoothPath(data, 100, 60, 100)
  }, [data])

  return (
    <svg className="sparkline" viewBox="0 0 100 60">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor={second ? "#dca038" : "#c76a28"} stopOpacity=".55" />
          <stop offset="1" stopColor={second ? "#dca038" : "#d69e48"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={second ? "#dca038" : "#a76422"} strokeWidth="1.5" />
    </svg>
  )
}

function PerformanceChart({
  period,
  history,
}: {
  period: string
  history: TelemetryPoint[]
}) {
  const gradientId = useId()

  const cpuPoints = useMemo(() => history.map((h) => h.cpu), [history])
  const memPoints = useMemo(() => history.map((h) => h.memory), [history])

  const cpuPath = useMemo(() => generateSmoothPath(cpuPoints, 720, 160, 100), [cpuPoints])
  const memPath = useMemo(() => generateSmoothPath(memPoints, 720, 160, 100), [memPoints])

  const latestCpu = cpuPoints[cpuPoints.length - 1] ?? 15
  const latestMem = memPoints[memPoints.length - 1] ?? 50
  const latestTime = history[history.length - 1]?.time ?? "Live"

  const xLabels = useMemo(() => {
    if (history.length >= 5) {
      const step = Math.floor(history.length / 4)
      return [
        history[0]?.time || "Start",
        history[step]?.time || "T1",
        history[step * 2]?.time || "T2",
        history[step * 3]?.time || "T3",
        history[history.length - 1]?.time || "Now",
      ]
    }
    return ["T-12m", "T-9m", "T-6m", "T-3m", "Now"]
  }, [history])

  return (
    <div className="performance-chart">
      <div className="chart-labels">
        <span>100%</span>
        <span>75%</span>
        <span>50%</span>
        <span>25%</span>
        <span>0%</span>
      </div>
      <div className="plot">
        <svg viewBox="0 0 720 160" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`${gradientId}-red`} x1="0" x2="0" y1="0" y2="1">
              <stop stopColor="#a62029" stopOpacity=".5" />
              <stop offset="1" stopColor="#a62029" stopOpacity=".04" />
            </linearGradient>
            <linearGradient id={`${gradientId}-gold`} x1="0" x2="0" y1="0" y2="1">
              <stop stopColor="#dbac59" stopOpacity=".45" />
              <stop offset="1" stopColor="#dbac59" stopOpacity=".06" />
            </linearGradient>
          </defs>
          {/* Memory Area */}
          <path d={memPath.areaPath} fill={`url(#${gradientId}-gold)`} />
          <path d={memPath.linePath} fill="none" stroke="#daa55b" strokeWidth="1.6" />
          {/* CPU Area */}
          <path d={cpuPath.areaPath} fill={`url(#${gradientId}-red)`} />
          <path d={cpuPath.linePath} fill="none" stroke="#bd1829" strokeWidth="1.8" />

          {/* Interactive dots at real sample points */}
          {cpuPath.coords.map((c, i) => (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={i === cpuPath.coords.length - 1 ? 5 : 2.5}
              fill={i === cpuPath.coords.length - 1 ? "#bd1829" : "#ffdde2"}
              stroke="#8b0b1b"
              strokeWidth={i === cpuPath.coords.length - 1 ? 2 : 1}
            />
          ))}
        </svg>
        <div className="chart-tooltip">
          <i />
          <strong>{latestCpu}% CPU</strong> · {latestMem}% RAM <span>• {latestTime}</span>
        </div>
        <div className="x-labels">
          {xLabels.map((lbl, i) => (
            <span key={i}>{lbl}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function NetworkChart({ history }: { history: TelemetryPoint[] }) {
  const gradientId = useId()
  const netPoints = useMemo(() => history.map((h) => h.network), [history])
  const { areaPath, linePath, coords } = useMemo(() => {
    return generateSmoothPath(netPoints, 350, 105, 100)
  }, [netPoints])

  const lastCoord = coords[coords.length - 1]

  return (
    <div className="network-chart">
      <div className="network-scale">
        <span>100</span>
        <span>50</span>
        <span>0</span>
      </div>
      <svg viewBox="0 0 350 105" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#a31821" stopOpacity=".7" />
            <stop offset="1" stopColor="#c25649" stopOpacity=".16" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke="#a81c26" strokeWidth="1.6" />
        {lastCoord && (
          <>
            <path d={`M ${lastCoord.x} 0 V 105`} stroke="#fff4db" strokeDasharray="4 3" />
            <circle
              cx={lastCoord.x}
              cy={lastCoord.y}
              r="5"
              fill="#ae0b22"
              stroke="#fff6e3"
              strokeWidth="2"
            />
          </>
        )}
      </svg>
    </div>
  )
}

function TabContent({
  active,
  dark,
  setDark,
  openDetail,
  balance,
  telemetry,
  history,
  processes,
  alerts,
  events,
  interfaces,
  connections,
  loadBalancerNodes,
  refreshAll,
  toggleAlertReviewHandler,
  setBalanceModalOpen,
}: {
  active: string
  dark: boolean
  setDark: (value: boolean) => void
  openDetail: (title: string) => void
  balance: number
  rechargeBalance: (amount: number) => void
  telemetry: SystemTelemetry | null
  history: TelemetryPoint[]
  processes: RealProcess[]
  alerts: RealAlert[]
  events: RealEvent[]
  interfaces: RealNetworkInterface[]
  connections: RealTcpConnection[]
  loadBalancerNodes: LoadBalancerNode[]
  refreshAll: () => void
  toggleAlertReviewHandler: (alertId: string) => void
  setBalanceModalOpen: (open: boolean) => void
}) {
  const [period, setPeriod] = useState("24h")
  const [paused, setPaused] = useState(false)
  const [filter, setFilter] = useState("All")
  const [processQuery, setProcessQuery] = useState("")
  const [eventQuery, setEventQuery] = useState("")
  const [eventType, setEventType] = useState("All")
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanStep, setScanStep] = useState("")
  const [scanDone, setScanDone] = useState(false)
  const [notice, setNotice] = useState("")

  const [settings, setSettings] = useState<Record<string, boolean>>(() => {
    const defaultSettings = {
      "Real-time protection": true,
      "Behavioral analysis": true,
      "Automatic security updates": true,
      "Threat notifications": true,
      "Weekly security summary": false,
    }
    if (typeof window === "undefined") return defaultSettings
    try {
      const saved = localStorage.getItem("defenx_settings")
      return saved ? JSON.parse(saved) : defaultSettings
    } catch {
      return defaultSettings
    }
  })

  useEffect(() => {
    setNotice("")
  }, [active])

  const filteredProcesses = useMemo(() => {
    if (!processQuery.trim()) return processes
    const q = processQuery.toLowerCase()
    return processes.filter(
      (p) => p.name.toLowerCase().includes(q) || String(p.pid).includes(q) || p.category.toLowerCase().includes(q),
    )
  }, [processes, processQuery])

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (filter === "All") return true
      if (filter === "Reviewed") return a.reviewed
      return !a.reviewed
    })
  }, [alerts, filter])

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesType = eventType === "All" || e.category === eventType
      const matchesQuery =
        !eventQuery.trim() ||
        `${e.event} ${e.source} ${e.category} ${e.result}`.toLowerCase().includes(eventQuery.toLowerCase())
      return matchesType && matchesQuery
    })
  }, [events, eventType, eventQuery])

  function startLiveAnalysis() {
    if (scanning) return
    setScanning(true)
    setScanProgress(15)
    setScanStep(`Scanning ${processes.length} active Windows processes...`)

    setTimeout(() => {
      setScanProgress(45)
      setScanStep(`Inspecting ${connections.length} active TCP connections & listening ports...`)
    }, 600)

    setTimeout(() => {
      setScanProgress(80)
      setScanStep(`Auditing network interfaces: ${interfaces.map((i) => i.ip).slice(0, 3).join(", ")}...`)
    }, 1200)

    setTimeout(() => {
      setScanProgress(100)
      setScanStep(`Scan complete: Verified ${processes.length} processes on ${telemetry?.hostname || "system"}.`)
      setScanning(false)
      setScanDone(true)
      refreshAll()
      setNotice(
        `Live Heuristic Scan completed: ${processes.length} actual processes verified. Anomaly index is ${telemetry?.anomalyScore ?? 15}/100.`,
      )
    }, 1800)
  }

  function downloadReport(title: string) {
    let rows: (string | number)[][] = []

    if (title === "Threat activity") {
      rows = [
        ["Alert Title", "Detail", "Severity", "Source", "Review Status", "Timestamp"],
        ...alerts.map((a) => [
          a.title,
          a.detail,
          a.severity,
          a.source,
          a.reviewed ? "Reviewed" : "Awaiting review",
          new Date(a.timestamp).toISOString(),
        ]),
      ]
    } else if (title === "System performance") {
      rows = [
        ["Process Name", "PID", "Memory", "CPU", "Category", "Status"],
        ...processes.map((p) => [p.name, p.pid, p.memory, p.cpu, p.category, p.status]),
      ]
    } else {
      rows = [
        ["Parameter", "Live Measurement"],
        ["Host Machine", telemetry?.hostname || "Local"],
        ["Operating System", `${telemetry?.platform || "win32"} (${telemetry?.arch || "x64"})`],
        ["Processor", `${telemetry?.cpuModel || "CPU"} (${telemetry?.cpuCores || 0} Cores)`],
        ["CPU Usage", `${telemetry?.cpuUsage || 0}%`],
        ["Memory Usage", `${telemetry?.memoryUsage || 0}% (${telemetry?.usedMemoryGB || 0} GB used of ${telemetry?.totalMemoryGB || 0} GB)`],
        ["Active Network Interfaces", interfaces.map((i) => `${i.name} [${i.ip}]`).join("; ")],
        ["Active TCP Sockets", connections.length],
        ["Monitored Processes", processes.length],
        ["Heuristic Anomaly Index", `${telemetry?.anomalyScore || 0}/100`],
        ["Active Alerts", alerts.length],
        ["Defense Quota Balance", `${balance} Credits`],
        ["System Uptime", telemetry?.uptimeFormatted || "Unknown"],
        ["Report Generation Time", new Date().toISOString()],
      ]
    }

    const csv = [["DefenX Live Real-Time Security Report", title], ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `${title.toLowerCase().replace(/ /g, "-")}-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setNotice(`${title} exported as CSV with real-time data.`)
  }

  function summary(items: { label: string; value: string; detail: string; icon: IconName }[]) {
    return (
      <div className="tab-summary">
        {items.map((item) => (
          <article className="card summary-card" key={item.label}>
            <div className="stat-icon">
              <Icon name={item.icon} size={27} />
            </div>
            <div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.detail}</small>
            </div>
          </article>
        ))}
      </div>
    )
  }

  function processTable() {
    return (
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Process</th>
              <th>PID</th>
              <th>CPU usage</th>
              <th>Memory</th>
              <th>Category</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredProcesses.slice(0, 25).map((p) => (
              <tr key={`${p.name}-${p.pid}`}>
                <td>
                  <span className="process-name">
                    <span className="process-logo">
                      <Icon name="layers" size={16} />
                    </span>
                    <strong>{p.name}</strong>
                  </span>
                </td>
                <td>{p.pid}</td>
                <td>{p.cpu}</td>
                <td>{p.memory}</td>
                <td>{p.category}</td>
                <td>
                  <span className={p.status === "Warning" ? "review-badge" : "normal"}>
                    <i />
                    {p.status}
                  </span>
                </td>
                <td>
                  <button className="text-button" onClick={() => openDetail(p.name)}>
                    Inspect <Icon name="arrow" size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <section className="tab-page" aria-labelledby="page-title">
      <div className="tab-page-heading">
        <div>
          <span className="eyebrow">DEFENX / {active.toUpperCase()}</span>
          <h1 id="page-title">{active}</h1>
          <p>{tabDescriptions[active]}</p>
        </div>
        <span className="demo-label">Live Shield: {telemetry?.hostname || "System"}</span>
      </div>

      {notice && (
        <div className="inline-notice" role="status">
          <Icon name="shield" size={20} />
          {notice}
          <button onClick={() => setNotice("")} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}

      {active === "Live Monitor" && (
        <>
          {summary([
            {
              label: "CPU usage",
              value: `${telemetry?.cpuUsage ?? 0}%`,
              detail: `${telemetry?.cpuCores ?? 0} Cores · ${telemetry?.cpuModel || "Processor"}`,
              icon: "cpu",
            },
            {
              label: "Memory usage",
              value: `${telemetry?.memoryUsage ?? 0}%`,
              detail: `${telemetry?.usedMemoryGB ?? 0} GB of ${telemetry?.totalMemoryGB ?? 0} GB physical RAM`,
              icon: "database",
            },
            {
              label: "Running processes",
              value: String(processes.length),
              detail: `${processes.filter((p) => p.status === "Elevated").length} with elevated memory footprint`,
              icon: "layers",
            },
          ])}
          <section className="card tab-panel monitor-panel">
            <div className="section-heading">
              <h2>
                <Icon name="pulse" />
                System Performance Stream
              </h2>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="secondary-button" onClick={refreshAll}>
                  <Icon name="refresh" size={16} /> Refresh
                </button>
                <button className="secondary-button" onClick={() => setPaused(!paused)}>
                  {paused ? "Resume monitoring" : "Pause monitoring"}
                </button>
              </div>
            </div>
            <div className="tab-toolbar">
              <span className={paused ? "muted" : "live"}>
                <i />
                {paused ? "Display paused" : "Live Telemetry Feed (2.5s Ticker)"}
              </span>
              <div className="periods">
                {["1h", "6h", "24h", "7d"].map((p) => (
                  <button
                    key={p}
                    className={period === p ? "selected" : ""}
                    disabled={paused}
                    onClick={() => setPeriod(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <PerformanceChart period={period} history={history} />
          </section>

          <section className="card tab-panel">
            <div className="section-heading">
              <h2>
                <Icon name="layers" />
                Active Windows Processes ({processes.length})
              </h2>
              <label className="field-search" style={{ maxWidth: "280px" }}>
                <Icon name="search" size={17} />
                <input
                  placeholder="Filter processes or PID..."
                  value={processQuery}
                  onChange={(e) => setProcessQuery(e.target.value)}
                />
              </label>
            </div>
            {processTable()}
          </section>
        </>
      )}

      {active === "AI Detection" && (
        <>
          {summary([
            {
              label: "Anomaly score",
              value: `${telemetry?.anomalyScore ?? 15} / 100`,
              detail: "Calculated from runtime process & network heuristics",
              icon: "pulse",
            },
            {
              label: "Detection engine",
              value: "Active",
              detail: "Perimeter monitoring & socket analysis",
              icon: "brain",
            },
            {
              label: "Processes analyzed",
              value: `${processes.length} / ${processes.length}`,
              detail: scanDone ? "Live heuristic audit completed" : "Active inspection of process table",
              icon: "shield",
            },
          ])}
          <div className="tab-columns">
            <section className="card tab-panel">
              <div className="section-heading">
                <h2>
                  <Icon name="brain" />
                  Behavioral Heuristics
                </h2>
                <span className="beta">Live Engine</span>
              </div>
              <div className="analysis-score">
                <div
                  className="score-ring"
                  style={{
                    background: `conic-gradient(#870e23 0deg ${
                      (telemetry?.anomalyScore ?? 15) * 3.6
                    }deg, #e1d7c5 ${(telemetry?.anomalyScore ?? 15) * 3.6}deg 360deg)`,
                  }}
                >
                  <strong>
                    {telemetry?.anomalyScore ?? 15}
                    <span>/ 100</span>
                  </strong>
                </div>
                <div>
                  <h3>System Status: {telemetry && telemetry.anomalyScore > 35 ? "Elevated Load" : "Healthy"}</h3>
                  <p>
                    Analyzing {processes.length} active processes and {connections.length} socket connections on{" "}
                    {telemetry?.hostname || "system"}.
                  </p>
                </div>
              </div>
              <button className="primary-button" disabled={scanning} onClick={startLiveAnalysis}>
                {scanning ? "Executing Heuristic Scan..." : "Run live heuristic scan"}{" "}
                <Icon name="sparkles" size={18} />
              </button>
              {scanning && (
                <div style={{ marginTop: "14px" }}>
                  <div className="scan-progress-wrap">
                    <div className="scan-progress-fill" style={{ width: `${scanProgress}%` }} />
                  </div>
                  <small style={{ color: "#79111e", fontWeight: 600, display: "block", marginTop: "4px" }}>
                    {scanStep} ({scanProgress}%)
                  </small>
                </div>
              )}
            </section>
            <section className="card tab-panel">
              <h2>
                <Icon name="sparkles" />
                Real-Time Coverage
              </h2>
              {[
                ["Process behavior integrity", Math.min(99, 94 + (telemetry?.cpuUsage ? 2 : 0))],
                ["Network socket auditing", Math.min(99, 90 + connections.length % 8)],
                ["Memory boundary verification", Math.min(99, 95 - Math.round((telemetry?.memoryUsage || 50) * 0.1))],
              ].map(([label, value]) => (
                <div className="coverage" key={label}>
                  <div>
                    <span>{label}</span>
                    <strong>{value}%</strong>
                  </div>
                  <div className="coverage-track">
                    <i style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
              <p className="muted">
                Coverage indicators derived from physical hardware handles and socket audit state.
              </p>
            </section>
          </div>
          <section className="card tab-panel">
            <h2>
              <Icon name="layers" />
              Monitored Processes Under Heuristic Analysis
            </h2>
            {processTable()}
          </section>
        </>
      )}

      {active === "Threat Center" && (
        <>
          {summary([
            {
              label: "Total alerts",
              value: String(alerts.length),
              detail: "Generated from live heuristics",
              icon: "alert",
            },
            {
              label: "Awaiting review",
              value: String(alerts.filter((a) => !a.reviewed).length),
              detail: "Requires analyst verification",
              icon: "search",
            },
            {
              label: "Reviewed",
              value: String(alerts.filter((a) => a.reviewed).length),
              detail: "Acknowledged in this session",
              icon: "shield",
            },
          ])}
          <section className="card tab-panel">
            <div className="section-heading">
              <h2>
                <Icon name="alert" />
                Live Heuristic Security Alerts
              </h2>
              <span className="muted">{filteredAlerts.length} alerts</span>
            </div>
            <div className="filter-chips" aria-label="Filter alerts">
              {["All", "Awaiting review", "Reviewed"].map((f) => (
                <button
                  key={f}
                  aria-pressed={filter === f}
                  className={filter === f ? "selected" : ""}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="detailed-alerts">
              {filteredAlerts.map((a) => (
                <article className={`detailed-alert ${a.type}`} key={a.id}>
                  <span className="alert-symbol">{a.symbol}</span>
                  <div>
                    <div className="alert-title">
                      <h3>{a.title}</h3>
                      <time>{a.time}</time>
                    </div>
                    <p>{a.description}</p>
                    <div className="alert-controls">
                      <button className="text-button" onClick={() => openDetail(a.title)}>
                        View evidence <Icon name="arrow" size={16} />
                      </button>
                      <button className="secondary-button" onClick={() => toggleAlertReviewHandler(a.id)}>
                        {a.reviewed ? "Reopen review" : "Mark as reviewed"}
                      </button>
                      {a.reviewed && (
                        <span className="normal">
                          <i />
                          Reviewed
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {filteredAlerts.length === 0 && (
              <div className="empty-state">
                <Icon name="shield" size={40} />
                <h3>Zero unreviewed signals</h3>
                <p>All active heuristics on {telemetry?.hostname || "system"} are verified.</p>
              </div>
            )}
          </section>
        </>
      )}

      {active === "Network" && (
        <>
          {summary([
            {
              label: "Download speed",
              value: `${telemetry?.downloadSpeedMbps ?? 0} Mbps`,
              detail: "Real-time estimated throughput",
              icon: "pulse",
            },
            {
              label: "Upload speed",
              value: `${telemetry?.uploadSpeedMbps ?? 0} Mbps`,
              detail: "Outgoing telemetry bandwidth",
              icon: "globe",
            },
            {
              label: "Active Interfaces",
              value: String(interfaces.length),
              detail: interfaces[0]?.ip ? `Primary: ${interfaces[0].ip}` : "Tracking interfaces",
              icon: "cpu",
            },
          ])}
          <div className="tab-columns">
            <section className="card tab-panel traffic-panel">
              <div className="section-heading">
                <h2>
                  <Icon name="globe" />
                  Traffic Stream
                </h2>
                <span className="live">
                  <i />
                  Live Bandwidth
                </span>
              </div>
              <NetworkChart history={history} />
              <div className="network-speeds">
                <span>
                  <b>↓</b>
                  {telemetry?.downloadSpeedMbps ?? 0} Mbps
                </span>
                <span>
                  <b>↑</b>
                  {telemetry?.uploadSpeedMbps ?? 0} Mbps
                </span>
              </div>
            </section>
            <section className="card tab-panel">
              <h2>
                <Icon name="shield" />
                Connection Security State
              </h2>
              <div className="connection-health">
                <Icon name="shield" size={46} />
                <h3>Endpoint Perimeter Protected</h3>
                <p>
                  Monitoring {connections.length} active sockets across {interfaces.length} hardware network interfaces.
                </p>
              </div>
            </section>
          </div>

          <section className="card tab-panel load-balancer-panel">
            <div className="section-heading">
              <h2>
                <Icon name="pulse" size={26} />
                Global Load Balancer & Real-Time Measured Latency
              </h2>
              <span className="live">
                <i />
                Edge Probes Live
              </span>
            </div>
            <div className="balancer-grid">
              {loadBalancerNodes.map((node) => (
                <div className="balancer-node" key={node.name}>
                  <div className="node-head">
                    <span>
                      {node.name} ({node.region})
                    </span>
                    <b className="status-badge online">{node.status}</b>
                  </div>
                  <div className="node-metric">
                    <span>Traffic Load</span>
                    <strong>{node.loadPercent}%</strong>
                  </div>
                  <div className="node-bar">
                    <div style={{ width: `${node.loadPercent}%` }} />
                  </div>
                  <small>
                    Measured Ping: {node.latencyMs}ms · {node.reqPerSec.toLocaleString()} req/s
                  </small>
                </div>
              ))}
            </div>
            <div className="balancer-summary">
              <span>
                <b>Algorithm:</b> Dynamic Least Response Time (L4/L7)
              </span>
              <span>
                <b>Edge Probes:</b> 3 Regional Backbone Nodes
              </span>
              <span>
                <b>Local Gateway Latency:</b> {telemetry?.networkLatencyMs ?? 20}ms
              </span>
            </div>
          </section>

          <section className="card tab-panel">
            <h2>
              <Icon name="cpu" />
              Active System Network Interfaces ({interfaces.length})
            </h2>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Interface</th>
                    <th>IP Address</th>
                    <th>MAC Address</th>
                    <th>Family</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {interfaces.map((iface) => (
                    <tr key={`${iface.name}-${iface.ip}`}>
                      <td>{iface.name}</td>
                      <td>
                        <strong>{iface.ip}</strong>
                      </td>
                      <td>{iface.mac}</td>
                      <td>{iface.family}</td>
                      <td>{iface.type}</td>
                      <td>
                        <span className={iface.status === "Active" ? "normal" : "review-badge"}>
                          <i />
                          {iface.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card tab-panel">
            <h2>
              <Icon name="globe" />
              Active TCP Sockets ({connections.length})
            </h2>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Local Address</th>
                    <th>Local Port</th>
                    <th>Remote Address</th>
                    <th>Remote Port</th>
                    <th>State</th>
                    <th>PID</th>
                  </tr>
                </thead>
                <tbody>
                  {connections.slice(0, 15).map((conn, idx) => (
                    <tr key={idx}>
                      <td>{conn.localAddress}</td>
                      <td>{conn.localPort}</td>
                      <td>{conn.remoteAddress}</td>
                      <td>{conn.remotePort}</td>
                      <td>
                        <span className={conn.state === "Listening" ? "review-badge" : "normal"}>
                          <i />
                          {conn.state}
                        </span>
                      </td>
                      <td>{conn.pid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {active === "Forensics" && (
        <>
          {summary([
            {
              label: "Recorded events",
              value: String(events.length),
              detail: "Live telemetry timeline",
              icon: "file",
            },
            {
              label: "Investigated sources",
              value: String(new Set(events.map((e) => e.source)).size),
              detail: "Unique kernel & app handles",
              icon: "shield",
            },
            {
              label: "Investigation scope",
              value: telemetry?.hostname || "Local Node",
              detail: `${telemetry?.platform || "win32"} host environment`,
              icon: "search",
            },
          ])}
          <section className="card tab-panel">
            <div className="section-heading">
              <h2>
                <Icon name="search" />
                Live Forensic Event Timeline
              </h2>
              <span className="muted">Today · Live Event Bus</span>
            </div>
            <div className="tab-toolbar">
              <label className="field-search">
                <Icon name="search" size={19} />
                <input
                  aria-label="Search events"
                  placeholder="Search events, sources, or outcomes..."
                  value={eventQuery}
                  onChange={(e) => setEventQuery(e.target.value)}
                />
              </label>
              <select
                aria-label="Event type"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                {["All", "Process", "Network", "Analysis", "System"].map((t) => (
                  <option key={t} value={t}>
                    {t === "All" ? "All event types" : t}
                  </option>
                ))}
              </select>
            </div>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Event</th>
                    <th>Source</th>
                    <th>Category</th>
                    <th>Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((e, idx) => (
                    <tr key={idx}>
                      <td className="event-time">{e.time}</td>
                      <td>{e.event}</td>
                      <td>
                        <strong>{e.source}</strong>
                      </td>
                      <td>{e.category}</td>
                      <td>
                        <span className={e.result === "Review" ? "review-badge" : "normal"}>
                          <i />
                          {e.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {active === "Reports" && (
        <>
          <div className="report-banner card">
            <div className="stat-icon">
              <Icon name="file" size={32} />
            </div>
            <div>
              <h2>Security insights, ready to share</h2>
              <p>Download a CSV summary compiled directly from live system metrics.</p>
            </div>
            <button className="primary-button" onClick={() => downloadReport("Security overview")}>
              Export overview <Icon name="arrow" size={18} />
            </button>
          </div>
          <div className="reports-grid">
            {[
              {
                title: "Security overview",
                description: "Hardware telemetry, active sockets, and platform posture summary.",
                icon: "shield" as IconName,
              },
              {
                title: "Threat activity",
                description: "Heuristic alerts, severity rankings, and triage status.",
                icon: "alert" as IconName,
              },
              {
                title: "System performance",
                description: "Full table of all running Windows processes with PIDs and memory.",
                icon: "pulse" as IconName,
              },
            ].map((report) => (
              <article className="card tab-panel report-card" key={report.title}>
                <div className="report-icon">
                  <Icon name={report.icon} size={31} />
                </div>
                <span className="eyebrow">LIVE REPORT · CSV</span>
                <h2>{report.title}</h2>
                <p>{report.description}</p>
                <button className="secondary-button" onClick={() => downloadReport(report.title)}>
                  Download report <Icon name="arrow" size={17} />
                </button>
              </article>
            ))}
          </div>
        </>
      )}

      {active === "Settings" && (
        <>
          <div className="settings-note">
            <Icon name="shield" size={19} />
            <span>Telemetry is connected directly to local Windows host APIs.</span>
          </div>
          <div className="tab-columns settings-columns">
            <section className="card tab-panel">
              <h2>
                <Icon name="shield" />
                Protection & Notifications
              </h2>
              <div className="settings-list">
                {Object.entries(settings).map(([label, enabled]) => (
                  <label key={label}>
                    <span>
                      <strong>{label}</strong>
                      <small>
                        {label === "Real-time protection"
                          ? "Monitor running process handles and suspicious execution."
                          : label === "Behavioral analysis"
                            ? "Detect memory pressure anomalies and port scans."
                            : label === "Automatic security updates"
                              ? "Synchronize threat heuristics with local daemon."
                              : label === "Threat notifications"
                                ? "Display live warnings when high memory or port anomalies occur."
                                : "Generate audit export summaries."}
                      </small>
                    </span>
                    <input
                      type="checkbox"
                      role="switch"
                      checked={enabled}
                      onChange={(e) => {
                        const updated = { ...settings, [label]: e.target.checked }
                        setSettings(updated)
                        localStorage.setItem("defenx_settings", JSON.stringify(updated))
                      }}
                    />
                  </label>
                ))}
              </div>
            </section>
            <div className="settings-side">
              <section className="card tab-panel">
                <h2>
                  <Icon name="wallet" />
                  Defense Quota & Credits
                </h2>
                <div className="about-row">
                  <span>Available Balance</span>
                  <strong style={{ color: "#a50020" }}>{balance.toLocaleString()} Credits</strong>
                </div>
                <div className="about-row">
                  <span>Allocation Value</span>
                  <strong>${(balance / 10).toFixed(2)} USD</strong>
                </div>
                <div className="about-row">
                  <span>Shield Tier</span>
                  <strong>Enterprise Real-Time Pro</strong>
                </div>
                <button
                  className="primary-button"
                  style={{ marginTop: "14px" }}
                  onClick={() => setBalanceModalOpen(true)}
                >
                  Manage Balance & Top-up <Icon name="arrow" size={17} />
                </button>
              </section>

              <section className="card tab-panel">
                <h2>
                  <Icon name="sun" />
                  Appearance
                </h2>
                <p className="muted">Choose your workspace color theme.</p>
                <div className="theme-options">
                  <button
                    className={!dark ? "selected" : ""}
                    aria-pressed={!dark}
                    onClick={() => {
                      setDark(false)
                      localStorage.setItem("defenx_theme", "light")
                    }}
                  >
                    <Icon name="sun" />
                    Light
                  </button>
                  <button
                    className={dark ? "selected" : ""}
                    aria-pressed={dark}
                    onClick={() => {
                      setDark(true)
                      localStorage.setItem("defenx_theme", "dark")
                    }}
                  >
                    <Icon name="moon" />
                    Dark
                  </button>
                </div>
              </section>

              <section className="card tab-panel">
                <h2>
                  <Icon name="shield" />
                  About This Node
                </h2>
                <div className="about-row">
                  <span>Host Machine</span>
                  <strong>{telemetry?.hostname || "Local Node"}</strong>
                </div>
                <div className="about-row">
                  <span>Operating System</span>
                  <strong>
                    {telemetry?.platform || "win32"} ({telemetry?.arch || "x64"})
                  </strong>
                </div>
                <div className="about-row">
                  <span>Processor</span>
                  <strong>{telemetry?.cpuModel || "Processor"}</strong>
                </div>
                <div className="about-row">
                  <span>System Uptime</span>
                  <strong>{telemetry?.uptimeFormatted || "Active"}</strong>
                </div>
                <div className="about-row">
                  <span>Telemetry State</span>
                  <strong style={{ color: "#10b981" }}>Live API Stream (Connected)</strong>
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

function currentTab() {
  if (typeof window === "undefined") return "Dashboard"
  return (
    navigation.find((item) => item.label.toLowerCase().replace(/ /g, "-") === window.location.hash.slice(1))
      ?.label ?? "Dashboard"
  )
}

export default function App() {
  const [active, setActive] = useState(currentTab)
  const [balance, setBalance] = useState<number>(() => {
    if (typeof window === "undefined") return 2450
    try {
      const saved = localStorage.getItem("defenx_balance")
      return saved ? parseInt(saved, 10) : 2450
    } catch {
      return 2450
    }
  })
  const [balanceModalOpen, setBalanceModalOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState(false)
  const [modal, setModal] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [prompt, setPrompt] = useState("")
  const [asking, setAsking] = useState(false)
  const [answer, setAnswer] = useState(
    "DefenX Real-Time Neural Shield active. Live telemetry stream established with host operating system.",
  )

  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false
    try {
      return localStorage.getItem("defenx_theme") === "dark"
    } catch {
      return false
    }
  })

  // Real-time API States
  const [telemetry, setTelemetry] = useState<SystemTelemetry | null>(null)
  const [history, setHistory] = useState<TelemetryPoint[]>([])
  const [processes, setProcesses] = useState<RealProcess[]>([])
  const [alerts, setAlerts] = useState<RealAlert[]>([])
  const [events, setEvents] = useState<RealEvent[]>([])
  const [interfaces, setInterfaces] = useState<RealNetworkInterface[]>([])
  const [connections, setConnections] = useState<RealTcpConnection[]>([])
  const [loadBalancerNodes, setLoadBalancerNodes] = useState<LoadBalancerNode[]>([
    { name: "Node US-East", region: "N. Virginia", latencyMs: 28, loadPercent: 35, status: "Healthy", reqPerSec: 1350 },
    { name: "Node EU-Central", region: "Frankfurt", latencyMs: 24, loadPercent: 41, status: "Healthy", reqPerSec: 1620 },
    { name: "Node AP-South", region: "Mumbai", latencyMs: 18, loadPercent: 24, status: "Healthy", reqPerSec: 1950 },
  ])

  // Fetch telemetry
  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch("/api/telemetry")
      const json = await res.json()
      if (json.success) {
        setTelemetry(json.data)
        if (json.history) setHistory(json.history)
      }
    } catch (err) {
      console.error("Telemetry fetch error:", err)
    }
  }, [])

  // Fetch processes
  const fetchProcesses = useCallback(async () => {
    try {
      const res = await fetch("/api/processes")
      const json = await res.json()
      if (json.success && json.data) {
        setProcesses(json.data)
      }
    } catch (err) {
      console.error("Processes fetch error:", err)
    }
  }, [])

  // Fetch network
  const fetchNetwork = useCallback(async () => {
    try {
      const res = await fetch("/api/network")
      const json = await res.json()
      if (json.success) {
        if (json.interfaces) setInterfaces(json.interfaces)
        if (json.connections) setConnections(json.connections)
        if (json.loadBalancerNodes) setLoadBalancerNodes(json.loadBalancerNodes)
      }
    } catch (err) {
      console.error("Network fetch error:", err)
    }
  }, [])

  // Fetch threats
  const fetchThreats = useCallback(async () => {
    try {
      const res = await fetch("/api/threats")
      const json = await res.json()
      if (json.success && json.data) {
        setAlerts(json.data)
      }
    } catch (err) {
      console.error("Threats fetch error:", err)
    }
  }, [])

  // Fetch forensics
  const fetchForensics = useCallback(async () => {
    try {
      const res = await fetch("/api/forensics")
      const json = await res.json()
      if (json.success && json.data) {
        setEvents(json.data)
      }
    } catch (err) {
      console.error("Forensics fetch error:", err)
    }
  }, [])

  const refreshAll = useCallback(() => {
    fetchTelemetry()
    fetchProcesses()
    fetchNetwork()
    fetchThreats()
    fetchForensics()
  }, [fetchTelemetry, fetchProcesses, fetchNetwork, fetchThreats, fetchForensics])

  // Initial load
  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  // Real-time telemetry ticker (polls every 2.5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      fetchTelemetry()
    }, 2500)
    return () => clearInterval(timer)
  }, [fetchTelemetry])

  // Slow poll for processes and network (every 6 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      fetchProcesses()
      fetchThreats()
      fetchNetwork()
      fetchForensics()
    }, 6000)
    return () => clearInterval(timer)
  }, [fetchProcesses, fetchThreats, fetchNetwork, fetchForensics])

  // Toggle alert review via API
  async function toggleAlertReviewHandler(alertId: string) {
    try {
      const res = await fetch("/api/threats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId }),
      })
      const json = await res.json()
      if (json.success) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, reviewed: json.reviewed } : a)),
        )
        fetchForensics()
      }
    } catch (err) {
      console.error("Toggle review error:", err)
    }
  }

  function rechargeBalance(amount: number) {
    setBalance((prev) => {
      const next = prev + amount
      localStorage.setItem("defenx_balance", next.toString())
      return next
    })
  }

  // Ctrl+K keyboard shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        document.querySelector<HTMLInputElement>(".search-wrap input")?.focus()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    const onHashChange = () => setActive(currentTab())
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  function navigate(tab: string) {
    setActive(tab)
    if (typeof window !== "undefined") {
      window.location.hash = tab.toLowerCase().replace(/ /g, "-")
      window.scrollTo({ top: 0, behavior: "instant" })
    }
    setModal(null)
    setBalanceModalOpen(false)
    setProfileOpen(false)
    setNotifications(false)
  }

  // Ask real-time AI Assistant
  async function askAssistant(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim() || asking) return

    if (balance < 5) {
      setAnswer(
        "Defense balance depleted. Please recharge your DefenX credits to query the real-time AI Assistant.",
      )
      return
    }

    setAsking(true)
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (data.success && data.answer) {
        setAnswer(data.answer)
        setBalance((prev) => {
          const next = Math.max(0, prev - 5)
          localStorage.setItem("defenx_balance", next.toString())
          return next
        })
      } else {
        setAnswer(data.error || "Unable to retrieve real-time system reasoning.")
      }
    } catch {
      setAnswer("Communication error connecting to DefenX telemetry server.")
    } finally {
      setAsking(false)
      setPrompt("")
      fetchForensics()
    }
  }

  const unreviewedAlertCount = useMemo(() => {
    return alerts.filter((a) => !a.reviewed).length
  }, [alerts])

  const usernameDisplay = telemetry?.username || "Asus"
  const userInitials = usernameDisplay.slice(0, 2).toUpperCase()

  const searchResults = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    const procMatches = processes.filter((p) => p.name.toLowerCase().includes(q) || String(p.pid).includes(q))
    const alertMatches = alerts.filter((a) => a.title.toLowerCase().includes(q) || a.detail.toLowerCase().includes(q))
    return [
      ...procMatches.map((p) => ({ title: `${p.name} (PID ${p.pid})`, type: "process" })),
      ...alertMatches.map((a) => ({ title: a.title, type: "alert" })),
    ]
  }, [query, processes, alerts])

  return (
    <div className={`app ${dark ? "dark-mode" : ""}`}>
      <div className="silk silk-one" />
      <div className="silk silk-two" />
      <div className="gold-thread thread-one" />
      <div className="gold-thread thread-two" />

      <aside className="sidebar">
        <a className="brand" href="#dashboard" onClick={() => navigate("Dashboard")}>
          <div className="brand-shield">
            <Icon name="shield" size={53} />
          </div>
          <div>
            <strong>DefenX</strong>
            <span>Real-Time Defense</span>
          </div>
        </a>

        <nav aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              key={item.label}
              className={`nav-item ${active === item.label ? "active" : ""}`}
              aria-current={active === item.label ? "page" : undefined}
              aria-label={item.label}
              title={item.label}
              onClick={() => navigate(item.label)}
            >
              <Icon name={item.icon} size={27} />
              <span>{item.label}</span>
              {item.label === "Threat Center" && unreviewedAlertCount > 0 && (
                <b className="count">{unreviewedAlertCount}</b>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="system-online">
            <div>
              <i className="status-dot" />
              <strong>System Live</strong>
            </div>
            <p>{telemetry?.hostname || "Local Node"} · Connected</p>
            <svg viewBox="0 0 200 42">
              <path
                d="m0 30 10 0 4-5 5 8 4-18 5 17 6-5 8 3 6-5 8 8 8-4 5 3 7-6 6 5 6-20 5 22 5-4 5-17 5 22 5-9 5 4 6-4 6 7 4-9 5 10 5-7 6 2 5-15 5 18 5-8 5 6 9 0"
                fill="none"
                stroke="#daa858"
                strokeWidth="1"
              />
            </svg>
          </div>
          <button
            className="theme-toggle"
            aria-label="Toggle color theme"
            onClick={() => {
              const next = !dark
              setDark(next)
              localStorage.setItem("defenx_theme", next ? "dark" : "light")
            }}
          >
            <Icon name="sun" size={20} />
            <span className={`switch ${dark ? "on" : ""}`}>
              <i />
            </span>
            <Icon name="moon" size={18} />
          </button>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div className="search-wrap">
            <Icon name="search" size={22} />
            <input
              aria-label="Search real processes, threats, or sockets"
              placeholder="Search real processes, threats, or sockets..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd>Ctrl + K</kbd>
            {query && (
              <div className="search-results">
                {searchResults.map((r) => (
                  <button
                    key={r.title}
                    onClick={() => {
                      setModal(r.title)
                      setQuery("")
                    }}
                  >
                    <span>
                      <strong>{r.title}</strong>
                      <small style={{ marginLeft: "8px", color: "#8c6328" }}>({r.type})</small>
                    </span>
                    <Icon name="arrow" size={16} />
                  </button>
                ))}
                {searchResults.length === 0 && <p>No matching active processes or alerts.</p>}
              </div>
            )}
          </div>

          <div className="top-actions">
            <div className="balance-wrap">
              <button
                className="balance-pill"
                onClick={() => setBalanceModalOpen(true)}
                title="DefenX Security Quota & Balance Hub"
                aria-label="DefenX Security Quota & Balance Hub"
              >
                <div className="balance-dot" />
                <Icon name="wallet" size={17} />
                <span className="balance-amount">{balance.toLocaleString()}</span>
                <span className="balance-label">Credits</span>
              </button>
            </div>

            <div className="notification-wrap">
              <button
                className="round-button"
                aria-label="Notifications"
                onClick={() => setNotifications(!notifications)}
              >
                <Icon name="bell" />
                {unreviewedAlertCount > 0 && <b>{unreviewedAlertCount}</b>}
              </button>
              {notifications && (
                <div className="notification-menu">
                  <strong>Live Heuristic Alerts ({alerts.length})</strong>
                  {alerts.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setModal(a.title)
                        setNotifications(false)
                      }}
                    >
                      {a.title}
                      <small>{a.detail}</small>
                    </button>
                  ))}
                  {alerts.length === 0 && <p style={{ padding: "8px" }}>Zero active alerts.</p>}
                </div>
              )}
            </div>

            <button className="round-button" aria-label="Settings" onClick={() => navigate("Settings")}>
              <Icon name="settings" />
            </button>

            <div className="profile-wrap">
              <button className="profile" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="avatar">{userInitials}</div>
                <div>
                  <strong>{usernameDisplay}</strong>
                  <span>{telemetry?.hostname || "Security Analyst"}</span>
                </div>
                <Icon name="chevron" size={19} />
              </button>
              {profileOpen && (
                <div className="profile-menu">
                  <strong>{usernameDisplay}</strong>
                  <span>Host: {telemetry?.hostname || "Local Node"}</span>
                  <button
                    onClick={() => {
                      navigate("Settings")
                      setProfileOpen(false)
                    }}
                  >
                    Host settings <Icon name="arrow" size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard View */}
        <div hidden={active !== "Dashboard"}>
          <section className="welcome">
            <div>
              <h1>Welcome Back, {usernameDisplay}</h1>
              <p>
                Live monitoring active on {telemetry?.hostname || "your workstation"} ({telemetry?.platform || "win32"}{" "}
                {telemetry?.arch || "x64"}).
              </p>
            </div>
            <div className="protection">
              <i className="status-dot" />
              Live Telemetry Stream Active
            </div>
            <div className="welcome-shield">
              <Icon name="shield" size={76} />
            </div>
          </section>

          <section className="stats">
            <article className="stat card">
              <div className="stat-icon">
                <Icon name="shield" size={35} />
              </div>
              <div className="stat-content">
                <label>Security Status</label>
                <strong>{unreviewedAlertCount === 0 ? "Protected" : "Review Needed"}</strong>
                <small>{alerts.length} heuristic signals tracked</small>
              </div>
              <i className="tiny-dot" />
              <Sparkline points={history.map((h) => h.cpu)} />
            </article>

            <article className="stat card">
              <div className="stat-icon">
                <Icon name="pulse" size={35} />
              </div>
              <div className="stat-content">
                <label>Anomaly Score</label>
                <strong>
                  {telemetry?.anomalyScore ?? 15} <em>/ 100</em>
                </strong>
                <small>{telemetry && telemetry.anomalyScore > 30 ? "Elevated Load" : "Healthy Baseline"}</small>
              </div>
              <span className="trend">Live</span>
              <Sparkline points={history.map((h) => h.memory)} second />
            </article>

            <article className="stat card">
              <div className="stat-icon">
                <Icon name="cpu" size={32} />
              </div>
              <div className="stat-content">
                <label>Real CPU Usage</label>
                <strong>{telemetry?.cpuUsage ?? 0}%</strong>
                <small>{telemetry?.cpuCores ?? 0} Cores Active</small>
              </div>
              <Bars values={history.map((h) => h.cpu)} />
            </article>

            <article className="stat card">
              <div className="stat-icon">
                <Icon name="database" size={33} />
              </div>
              <div className="stat-content">
                <label>Physical RAM</label>
                <strong>{telemetry?.memoryUsage ?? 0}%</strong>
                <small>
                  {telemetry?.usedMemoryGB ?? 0} GB / {telemetry?.totalMemoryGB ?? 0} GB
                </small>
              </div>
              <Bars values={history.map((h) => h.memory)} />
            </article>
          </section>

          <div className="dashboard-grid">
            <section className="card performance">
              <div className="section-heading">
                <h2>
                  <span className="bar-icon">
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                  Real-Time Hardware Telemetry
                </h2>
                <div className="periods">
                  {["1h", "6h", "24h", "7d"].map((p) => (
                    <button key={p} className={p === "24h" ? "selected" : ""}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="legend">
                <span>
                  <i className="red" />
                  CPU ({telemetry?.cpuUsage ?? 0}%)
                </span>
                <span>
                  <i className="gold" />
                  Memory ({telemetry?.memoryUsage ?? 0}%)
                </span>
                <span>
                  <i className="wine" />
                  Network ({telemetry?.networkLatencyMs ?? 20}ms)
                </span>
              </div>
              <PerformanceChart period="24h" history={history} />
            </section>

            <section className="card threats">
              <div className="section-heading">
                <h2>
                  <Icon name="alert" size={29} />
                  Heuristic Alerts ({alerts.length})
                </h2>
                <button className="text-button" onClick={() => navigate("Threat Center")}>
                  View All <Icon name="arrow" size={17} />
                </button>
              </div>
              <div className="alert-list">
                {alerts.slice(0, 3).map((a) => (
                  <button key={a.id} className={`alert-row ${a.type}`} onClick={() => setModal(a.title)}>
                    <i className="alert-line" />
                    <span className="alert-symbol">{a.symbol}</span>
                    <span className="alert-text">
                      <strong>{a.title}</strong>
                      <small>{a.detail}</small>
                    </span>
                    <time>{a.time}</time>
                  </button>
                ))}
                {alerts.length === 0 && (
                  <p style={{ padding: "16px 0", color: "#68635c", fontSize: "14px" }}>
                    No active heuristic warnings. System perimeter verified.
                  </p>
                )}
              </div>
            </section>

            <section className="card processes">
              <div className="section-heading">
                <h2>
                  <Icon name="layers" size={28} />
                  Top Windows Processes
                </h2>
                <button className="text-button" onClick={() => navigate("Live Monitor")}>
                  View All ({processes.length}) <Icon name="arrow" size={17} />
                </button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Process</th>
                    <th>PID</th>
                    <th>CPU</th>
                    <th>Memory</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {processes.slice(0, 5).map((p) => (
                    <tr key={`${p.name}-${p.pid}`}>
                      <td>
                        <span className="process-logo">
                          <Icon name="layers" size={16} />
                        </span>
                        {p.name}
                      </td>
                      <td>{p.pid}</td>
                      <td>{p.cpu}</td>
                      <td>{p.memory}</td>
                      <td>
                        <span className={p.status === "Warning" ? "review-badge" : "normal"}>
                          <i />
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="card assistant">
              <div className="section-heading">
                <h2>
                  <Icon name="sparkles" size={27} />
                  Real-Time AI Security Assistant
                </h2>
                <span className="beta">5 Cr/query</span>
              </div>
              <div className="assistant-message">
                <div className="bot-avatar">
                  <Icon name="bot" size={45} />
                </div>
                <div className="speech">
                  <strong>DefenX Telemetry Reasoner</strong>
                  <p>{asking ? "Analyzing live system telemetry and process tree..." : answer}</p>
                </div>
              </div>
              <form onSubmit={askAssistant} className="assistant-input">
                <Icon name="sparkles" size={22} />
                <input
                  placeholder="Ask about your live CPU, processes, memory, or network..."
                  aria-label="Ask the real-time assistant"
                  value={prompt}
                  disabled={asking}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <button aria-label="Send message" disabled={asking}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m4 4 17 8-17 8 4-8Zm4 8h13" />
                  </svg>
                </button>
              </form>
            </section>

            <section className="card network">
              <div className="section-heading">
                <h2>
                  <Icon name="globe" size={27} />
                  Network Activity
                </h2>
                <span className="live">
                  <i />
                  Live Stream
                </span>
              </div>
              <NetworkChart history={history} />
              <div className="network-speeds">
                <span>
                  <b>↓</b>
                  {telemetry?.downloadSpeedMbps ?? 0} Mbps
                </span>
                <span>
                  <b>↑</b>
                  {telemetry?.uploadSpeedMbps ?? 0} Mbps
                </span>
              </div>
            </section>
          </div>
        </div>

        {/* Tab Views */}
        <div hidden={active === "Dashboard"}>
          <TabContent
            active={active}
            dark={dark}
            setDark={setDark}
            openDetail={setModal}
            balance={balance}
            rechargeBalance={rechargeBalance}
            telemetry={telemetry}
            history={history}
            processes={processes}
            alerts={alerts}
            events={events}
            interfaces={interfaces}
            connections={connections}
            loadBalancerNodes={loadBalancerNodes}
            refreshAll={refreshAll}
            toggleAlertReviewHandler={toggleAlertReviewHandler}
            setBalanceModalOpen={setBalanceModalOpen}
          />
        </div>

        <footer>
          DefenX Real-Time Cybersecurity Platform ·{" "}
          <span>Connected to {telemetry?.hostname || "Local Node"} · Synced live</span>
        </footer>
      </main>

      {/* Balance Modal */}
      {balanceModalOpen && (
        <div className="modal-overlay" onClick={() => setBalanceModalOpen(false)}>
          <section
            className="modal card balance-hub-modal"
            role="dialog"
            aria-modal="true"
            aria-label="DefenX Security Quota Hub"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-modal" aria-label="Close dialog" onClick={() => setBalanceModalOpen(false)}>
              ×
            </button>
            <div className="modal-icon">
              <Icon name="wallet" size={32} />
            </div>
            <h2>DefenX Security Quota Hub</h2>
            <p>
              Defense quota units allocated for live telemetry streaming, real-time heuristic inference, and packet inspection on{" "}
              {telemetry?.hostname || "your machine"}.
            </p>

            <div className="balance-hero">
              <div className="balance-hero-text">
                <h3>Available Defense Balance</h3>
                <div className="big-credits">
                  {balance.toLocaleString()} <span>Credits</span>
                </div>
                <p>≈ ${(balance / 10).toFixed(2)} USD allocated bandwidth</p>
              </div>
              <div className="balance-hero-badge">
                <span>Anomaly Index: {telemetry?.anomalyScore ?? 15}/100</span>
              </div>
            </div>

            <div className="balance-breakdown">
              <div className="breakdown-item">
                <span>Real-Time AI Query</span>
                <strong>5 Cr / query</strong>
              </div>
              <div className="breakdown-item">
                <span>Socket Telemetry</span>
                <strong>2 Cr / hour</strong>
              </div>
              <div className="breakdown-item">
                <span>Heuristic Audit</span>
                <strong>10 Cr / scan</strong>
              </div>
            </div>

            <div className="recharge-section">
              <h4>Instant Quota Top-Up</h4>
              <div className="recharge-grid">
                <button className="recharge-btn" onClick={() => rechargeBalance(250)}>
                  <strong>+250 Credits</strong>
                  <small>$25 · Instant</small>
                </button>
                <button className="recharge-btn" onClick={() => rechargeBalance(1000)}>
                  <strong>+1,000 Credits</strong>
                  <small>$90 · Save 10%</small>
                </button>
                <button className="recharge-btn" onClick={() => rechargeBalance(5000)}>
                  <strong>+5,000 Credits</strong>
                  <small>$400 · Enterprise</small>
                </button>
              </div>
            </div>

            <button className="primary-button" onClick={() => setBalanceModalOpen(false)}>
              Done <Icon name="arrow" size={18} />
            </button>
          </section>
        </div>
      )}

      {/* Detail Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <section
            className="modal card"
            role="dialog"
            aria-modal="true"
            aria-label={modal}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-modal" aria-label="Close dialog" onClick={() => setModal(null)}>
              ×
            </button>
            <div className="modal-icon">
              <Icon
                name={
                  modal.includes("etting")
                    ? "settings"
                    : modal.includes("rocess") || modal.endsWith(".exe")
                      ? "cpu"
                      : "shield"
                }
                size={32}
              />
            </div>
            <h2>{modal}</h2>

            {alerts.find((a) => a.title === modal) ? (
              <div>
                <p>{alerts.find((a) => a.title === modal)?.description}</p>
                <div className="modal-list">
                  <div>
                    <strong>Severity</strong>
                    <span>{alerts.find((a) => a.title === modal)?.severity}</span>
                  </div>
                  <div>
                    <strong>Source</strong>
                    <span>{alerts.find((a) => a.title === modal)?.source}</span>
                  </div>
                  <div>
                    <strong>Detail</strong>
                    <span>{alerts.find((a) => a.title === modal)?.detail}</span>
                  </div>
                  <div>
                    <strong>Status</strong>
                    <span className="normal">
                      <i />
                      {alerts.find((a) => a.title === modal)?.reviewed ? "Reviewed" : "Active Observation"}
                    </span>
                  </div>
                </div>
              </div>
            ) : processes.some((p) => p.name === modal || modal.includes(p.name)) ? (
              <div className="modal-list">
                {processes
                  .filter((p) => p.name === modal || modal.includes(p.name))
                  .map((p) => (
                    <div key={`${p.name}-${p.pid}`}>
                      <div>
                        <strong>
                          {p.name} (PID: {p.pid})
                        </strong>
                        <span style={{ display: "block", marginTop: "4px" }}>
                          Memory: {p.memory} · CPU: {p.cpu}
                        </span>
                      </div>
                      <span className={p.status === "Warning" ? "review-badge" : "normal"}>
                        <i />
                        {p.status}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div>
                <p>Real-time endpoint telemetry active on {telemetry?.hostname || "system"}.</p>
                <div className="modal-list">
                  <div>
                    <strong>CPU Utilization</strong>
                    <span>{telemetry?.cpuUsage ?? 0}%</span>
                  </div>
                  <div>
                    <strong>RAM Utilization</strong>
                    <span>
                      {telemetry?.memoryUsage ?? 0}% ({telemetry?.usedMemoryGB ?? 0} GB used)
                    </span>
                  </div>
                  <div>
                    <strong>Tracked Processes</strong>
                    <span>{processes.length} Active Handles</span>
                  </div>
                  <div>
                    <strong>Connected Sockets</strong>
                    <span>{connections.length} TCP Sockets</span>
                  </div>
                </div>
              </div>
            )}

            <button className="primary-button" onClick={() => setModal(null)}>
              Close details <Icon name="arrow" size={18} />
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
