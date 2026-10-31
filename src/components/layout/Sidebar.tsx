"use client"

import React from "react"
import { Icon, navigation } from "@/components/common/Icon"
import { TelemetrySnapshot } from "@/types/defenx"

interface SidebarProps {
  active: string
  setActive: (tab: string) => void
  dark: boolean
  setDark: (dark: boolean) => void
  telemetry: TelemetrySnapshot | null
  unreviewedAlertCount: number
}

export function Sidebar({
  active,
  setActive,
  dark,
  setDark,
  telemetry,
  unreviewedAlertCount,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <a
        className="brand"
        href="#dashboard"
        onClick={() => setActive("Dashboard")}
      >
        <div className="brand-shield">
          <Icon name="shield" size={53} />
        </div>
        <div>
          <strong>DefenX</strong>
          <span>Real-Time Defense v2.0</span>
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
            onClick={() => setActive(item.label)}
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
            try {
              localStorage.setItem("defenx_theme", next ? "dark" : "light")
            } catch {}
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
  )
}
