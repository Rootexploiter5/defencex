import fs from "node:fs"
import path from "node:path"
import { PlaybookPolicy, ProcessInfo, NetworkConnection, TelemetrySnapshot } from "@/types/defenx"
import { quarantineProcess, blockRemoteIp, isSafeMode } from "./containmentEngine"
import { appendForensicEvent } from "./storageEngine"
import { logInfo, logError } from "./logger"

const DATA_DIR = path.join(process.cwd(), "data")
const PLAYBOOKS_FILE = path.join(DATA_DIR, "playbooks.json")

const DEFAULT_PLAYBOOKS: PlaybookPolicy[] = [
  {
    id: "soar-entropy-kill",
    name: "Auto-Quarantine Obfuscated Payloads",
    description: "Automatically terminate processes exhibiting Shannon entropy > 4.75 running from untrusted paths.",
    enabled: true,
    condition: "high_entropy",
    action: "quarantine_process",
    triggerCount: 0,
  },
  {
    id: "soar-c2-firewall",
    name: "Auto-Block C2 Beaconing Sockets",
    description: "Automatically add Windows Firewall rule blocking remote IPs communicating over ports 4444, 1337, or 8080.",
    enabled: true,
    condition: "c2_socket",
    action: "block_ip",
    triggerCount: 0,
  },
  {
    id: "soar-shadow-intercept",
    name: "Ransomware Shadow Purge Intercept",
    description: "Immediately terminate any process attempting vssadmin shadow copy deletion or boot tamper.",
    enabled: true,
    condition: "shadow_purge",
    action: "quarantine_process",
    triggerCount: 0,
  },
  {
    id: "soar-anomaly-spike",
    name: "Critical Anomaly Threshold Alert",
    description: "Generate priority forensic escalation when composite behavioral anomaly index exceeds 88/100.",
    enabled: true,
    condition: "anomaly_spike",
    action: "alert_analyst",
    triggerCount: 0,
  },
]

// Global cache
const globalPlaybooks = globalThis as unknown as {
  __defenx_playbooks?: PlaybookPolicy[]
}

if (!globalPlaybooks.__defenx_playbooks) {
  try {
    if (fs.existsSync(PLAYBOOKS_FILE)) {
      const raw = fs.readFileSync(PLAYBOOKS_FILE, "utf-8")
      globalPlaybooks.__defenx_playbooks = JSON.parse(raw)
    }
  } catch (err) {
    logError("PlaybookEngine.load", err)
  }

  if (!globalPlaybooks.__defenx_playbooks) {
    globalPlaybooks.__defenx_playbooks = DEFAULT_PLAYBOOKS
  }
}

const policies: PlaybookPolicy[] = globalPlaybooks.__defenx_playbooks

function persistPlaybooks() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(PLAYBOOKS_FILE, JSON.stringify(policies, null, 2), "utf-8")
  } catch (err) {
    logError("PlaybookEngine.persistPlaybooks", err)
  }
}

export function getPlaybookPolicies(): PlaybookPolicy[] {
  return [...policies]
}

export function togglePlaybookPolicy(policyId: string): boolean {
  const target = policies.find((p) => p.id === policyId)
  if (!target) return false
  target.enabled = !target.enabled
  persistPlaybooks()

  appendForensicEvent({
    actor: "Security Analyst",
    category: "Security",
    action: "PLAYBOOK_POLICY_TOGGLE",
    target: target.name,
    status: "Success",
    event: `SOAR Playbook Policy '${target.name}' set to ${target.enabled ? "ENABLED" : "DISABLED"}`,
    source: "playbookEngine",
    result: "Normal",
  })

  return target.enabled
}

// Set of already contained targets to avoid repeated executions on the same PID/IP
const executedActions = new Set<string>()

export async function evaluatePlaybooks(
  telemetry: TelemetrySnapshot,
  processes: ProcessInfo[],
  connections: NetworkConnection[],
): Promise<void> {
  const safe = isSafeMode()

  for (const policy of policies) {
    if (!policy.enabled) continue

    // 1. High-Entropy Policy
    if (policy.condition === "high_entropy") {
      for (const proc of processes) {
        if (proc.riskScore >= 75 && proc.riskReasons.some((r) => r.includes("entropy") || r.includes("Base64"))) {
          const actionKey = `quarantine-proc-${proc.pid}`
          if (!executedActions.has(actionKey)) {
            executedActions.add(actionKey)
            policy.triggerCount++
            policy.lastTriggered = Date.now()
            persistPlaybooks()

            logInfo("PlaybookEngine", `Executing '${policy.name}' on PID ${proc.pid} (${proc.name})`)
            await quarantineProcess(proc.pid, proc.name, undefined, safe)

            appendForensicEvent({
              actor: "SOAR Playbook Engine",
              category: "Security",
              action: "AUTO_CONTAINMENT_PLAYBOOK",
              target: `${proc.name} (PID: ${proc.pid})`,
              status: "Contained",
              event: `[SOAR PLAYBOOK] '${policy.name}' automatically quarantined process PID ${proc.pid} (${safe ? "Safe-Mode" : "Live"}).`,
              source: "playbookEngine",
              result: "Contained",
              metadata: { policyId: policy.id, pid: proc.pid, safeMode: safe },
            })
          }
        }
      }
    }

    // 2. C2 Beaconing Socket Policy
    if (policy.condition === "c2_socket") {
      for (const conn of connections) {
        if (conn.isSuspicious && conn.remoteAddress !== "0.0.0.0" && conn.remoteAddress !== "127.0.0.1") {
          const actionKey = `block-ip-${conn.remoteAddress}`
          if (!executedActions.has(actionKey)) {
            executedActions.add(actionKey)
            policy.triggerCount++
            policy.lastTriggered = Date.now()
            persistPlaybooks()

            logInfo("PlaybookEngine", `Executing '${policy.name}' on remote IP ${conn.remoteAddress}`)
            await blockRemoteIp(conn.remoteAddress, undefined, safe)

            appendForensicEvent({
              actor: "SOAR Playbook Engine",
              category: "Security",
              action: "AUTO_FIREWALL_PLAYBOOK",
              target: conn.remoteAddress,
              status: "Blocked",
              event: `[SOAR PLAYBOOK] '${policy.name}' automatically blocked IP ${conn.remoteAddress} on port ${conn.remotePort} (${safe ? "Safe-Mode" : "Live"}).`,
              source: "playbookEngine",
              result: "Blocked",
              metadata: { policyId: policy.id, ip: conn.remoteAddress, port: conn.remotePort, safeMode: safe },
            })
          }
        }
      }
    }

    // 3. Ransomware Shadow Purge Intercept
    if (policy.condition === "shadow_purge") {
      for (const proc of processes) {
        if (proc.riskReasons.some((r) => r.includes("shadows") || r.includes("recovery"))) {
          const actionKey = `quarantine-shadow-${proc.pid}`
          if (!executedActions.has(actionKey)) {
            executedActions.add(actionKey)
            policy.triggerCount++
            policy.lastTriggered = Date.now()
            persistPlaybooks()

            logInfo("PlaybookEngine", `Executing '${policy.name}' on PID ${proc.pid}`)
            await quarantineProcess(proc.pid, proc.name, undefined, safe)
          }
        }
      }
    }

    // 4. Critical Anomaly Spike Escalation
    if (policy.condition === "anomaly_spike") {
      if (telemetry.anomalyScore >= 88) {
        const actionKey = `anomaly-spike-${Math.floor(Date.now() / 60000)}`
        if (!executedActions.has(actionKey)) {
          executedActions.add(actionKey)
          policy.triggerCount++
          policy.lastTriggered = Date.now()
          persistPlaybooks()

          appendForensicEvent({
            actor: "SOAR Playbook Engine",
            category: "Analysis",
            action: "AUTO_ESCALATION_PLAYBOOK",
            target: `Anomaly Index ${telemetry.anomalyScore}/100`,
            status: "Warning",
            event: `[SOAR PLAYBOOK] Anomaly index reached ${telemetry.anomalyScore}/100. Automated incident response ticket created.`,
            source: "playbookEngine",
            result: "Review",
          })
        }
      }
    }
  }
}

