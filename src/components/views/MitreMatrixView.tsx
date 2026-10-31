"use client"

import React, { useState, useMemo } from "react"
import { Icon } from "@/components/common/Icon"
import { ThreatAlert, ProcessInfo, MitreTechnique } from "@/types/defenx"

interface MitreMatrixViewProps {
  alerts: ThreatAlert[]
  processes: ProcessInfo[]
  onSelectTechnique?: (techniqueId: string) => void
  selectedTechniqueId?: string | null
}

interface TacticColumn {
  tactic: string
  techniques: {
    id: string
    name: string
    description: string
  }[]
}

const MITRE_TACTICS: TacticColumn[] = [
  {
    tactic: "Initial Access",
    techniques: [
      { id: "T1189", name: "Drive-by Compromise", description: "Adversary gains access through user web activity" },
      { id: "T1566", name: "Phishing Attachment", description: "Malicious payload delivered via email or web cradle" },
    ],
  },
  {
    tactic: "Execution",
    techniques: [
      { id: "T1059.001", name: "PowerShell LOLBin", description: "PowerShell executing encoded or memory-resident scripts" },
      { id: "T1059.003", name: "Windows Command Shell", description: "cmd.exe spawned by untrusted parent processes" },
      { id: "T1204", name: "User Execution", description: "Direct execution of untrusted executable from temporary folders" },
    ],
  },
  {
    tactic: "Persistence",
    techniques: [
      { id: "T1547", name: "Boot/Logon Autostart", description: "Adversary configures startup folder or registry Run keys" },
      { id: "T1053", name: "Scheduled Task/Job", description: "Persistence established via schtasks or cron hooks" },
    ],
  },
  {
    tactic: "Defense Evasion",
    techniques: [
      { id: "T1027", name: "Obfuscated Files/Enc", description: "Base64 encoding or high Shannon entropy arguments" },
      { id: "T1562", name: "Impair Defenses", description: "Tampering with firewall, safe-mode, or security services" },
      { id: "T1070", name: "Indicator Removal", description: "Clearing event logs or temporary binary drop paths" },
    ],
  },
  {
    tactic: "Discovery",
    techniques: [
      { id: "T1082", name: "System Info Discovery", description: "Querying hardware specs, OS version, and network adapters" },
      { id: "T1057", name: "Process Discovery", description: "Enumerating running processes and memory handles via CIM" },
      { id: "T1046", name: "Network Service Scanning", description: "Scanning local listening ports and remote IP endpoints" },
    ],
  },
  {
    tactic: "Lateral Movement",
    techniques: [
      { id: "T1021", name: "Remote Services", description: "Adversary moving across SMB, RPC, or WinRM ports" },
    ],
  },
  {
    tactic: "Command & Control",
    techniques: [
      { id: "T1071", name: "Application Protocol C2", description: "Beaconing to external C2 server via standard web ports" },
      { id: "T1571", name: "Non-Standard Port C2", description: "Communication over known adversary ports like 4444 or 1337" },
    ],
  },
  {
    tactic: "Impact",
    techniques: [
      { id: "T1486", name: "Data Encrypted for Impact", description: "Ransomware encryption activity and rapid IO variance" },
      { id: "T1490", name: "Inhibit Recovery: Shadow Purge", description: "vssadmin delete shadows or tampering with bootloader" },
    ],
  },
]

export function MitreMatrixView({
  alerts,
  processes,
  onSelectTechnique,
  selectedTechniqueId,
}: MitreMatrixViewProps) {
  const [hoveredTech, setHoveredTech] = useState<MitreTechnique | null>(null)

  // Compute live detection mapping across all techniques
  const techniqueMap = useMemo(() => {
    const map = new Map<string, MitreTechnique>()

    // Check alerts
    for (const alert of alerts) {
      const mitreStr = alert.mitreTactic || ""
      for (const col of MITRE_TACTICS) {
        for (const tech of col.techniques) {
          if (mitreStr.includes(tech.id) || alert.detail.includes(tech.id) || alert.title.toLowerCase().includes(tech.name.toLowerCase())) {
            const existing = map.get(tech.id) || {
              id: tech.id,
              tactic: col.tactic,
              name: tech.name,
              description: tech.description,
              detected: true,
              alertCount: 0,
              pids: [],
            }
            existing.alertCount++
            existing.detected = true
            if (alert.pid && !existing.pids?.includes(alert.pid)) {
              existing.pids?.push(alert.pid)
            }
            map.set(tech.id, existing)
          }
        }
      }
    }

    // Check suspicious processes for LOLBins or high entropy
    for (const proc of processes) {
      if (proc.riskScore >= 40) {
        if (proc.name.toLowerCase().includes("powershell")) {
          const tech = map.get("T1059.001") || {
            id: "T1059.001",
            tactic: "Execution",
            name: "PowerShell LOLBin",
            description: "PowerShell executing encoded or memory-resident scripts",
            detected: true,
            alertCount: 1,
            pids: [proc.pid],
          }
          tech.detected = true
          if (!tech.pids?.includes(proc.pid)) tech.pids?.push(proc.pid)
          map.set("T1059.001", tech)
        }
        if (proc.riskReasons.some((r) => r.includes("entropy") || r.includes("Base64"))) {
          const tech = map.get("T1027") || {
            id: "T1027",
            tactic: "Defense Evasion",
            name: "Obfuscated Files/Enc",
            description: "Base64 encoding or high Shannon entropy arguments",
            detected: true,
            alertCount: 1,
            pids: [proc.pid],
          }
          tech.detected = true
          if (!tech.pids?.includes(proc.pid)) tech.pids?.push(proc.pid)
          map.set("T1027", tech)
        }
        if (proc.riskReasons.some((r) => r.includes("shadows") || r.includes("recovery"))) {
          const tech = map.get("T1490") || {
            id: "T1490",
            tactic: "Impact",
            name: "Inhibit Recovery: Shadow Purge",
            description: "vssadmin delete shadows or tampering with bootloader",
            detected: true,
            alertCount: 1,
            pids: [proc.pid],
          }
          tech.detected = true
          if (!tech.pids?.includes(proc.pid)) tech.pids?.push(proc.pid)
          map.set("T1490", tech)
        }
      }
    }

    return map
  }, [alerts, processes])

  const totalDetected = useMemo(() => {
    let count = 0
    for (const tech of techniqueMap.values()) {
      if (tech.detected) count++
    }
    return count
  }, [techniqueMap])

  return (
    <div style={{ marginTop: "10px", marginBottom: "25px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "17px", color: "#6b0f1a", display: "flex", alignItems: "center", gap: "8px" }}>
            <Icon name="shield" size={18} />
            MITRE ATT&CK Enterprise Matrix (Live Endpoint Coverage)
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#77675e" }}>
            Real-time technique mapping computed from active process tree lineage, entropy metrics, and network sockets.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span
            style={{
              fontSize: "12px",
              padding: "4px 10px",
              borderRadius: "16px",
              background: totalDetected > 0 ? "rgba(220, 38, 38, 0.15)" : "rgba(16, 185, 129, 0.15)",
              color: totalDetected > 0 ? "#b91c1c" : "#047857",
              border: `1px solid ${totalDetected > 0 ? "#ef4444" : "#10b981"}`,
              fontWeight: 700,
            }}
          >
            {totalDetected} Technique{totalDetected === 1 ? "" : "s"} Flagged
          </span>
          {selectedTechniqueId && onSelectTechnique && (
            <button
              className="secondary-button"
              onClick={() => onSelectTechnique("")}
              style={{ padding: "4px 10px", fontSize: "11px" }}
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Grid Container */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "8px",
          background: "rgba(0,0,0,0.03)",
          padding: "14px",
          borderRadius: "14px",
          border: "1px solid #dccbb4",
          overflowX: "auto",
        }}
      >
        {MITRE_TACTICS.map((col) => {
          return (
            <div key={col.tactic} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "#6b0f1a",
                  padding: "6px 8px",
                  background: "#e8dcce",
                  borderRadius: "6px",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={col.tactic}
              >
                {col.tactic}
              </div>

              {col.techniques.map((tech) => {
                const detectedInfo = techniqueMap.get(tech.id)
                const isDetected = !!detectedInfo?.detected
                const isSelected = selectedTechniqueId === tech.id

                return (
                  <button
                    key={tech.id}
                    onClick={() => onSelectTechnique?.(tech.id)}
                    onMouseEnter={() =>
                      setHoveredTech(
                        detectedInfo || {
                          id: tech.id,
                          tactic: col.tactic,
                          name: tech.name,
                          description: tech.description,
                          detected: false,
                          alertCount: 0,
                        },
                      )
                    }
                    onMouseLeave={() => setHoveredTech(null)}
                    style={{
                      padding: "8px 7px",
                      borderRadius: "8px",
                      textAlign: "left",
                      border: isSelected
                        ? "2px solid #b91c1c"
                        : isDetected
                          ? "1px solid #ef4444"
                          : "1px solid #dfd1bd",
                      background: isDetected
                        ? "linear-gradient(135deg, #fee2e2, #fecaca)"
                        : "#fffaf1",
                      cursor: "pointer",
                      boxShadow: isDetected ? "0 2px 6px rgba(220, 38, 38, 0.2)" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: isDetected ? "#991b1b" : "#8c6b4f",
                        }}
                      >
                        {tech.id}
                      </span>
                      {isDetected && (
                        <span
                          style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            background: "#ef4444",
                            boxShadow: "0 0 6px #ef4444",
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: isDetected ? "#7f1d1d" : "#44342a",
                        marginTop: "3px",
                        lineHeight: "1.25",
                      }}
                    >
                      {tech.name}
                    </div>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Hover Information Strip */}
      {hoveredTech && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px 14px",
            borderRadius: "10px",
            background: hoveredTech.detected ? "#fff1f2" : "#fefce8",
            border: `1px solid ${hoveredTech.detected ? "#fecdd3" : "#fef08a"}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "13px",
          }}
        >
          <div>
            <strong>
              [{hoveredTech.id}] {hoveredTech.name}
            </strong>{" "}
            — <span style={{ color: "#57483d" }}>{hoveredTech.description}</span>
          </div>
          <div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "6px",
                background: hoveredTech.detected ? "#ef4444" : "#10b981",
                color: "#fff",
              }}
            >
              {hoveredTech.detected
                ? `DETECTED (${hoveredTech.alertCount} signal${hoveredTech.alertCount === 1 ? "" : "s"})`
                : "VERIFIED NORMAL"}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
