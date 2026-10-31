"use client" /* Metric Summaries */ /* Real-Time Performance Chart */ /* Multi-Variate Explainability Breakdown */ /* Windows Processes Table */

import React, { useState, useMemo } from "react"
import { Icon } from "@/components/common/Icon"
import { PerformanceChart } from "@/components/common/Charts"
import { TelemetrySnapshot, TelemetryPoint, ProcessInfo } from "@/types/defenx"
import { getRiskColor } from "@/lib/formatters"

interface LiveMonitorViewProps {
  telemetry: TelemetrySnapshot | null
  history: TelemetryPoint[]
  processes: ProcessInfo[]
  refreshAll: () => void
  openDetail: (title: string) => void
}

export function LiveMonitorView({
  telemetry,
  history,
  processes,
  refreshAll,
  openDetail,
}: LiveMonitorViewProps) {
  const [period, setPeriod] = useState("24h")
  const [paused, setPaused] = useState(false)
  const [processQuery, setProcessQuery] = useState("")

  const filteredProcesses = useMemo(() => {
    if (!processQuery.trim()) return processes
    const q = processQuery.toLowerCase()
    return processes.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        String(p.pid).includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.riskReasons.some((r) => r.toLowerCase().includes(q)),
    )
  }, [processes, processQuery])

  return (
    <>
      {}
      <div className="tab-summary">
        <article className="card summary-card">
          <div className="stat-icon">
            <Icon name="cpu" size={27} />
          </div>
          <div>
            <span>CPU usage</span>
            <strong>{telemetry?.cpuUsage ?? 0}%</strong>
            <small>
              {telemetry?.cpuCores ?? 0} Cores ·{" "}
              {telemetry?.cpuModel || "Processor"}
            </small>
          </div>
        </article>

        <article className="card summary-card">
          <div className="stat-icon">
            <Icon name="database" size={27} />
          </div>
          <div>
            <span>Memory usage</span>
            <strong>{telemetry?.memoryUsage ?? 0}%</strong>
            <small>
              {telemetry?.usedMemoryGB ?? 0} GB of{" "}
              {telemetry?.totalMemoryGB ?? 0} GB physical RAM
            </small>
          </div>
        </article>

        <article className="card summary-card">
          <div className="stat-icon">
            <Icon name="layers" size={27} />
          </div>
          <div>
            <span>Running processes</span>
            <strong>{processes.length}</strong>
            <small>
              {
                processes.filter(
                  (p) => p.status === "Elevated" || p.status === "Warning",
                ).length
              }{" "}
              elevated / flagged handles
            </small>
          </div>
        </article>
      </div>

      {}
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
            <button
              className="secondary-button"
              onClick={() => setPaused(!paused)}
            >
              {paused ? "Resume monitoring" : "Pause monitoring"}
            </button>
          </div>
        </div>
        <div className="tab-toolbar">
          <span className={paused ? "muted" : "live"}>
            <i />
            {paused
              ? "Display paused"
              : "Live Telemetry Feed (3s Mutex Daemon)"}
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

      {}
      <section className="card tab-panel">
        <div className="section-heading">
          <h2>
            <Icon name="brain" />
            Behavioral Anomaly Explainability Breakdown
          </h2>
          <span
            className="demo-label"
            style={{
              fontWeight: 600,
              backgroundColor:
                (telemetry?.anomalyScore ?? 0) > 75 ? "#fee2e2" : "#fef3c7",
              borderColor:
                (telemetry?.anomalyScore ?? 0) > 75 ? "#ef4444" : "#f59e0b",
              color:
                (telemetry?.anomalyScore ?? 0) > 75 ? "#b91c1c" : "#b45309",
            }}
          >
            Composite Anomaly Index: {telemetry?.anomalyScore ?? 15} / 100
          </span>
        </div>
        <p className="muted" style={{ margin: "4px 0 16px" }}>
          DefenX online EWMA model evaluates multivariate Z-scores and process
          entropy in real time.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "14px",
          }}
        >
          {(telemetry?.featureContributions || []).map((feat) => {
            const zColor =
              Math.abs(feat.zScore) > 2.5
                ? "#ef4444"
                : Math.abs(feat.zScore) > 1.5
                  ? "#f59e0b"
                  : "#10b981"
            return (
              <div
                key={feat.feature}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid #d8c2a1",
                  background: "linear-gradient(130deg, #fffaf1, #f4e8d4)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <strong style={{ fontSize: "14px", color: "#610009" }}>
                    {feat.feature}
                  </strong>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      backgroundColor: `${zColor}20`,
                      color: zColor,
                      border: `1px solid ${zColor}40`,
                    }}
                  >
                    Z-Score: {feat.zScore > 0 ? `+${feat.zScore}` : feat.zScore}
                  </span>
                </div>
                <div
                  style={{
                    height: "6px",
                    width: "100%",
                    background: "#e5d5be",
                    borderRadius: "3px",
                    overflow: "hidden",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${feat.impact}%`,
                      background: zColor,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    color: "#68584e",
                  }}
                >
                  <span>{feat.detail}</span>
                  <strong>{feat.impact}% Impact</strong>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {}
      <section className="card tab-panel">
        <div className="section-heading">
          <h2>
            <Icon name="layers" />
            Active Windows Processes ({processes.length})
          </h2>
          <label className="field-search" style={{ maxWidth: "280px" }}>
            <Icon name="search" size={17} />
            <input
              placeholder="Filter processes, PID, or risks..."
              value={processQuery}
              onChange={(e) => setProcessQuery(e.target.value)}
            />
          </label>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Process</th>
                <th>PID (PPID)</th>
                <th>CPU</th>
                <th>Memory</th>
                <th>Category</th>
                <th>Risk Rating</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredProcesses.slice(0, 30).map((p) => {
                const riskColor = getRiskColor(p.riskScore || 0)
                return (
                  <tr key={`${p.name}-${p.pid}`}>
                    <td>
                      <span className="process-name">
                        <span className="process-logo">
                          <Icon name="layers" size={16} />
                        </span>
                        <div>
                          <strong>{p.name}</strong>
                          {p.riskReasons.length > 0 && (
                            <small
                              style={{
                                color: "#dc2626",
                                display: "block",
                                fontSize: "11px",
                              }}
                            >
                              {p.riskReasons[0]}
                            </small>
                          )}
                        </div>
                      </span>
                    </td>
                    <td>
                      {p.pid}{" "}
                      {p.ppid ? (
                        <small style={{ color: "#8a7565" }}>
                          (PPID: {p.ppid})
                        </small>
                      ) : null}
                    </td>
                    <td>{p.cpu}</td>
                    <td>{p.memory}</td>
                    <td>{p.category}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 700,
                          backgroundColor: `${riskColor}15`,
                          color: riskColor,
                          border: `1px solid ${riskColor}40`,
                        }}
                      >
                        {p.riskScore || 0}/100
                      </span>
                    </td>
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
                    <td>
                      <button
                        className="text-button"
                        onClick={() => openDetail(p.name)}
                      >
                        Inspect <Icon name="arrow" size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
