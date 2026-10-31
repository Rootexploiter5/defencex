"use client" /* Protection & Notifications */ /* Containment Engine Guard */ /* Defense Quota & Credits */ /* Appearance */ /* About This Node */

import React, { useState, useEffect } from "react"
import { Icon } from "@/components/common/Icon"
import { TelemetrySnapshot } from "@/types/defenx"

const DEFAULT_SETTINGS = {
  "Real-time protection": true,
  "Behavioral analysis": true,
  "Automatic security updates": true,
  "Threat notifications": true,
  "Weekly security summary": false,
}

interface OperationsHubViewProps {
  telemetry: TelemetrySnapshot | null
  balance: number
  setBalanceModalOpen: (open: boolean) => void
  dark: boolean
  setDark: (dark: boolean) => void
  safeMode: boolean
  toggleSafeMode: () => void
}

export function OperationsHubView({
  telemetry,
  balance,
  setBalanceModalOpen,
  dark,
  setDark,
  safeMode,
  toggleSafeMode,
}: OperationsHubViewProps) {
  const [settings, setSettings] = useState<Record<string, boolean>>(DEFAULT_SETTINGS)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("defenx_settings")
      if (saved) {
        setSettings(JSON.parse(saved))
      }
    } catch {}
  }, [])

  return (
    <>
      <div className="settings-note">
        <Icon name="shield" size={19} />
        <span>
          Telemetry is connected directly to local Windows CIM host APIs and
          behavioral anomaly engine.
        </span>
      </div>

      <div className="tab-columns settings-columns">
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {}
          <section className="card tab-panel">
            <h2>
              <Icon name="shield" />
              Protection & Real-Time Monitoring
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
                      try {
                        localStorage.setItem(
                          "defenx_settings",
                          JSON.stringify(updated),
                        )
                      } catch {}
                    }}
                  />
                </label>
              ))}
            </div>
          </section>

          {}
          <section className="card tab-panel">
            <div className="section-heading">
              <h2>
                <Icon name="shield" />
                OS Containment Engine Guard
              </h2>
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
                {safeMode
                  ? "Safe-Mode (Dry-Run Guard)"
                  : "Live Windows OS Enforcement"}
              </span>
            </div>
            <p className="muted">
              {safeMode
                ? "Safe-Mode is currently ACTIVE. Any process quarantine (Stop-Process) or firewall block (netsh) actions will be simulated and recorded in forensics without affecting actual system tasks."
                : "⚠️ LIVE ENFORCEMENT is active! Containment actions execute directly on the Windows host operating system. Core kernel processes remain protected by whitelist."}
            </p>
            <button
              className="primary-button"
              onClick={toggleSafeMode}
              style={{
                backgroundColor: safeMode ? "#047857" : "#b91c1c",
                borderColor: safeMode ? "#10b981" : "#ef4444",
              }}
            >
              {safeMode
                ? "Switch to Live Enforcement"
                : "Enable Safe Containment Guard"}
              <Icon name="arrow" size={17} />
            </button>
          </section>
        </div>

        <div className="settings-side">
          {}
          <section className="card tab-panel">
            <h2>
              <Icon name="wallet" />
              Defense Quota & Credits
            </h2>
            <div className="about-row">
              <span>Available Balance</span>
              <strong style={{ color: "#a50020" }}>
                {balance.toLocaleString()} Credits
              </strong>
            </div>
            <div className="about-row">
              <span>Allocation Value</span>
              <strong>${(balance / 10).toFixed(2)} USD</strong>
            </div>
            <div className="about-row">
              <span>Shield Tier</span>
              <strong>Enterprise Real-Time Pro v2.0</strong>
            </div>
            <button
              className="primary-button"
              style={{ marginTop: "14px" }}
              onClick={() => setBalanceModalOpen(true)}
            >
              Manage Balance & Top-up <Icon name="arrow" size={17} />
            </button>
          </section>

          {}
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
                onClick={() => setDark(false)}
              >
                <Icon name="sun" />
                Light
              </button>
              <button
                className={dark ? "selected" : ""}
                aria-pressed={dark}
                onClick={() => setDark(true)}
              >
                <Icon name="moon" />
                Dark
              </button>
            </div>
          </section>

          {}
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
              <strong style={{ color: "#10b981" }}>
                Live CIM Daemon (Connected)
              </strong>
            </div>
            <div className="about-row">
              <span>Baseline Model</span>
              <strong style={{ textTransform: "capitalize" }}>
                Online EWMA ({telemetry?.baselineStatus || "stable"})
              </strong>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
