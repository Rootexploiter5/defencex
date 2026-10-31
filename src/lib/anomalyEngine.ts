import {
  FeatureContribution,
  ProcessInfo,
  NetworkConnection,
  ThreatAlert,
} from "@/types/defenx"
import {
  BaselineRecord,
  BaselineMetricStats,
  loadBaseline,
  saveBaseline,
  saveAlert,
  appendForensicEvent,
} from "./storageEngine"

// Alpha smoothing factor for EWMA (0.1 = ~10-sample weighted memory)
const EWMA_ALPHA = 0.08
const MIN_SAMPLES_FOR_STABLE = 12

// Shannon entropy calculation for obfuscated command lines / payloads
export function computeShannonEntropy(str: string): number {
  if (!str || str.length === 0) return 0
  const len = str.length
  const frequencies = new Map<string, number>()

  for (let i = 0; i < len; i++) {
    const char = str[i]
    frequencies.set(char, (frequencies.get(char) || 0) + 1)
  }

  let entropy = 0
  for (const count of frequencies.values()) {
    const p = count / len
    entropy -= p * Math.log2(p)
  }

  return +entropy.toFixed(3)
}

// Suspicious executable directory paths
const SUSPICIOUS_PATHS = [
  /\\appdata\\local\\temp/i,
  /\\users\\public/i,
  /\\\$recycle\.bin/i,
  /\\windows\\temp/i,
  /\\programdata\\[a-z0-9_-]{8,}/i,
]

// Living-Off-The-Land Binaries (LOLBins)
const LOLBINS = new Set([
  "powershell.exe",
  "pwsh.exe",
  "cmd.exe",
  "mshta.exe",
  "rundll32.exe",
  "cscript.exe",
  "wscript.exe",
  "certutil.exe",
  "regsvr32.exe",
  "bitsadmin.exe",
  "wmic.exe",
])

// Non-shell parents that shouldn't typically spawn LOLBins
const SUSPICIOUS_PARENTS = new Set([
  "winword.exe",
  "excel.exe",
  "powerpnt.exe",
  "outlook.exe",
  "chrome.exe",
  "msedge.exe",
  "firefox.exe",
  "wmiprvse.exe",
  "spoolsv.exe",
  "sqlservr.exe",
])

// Dangerous command-line indicators
export interface DangerousCmdPattern {
  regex: RegExp
  reason: string
  score: number
}

const DANGEROUS_CMD_PATTERNS: DangerousCmdPattern[] = [
    {
      regex: /-(?:enc|encodedcommand)\s+[a-z0-9+/=]{16,}/i,
      reason: "Encoded Base64 PowerShell execution",
      score: 45,
    },
    {
      regex: /frombase64string/i,
      reason: "In-memory Base64 decoding",
      score: 35,
    },
    {
      regex: /iex\s*\(|invoke-expression/i,
      reason: "Dynamic expression evaluation (IEX)",
      score: 35,
    },
    {
      regex: /invoke-webrequest|downloadstring|downloadfile/i,
      reason: "Web cradle download execution",
      score: 40,
    },
    {
      regex: /-w\s+hidden|-windowstyle\s+hidden/i,
      reason: "Hidden window defense evasion",
      score: 25,
    },
    {
      regex: /vssadmin\s+delete\s+shadows/i,
      reason: "Ransomware shadow copy deletion",
      score: 60,
    },
    {
      regex: /bcdedit.*recoveryenabled\s+no/i,
      reason: "Tampering with Windows boot recovery",
      score: 55,
    },
    {
      regex: /bypass\s+-nop/i,
      reason: "ExecutionPolicy bypass with no-profile",
      score: 20,
    },
  ]

export interface EvaluatedHostBehavior {
  compositeScore: number
  baselineStatus: "learning" | "stable" | "elevated" | "critical"
  featureContributions: FeatureContribution[]
  suspiciousProcesses: ProcessInfo[]
}

export interface ProcessInspectionResult {
  riskScore: number
  riskReasons: string[]
  entropy: number
}

class AnomalyEngine {
  private baseline: BaselineRecord
  private lastAlertTime = 0

  constructor() {
    const existing = loadBaseline()
    if (existing) {
      this.baseline = existing
    } else {
      this.baseline = {
        features: {
          cpuUsage: {
            mean: 18,
            variance: 45,
            stdDev: 6.7,
            count: 0,
            lastUpdated: Date.now(),
          },
          memoryDeltaRate: {
            mean: 2,
            variance: 8,
            stdDev: 2.8,
            count: 0,
            lastUpdated: Date.now(),
          },
          activeOutboundSockets: {
            mean: 12,
            variance: 20,
            stdDev: 4.4,
            count: 0,
            lastUpdated: Date.now(),
          },
          uniqueRemoteIps: {
            mean: 8,
            variance: 16,
            stdDev: 4.0,
            count: 0,
            lastUpdated: Date.now(),
          },
          suspiciousProcessCount: {
            mean: 0.1,
            variance: 0.5,
            stdDev: 0.7,
            count: 0,
            lastUpdated: Date.now(),
          },
        },
        sampleCount: 0,
        lastUpdated: Date.now(),
        status: "learning",
      }
    }
  }

  private updateFeatureBaseline(featureName: string, value: number): {
    zScore: number
    stats: BaselineMetricStats
  } {
    let stats = this.baseline.features[featureName]
    if (!stats) {
      stats = {
        mean: value,
        variance: 10,
        stdDev: 3.16,
        count: 1,
        lastUpdated: Date.now(),
      }
      this.baseline.features[featureName] = stats
    }

    if (stats.count < 3) {
      // Direct sample averaging early on
      stats.mean = (stats.mean * stats.count + value) / (stats.count + 1)
      stats.variance = Math.max(4, Math.pow(value - stats.mean, 2))
      stats.stdDev = Math.max(1, Math.sqrt(stats.variance))
      stats.count++
      stats.lastUpdated = Date.now()
      return { zScore: 0.2, stats }
    }

    // Online EWMA Mean and Variance updating
    const diff = value - stats.mean
    const newMean = stats.mean + EWMA_ALPHA * diff
    const newVar =
      (1 - EWMA_ALPHA) * (stats.variance + EWMA_ALPHA * Math.pow(diff, 2))

    stats.mean = +newMean.toFixed(2)
    stats.variance = Math.max(1, +newVar.toFixed(2))
    stats.stdDev = Math.max(0.5, +Math.sqrt(stats.variance).toFixed(2))
    stats.count++
    stats.lastUpdated = Date.now()

    // Calculate statistical Z-score: (value - mean) / stdDev
    const zScore = +((value - stats.mean) / stats.stdDev).toFixed(2)
    return { zScore, stats }
  }

  // Inspect individual process for lineage, path, and command-line entropy
  public inspectProcess(
    proc: {
      pid: number
      ppid?: number
      name: string
      executablePath?: string
      commandLine?: string
      cpuPercent?: number
      memoryMB?: number
    },
    parentMap: Map<number, string>,
  ): ProcessInspectionResult {
    let riskScore = 0
    const riskReasons: string[] = []
    const cmd = proc.commandLine || ""
    const exe = proc.executablePath || ""
    const nameLower = proc.name.toLowerCase()
    const ppid = proc.ppid || 0
    const parentName = (parentMap.get(ppid) || "").toLowerCase()

    // 1. Path analysis (Temp, Public, Recycle Bin)
    for (const pattern of SUSPICIOUS_PATHS) {
      if (pattern.test(exe) || pattern.test(cmd)) {
        riskScore += 35
        riskReasons.push(
          `Binary running from untrusted path (${exe.slice(0, 40)}...)`,
        )
        break
      }
    }

    // 2. LOLBin Lineage Analysis
    if (LOLBINS.has(nameLower)) {
      if (parentName && SUSPICIOUS_PARENTS.has(parentName)) {
        riskScore += 45
        riskReasons.push(
          `Suspicious Process Lineage: ${nameLower} spawned by non-shell parent (${parentName})`,
        )
      }
    }

    // 3. Command-line entropy check (obfuscation detection)
    const entropy = computeShannonEntropy(cmd)
    if (cmd.length > 35 && entropy > 4.65) {
      riskScore += 30
      riskReasons.push(
        `High command-line Shannon entropy (${entropy.toFixed(2)} bits/char - possible obfuscation)`,
      )
    }

    // 4. Dangerous command arguments
    for (const pattern of DANGEROUS_CMD_PATTERNS) {
      if (pattern.regex.test(cmd)) {
        riskScore += pattern.score
        riskReasons.push(pattern.reason)
      }
    }

    // 5. Memory / CPU anomaly
    if ((proc.memoryMB || 0) > 2500) {
      riskScore += 15
      riskReasons.push(
        `Abnormally high memory footprint (${Math.round(proc.memoryMB || 0)} MB)`,
      )
    }
    if ((proc.cpuPercent || 0) > 85) {
      riskScore += 20
      riskReasons.push(
        `Elevated continuous CPU consumption (${(proc.cpuPercent || 0).toFixed(1)}%)`,
      )
    }

    // Cap risk score between 0 and 100
    riskScore = Math.min(100, Math.max(0, riskScore))

    return { riskScore, riskReasons, entropy }
  }

  // Evaluate system-wide behavioral vector
  public evaluateBehavior(
    rawMetrics: {
      cpuUsage: number
      memoryUsage: number
      activeOutboundSockets: number
      uniqueRemoteIps: number
    },
    processes: ProcessInfo[],
    connections: NetworkConnection[],
  ): EvaluatedHostBehavior {
    this.baseline.sampleCount++

    // Build parent PID mapping for lineage checks
    const parentMap = new Map<number, string>()
    for (const p of processes) {
      parentMap.set(p.pid, p.name)
    }

    // Inspect all processes
    const suspiciousProcesses: ProcessInfo[] = []
    let maxProcRisk = 0
    let totalRiskCount = 0

    for (const proc of processes) {
      const inspection = this.inspectProcess(proc, parentMap)
      proc.riskScore = inspection.riskScore
      proc.riskReasons = inspection.riskReasons

      if (inspection.riskScore > maxProcRisk) {
        maxProcRisk = inspection.riskScore
      }

      if (inspection.riskScore >= 35) {
        suspiciousProcesses.push(proc)
        totalRiskCount++
        proc.status = inspection.riskScore >= 65 ? "Warning" : "Elevated"
      }
    }

    // Update statistical features
    const cpuZ = this.updateFeatureBaseline("cpuUsage", rawMetrics.cpuUsage)
    const sockZ = this.updateFeatureBaseline(
      "activeOutboundSockets",
      rawMetrics.activeOutboundSockets,
    )
    const ipZ = this.updateFeatureBaseline(
      "uniqueRemoteIps",
      rawMetrics.uniqueRemoteIps,
    )
    const procZ = this.updateFeatureBaseline(
      "suspiciousProcessCount",
      totalRiskCount,
    )

    // Build explainability vector
    const featureContributions: FeatureContribution[] = [
      {
        feature: "CPU Variance & Load",
        zScore: cpuZ.zScore,
        impact: Math.min(
          100,
          Math.max(
            5,
            Math.round(
              Math.abs(cpuZ.zScore) * 18 + (rawMetrics.cpuUsage > 80 ? 25 : 0),
            ),
          ),
        ),
        detail: `Current: ${rawMetrics.cpuUsage}% (μ: ${cpuZ.stats.mean}%, σ: ${cpuZ.stats.stdDev})`,
      },
      {
        feature: "Outbound Sockets Delta",
        zScore: sockZ.zScore,
        impact: Math.min(
          100,
          Math.max(5, Math.round(Math.abs(sockZ.zScore) * 20)),
        ),
        detail: `Tracking ${rawMetrics.activeOutboundSockets} active connections (μ: ${sockZ.stats.mean})`,
      },
      {
        feature: "Remote Peer Diversity",
        zScore: ipZ.zScore,
        impact: Math.min(
          100,
          Math.max(5, Math.round(Math.abs(ipZ.zScore) * 16)),
        ),
        detail: `${rawMetrics.uniqueRemoteIps} unique remote IPs communicating with host`,
      },
      {
        feature: "Process Lineage & Heuristics",
        zScore: procZ.zScore,
        impact: Math.min(
          100,
          Math.max(5, Math.round(maxProcRisk * 0.8 + totalRiskCount * 12)),
        ),
        detail: `${totalRiskCount} flagged processes. Peak risk: ${maxProcRisk}/100`,
      },
    ]

    // Determine baseline maturity & status
    let baselineStatus: BaselineRecord["status"] = "learning"
    if (this.baseline.sampleCount >= MIN_SAMPLES_FOR_STABLE) {
      const avgZ =
        (Math.abs(cpuZ.zScore) +
          Math.abs(sockZ.zScore) +
          Math.abs(procZ.zScore)) /
        3
      if (avgZ >= 3.2 || maxProcRisk >= 75) {
        baselineStatus = "critical"
      } else if (avgZ >= 1.9 || maxProcRisk >= 45) {
        baselineStatus = "elevated"
      } else {
        baselineStatus = "stable"
      }
    }
    this.baseline.status = baselineStatus
    this.baseline.lastUpdated = Date.now()

    // Calculate composite Anomaly Index (0-100)
    const zScoreWeight = Math.max(
      0,
      cpuZ.zScore * 8 + sockZ.zScore * 10 + procZ.zScore * 18,
    )
    const heuristicWeight = maxProcRisk * 0.45 + totalRiskCount * 8
    const baseHostAnomaly = Math.round(
      rawMetrics.cpuUsage * 0.12 + rawMetrics.memoryUsage * 0.1,
    )

    let compositeScore = Math.round(
      zScoreWeight + heuristicWeight + baseHostAnomaly,
    )
    compositeScore = Math.min(99, Math.max(6, compositeScore))

    // Persist baseline periodically (every ~10 samples)
    if (this.baseline.sampleCount % 10 === 0) {
      saveBaseline(this.baseline)
    }

    // Auto-alert on threshold breach (> 78) with cooldown (at most 1 alert every 30 seconds)
    const now = Date.now()
    if (compositeScore >= 78 && now - this.lastAlertTime > 30000) {
      this.lastAlertTime = now
      const highestThreatProc = suspiciousProcesses[0]
      const alertId = `alert-auto-${now}`

      const autoAlert: ThreatAlert = {
        id: alertId,
        timestamp: now,
        time: "Just now",
        title: highestThreatProc
          ? `Behavioral Anomaly in ${highestThreatProc.name}`
          : "Host Multi-Variate Anomaly Threshold Breached",
        detail: highestThreatProc
          ? `PID ${highestThreatProc.pid}: ${highestThreatProc.riskReasons[0] || "Severe behavioral deviation"}`
          : `Composite Anomaly Score ${compositeScore}/100 exceeded threshold 78`,
        severity: compositeScore >= 88 ? "High" : "Medium",
        type: "danger",
        symbol: "!",
        status: "Active",
        mitreTactic: highestThreatProc?.riskReasons.some(
          (r) => r.includes("Lineage") || r.includes("Base64"),
        )
          ? "Execution (T1059.001)"
          : "Defense Evasion (T1027)",
        pid: highestThreatProc?.pid,
        anomalyBreakdown: `Anomaly score: ${compositeScore}/100. Peak Z-score: ${Math.max(cpuZ.zScore, sockZ.zScore, procZ.zScore).toFixed(1)}`,
        reviewed: false,
        source: highestThreatProc ? highestThreatProc.name : "AnomalyEngine",
        description: `Automated detection triggered by DefenX multi-variate EWMA model. Feature impact breakdown: ${featureContributions.map((f) => `${f.feature} (${f.impact}%)`).join(", ")}.`,
      }

      saveAlert(autoAlert)
      appendForensicEvent({
        actor: "AnomalyEngine",
        category: "Analysis",
        action: "THRESHOLD_BREACH_ALERT",
        target: highestThreatProc
          ? `${highestThreatProc.name} (PID ${highestThreatProc.pid})`
          : "Host Telemetry",
        status: "Warning",
        event: `Behavioral Anomaly Score reached ${compositeScore}/100. Alert created: ${autoAlert.title}`,
        source: "anomalyEngine",
        result: "Review",
        metadata: {
          score: compositeScore,
          zScores: {
            cpu: cpuZ.zScore,
            sockets: sockZ.zScore,
            processes: procZ.zScore,
          },
        },
      })
    }

    return {
      compositeScore,
      baselineStatus,
      featureContributions,
      suspiciousProcesses,
    }
  }

  public getBaselineStats(): BaselineRecord {
    return this.baseline
  }
}

export const anomalyEngine = new AnomalyEngine()
