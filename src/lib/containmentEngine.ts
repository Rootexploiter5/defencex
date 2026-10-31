import { exec } from "node:child_process"
import { promisify } from "node:util"
import { ContainmentResult } from "@/types/defenx"
import { appendForensicEvent, updateAlertStatus } from "./storageEngine"
import { logError, logInfo } from "./logger"

const execAsync = promisify(exec)

// Whitelist of critical Windows system processes that must never be terminated
const PROTECTED_PROCESS_NAMES = new Set([
  "system",
  "system idle process",
  "registry",
  "smss.exe",
  "csrss.exe",
  "wininit.exe",
  "services.exe",
  "lsass.exe",
  "svchost.exe",
  "explorer.exe",
  "node.exe",
  "conhost.exe",
  "fontdrvhost.exe",
  "dwm.exe",
])

// Global containment state across Next.js Turbopack reloads
const globalContainment = globalThis as unknown as {
  __defenx_safe_mode?: boolean
}

if (typeof globalContainment.__defenx_safe_mode !== "boolean") {
  globalContainment.__defenx_safe_mode = true // Default to safe-mode (dry-run)
}

export function isSafeMode(): boolean {
  return globalContainment.__defenx_safe_mode ?? true
}

export function setSafeMode(enabled: boolean): boolean {
  globalContainment.__defenx_safe_mode = enabled
  appendForensicEvent({
    actor: "Security Analyst",
    category: "Security",
    action: "SAFE_MODE_TOGGLE",
    target: "Containment Guard",
    status: "Success",
    event: `Containment enforcement changed to ${enabled ? "SAFE-MODE (Dry-Run)" : "LIVE ENFORCEMENT"
      }`,
    source: "containmentEngine",
    result: enabled ? "Normal" : "Verified",
  })
  return globalContainment.__defenx_safe_mode
}

export function toggleSafeMode(): boolean {
  return setSafeMode(!isSafeMode())
}

export interface ProcessProtectionResult {
  protected: boolean
  reason?: string
}

export function isProcessProtected(
  pid: number,
  processName?: string,
): ProcessProtectionResult {
  // Never terminate PID 0 (Idle), PID 4 (System), or the running Node.js process itself
  if (pid <= 4) {
    return {
      protected: true,
      reason: `Kernel process PID ${pid} is permanently protected.`,
    }
  }
  if (pid === process.pid) {
    return {
      protected: true,
      reason: `Cannot terminate DefenX server process (PID ${pid}).`,
    }
  }
  if (processName) {
    const clean = processName.toLowerCase().trim()
    if (
      PROTECTED_PROCESS_NAMES.has(clean) ||
      PROTECTED_PROCESS_NAMES.has(`${clean}.exe`)
    ) {
      return {
        protected: true,
        reason: `Process '${processName}' is in the Windows Core System Whitelist.`,
      }
    }
  }
  return { protected: false }
}

export async function quarantineProcess(
  pid: number,
  processName?: string,
  alertId?: string,
  overrideSafeMode?: boolean,
): Promise<ContainmentResult> {
  const safe = overrideSafeMode !== undefined ? overrideSafeMode : isSafeMode()
  const mode = safe ? "dry-run" : "live"

  // 1. Protection verification
  const guard = isProcessProtected(pid, processName)
  if (guard.protected) {
    const failureMsg = `Quarantine rejected: ${guard.reason}`
    appendForensicEvent({
      actor: "Containment Guard",
      category: "Security",
      action: "PROCESS_QUARANTINE_BLOCKED",
      target: `PID ${pid} (${processName || "unknown"})`,
      status: "Blocked",
      event: failureMsg,
      source: "containmentEngine",
      result: "Blocked",
    })
    return {
      success: false,
      mode,
      targetType: "process",
      targetValue: pid,
      message: failureMsg,
      timestamp: Date.now(),
    }
  }

  // 2. Safe-mode simulation (Dry-Run)
  if (safe) {
    const msg = `[DRY-RUN] Stop-Process -Id ${pid} -Force simulated successfully. No actual process terminated.`
    logInfo("ContainmentEngine.quarantineProcess", msg)

    appendForensicEvent({
      actor: "Security Analyst",
      category: "Process",
      action: "DRY_RUN_QUARANTINE",
      target: `PID ${pid} (${processName || "Process"})`,
      status: "Contained",
      event: `Simulated termination of PID ${pid} (${processName || "Process"}). Safe-Mode is active.`,
      source: "containmentEngine",
      result: "Contained",
    })

    if (alertId) {
      updateAlertStatus(
        alertId,
        "Quarantined",
        "Simulated Quarantine (Safe-Mode)",
      )
    }

    return {
      success: true,
      mode: "dry-run",
      targetType: "process",
      targetValue: pid,
      message: msg,
      timestamp: Date.now(),
    }
  }

  // 3. Live OS Containment (Stop-Process)
  try {
    const psCmd = `powershell -NoProfile -NonInteractive -Command "Stop-Process -Id ${pid} -Force"`
    await execAsync(psCmd, { timeout: 4000 })

    const msg = `Process PID ${pid} (${processName || "Target"}) was terminated via PowerShell Stop-Process.`
    logInfo("ContainmentEngine.quarantineProcess", msg)

    appendForensicEvent({
      actor: "Security Analyst",
      category: "Process",
      action: "LIVE_PROCESS_TERMINATED",
      target: `PID ${pid} (${processName || "Target"})`,
      status: "Contained",
      event: msg,
      source: "containmentEngine",
      result: "Contained",
    })

    if (alertId) {
      updateAlertStatus(
        alertId,
        "Quarantined",
        "Active Termination (Stop-Process)",
      )
    }

    return {
      success: true,
      mode: "live",
      targetType: "process",
      targetValue: pid,
      message: msg,
      timestamp: Date.now(),
    }
  } catch (err) {
    const errorMsg = `Failed to terminate PID ${pid}: ${(err as Error).message}`
    logError("ContainmentEngine.quarantineProcess", err)

    appendForensicEvent({
      actor: "Security Analyst",
      category: "Process",
      action: "TERMINATION_FAILED",
      target: `PID ${pid}`,
      status: "Failed",
      event: errorMsg,
      source: "containmentEngine",
      result: "Review",
    })

    return {
      success: false,
      mode: "live",
      targetType: "process",
      targetValue: pid,
      message: errorMsg,
      timestamp: Date.now(),
    }
  }
}

export async function blockRemoteIp(
  ip: string,
  alertId?: string,
  overrideSafeMode?: boolean,
): Promise<ContainmentResult> {
  const safe = overrideSafeMode !== undefined ? overrideSafeMode : isSafeMode()
  const mode = safe ? "dry-run" : "live"

  // Sanitize and validate IP address
  const cleanIp = ip.trim()
  const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
  if (!ipv4Regex.test(cleanIp)) {
    return {
      success: false,
      mode,
      targetType: "ip",
      targetValue: ip,
      message: `Invalid IP address format: ${ip}`,
      timestamp: Date.now(),
    }
  }

  // Prevent blocking local loopback or standard gateway addresses
  if (
    cleanIp === "127.0.0.1" ||
    cleanIp === "0.0.0.0" ||
    cleanIp.startsWith("169.254.")
  ) {
    return {
      success: false,
      mode,
      targetType: "ip",
      targetValue: cleanIp,
      message: `Cannot block reserved/loopback address ${cleanIp}`,
      timestamp: Date.now(),
    }
  }

  // Dry-run simulation
  if (safe) {
    const msg = `[DRY-RUN] netsh advfirewall firewall add rule name="DefenX_Block_${cleanIp}" dir=out action=block remoteip=${cleanIp} simulated.`
    logInfo("ContainmentEngine.blockRemoteIp", msg)

    appendForensicEvent({
      actor: "Security Analyst",
      category: "Network",
      action: "DRY_RUN_FIREWALL_BLOCK",
      target: cleanIp,
      status: "Blocked",
      event: `Simulated outbound firewall block rule for IP ${cleanIp}. Safe-Mode is active.`,
      source: "containmentEngine",
      result: "Blocked",
    })

    if (alertId) {
      updateAlertStatus(
        alertId,
        "Quarantined",
        `Simulated IP Block (${cleanIp})`,
      )
    }

    return {
      success: true,
      mode: "dry-run",
      targetType: "ip",
      targetValue: cleanIp,
      message: msg,
      timestamp: Date.now(),
    }
  }

  // Live Windows Firewall Rule
  try {
    const cmd = `netsh advfirewall firewall add rule name="DefenX_Block_${cleanIp}" dir=out action=block remoteip=${cleanIp}`
    await execAsync(cmd, { timeout: 4000 })

    const msg = `Outbound firewall rule created for IP ${cleanIp}. Outbound traffic blocked.`
    logInfo("ContainmentEngine.blockRemoteIp", msg)

    appendForensicEvent({
      actor: "Security Analyst",
      category: "Network",
      action: "LIVE_FIREWALL_RULE_ADDED",
      target: cleanIp,
      status: "Blocked",
      event: msg,
      source: "containmentEngine",
      result: "Blocked",
    })

    if (alertId) {
      updateAlertStatus(
        alertId,
        "Quarantined",
        `Firewall Rule: Blocked ${cleanIp}`,
      )
    }

    return {
      success: true,
      mode: "live",
      targetType: "ip",
      targetValue: cleanIp,
      message: msg,
      timestamp: Date.now(),
    }
  } catch (err) {
    const errorMsg = `Failed to create firewall rule for ${cleanIp}: ${(err as Error).message}`
    logError("ContainmentEngine.blockRemoteIp", err)

    appendForensicEvent({
      actor: "Security Analyst",
      category: "Network",
      action: "FIREWALL_RULE_FAILED",
      target: cleanIp,
      status: "Failed",
      event: errorMsg,
      source: "containmentEngine",
      result: "Review",
    })

    return {
      success: false,
      mode: "live",
      targetType: "ip",
      targetValue: cleanIp,
      message: errorMsg,
      timestamp: Date.now(),
    }
  }
}
