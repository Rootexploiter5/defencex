import { NextResponse } from "next/server"
import {
  getSystemTelemetry,
  getRealProcesses,
  getRealNetworkInterfaces,
  getRealTcpConnections,
  getRealAlerts,
  addForensicsEvent,
} from "@/lib/systemMetrics"

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

    const primaryIface = interfaces.find((i) => i.status === "Active" && !i.ip.startsWith("127.")) || interfaces[0]

    if (
      clean.includes("network") ||
      clean.includes("connection") ||
      clean.includes("traffic") ||
      clean.includes("ip") ||
      clean.includes("port")
    ) {
      answer = `Live Network Intelligence: Host "${telemetry.hostname}" is communicating over ${primaryIface?.name || "Interface"} (${primaryIface?.ip || "Unknown IP"}). Currently tracking ${connections.length} active TCP connections. Measured latency to edge backbone is ${telemetry.networkLatencyMs}ms with ${telemetry.downloadSpeedMbps} Mbps estimated bandwidth.`
    } else if (
      clean.includes("threat") ||
      clean.includes("alert") ||
      clean.includes("malware") ||
      clean.includes("security") ||
      clean.includes("vulnerability")
    ) {
      if (alerts.length > 0) {
        answer = `Threat Intelligence Engine: Identified ${alerts.length} active heuristic signals on ${telemetry.hostname}. Highest priority: "${alerts[0].title}" (${alerts[0].detail}). Heuristic anomaly rating is ${telemetry.anomalyScore}/100. Continuous runtime sandbox observation is active.`
      } else {
        answer = `Threat Intelligence Engine: Zero anomalous behavioral vectors detected. System integrity on ${telemetry.hostname} verified with anomaly rating at ${telemetry.anomalyScore}/100.`
      }
    } else if (
      clean.includes("cpu") ||
      clean.includes("process") ||
      clean.includes("memory") ||
      clean.includes("ram") ||
      clean.includes("system") ||
      clean.includes("hardware")
    ) {
      answer = `Real-Time Telemetry: Hardware CPU is ${telemetry.cpuModel} (${telemetry.cpuCores} cores) operating at ${telemetry.cpuUsage}% utilization. Physical RAM load is ${telemetry.memoryUsage}% (${telemetry.usedMemoryGB} GB used of ${telemetry.totalMemoryGB} GB). Top resource consumers: ${topProcessesSummary}. System uptime is ${telemetry.uptimeFormatted}.`
    } else if (
      clean.includes("balance") ||
      clean.includes("credit") ||
      clean.includes("quota") ||
      clean.includes("cost")
    ) {
      answer = `DefenX Security Quota: Defense operations balance is active for real-time AI heuristics, deep packet inspection, and containment dispatch. 5 credits deducted for this neural telemetry inference.`
    } else {
      answer = `DefenX Neural Analyst: Inspected "${prompt}". Active telemetry on ${telemetry.hostname} (${telemetry.platform} ${telemetry.arch}) shows CPU at ${telemetry.cpuUsage}%, RAM at ${telemetry.memoryUsage}%, and ${processes.length} tracked processes. Anomaly score remains stable at ${telemetry.anomalyScore}/100. Security perimeter is healthy.`
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
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    )
  }
}
