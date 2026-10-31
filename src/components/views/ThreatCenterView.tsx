"use client" /* Metric Summaries */ /* Incident Queue */ /* Filter Chips */ /* Alert Cards */ /* Actions & Containment Controls */ /* 1-Click OS Process Quarantine */ /* 1-Click IP Firewall Rule */

import React, { useState, useMemo } from "react"
import { Icon } from "@/components/common/Icon"
import { ThreatAlert, TelemetrySnapshot } from "@/types/defenx"
import { getSeverityBadgeColor } from "@/lib/formatters"

interface ThreatCenterViewProps {
  alerts: ThreatAlert[]
  telemetry: TelemetrySnapshot | null
  safeMode: boolean
  toggleSafeMode: () => void
  toggleAlertReviewHandler: (alertId: string) => Promise<void>
  quarantineProcess: (
    pid: number,
    processName?: string,
    alertId?: string,
  ) => Promise<void>
  blockIp: (remoteIp: string, alertId?: string) => Promise<void>
  openDetail: (title: string) => void
}

export function ThreatCenterView({
  alerts,
  telemetry,
  safeMode,
  toggleSafeMode,
  toggleAlertReviewHandler,
  quarantineProcess,
  blockIp,
  openDetail,
}: ThreatCenterViewProps) {
  const [filter, setFilter] = useState("All")
  const [actingAlertId, setActingAlertId] = useState<string | null>(null)

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (filter === "All") return true
      if (filter === "Reviewed") return a.reviewed
      return !a.reviewed
    })
  }, [alerts, filter])

  const handleQuarantine = async (alert: ThreatAlert) => {
    if (!alert.pid) return
    setActingAlertId(alert.id)
    await quarantineProcess(alert.pid, alert.source, alert.id)
    setActingAlertId(null)
  }

  const handleBlockIp = async (alert: ThreatAlert) => {
    if (!alert.remoteIp) return
    setActingAlertId(alert.id)
    await blockIp(alert.remoteIp, alert.id)
    setActingAlertId(null)
  }

  return (
    <>
      {}
      <div className="tab-summary">
        <article className="card summary-card">
          <div className="stat-icon">
            <Icon name="alert" size={27} />
          </div>
          <div>
            <span>Total alerts</span>
            <strong>{alerts.length}</strong>
            <small>Multi-variate heuristic & CIM signals</small>
          </div>
        </article>

        <article className="card summary-card">
          <div className="stat-icon">
            <Icon name="search" size={27} />
          </div>
          <div>
            <span>Awaiting review</span>
            <strong>{alerts.filter((a) => !a.reviewed).length}</strong>
            <small>Active incident queue</small>
          </div>
        </article>

        <article className="card summary-card">
          <div className="stat-icon">
            <Icon name="shield" size={27} />
          </div>
          <div>
            <span>Reviewed & Contained</span>
            <strong>{alerts.filter((a) => a.reviewed).length}</strong>
            <small>Acknowledged in session</small>
          </div>
        </article>
      </div>

      {}
      <section className="card tab-panel">
        <div className="section-heading">
          <h2>
            <Icon name="alert" />
            Live Endpoint Security Incident Queue
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontSize: "12px",
                padding: "4px 10px",
                borderRadius: "20px",
                backgroundColor: safeMode
                  ? "rgba(16, 185, 129, 0.15)"
                  : "rgba(220, 38, 38, 0.15)",
                color: safeMode ? "#047857" : "#b91c1c",
                border: `1px solid ${safeMode ? "#10b981" : "#ef4444"}`,
                fontWeight: 600,
              }}
            >
              Enforcement:{" "}
              {safeMode ? "Safe-Mode (Dry-Run)" : "Live Windows OS"}
            </span>
            <button className="secondary-button" onClick={toggleSafeMode}>
              Toggle
            </button>
          </div>
        </div>

        {}
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

        {}
        <div className="detailed-alerts">
          {filteredAlerts.map((a) => {
            const badge = getSeverityBadgeColor(a.severity)
            const isProcessing = actingAlertId === a.id

            return (
              <article className={`detailed-alert ${a.type}`} key={a.id}>
                <span className="alert-symbol">{a.symbol}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="alert-title">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <h3>{a.title}</h3>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: "6px",
                          backgroundColor: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        {a.severity.toUpperCase()}
                      </span>
                      {a.mitreTactic && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "2px 7px",
                            borderRadius: "6px",
                            backgroundColor: "#fef3c7",
                            color: "#92400e",
                            border: "1px solid #fde68a",
                          }}
                        >
                          MITRE: {a.mitreTactic}
                        </span>
                      )}
                    </div>
                    <time>{a.time}</time>
                  </div>

                  <p style={{ margin: "6px 0 10px" }}>{a.description}</p>

                  {a.anomalyBreakdown && (
                    <div
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: "rgba(0,0,0,0.03)",
                        borderLeft: "3px solid #b91c1c",
                        fontSize: "12px",
                        color: "#6b2c34",
                        marginBottom: "12px",
                      }}
                    >
                      <strong>Explainability:</strong> {a.anomalyBreakdown}
                    </div>
                  )}

                  {a.containmentAction && (
                    <div style={{ marginBottom: "12px" }}>
                      <span
                        style={{
                          fontSize: "12px",
                          padding: "3px 9px",
                          borderRadius: "12px",
                          backgroundColor: "rgba(16, 185, 129, 0.15)",
                          color: "#047857",
                          fontWeight: 600,
                          border: "1px solid #10b981",
                        }}
                      >
                        🛡️ Containment: {a.containmentAction}
                      </span>
                    </div>
                  )}

                  {}
                  <div
                    className="alert-controls"
                    style={{ flexWrap: "wrap", gap: "10px" }}
                  >
                    <button
                      className="text-button"
                      onClick={() => openDetail(a.title)}
                    >
                      View evidence <Icon name="arrow" size={16} />
                    </button>

                    {}
                    {a.pid && (
                      <button
                        className="secondary-button"
                        disabled={isProcessing || a.status === "Quarantined"}
                        onClick={() => handleQuarantine(a)}
                        style={{
                          backgroundColor:
                            a.status === "Quarantined" ? "#f1f5f9" : "#fee2e2",
                          color:
                            a.status === "Quarantined" ? "#64748b" : "#991b1b",
                          borderColor:
                            a.status === "Quarantined" ? "#cbd5e1" : "#fca5a5",
                          fontWeight: 600,
                        }}
                      >
                        <Icon name="shield" size={15} />
                        {a.status === "Quarantined"
                          ? "Process Quarantined"
                          : `Quarantine PID ${a.pid} (${
                              safeMode ? "Dry-Run" : "Stop-Process"
                            })`}
                      </button>
                    )}

                    {}
                    {a.remoteIp && (
                      <button
                        className="secondary-button"
                        disabled={isProcessing}
                        onClick={() => handleBlockIp(a)}
                        style={{
                          backgroundColor: "#fef3c7",
                          color: "#92400e",
                          borderColor: "#fde68a",
                          fontWeight: 600,
                        }}
                      >
                        <Icon name="globe" size={15} />
                        Block {a.remoteIp} (netsh firewall)
                      </button>
                    )}

                    <button
                      className="secondary-button"
                      disabled={isProcessing}
                      onClick={() => toggleAlertReviewHandler(a.id)}
                    >
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
            )
          })}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="empty-state">
            <Icon name="shield" size={40} />
            <h3>Zero unreviewed signals</h3>
            <p>
              All active heuristics on {telemetry?.hostname || "system"} are
              verified.
            </p>
          </div>
        )}
      </section>
    </>
  )
}
