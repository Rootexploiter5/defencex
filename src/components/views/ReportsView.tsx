"use client"

import React from "react"
import { Icon, IconName } from "@/components/common/Icon"
import {
  TelemetrySnapshot,
  ProcessInfo,
  ThreatAlert,
  RealNetworkInterface,
  NetworkConnection,
} from "@/types/defenx"

interface ReportsViewProps {
  telemetry: TelemetrySnapshot | null
  alerts: ThreatAlert[]
  processes: ProcessInfo[]
  interfaces: RealNetworkInterface[]
  connections: NetworkConnection[]
  balance: number
  setNotice: (n: string) => void
}

export function ReportsView({
  telemetry,
  alerts,
  processes,
  interfaces,
  connections,
  balance,
  setNotice,
}: ReportsViewProps) {
  function downloadReport(title: string) {
    let rows: (string | number)[][] = []

    if (title === "Threat activity") {
      rows = [
        [
          "Alert Title",
          "Detail",
          "Severity",
          "Source",
          "MITRE Tactic",
          "Review Status",
          "Timestamp",
        ],
        ...alerts.map((a) => [
          a.title,
          a.detail,
          a.severity,
          a.source,
          a.mitreTactic || "Defense Evasion",
          a.reviewed ? "Reviewed" : "Awaiting review",
          new Date(a.timestamp).toISOString(),
        ]),
      ]
    } else if (title === "System performance") {
      rows = [
        [
          "Process Name",
          "PID",
          "PPID",
          "Memory",
          "CPU",
          "Risk Rating",
          "Category",
          "Status",
        ],
        ...processes.map((p) => [
          p.name,
          p.pid,
          p.ppid,
          p.memory,
          p.cpu,
          `${p.riskScore}/100`,
          p.category,
          p.status,
        ]),
      ]
    } else {
      rows = [
        ["Parameter", "Live Measurement"],
        ["Host Machine", telemetry?.hostname || "Local"],
        [
          "Operating System",
          `${telemetry?.platform || "win32"} (${telemetry?.arch || "x64"})`,
        ],
        [
          "Processor",
          `${telemetry?.cpuModel || "CPU"} (${telemetry?.cpuCores || 0} Cores)`,
        ],
        ["CPU Usage", `${telemetry?.cpuUsage || 0}%`],
        [
          "Memory Usage",
          `${telemetry?.memoryUsage || 0}% (${telemetry?.usedMemoryGB || 0} GB used of ${telemetry?.totalMemoryGB || 0
          } GB)`,
        ],
        [
          "Active Network Interfaces",
          interfaces.map((i) => `${i.name} [${i.ip}]`).join("; "),
        ],
        ["Active TCP Sockets", connections.length],
        ["Monitored Processes", processes.length],
        [
          "Heuristic Anomaly Index",
          `${telemetry?.anomalyScore || 0}/100 (${telemetry?.baselineStatus || "stable"})`,
        ],
        ["Active Alerts", alerts.length],
        ["Defense Quota Balance", `${balance} Credits`],
        ["System Uptime", telemetry?.uptimeFormatted || "Unknown"],
        ["Report Generation Time", new Date().toISOString()],
      ]
    }

    const csv = [["DefenX Live Real-Time Security Report", title], ...rows]
      .map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n")

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    )
    const link = document.createElement("a")
    link.href = url
    link.download = `${title.toLowerCase().replace(/ /g, "-")}-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setNotice(`${title} exported as CSV with real-time telemetry.`)
  }

  return (
    <>
      <div className="report-banner card">
        <div className="stat-icon">
          <Icon name="file" size={32} />
        </div>
        <div>
          <h2>Security insights, ready to share</h2>
          <p>
            Download structured CSV summaries compiled directly from live host
            telemetry.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={() => downloadReport("Security overview")}
        >
          Export overview <Icon name="arrow" size={18} />
        </button>
      </div>

      <div className="reports-grid">
        {[
          {
            title: "Security overview",
            description:
              "Hardware telemetry, active sockets, and platform posture summary.",
            icon: "shield" as IconName,
          },
          {
            title: "Threat activity",
            description:
              "Heuristic alerts, severity rankings, MITRE tactics, and triage status.",
            icon: "alert" as IconName,
          },
          {
            title: "System performance",
            description:
              "Full table of all running Windows processes with PIDs, PPIDs, and memory footprint.",
            icon: "pulse" as IconName,
          },
        ].map((report) => (
          <article className="card tab-panel report-card" key={report.title}>
            <div className="report-icon">
              <Icon name={report.icon} size={31} />
            </div>
            <span className="eyebrow">LIVE REPORT · CSV</span>
            <h2>{report.title}</h2>
            <p>{report.description}</p>
            <button
              className="secondary-button"
              onClick={() => downloadReport(report.title)}
            >
              Download report <Icon name="arrow" size={17} />
            </button>
          </article>
        ))}
      </div>
    </>
  )
}
