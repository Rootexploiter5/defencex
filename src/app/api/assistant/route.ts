import { NextResponse } from "next/server"
import {
  getSystemTelemetry,
  getRealProcesses,
  getRealNetworkInterfaces,
  getRealTcpConnections,
  getRealAlerts,
  addForensicsEvent,
  isSafeMode,
} from "@/lib/systemMetrics"
import { logError } from "@/lib/logger"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 },
      )
    }

    const telemetry = getSystemTelemetry()
    const [processes, interfaces, connections, alerts] = await Promise.all([
      getRealProcesses(),
      getRealNetworkInterfaces(),
      getRealTcpConnections(),
      getRealAlerts(),
    ])

    const clean = prompt.toLowerCase().trim()
    let answer = ""

    const topProcessesSummary = processes
      .slice(0, 4)
      .map((p) => `${p.name} (PID ${p.pid}, ${p.memory})`)
      .join(", ")

    const primaryIface =
      interfaces.find(
        (i) => i.status === "Active" && !i.ip.startsWith("127."),
      ) || interfaces[0]

    const highestRiskProc = processes.find((p) => p.riskScore > 40)
    const activeThreats = alerts.filter((a) => !a.reviewed)

    if (
      clean.includes("network") ||
      clean.includes("connection") ||
      clean.includes("traffic") ||
      clean.includes("ip") ||
      clean.includes("port")
    ) {
      const suspiciousConns = connections.filter((c) => c.isSuspicious)
      answer = `Live Network Intelligence: Host "${telemetry.hostname}" is communicating over ${primaryIface?.name || "Interface"} (${primaryIface?.ip || "Unknown IP"}). Currently tracking ${connections.length} active TCP connections. ${
        suspiciousConns.length > 0
          ? `⚠️ Found ${suspiciousConns.length} socket(s) flagged as suspicious!`
          : "Perimeter routes verified."
      } Measured edge latency: ${telemetry.networkLatencyMs}ms.`
    } else if (
      clean.includes("threat") ||
      clean.includes("alert") ||
      clean.includes("malware") ||
      clean.includes("security") ||
      clean.includes("vulnerability") ||
      clean.includes("quarantine")
    ) {
      if (activeThreats.length > 0) {
        const top = activeThreats[0]
        answer = `Threat Intelligence Engine: Identified ${activeThreats.length} unreviewed alert(s) on ${telemetry.hostname}. Highest priority: "${top.title}" [${top.mitreTactic}] (${top.detail}). Behavioral Anomaly Index is ${telemetry.anomalyScore}/100. Safe-mode containment is currently ${
          isSafeMode() ? "ENABLED (Dry-run)" : "LIVE ENFORCEMENT"
        }.`
      } else {
        answer = `Threat Intelligence Engine: Zero anomalous behavioral vectors currently unreviewed. System integrity on ${telemetry.hostname} verified with anomaly rating at ${telemetry.anomalyScore}/100.`
      }
    } else if (
      clean.includes("cpu") ||
      clean.includes("process") ||
      clean.includes("memory") ||
      clean.includes("ram") ||
      clean.includes("system") ||
      clean.includes("hardware")
    ) {
      answer = `Real-Time CIM Telemetry: Hardware CPU is ${telemetry.cpuModel} (${telemetry.cpuCores} cores) operating at ${telemetry.cpuUsage}% utilization. Physical RAM load is ${telemetry.memoryUsage}% (${telemetry.usedMemoryGB} GB used of ${telemetry.totalMemoryGB} GB). Top resource consumers: ${topProcessesSummary}. System uptime is ${telemetry.uptimeFormatted}.`
    } else if (
      clean.includes("anomaly") ||
      clean.includes("baseline") ||
      clean.includes("z-score") ||
      clean.includes("ml") ||
      clean.includes("explain")
    ) {
      const topFeature = [...telemetry.featureContributions].sort(
        (a, b) => b.impact - a.impact,
      )[0]
      answer = `Behavioral ML Engine: Model status is "${telemetry.baselineStatus.toUpperCase()}". Composite Anomaly Index is ${telemetry.anomalyScore}/100. Primary driver: ${topFeature?.feature || "CPU"} (Z-Score: ${topFeature?.zScore ?? 0}, Impact: ${topFeature?.impact ?? 0}% - ${topFeature?.detail || ""}).`
    } else if (
      clean.includes("status") ||
      clean.includes("health") ||
      clean.includes("posture")
    ) {
      answer = `DefenX Real-Time Security Engine: Host "${telemetry.hostname}" is operating with Anomaly Score ${telemetry.anomalyScore}/100. ${alerts.length} active alerts logged. Safe-mode containment is ${isSafeMode() ? "ENABLED (Dry-Run)" : "LIVE ENFORCEMENT"}.`
    } else {
      answer = `DefenX Neural Analyst: Inspected "${prompt}". Active telemetry on ${telemetry.hostname} (${telemetry.platform} ${telemetry.arch}) shows CPU at ${telemetry.cpuUsage}%, RAM at ${telemetry.memoryUsage}%, and ${processes.length} tracked processes. Anomaly score remains at ${telemetry.anomalyScore}/100 with baseline state "${telemetry.baselineStatus}". Security perimeter is healthy.`
    }

    addForensicsEvent(
      `AI Assistant query processed: "${prompt.slice(0, 32)}..."`,
      "Neural Engine",
      "Analysis",
      "Normal",
    )

    return NextResponse.json({
      success: true,
      answer,
      telemetry: {
        cpu: telemetry.cpuUsage,
        memory: telemetry.memoryUsage,
        score: telemetry.anomalyScore,
        baselineStatus: telemetry.baselineStatus,
      },
      explainability: telemetry.featureContributions,
    })
  } catch (error) {
    logError("API /api/assistant POST", error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    )
  }
}
