import { useEffect, useId, useState } from "react"

type IconName = "shield" | "home" | "pulse" | "brain" | "alert" | "globe" | "search" | "file" | "settings" | "bell" | "cpu" | "database" | "layers" | "sparkles" | "bot" | "arrow" | "chevron" | "sun" | "moon"
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
    bell: (
      <>
        <path d="M5 17h14l-2-4V8A5 5 0 0 0 7 8v5Zm5 3h4" />
      </>
    ),
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
    arrow: (
      <>
        <path d="M3 12h18m-6-6 6 6-6 6" />
      </>
    ),
    chevron: <path d="m5 9 7 7 7-7" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2" />
      </>
    ),
    moon: <path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z" />,
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
const alerts = [
  {
    title: "Suspicious Process Detected",
    detail: "chrome.exe - unusual behavior",
    time: "2m ago",
    type: "danger",
    symbol: "!",
    description:
      "An unusual Chrome subprocess was detected. The process is isolated and is being monitored. No action is required.",
  },
  {
    title: "Potential Malware Activity",
    detail: "Unknown connection attempt",
    time: "5m ago",
    type: "warning",
    symbol: "△",
    description:
      "An unknown application attempted an outbound connection. DefenX blocked the connection and is analyzing the source.",
  },
  {
    title: "New Device Connected",
    detail: "IP: 192.168.1.105",
    time: "12m ago",
    type: "info",
    symbol: "i",
    description:
      "A new device joined your local network. Review the device and confirm that you recognize it.",
  },
]
const processes = [
  {
    name: "chrome.exe",
    cpu: "12.4%",
    memory: "420 MB",
    logo: "chrome",
    letter: "",
  },
  {
    name: "Code.exe",
    cpu: "8.1%",
    memory: "310 MB",
    logo: "code",
    letter: "⋈",
  },
  {
    name: "python.exe",
    cpu: "5.6%",
    memory: "280 MB",
    logo: "python",
    letter: "Py",
  },
  {
    name: "Discord.exe",
    cpu: "3.2%",
    memory: "190 MB",
    logo: "discord",
    letter: "••",
  },
  {
    name: "explorer.exe",
    cpu: "1.9%",
    memory: "120 MB",
    logo: "folder",
    letter: "",
  },
]
function Bars({ variant = 0 }: { variant?: number }) {
  return (
    <div className="mini-bars">
      {Array.from({ length: 14 }, (_, i) => (
        <i
          key={i}
          style={{
            height: `${[20, 17, 33, 29, 26, 40, 65, 52, 43, 49, 58, 72, 68, 86][(i + variant) % 14]}%`,
          }}
        />
      ))}
    </div>
  )
}
function Sparkline({ second = false }: { second?: boolean }) {
  return (
    <svg className="sparkline" viewBox="0 0 100 60">
      <defs>
        <linearGradient id={`spark${second}`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#c76a28" stopOpacity=".55" />
          <stop offset="1" stopColor="#d69e48" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={
          second
            ? "M0 56 10 49 20 48 30 39Q35 34 43 44T60 39 76 27 100 20V60H0Z"
            : "M0 58 10 47 19 49 28 30Q33 20 43 34T59 37 70 20 80 27L96 4V60H0Z"
        }
        fill={`url(#spark${second})`}
        stroke="#a76422"
        strokeWidth="1.5"
      />
    </svg>
  )
}
function PerformanceChart({ period }: { period: string }) {
  const gradientId = useId()
  const shift =
    period === "1h" ? 12 : period === "6h" ? -9 : period === "7d" ? 7 : 0
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
          <path
            d={`M0 88 C60 140 100 25 160 64 S240 64 270 80 S340 127 385 78 S450 82 490 70 S570 151 630 96 S680 103 720 62 L720 160H0Z`}
            fill={`url(#${gradientId}-red)`}
            stroke="#bd1829"
            strokeWidth="1.6"
            transform={`translate(0,${shift})`}
          />
          <path
            d="M0 100C70 92 110 111 155 114S230 50 285 89 360 103 395 84 465 110 510 99 550 86 585 86 640 19 680 48 705 58 720 65V160H0Z"
            fill={`url(#${gradientId}-red)`}
            stroke="#8b1721"
            strokeWidth="1.5"
          />
          <path
            d="M0 87C55 57 62 97 125 104S195 118 235 95 310 100 350 86 419 77 440 87 500 122 550 114 610 126 655 102 700 72 720 61V160H0Z"
            fill={`url(#${gradientId}-gold)`}
            stroke="#daa55b"
            strokeWidth="1.2"
          />
          <path
            d="M0 133Q35 113 67 132T135 133 205 132 270 127 340 127 400 111 430 117 490 110 550 130 620 128 675 124 720 124"
            fill="none"
            stroke="#ffe2a0"
            strokeWidth="1.6"
          />
          <path d="M440 60v100" stroke="#fff6d9" strokeDasharray="4 4" />
          <circle cx="440" cy="63" r="5" fill="#c00e27" stroke="#8b0b1b" />
          {[0, 180, 340, 518, 600, 720].map((x, i) => (
            <circle
              key={x}
              cx={x}
              cy={[88, 112, 99, 74, 114, 62][i]}
              r="2.8"
              fill={i % 2 ? "#fff6db" : "#ce2234"}
            />
          ))}
        </svg>
        <div className="chart-tooltip">
          <i />
          68% <span>• 4:30 PM</span>
        </div>
        <div className="x-labels">
          {["12AM", "4AM", "8AM", "12PM", "4PM", "8PM", "12AM"].map((x, i) => (
            <span key={i}>{x}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
function NetworkChart() {
  const gradientId = useId()
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
        <path
          d="M0 80C28 69 39 35 70 42S105 57 130 39 150 43 177 16 213-1 235 12 275 69 297 54 325 37 350 29V105H0Z"
          fill={`url(#${gradientId})`}
          stroke="#a81c26"
          strokeWidth="1.6"
        />
        <path d="M220 3v102" stroke="#fff4db" strokeDasharray="4 3" />
        <circle
          cx="220"
          cy="4"
          r="6"
          fill="#ae0b22"
          stroke="#fff6e3"
          strokeWidth="2"
        />
        <circle cx="104" cy="49" r="2.5" fill="#fff3df" stroke="#c93038" />
        <circle cx="292" cy="55" r="3" fill="#b60019" />
      </svg>
    </div>
  )
}
const tabDescriptions: Record<string, string> = {
  "Live Monitor": "A closer look at your system's performance and running processes.",
  "AI Detection": "Behavioral analysis that helps you stay one step ahead.",
  "Threat Center": "Investigate, review, and manage security alerts in one place.",
  Network: "Understand your traffic, connections, and connected devices.",
  Forensics: "Follow the evidence. Explore a timeline of system activity.",
  Reports: "Your security posture, clearly summarized and ready to share.",
  Settings: "Make DefenX work the way you do.",
}
const activity = [
  { time: "16:30:24", event: "Suspicious process isolated", source: "chrome.exe", category: "Process", result: "Contained" },
  { time: "16:27:10", event: "Outbound connection blocked", source: "185.220.101.42", category: "Network", result: "Blocked" },
  { time: "16:20:06", event: "New device discovered", source: "192.168.1.105", category: "Network", result: "Review" },
  { time: "16:15:42", event: "Behavior analysis completed", source: "AI engine", category: "Analysis", result: "Normal" },
  { time: "16:00:00", event: "Scheduled system scan completed", source: "DefenX scanner", category: "Analysis", result: "Normal" },
]
function TabContent({ active, dark, setDark, openDetail }: { active: string; dark: boolean; setDark: (value: boolean) => void; openDetail: (title: string) => void }) {
  const [period, setPeriod] = useState("24h")
  const [paused, setPaused] = useState(false)
  const [filter, setFilter] = useState("All")
  const [eventQuery, setEventQuery] = useState("")
  const [eventType, setEventType] = useState("All")
  const [reviewed, setReviewed] = useState<string[]>([])
  const [scanDone, setScanDone] = useState(false)
  const [notice, setNotice] = useState("")
  const [settings, setSettings] = useState<Record<string, boolean>>({ "Real-time protection": true, "Behavioral analysis": true, "Automatic security updates": true, "Threat notifications": true, "Weekly security summary": false })
  useEffect(() => { setNotice("") }, [active])
  function downloadReport(title: string) {
    const rows = title === "Threat activity"
      ? [["Alert", "Detail", "Review status"], ...alerts.map(a => [a.title, a.detail, reviewed.includes(a.title) ? "Reviewed" : "Awaiting review"])]
      : title === "System performance"
        ? [["Process", "CPU", "Memory", "Status"], ...processes.map(p => [p.name, p.cpu, p.memory, "Normal"])]
        : [["Metric", "Value"], ["Protection", "Active"], ["Processes monitored", "5"], ["Alerts", "3"], ["CPU usage", "36%"], ["Memory usage", "58%"]]
    const csv = [["DefenX demo report", title], ...rows].map(row => row.map(value => `"${value.replace(/"/g, '""')}"`).join(",")).join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `${title.toLowerCase().replace(/ /g, "-")}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setNotice(`${title} downloaded as CSV.`)
  }
  function summary(items: { label: string; value: string; detail: string; icon: IconName }[]) {
    return <div className="tab-summary">{items.map(item => <article className="card summary-card" key={item.label}><div className="stat-icon"><Icon name={item.icon} size={27}/></div><div><span>{item.label}</span><strong>{item.value}</strong><small>{item.detail}</small></div></article>)}</div>
  }
  function processTable() {
    return <div className="table-scroll"><table className="data-table"><thead><tr><th>Process</th><th>CPU usage</th><th>Memory</th><th>Status</th><th>Details</th></tr></thead><tbody>{processes.map(p => <tr key={p.name}><td><span className="process-name"><span className={`process-logo ${p.logo}`}>{p.letter}</span>{p.name}</span></td><td>{p.cpu}</td><td>{p.memory}</td><td><span className="normal"><i/>Normal</span></td><td><button className="text-button" onClick={() => openDetail(p.name)}>Inspect <Icon name="arrow" size={16}/></button></td></tr>)}</tbody></table></div>
  }
  return <section className="tab-page" aria-labelledby="page-title">
    <div className="tab-page-heading"><div><span className="eyebrow">DEFENX / {active.toUpperCase()}</span><h1 id="page-title">{active}</h1><p>{tabDescriptions[active]}</p></div><span className="demo-label">Demo workspace</span></div>
    {notice && <div className="inline-notice" role="status"><Icon name="shield" size={20}/>{notice}<button onClick={() => setNotice("")} aria-label="Dismiss message">×</button></div>}
    {active === "Live Monitor" && <>
      {summary([{ label: "CPU usage", value: "36%", detail: "Within normal range", icon: "cpu" }, { label: "Memory usage", value: "58%", detail: "9.3 GB of 16 GB", icon: "database" }, { label: "Running processes", value: "5", detail: "All processes healthy", icon: "layers" }])}
      <section className="card tab-panel monitor-panel"><div className="section-heading"><h2><Icon name="pulse"/>System Performance</h2><button className="secondary-button" onClick={() => setPaused(!paused)}>{paused ? "Resume monitoring" : "Pause monitoring"}</button></div><div className="tab-toolbar"><span className={paused ? "muted" : "live"}>{paused ? "Display paused" : "Sample telemetry"}</span><div className="periods">{["1h", "6h", "24h", "7d"].map(p => <button key={p} className={period === p ? "selected" : ""} disabled={paused} onClick={() => setPeriod(p)}>{p}</button>)}</div></div><PerformanceChart period={period}/></section>
      <section className="card tab-panel"><div className="section-heading"><h2><Icon name="layers"/>Running Processes</h2><span className="muted">5 processes</span></div>{processTable()}</section>
    </>}
    {active === "AI Detection" && <>
      {summary([{ label: "Anomaly score", value: "12.4 / 100", detail: "Normal behavior", icon: "pulse" }, { label: "Detection engine", value: "Active", detail: "Behavioral analysis enabled", icon: "brain" }, { label: "Processes analyzed", value: scanDone ? "5 / 5" : "5", detail: scanDone ? "Demo analysis completed" : "No active threats found", icon: "shield" }])}
      <div className="tab-columns"><section className="card tab-panel"><div className="section-heading"><h2><Icon name="brain"/>Behavioral Analysis</h2><span className="beta">AI powered</span></div><div className="analysis-score"><div className="score-ring"><strong>12.4<span>/ 100</span></strong></div><div><h3>Normal behavior</h3><p>System activity is within expected patterns. Suspicious events have been contained.</p></div></div><button className="primary-button" onClick={() => { setScanDone(true); setNotice("Demo analysis completed: 5 sample processes reviewed. No additional anomalies found.") }}>Run demo analysis <Icon name="sparkles" size={18}/></button></section><section className="card tab-panel"><h2><Icon name="sparkles"/>Detection Coverage</h2>{[["Process behavior", 96], ["Network patterns", 91], ["System integrity", 98]].map(([label, value]) => <div className="coverage" key={label}><div><span>{label}</span><strong>{value}%</strong></div><div className="coverage-track"><i style={{ width: `${value}%` }}/></div></div>)}<p className="muted">Illustrative coverage metrics for this demo workspace.</p></section></div>
      <section className="card tab-panel"><h2><Icon name="layers"/>Analyzed Processes</h2>{processTable()}</section>
    </>}
    {active === "Threat Center" && <>
      {summary([{ label: "Total alerts", value: "3", detail: "In this demo workspace", icon: "alert" }, { label: "Awaiting review", value: String(3 - reviewed.length), detail: "Review the details below", icon: "search" }, { label: "Reviewed", value: String(reviewed.length), detail: "During this session", icon: "shield" }])}
      <section className="card tab-panel"><div className="section-heading"><h2><Icon name="alert"/>Security Alerts</h2><span className="muted">{filter === "All" ? 3 : filter === "Reviewed" ? reviewed.length : 3 - reviewed.length} alerts</span></div><div className="filter-chips" aria-label="Filter alerts">{["All", "Awaiting review", "Reviewed"].map(f => <button key={f} aria-pressed={filter === f} className={filter === f ? "selected" : ""} onClick={() => setFilter(f)}>{f}</button>)}</div><div className="detailed-alerts">{alerts.filter(a => filter === "All" || (filter === "Reviewed" ? reviewed.includes(a.title) : !reviewed.includes(a.title))).map(a => <article className={`detailed-alert ${a.type}`} key={a.title}><span className="alert-symbol">{a.symbol}</span><div><div className="alert-title"><h3>{a.title}</h3><time>{a.time}</time></div><p>{a.description}</p><div className="alert-controls"><button className="text-button" onClick={() => openDetail(a.title)}>View evidence <Icon name="arrow" size={16}/></button><button className="secondary-button" onClick={() => setReviewed(reviewed.includes(a.title) ? reviewed.filter(t => t !== a.title) : [...reviewed, a.title])}>{reviewed.includes(a.title) ? "Reopen review" : "Mark as reviewed"}</button>{reviewed.includes(a.title) && <span className="normal"><i/>Reviewed</span>}</div></div></article>)}</div>{!alerts.some(a => filter === "All" || (filter === "Reviewed" ? reviewed.includes(a.title) : !reviewed.includes(a.title))) && <div className="empty-state"><Icon name="shield" size={40}/><h3>You're all caught up</h3><p>No alerts in this view.</p></div>}</section>
    </>}
    {active === "Network" && <>
      {summary([{ label: "Download speed", value: "48.2 Mbps", detail: "Incoming traffic", icon: "pulse" }, { label: "Upload speed", value: "12.6 Mbps", detail: "Outgoing traffic", icon: "globe" }, { label: "Connected devices", value: "3", detail: "1 device awaiting review", icon: "cpu" }])}
      <div className="tab-columns"><section className="card tab-panel traffic-panel"><div className="section-heading"><h2><Icon name="globe"/>Traffic Overview</h2><span className="live"><i/>Sample traffic</span></div><NetworkChart/><div className="network-speeds"><span><b>↓</b>48.2 Mbps</span><span><b>↑</b>12.6 Mbps</span></div></section><section className="card tab-panel"><h2><Icon name="shield"/>Connection Security</h2><div className="connection-health"><Icon name="shield" size={46}/><h3>Your network is protected</h3><p>Unknown outbound connections are blocked. Review new devices before trusting them.</p></div></section></div>
      <section className="card tab-panel"><h2><Icon name="cpu"/>Connected Devices</h2><div className="table-scroll"><table className="data-table"><thead><tr><th>Device</th><th>IP address</th><th>Connection</th><th>Status</th></tr></thead><tbody>{[["This workstation", "192.168.1.101", "Ethernet", "Trusted"], ["Office router", "192.168.1.1", "Gateway", "Trusted"], ["Unknown device", "192.168.1.105", "Wi-Fi", "Review"]].map(d => <tr key={d[1]}><td>{d[0]}</td><td>{d[1]}</td><td>{d[2]}</td><td>{d[3] === "Review" ? <button className="text-button" onClick={() => openDetail("New Device Connected")}>Review device <Icon name="arrow" size={16}/></button> : <span className="normal"><i/>Trusted</span>}</td></tr>)}</tbody></table></div></section>
    </>}
    {active === "Forensics" && <>
      {summary([{ label: "Recorded events", value: "5", detail: "Sample activity timeline", icon: "file" }, { label: "Contained events", value: "2", detail: "Process and connection", icon: "shield" }, { label: "Investigation scope", value: "This device", detail: "Current session", icon: "search" }])}
      <section className="card tab-panel"><div className="section-heading"><h2><Icon name="search"/>Event Timeline</h2><span className="muted">Today · sample data</span></div><div className="tab-toolbar"><label className="field-search"><Icon name="search" size={19}/><input aria-label="Search events" placeholder="Search events or sources..." value={eventQuery} onChange={e => setEventQuery(e.target.value)}/></label><select aria-label="Event type" value={eventType} onChange={e => setEventType(e.target.value)}>{["All", "Process", "Network", "Analysis"].map(t => <option key={t} value={t}>{t === "All" ? "All event types" : t}</option>)}</select></div><div className="table-scroll"><table className="data-table"><thead><tr><th>Time</th><th>Event</th><th>Source</th><th>Type</th><th>Outcome</th></tr></thead><tbody>{activity.filter(e => (eventType === "All" || e.category === eventType) && `${e.event} ${e.source}`.toLowerCase().includes(eventQuery.toLowerCase())).map(e => <tr key={e.time}><td className="event-time">{e.time}</td><td>{e.event}</td><td>{e.source}</td><td>{e.category}</td><td><span className={e.result === "Review" ? "review-badge" : "normal"}>{e.result}</span></td></tr>)}</tbody></table></div>{!activity.some(e => (eventType === "All" || e.category === eventType) && `${e.event} ${e.source}`.toLowerCase().includes(eventQuery.toLowerCase())) && <div className="empty-state"><Icon name="search" size={36}/><h3>No matching events</h3><p>Try a different search or event type.</p></div>}</section>
    </>}
    {active === "Reports" && <>
      <div className="report-banner card"><div className="stat-icon"><Icon name="file" size={32}/></div><div><h2>Security insights, ready to share</h2><p>Download a CSV summary of the sample data in this workspace.</p></div><button className="primary-button" onClick={() => downloadReport("Security overview")}>Export overview <Icon name="arrow" size={18}/></button></div>
      <div className="reports-grid">{[{ title: "Security overview", description: "Protection status, system health, and a high-level summary.", icon: "shield" as IconName }, { title: "Threat activity", description: "Alert counts and a snapshot of current security activity.", icon: "alert" as IconName }, { title: "System performance", description: "CPU, memory, and monitored process summary.", icon: "pulse" as IconName }].map(report => <article className="card tab-panel report-card" key={report.title}><div className="report-icon"><Icon name={report.icon} size={31}/></div><span className="eyebrow">DEMO REPORT · CSV</span><h2>{report.title}</h2><p>{report.description}</p><button className="secondary-button" onClick={() => downloadReport(report.title)}>Download report <Icon name="arrow" size={17}/></button></article>)}</div>
    </>}
    {active === "Settings" && <>
      <div className="settings-note"><Icon name="shield" size={19}/><span>Preview settings apply to this session only. No device configuration is changed.</span></div>
      <div className="tab-columns settings-columns"><section className="card tab-panel"><h2><Icon name="shield"/>Protection & Notifications</h2><div className="settings-list">{Object.entries(settings).map(([label, enabled]) => <label key={label}><span><strong>{label}</strong><small>{label === "Real-time protection" ? "Monitor suspicious activity as it happens." : label === "Behavioral analysis" ? "Identify unusual application behavior." : label === "Automatic security updates" ? "Keep detection definitions up to date." : label === "Threat notifications" ? "Stay informed about new security alerts." : "Receive a summary of your security posture."}</small></span><input type="checkbox" role="switch" checked={enabled} onChange={e => setSettings({ ...settings, [label]: e.target.checked })}/></label>)}</div><span className="muted">Changes are applied automatically in this demo.</span></section><div className="settings-side"><section className="card tab-panel"><h2><Icon name="sun"/>Appearance</h2><p className="muted">Choose your workspace color theme.</p><div className="theme-options"><button className={!dark ? "selected" : ""} aria-pressed={!dark} onClick={() => setDark(false)}><Icon name="sun"/>Light</button><button className={dark ? "selected" : ""} aria-pressed={dark} onClick={() => setDark(true)}><Icon name="moon"/>Dark</button></div></section><section className="card tab-panel"><h2><Icon name="shield"/>About DefenX</h2><p className="muted">AI Cybersecurity · Interface preview</p><div className="about-row"><span>Workspace</span><strong>Demo</strong></div><div className="about-row"><span>Analyst</span><strong>Akhilesh A S</strong></div><div className="about-row"><span>Data source</span><strong>Sample data</strong></div></section></div></div>
    </>}
  </section>
}
function currentTab() {
  return navigation.find(item => item.label.toLowerCase().replace(/ /g, "-") === window.location.hash.slice(1))?.label ?? "Dashboard"
}
export default function App() {
  const [active, setActive] = useState(currentTab)
  useEffect(() => {
    const onHashChange = () => setActive(currentTab())
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".sidebar nav")
    const selected = nav?.querySelector<HTMLElement>('[aria-current="page"]')
    if (nav && selected && window.innerWidth <= 700) {
      nav.scrollTo({ left: selected.offsetLeft - nav.clientWidth / 2 + selected.clientWidth / 2 })
    }
  }, [active])
  function navigate(tab: string) {
    setActive(tab)
    window.location.hash = tab.toLowerCase().replace(/ /g, "-")
    setModal(null)
    setProfileOpen(false)
    setNotifications(false)
    window.scrollTo({ top: 0, behavior: "instant" })
  }
  const [period, setPeriod] = useState("24h")
  const [modal, setModal] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [prompt, setPrompt] = useState("")
  const [answer, setAnswer] = useState("No unusual activity detected.")
  const [dark, setDark] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState(false)
  function askAssistant(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim()) return
    setAnswer(
      /network|connection/i.test(prompt)
        ? "Your network is secure. 1 new device is awaiting review."
        : /threat|alert/i.test(prompt)
          ? "3 alerts need review. All suspicious activity is contained."
          : "Your system is protected. All 5 processes are running normally.",
    )
    setPrompt("")
  }
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
            <span>AI Cybersecurity</span>
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
              {item.label === "Threat Center" && <b className="count">3</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="system-online">
            <div>
              <i className="status-dot" />
              <strong>System Online</strong>
            </div>
            <p>All systems operational</p>
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
            onClick={() => setDark(!dark)}
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
              aria-label="Search threats, processes, or logs"
              placeholder="Search threats, processes, or logs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd>Ctrl + K</kbd>
            {query && (
              <div className="search-results">
                {[
                  ...processes.map((p) => p.name),
                  ...alerts.map((a) => a.title),
                ]
                  .filter((p) => p.toLowerCase().includes(query.toLowerCase()))
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setModal(p)
                        setQuery("")
                      }}
                    >
                      {p}
                      <Icon name="arrow" size={16} />
                    </button>
                  ))}
                {![
                  ...processes.map((p) => p.name),
                  ...alerts.map((a) => a.title),
                ].some((p) =>
                  p.toLowerCase().includes(query.toLowerCase()),
                ) && <p>No results found.</p>}
              </div>
            )}
          </div>
          <div className="top-actions">
            <div className="notification-wrap">
              <button
                className="round-button"
                aria-label="Notifications"
                onClick={() => setNotifications(!notifications)}
              >
                <Icon name="bell" />
                <b>3</b>
              </button>
              {notifications && (
                <div className="notification-menu">
                  <strong>Notifications</strong>
                  {alerts.map((a) => (
                    <button
                      key={a.title}
                      onClick={() => {
                        setModal(a.title)
                        setNotifications(false)
                      }}
                    >
                      {a.title}
                      <small>{a.time}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              className="round-button"
              aria-label="Settings"
              onClick={() => navigate("Settings")}
            >
              <Icon name="settings" />
            </button>
            <div className="profile-wrap">
              <button
                className="profile"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="avatar">AS</div>
                <div>
                  <strong>Akhilesh A S</strong>
                  <span>Security Analyst</span>
                </div>
                <Icon name="chevron" size={19} />
              </button>
              {profileOpen && (
                <div className="profile-menu">
                  <strong>Akhilesh A S</strong>
                  <span>Security Analyst</span>
                  <button
                    onClick={() => {
                      navigate("Settings")
                      setProfileOpen(false)
                    }}
                  >
                    Account settings <Icon name="arrow" size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div hidden={active !== "Dashboard"}>
        <section className="welcome">
          <div>
            <h1>Welcome Back, Akhilesh</h1>
            <p>Your device is secure and under real-time monitoring.</p>
          </div>
          <div className="protection">
            <i className="status-dot" />
            Live Protection Active
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
              <strong>Protected</strong>
              <small>No active threats</small>
            </div>
            <i className="tiny-dot" />
            <Sparkline />
          </article>
          <article className="stat card">
            <div className="stat-icon">
              <Icon name="pulse" size={35} />
            </div>
            <div className="stat-content">
              <label>Anomaly Score</label>
              <strong>
                12.4 <em>/ 100</em>
              </strong>
              <small>Normal behavior</small>
            </div>
            <span className="trend">↓ 18%</span>
            <Sparkline second />
          </article>
          <article className="stat card">
            <div className="stat-icon">
              <Icon name="cpu" size={32} />
            </div>
            <div className="stat-content">
              <label>CPU Usage</label>
              <strong>36%</strong>
              <small>Normal</small>
            </div>
            <Bars />
          </article>
          <article className="stat card">
            <div className="stat-icon">
              <Icon name="database" size={33} />
            </div>
            <div className="stat-content">
              <label>Memory Usage</label>
              <strong>58%</strong>
              <small>Normal</small>
            </div>
            <Bars variant={2} />
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
                System Performance
              </h2>
              <div className="periods">
                {["1h", "6h", "24h", "7d"].map((p) => (
                  <button
                    className={period === p ? "selected" : ""}
                    onClick={() => setPeriod(p)}
                    key={p}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="legend">
              <span>
                <i className="red" />
                CPU
              </span>
              <span>
                <i className="gold" />
                Memory
              </span>
              <span>
                <i className="wine" />
                Network
              </span>
            </div>
            <PerformanceChart period={period} />
          </section>
          <section className="card threats">
            <div className="section-heading">
              <h2>
                <Icon name="alert" size={29} />
                Threat Alerts
              </h2>
              <button
                className="text-button"
                onClick={() => setModal("All threat alerts")}
              >
                View All <Icon name="arrow" size={17} />
              </button>
            </div>
            <div className="alert-list">
              {alerts.map((a) => (
                <button
                  key={a.title}
                  className={`alert-row ${a.type}`}
                  onClick={() => setModal(a.title)}
                >
                  <i className="alert-line" />
                  <span className="alert-symbol">{a.symbol}</span>
                  <span className="alert-text">
                    <strong>{a.title}</strong>
                    <small>{a.detail}</small>
                  </span>
                  <time>{a.time}</time>
                </button>
              ))}
            </div>
          </section>
          <section className="card processes">
            <div className="section-heading">
              <h2>
                <Icon name="layers" size={28} />
                Top Processes
              </h2>
              <button
                className="text-button"
                onClick={() => setModal("All running processes")}
              >
                View All <Icon name="arrow" size={17} />
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Process</th>
                  <th>CPU</th>
                  <th>Memory</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((p) => (
                  <tr key={p.name}>
                    <td>
                      <span className={`process-logo ${p.logo}`}>
                        {p.letter}
                      </span>
                      {p.name}
                    </td>
                    <td>{p.cpu}</td>
                    <td>{p.memory}</td>
                    <td>
                      <span className="normal">
                        <i />
                        Normal
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
                AI Security Assistant
              </h2>
              <span className="beta">Beta</span>
            </div>
            <div className="assistant-message">
              <div className="bot-avatar">
                <Icon name="bot" size={45} />
              </div>
              <div className="speech">
                <strong>Your system looks good!</strong>
                <p>{answer}</p>
              </div>
            </div>
            <form onSubmit={askAssistant} className="assistant-input">
              <Icon name="sparkles" size={22} />
              <input
                placeholder="Ask anything..."
                aria-label="Ask the security assistant"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button aria-label="Send message">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
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
                Live
              </span>
            </div>
            <NetworkChart />
            <div className="network-speeds">
              <span>
                <b>↓</b>48.2 Mbps
              </span>
              <span>
                <b>↑</b>12.6 Mbps
              </span>
            </div>
          </section>
        </div>
        </div>
        <div hidden={active === "Dashboard"}>
          <TabContent active={active} dark={dark} setDark={setDark} openDetail={setModal}/>
        </div>
        <footer>
          DefenX Security Platform{" "}
          <span>All systems operational · Last synced just now</span>
        </footer>
      </main>
      {modal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setModal(null)
          }}
        >
          <section
            className="modal card"
            role="dialog"
            aria-modal="true"
            aria-label={modal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-modal"
              aria-label="Close dialog"
              onClick={() => {
                setModal(null)
              }}
            >
              ×
            </button>
            <div className="modal-icon">
              <Icon
                name={
                  modal.includes("etting")
                    ? "settings"
                    : modal.includes("rocess")
                      ? "cpu"
                      : "shield"
                }
                size={32}
              />
            </div>
            <h2>{modal}</h2>
            {alerts.find((a) => a.title === modal) ? (
              <p>{alerts.find((a) => a.title === modal)?.description}</p>
            ) : modal.toLowerCase().includes("process") ||
              modal.endsWith(".exe") ? (
              <div className="modal-list">
                {processes
                  .filter((p) => !modal.endsWith(".exe") || p.name === modal)
                  .map((p) => (
                    <div key={p.name}>
                      <strong>{p.name}</strong>
                      <span>
                        {p.cpu} CPU · {p.memory}
                      </span>
                      <span className="normal">
                        <i />
                        Normal
                      </span>
                    </div>
                  ))}
              </div>
            ) : modal.includes("etting") ? (
              <div className="settings-list">
                {[
                  "Real-time protection",
                  "Threat notifications",
                  "Automatic security updates",
                ].map((s) => (
                  <label key={s}>
                    {s}
                    <input type="checkbox" defaultChecked />
                  </label>
                ))}
              </div>
            ) : modal.includes("threat") || modal === "Threat Center" ? (
              <div className="modal-list">
                {alerts.map((a) => (
                  <button key={a.title} onClick={() => setModal(a.title)}>
                    <strong>{a.title}</strong>
                    <span>{a.detail}</span>
                    <Icon name="arrow" size={18} />
                  </button>
                ))}
              </div>
            ) : (
              <>
                <p>
                  Your device is protected and monitored in real time. No active
                  threats have been found.
                </p>
                <div className="modal-list">
                  <div>
                    <strong>Protection status</strong>
                    <span className="normal">
                      <i />
                      Active
                    </span>
                  </div>
                  <div>
                    <strong>Devices monitored</strong>
                    <span>1 device</span>
                  </div>
                  <div>
                    <strong>Last security scan</strong>
                    <span>Just now</span>
                  </div>
                </div>
              </>
            )}
            <button
              className="primary-button"
              onClick={() => {
                setModal(null)
              }}
            >
              Close details <Icon name="arrow" size={18} />
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
