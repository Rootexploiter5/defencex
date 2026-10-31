"use client" /* Safe-Mode Containment Mode Badge & Interactive Toggle */ /* AI Assistant Quick Trigger */ /* Balance / Quota Pill */ /* Notification Bell */ /* Profile Dropdown */

import React, { useMemo } from "react"
import { Icon } from "@/components/common/Icon"
import { TelemetrySnapshot, ProcessInfo, ThreatAlert } from "@/types/defenx"

interface TopBarProps {
  query: string
  setQuery: (q: string) => void
  processes: ProcessInfo[]
  alerts: ThreatAlert[]
  balance: number
  setBalanceModalOpen: (open: boolean) => void
  safeMode: boolean
  toggleSafeMode: () => void
  notifications: boolean
  setNotifications: (open: boolean) => void
  profileOpen: boolean
  setProfileOpen: (open: boolean) => void
  setAssistantModalOpen: (open: boolean) => void
  openDetail: (title: string) => void
  setActive: (tab: string) => void
  telemetry: TelemetrySnapshot | null
  unreviewedAlertCount: number
}

export function TopBar({
  query,
  setQuery,
  processes,
  alerts,
  balance,
  setBalanceModalOpen,
  safeMode,
  toggleSafeMode,
  notifications,
  setNotifications,
  profileOpen,
  setProfileOpen,
  setAssistantModalOpen,
  openDetail,
  setActive,
  telemetry,
  unreviewedAlertCount,
}: TopBarProps) {
  const searchResults = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    const procMatches = processes.filter(
      (p) => p.name.toLowerCase().includes(q) || p.pid.toString().includes(q),
    )
    const alertMatches = alerts.filter(
      (a) =>
        a.title.toLowerCase().includes(q) || a.detail.toLowerCase().includes(q),
    )
    return [
      ...procMatches
        .slice(0, 4)
        .map((p) => ({ title: p.name, type: `Process PID ${p.pid}` })),
      ...alertMatches
        .slice(0, 4)
        .map((a) => ({ title: a.title, type: "Threat Alert" })),
    ]
  }, [query, processes, alerts])

  const usernameDisplay = telemetry?.username || "Analyst"
  const userInitials = usernameDisplay.slice(0, 2).toUpperCase()

  return (
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
                  openDetail(r.title)
                  setQuery("")
                }}
              >
                <span>
                  <strong>{r.title}</strong>
                  <small style={{ marginLeft: "8px", color: "#8c6328" }}>
                    ({r.type})
                  </small>
                </span>
                <Icon name="arrow" size={16} />
              </button>
            ))}
            {searchResults.length === 0 && (
              <p>No matching active processes or alerts.</p>
            )}
          </div>
        )}
      </div>

      <div className="top-actions">
        {}
        <button
          onClick={toggleSafeMode}
          title={
            safeMode
              ? "Safe-Mode is active (dry-run containment). Click to switch to live OS enforcement."
              : "Live enforcement is active! Process kills and firewall rules execute directly on OS. Click to engage safe-mode."
          }
          className="demo-label"
          style={{
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            backgroundColor: safeMode
              ? "rgba(16, 185, 129, 0.15)"
              : "rgba(220, 38, 38, 0.2)",
            borderColor: safeMode ? "#10b981" : "#ef4444",
            color: safeMode ? "#047857" : "#b91c1c",
            fontWeight: 600,
            transition: "all 0.2s ease",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: safeMode ? "#10b981" : "#ef4444",
              display: "inline-block",
            }}
          />
          {safeMode ? "Safe Containment Mode (Dry-Run)" : "Live OS Enforcement"}
        </button>

        {}
        <button
          className="round-button"
          aria-label="AI Threat Assistant"
          title="Open AI Neural Triage Assistant"
          onClick={() => setAssistantModalOpen(true)}
          style={{ position: "relative" }}
        >
          <Icon name="bot" />
        </button>

        {}
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

        {}
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
                    openDetail(a.title)
                    setNotifications(false)
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{a.title}</span>
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "2px 6px",
                        borderRadius: "10px",
                        backgroundColor: a.reviewed ? "#e2e8f0" : "#fee2e2",
                        color: a.reviewed ? "#475569" : "#b91c1c",
                      }}
                    >
                      {a.reviewed ? "Reviewed" : "Active"}
                    </span>
                  </div>
                  <small>{a.detail}</small>
                </button>
              ))}
              {alerts.length === 0 && (
                <p style={{ padding: "8px" }}>Zero active alerts.</p>
              )}
            </div>
          )}
        </div>

        <button
          className="round-button"
          aria-label="Settings"
          onClick={() => setActive("Settings")}
        >
          <Icon name="settings" />
        </button>

        {}
        <div className="profile-wrap">
          <button
            className="profile"
            onClick={() => setProfileOpen(!profileOpen)}
          >
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
                  setActive("Settings")
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
  )
}
