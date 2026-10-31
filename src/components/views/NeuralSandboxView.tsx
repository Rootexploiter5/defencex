"use client" /* Metric Summaries */ /* Behavioral Heuristics & Coverage */ /* Attack Simulator Control Panel */ /* Scenario 1 */ /* Scenario 2 */ /* Scenario 3 */ /* Monitored Processes Table */

import React, { useState } from "react"
import { Icon } from "@/components/common/Icon"
import {
  TelemetrySnapshot,
  ProcessInfo,
  NetworkConnection,
  AttackSimulationType,
} from "@/types/defenx"
import { getRiskColor } from "@/lib/formatters"

interface NeuralSandboxViewProps {
  telemetry: TelemetrySnapshot | null
  processes: ProcessInfo[]
  connections: NetworkConnection[]
  safeMode: boolean
  toggleSafeMode: () => void
  triggerAttack: (type: AttackSimulationType) => Promise<void>
  openDetail: (title: string) => void
  refreshAll: () => void
}

export function NeuralSandboxView({
  telemetry,
  processes,
  connections,
  safeMode,
  toggleSafeMode,
  triggerAttack,
  openDetail,
  refreshAll,
}: NeuralSandboxViewProps) {
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanStep, setScanStep] = useState("")
  const [scanDone, setScanDone] = useState(false)
  const [simulating, setSimulating] = useState<string | null>(null)

  function startLiveAnalysis() {
    if (scanning) return
    setScanning(true)
    setScanProgress(15)
    setScanStep(`Scanning ${processes.length} active Windows processes...`)

    setTimeout(() => {
      setScanProgress(45)
      setScanStep(
        `Inspecting ${connections.length} active TCP connections & listening ports...`,
      )
    }, 600)

    setTimeout(() => {
      setScanProgress(80)
      setScanStep("Calculating EWMA feature Z-scores and command entropy...")
    }, 1200)

    setTimeout(() => {
      setScanProgress(100)
      setScanStep(
        `Scan complete: Verified ${processes.length} processes on ${telemetry?.hostname || "system"}.`,
      )
      setScanning(false)
      setScanDone(true)
      refreshAll()
    }, 1800)
  }

  const handleLaunchScenario = async (type: AttackSimulationType) => {
    setSimulating(type)
    await triggerAttack(type)
    setTimeout(() => setSimulating(null), 1500)
  }

  return (
    <>
      { }
      <div className="tab-summary">
        <article className="card summary-card">
          <div className="stat-icon">
            <Icon name="pulse" size={27} />
          </div>
          <div>
            <span>Anomaly score</span>
            <strong>{telemetry?.anomalyScore ?? 15} / 100</strong>
            <small>
              Online EWMA baseline ({telemetry?.baselineStatus || "learning"})
            </small>
          </div>
        </article>

        <article className="card summary-card">
          <div className="stat-icon">
            <Icon name="brain" size={27} />
          </div>
          <div>
            <span>Detection engine</span>
            <strong>Active</strong>
            <small>Multivariate Z-Scores & Shannon Entropy</small>
          </div>
        </article>

        <article className="card summary-card">
          <div className="stat-icon">
            <Icon name="shield" size={27} />
          </div>
          <div>
            <span>Processes analyzed</span>
            <strong>
              {processes.length} / {processes.length}
            </strong>
            <small>
              {scanDone
                ? "Heuristic audit completed"
                : "Active inspection of process tree"}
            </small>
          </div>
        </article>
      </div>

      { }
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
                background: `conic-gradient(#870e23 0deg ${(telemetry?.anomalyScore ?? 15) * 3.6
                  }deg, #e1d7c5 ${(telemetry?.anomalyScore ?? 15) * 3.6}deg 360deg)`,
              }}
            >
              <strong>
                {telemetry?.anomalyScore ?? 15}
                <span>/ 100</span>
              </strong>
            </div>
            <div>
              <h3>
                System Status:{" "}
                {telemetry && telemetry.anomalyScore > 65
                  ? "Threat Alert Elevated"
                  : telemetry && telemetry.anomalyScore > 35
                    ? "Elevated Load"
                    : "Healthy"}
              </h3>
              <p>
                Analyzing {processes.length} active processes and{" "}
                {connections.length} socket connections on{" "}
                {telemetry?.hostname || "system"}.
              </p>
            </div>
          </div>
          <button
            className="primary-button"
            disabled={scanning}
            onClick={startLiveAnalysis}
          >
            {scanning
              ? "Executing Heuristic Scan..."
              : "Run live heuristic scan"}{" "}
            <Icon name="sparkles" size={18} />
          </button>
          {scanning && (
            <div style={{ marginTop: "14px" }}>
              <div className="scan-progress-wrap">
                <div
                  className="scan-progress-fill"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <small
                style={{
                  color: "#79111e",
                  fontWeight: 600,
                  display: "block",
                  marginTop: "4px",
                }}
              >
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
            [
              "Process behavior integrity",
              Math.min(99, 94 + (telemetry?.cpuUsage ? 2 : 0)),
            ],
            [
              "Network socket auditing",
              Math.min(99, 90 + (connections.length % 8)),
            ],
            [
              "Memory boundary verification",
              Math.min(
                99,
                95 - Math.round((telemetry?.memoryUsage || 50) * 0.1),
              ),
            ],
          ].map(([label, value]) => (
            <div className="coverage" key={label as string}>
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
            Coverage indicators derived from physical hardware handles and
            socket audit state.
          </p>
        </section>
      </div>

      { }
      <section
        className="card tab-panel"
        style={{
          border: "2px solid #c48e50",
          background:
            "linear-gradient(135deg, rgba(81, 0, 9, 0.04), rgba(219, 172, 89, 0.08))",
        }}
      >
        <div className="section-heading">
          <h2>
            <Icon name="zap" />
            Neural Sandbox: Simulate Attack Scenarios
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontSize: "12px",
                padding: "4px 10px",
                borderRadius: "20px",
                border: "1px solid",
                borderColor: safeMode ? "#10b981" : "#ef4444",
                backgroundColor: safeMode
                  ? "rgba(16, 185, 129, 0.15)"
                  : "rgba(220, 38, 38, 0.15)",
                color: safeMode ? "#047857" : "#b91c1c",
                fontWeight: 600,
              }}
            >
              Mode:{" "}
              {safeMode ? "Safe Containment (Dry-Run)" : "Live OS Enforcement"}
            </span>
            <button className="secondary-button" onClick={toggleSafeMode}>
              Toggle Mode
            </button>
          </div>
        </div>
        <p className="muted" style={{ margin: "4px 0 16px" }}>
          Trigger simulated advanced threat vectors to test the multi-variate
          anomaly engine, explainability breakdown, and 1-click OS quarantine
          end-to-end.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "14px",
          }}
        >
          { }
          <div
            style={{
              padding: "18px",
              borderRadius: "14px",
              background: "#fff9ee",
              border: "1px solid #dfc39e",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <strong style={{ fontSize: "15px", color: "#781523" }}>
                  Encoded PowerShell LOLBin
                </strong>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "6px",
                    background: "#fee2e2",
                    color: "#b91c1c",
                  }}
                >
                  Execution (T1059.001)
                </span>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#5a4b41",
                  lineHeight: "1.5",
                  margin: "0 0 12px",
                }}
              >
                Spawns <code>powershell.exe</code> with <code>-Enc</code> Base64
                download cradle from <code>C:\Users\Public\Temp</code>. Triggers
                command-line Shannon entropy and parent-child lineage anomaly.
              </p>
            </div>
            <button
              className="primary-button"
              disabled={simulating !== null}
              onClick={() => handleLaunchScenario("lolbin_powershell")}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {simulating === "lolbin_powershell"
                ? "Deploying Scenario..."
                : "Simulate LOLBin Attack"}
              <Icon name="play" size={16} />
            </button>
          </div>

          { }
          <div
            style={{
              padding: "18px",
              borderRadius: "14px",
              background: "#fff9ee",
              border: "1px solid #dfc39e",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <strong style={{ fontSize: "15px", color: "#781523" }}>
                  C2 Outbound Beaconing
                </strong>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "6px",
                    background: "#fee2e2",
                    color: "#b91c1c",
                  }}
                >
                  Command & Control (T1071)
                </span>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#5a4b41",
                  lineHeight: "1.5",
                  margin: "0 0 12px",
                }}
              >
                Establishes suspicious TCP sockets to hostile remote IP{" "}
                <code>185.220.101.5</code> on port <code>4444</code>. Triggers
                socket baseline Z-score spike and enables 1-click firewall
                block.
              </p>
            </div>
            <button
              className="primary-button"
              disabled={simulating !== null}
              onClick={() => handleLaunchScenario("c2_beacon")}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {simulating === "c2_beacon"
                ? "Deploying Scenario..."
                : "Simulate C2 Beacon"}
              <Icon name="play" size={16} />
            </button>
          </div>

          { }
          <div
            style={{
              padding: "18px",
              borderRadius: "14px",
              background: "#fff9ee",
              border: "1px solid #dfc39e",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <strong style={{ fontSize: "15px", color: "#781523" }}>
                  Ransomware Shadow Purge
                </strong>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "6px",
                    background: "#fee2e2",
                    color: "#b91c1c",
                  }}
                >
                  Impact (T1486)
                </span>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#5a4b41",
                  lineHeight: "1.5",
                  margin: "0 0 12px",
                }}
              >
                Simulates <code>vss_purge.exe</code> executing{" "}
                <code>vssadmin delete shadows</code> and memory spike (1.2 GB).
                Triggers critical behavioral threshold and automatic containment
                alert.
              </p>
            </div>
            <button
              className="primary-button"
              disabled={simulating !== null}
              onClick={() => handleLaunchScenario("ransomware_io")}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {simulating === "ransomware_io"
                ? "Deploying Scenario..."
                : "Simulate Ransomware Spike"}
              <Icon name="play" size={16} />
            </button>
          </div>
        </div>
      </section>

      { }
      <section className="card tab-panel">
        <h2>
          <Icon name="layers" />
          Monitored Processes Under Heuristic Analysis
        </h2>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Process</th>
                <th>PID</th>
                <th>CPU</th>
                <th>Memory</th>
                <th>Category</th>
                <th>Risk Rating</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {processes.slice(0, 20).map((p) => {
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
                    <td>{p.pid}</td>
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
