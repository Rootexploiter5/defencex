"use client"

import React from "react"
import { Icon } from "@/components/common/Icon"
import {
  ProcessInfo,
  ThreatAlert,
  TelemetrySnapshot,
  NetworkConnection,
} from "@/types/defenx"

interface DetailModalProps {
  modal: string | null
  onClose: () => void
  alerts: ThreatAlert[]
  processes: ProcessInfo[]
  connections: NetworkConnection[]
  telemetry: TelemetrySnapshot | null
}

export function DetailModal({
  modal,
  onClose,
  alerts,
  processes,
  connections,
  telemetry,
}: DetailModalProps) {
  if (!modal) return null

  const targetAlert = alerts.find((a) => a.title === modal)
  const matchingProcesses = processes.filter(
    (p) => p.name === modal || modal.includes(p.name),
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
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
          onClick={onClose}
        >
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

        {targetAlert ? (
          <div>
            <p>{targetAlert.description}</p>
            <div className="modal-list">
              <div>
                <strong>Severity</strong>
                <span>{targetAlert.severity}</span>
              </div>
              <div>
                <strong>MITRE Tactic</strong>
                <span>{targetAlert.mitreTactic || "Defense Evasion"}</span>
              </div>
              <div>
                <strong>Source</strong>
                <span>{targetAlert.source}</span>
              </div>
              <div>
                <strong>Detail</strong>
                <span>{targetAlert.detail}</span>
              </div>
              <div>
                <strong>Status</strong>
                <span className="normal">
                  <i />
                  {targetAlert.reviewed ? "Reviewed" : "Active Observation"}
                </span>
              </div>
              {targetAlert.containmentAction && (
                <div>
                  <strong>Containment Status</strong>
                  <span style={{ color: "#059669", fontWeight: 600 }}>
                    {targetAlert.containmentAction}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : matchingProcesses.length > 0 ? (
          <div className="modal-list">
            {matchingProcesses.map((p) => (
              <div key={`${p.name}-${p.pid}`}>
                <div>
                  <strong>
                    {p.name} (PID: {p.pid}, PPID: {p.ppid})
                  </strong>
                  <span style={{ display: "block", marginTop: "4px" }}>
                    Memory: {p.memory} · CPU: {p.cpu} · Risk: {p.riskScore}/100
                  </span>
                  {p.riskReasons.length > 0 && (
                    <small
                      style={{
                        color: "#dc2626",
                        display: "block",
                        marginTop: "4px",
                      }}
                    >
                      ⚠️ {p.riskReasons.join(" · ")}
                    </small>
                  )}
                </div>
                <span
                  className={p.status === "Warning" ? "review-badge" : "normal"}
                >
                  <i />
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p>
              Real-time endpoint telemetry active on{" "}
              {telemetry?.hostname || "system"}.
            </p>
            <div className="modal-list">
              <div>
                <strong>CPU Utilization</strong>
                <span>{telemetry?.cpuUsage ?? 0}%</span>
              </div>
              <div>
                <strong>RAM Utilization</strong>
                <span>
                  {telemetry?.memoryUsage ?? 0}% ({telemetry?.usedMemoryGB ?? 0}{" "}
                  GB used)
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
              <div>
                <strong>Behavioral Anomaly Index</strong>
                <span>{telemetry?.anomalyScore ?? 15}/100</span>
              </div>
            </div>
          </div>
        )}

        <button className="primary-button" onClick={onClose}>
          Close details <Icon name="arrow" size={18} />
        </button>
      </section>
    </div>
  )
}
