"use client" /* Metric Summaries */ /* Forensic Timeline */

import React, { useState, useMemo } from "react"
import { Icon } from "@/components/common/Icon"
import { ForensicEvent, TelemetrySnapshot } from "@/types/defenx"

interface ForensicsViewProps {
  events: ForensicEvent[]
  telemetry: TelemetrySnapshot | null
}

export function ForensicsView({ events, telemetry }: ForensicsViewProps) {
  const [eventQuery, setEventQuery] = useState("")
  const [eventType, setEventType] = useState("All")

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesType = eventType === "All" || e.category === eventType
      const matchesQuery =
        !eventQuery.trim() ||
        `${e.event} ${e.source} ${e.category} ${e.result} ${e.action} ${e.target}`
          .toLowerCase()
          .includes(eventQuery.toLowerCase())
      return matchesType && matchesQuery
    })
  }, [events, eventType, eventQuery])

  const handleExportCsv = () => {
    window.open("/api/forensics?format=csv", "_blank")
  }

  return (
    <>
      { }
      <div className="tab-summary">
        <article className="card summary-card">
          <div className="stat-icon">
            <Icon name="file" size={27} />
          </div>
          <div>
            <span>Recorded events</span>
            <strong>{events.length}</strong>
            <small>Immutable disk-backed forensic timeline</small>
          </div>
        </article>

        <article className="card summary-card">
          <div className="stat-icon">
            <Icon name="shield" size={27} />
          </div>
          <div>
            <span>Investigated sources</span>
            <strong>{new Set(events.map((e) => e.source)).size}</strong>
            <small>Unique kernel, daemon, & analyst actors</small>
          </div>
        </article>

        <article className="card summary-card">
          <div className="stat-icon">
            <Icon name="search" size={27} />
          </div>
          <div>
            <span>Investigation scope</span>
            <strong>{telemetry?.hostname || "Local Node"}</strong>
            <small>{telemetry?.platform || "win32"} host environment</small>
          </div>
        </article>
      </div>

      { }
      <section className="card tab-panel">
        <div className="section-heading">
          <h2>
            <Icon name="search" />
            Live Forensic Event Timeline
          </h2>
          <button className="secondary-button" onClick={handleExportCsv}>
            <Icon name="download" size={16} /> Export Forensic Log (CSV)
          </button>
        </div>

        <div className="tab-toolbar">
          <label className="field-search">
            <Icon name="search" size={19} />
            <input
              aria-label="Search events"
              placeholder="Search events, sources, actions, or outcomes..."
              value={eventQuery}
              onChange={(e) => setEventQuery(e.target.value)}
            />
          </label>
          <select
            aria-label="Event type"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          >
            {[
              "All",
              "Process",
              "Network",
              "Analysis",
              "System",
              "Security",
            ].map((t) => (
              <option key={t} value={t}>
                {t === "All" ? "All event categories" : t}
              </option>
            ))}
          </select>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Event Description</th>
                <th>Actor / Source</th>
                <th>Action & Target</th>
                <th>Category</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((e) => (
                <tr key={e.id}>
                  <td className="event-time">{e.time}</td>
                  <td>
                    <strong>{e.event}</strong>
                  </td>
                  <td>
                    <span>{e.actor || e.source}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "#5c4d44" }}>
                      {e.action
                        ? `${e.action}: ${e.target}`
                        : e.target || "N/A"}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 7px",
                        borderRadius: "4px",
                        background: "#ede0cf",
                        color: "#5b1d24",
                        fontWeight: 600,
                      }}
                    >
                      {e.category}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        e.result === "Review" ||
                          e.status === "Warning" ||
                          e.status === "Blocked"
                          ? "review-badge"
                          : "normal"
                      }
                    >
                      <i />
                      {e.status || e.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
