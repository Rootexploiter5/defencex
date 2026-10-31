"use client"

import React from "react"
import { Icon } from "@/components/common/Icon"
import {
  PerformanceChart,
  NetworkChart,
  Sparkline,
  Bars,
} from "@/components/common/Charts"
import {
  TelemetrySnapshot,
  TelemetryPoint,
  ProcessInfo,
  ThreatAlert,
} from "@/types/defenx"

interface DashboardViewProps {
  telemetry: TelemetrySnapshot | null
  history: TelemetryPoint[]
  processes: ProcessInfo[]
  alerts: ThreatAlert[]
  unreviewedAlertCount: number
  openDetail: (title: string) => void
  setActive: (tab: string) => void
  prompt: string
  setPrompt: (p: string) => void
  asking: boolean
  answer: string
  askAssistant: (customPrompt?: string) => Promise<void>
}

export function DashboardView({
  telemetry,
  history,
  processes,
  alerts,
  unreviewedAlertCount,
  openDetail,
  setActive,
  prompt,
  setPrompt,
  asking,
  answer,
  askAssistant,
}: DashboardViewProps) {
  const usernameDisplay = telemetry?.username || "Analyst"

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    askAssistant()
  }

  return (
    <div>
      <section className="welcome">
        <div>
          <h1>Welcome Back, {usernameDisplay}</h1>
          <p>
            Live monitoring active on{" "}
            {telemetry?.hostname || "your workstation"} (
            {telemetry?.platform || "win32"} {telemetry?.arch || "x64"}).
          </p>
        </div>
        <div className="protection">
          <i className="status-dot" />
          Live CIM Telemetry Stream Active
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
            <strong>
              {unreviewedAlertCount === 0 ? "Protected" : "Review Needed"}
            </strong>
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
            <small>
              {telemetry && telemetry.anomalyScore > 35
                ? "Elevated Load"
                : "Healthy Baseline"}
            </small>
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
              {telemetry?.usedMemoryGB ?? 0} GB /{" "}
              {telemetry?.totalMemoryGB ?? 0} GB
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
            <button
              className="text-button"
              onClick={() => setActive("Threat Center")}
            >
              View All <Icon name="arrow" size={17} />
            </button>
          </div>
          <div className="alert-list">
            {alerts.slice(0, 3).map((a) => (
              <button
                key={a.id}
                className={`alert-row ${a.type}`}
                onClick={() => openDetail(a.title)}
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
            {alerts.length === 0 && (
              <p
                style={{
                  padding: "16px 0",
                  color: "#68635c",
                  fontSize: "14px",
                }}
              >
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
            <button
              className="text-button"
              onClick={() => setActive("Live Monitor")}
            >
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
                    <span
                      className={
                        p.status === "Warning" ? "review-badge" : "normal"
                      }
                    >
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
              <p>
                {asking
                  ? "Analyzing live system telemetry and process tree..."
                  : answer}
              </p>
            </div>
          </div>
          <form onSubmit={handleFormSubmit} className="assistant-input">
            <Icon name="sparkles" size={22} />
            <input
              placeholder="Ask about your live CPU, processes, memory, or network..."
              aria-label="Ask the real-time assistant"
              value={prompt}
              disabled={asking}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button aria-label="Send message" disabled={asking}>
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
  )
}
