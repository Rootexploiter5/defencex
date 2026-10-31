import { NextResponse } from "next/server"
import {
  getRealAlerts,
  toggleAlertReview,
  quarantineProcess,
  blockRemoteIp,
  triggerSimulatedAttack,
  isSafeMode,
  setSafeMode,
  toggleSafeMode,
} from "@/lib/systemMetrics"
import { logError } from "@/lib/logger"

export async function GET() {
  try {
    const alerts = await getRealAlerts()
    return NextResponse.json({
      success: true,
      count: alerts.length,
      data: alerts,
      safeMode: isSafeMode(),
    })
  } catch (error) {
    logError("API /api/threats GET", error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      action,
      alertId,
      pid,
      processName,
      remoteIp,
      attackType,
      safeMode,
    } = body

    // 1. Attack Simulation Dispatch
    if (action === "simulate" && attackType) {
      const result = triggerSimulatedAttack(attackType)
      return NextResponse.json({ ...result })
    }

    // 2. Safe-Mode Toggles
    if (action === "toggle_safe_mode") {
      const newMode = toggleSafeMode()
      return NextResponse.json({ success: true, safeMode: newMode })
    }

    if (action === "set_safe_mode" && typeof safeMode === "boolean") {
      const newMode = setSafeMode(safeMode)
      return NextResponse.json({ success: true, safeMode: newMode })
    }

    // 3. Process Quarantine (Stop-Process)
    if (action === "quarantine") {
      if (typeof pid !== "number") {
        return NextResponse.json(
          { success: false, error: "Numeric 'pid' is required for quarantine" },
          { status: 400 },
        )
      }
      const result = await quarantineProcess(pid, processName, alertId)
      return NextResponse.json({
        success: result.success,
        result,
        safeMode: isSafeMode(),
      })
    }

    // 4. IP Firewall Rule (netsh)
    if (action === "block_ip") {
      if (!remoteIp || typeof remoteIp !== "string") {
        return NextResponse.json(
          {
            success: false,
            error: "Valid 'remoteIp' string is required for firewall block",
          },
          { status: 400 },
        )
      }
      const result = await blockRemoteIp(remoteIp, alertId)
      return NextResponse.json({
        success: result.success,
        result,
        safeMode: isSafeMode(),
      })
    }

    // 5. Default Alert Review Toggle
    if (alertId) {
      const reviewed = toggleAlertReview(alertId)
      return NextResponse.json({
        success: true,
        alertId,
        reviewed,
        safeMode: isSafeMode(),
      })
    }

    return NextResponse.json(
      { success: false, error: "Unrecognized threat action" },
      { status: 400 },
    )
  } catch (error) {
    logError("API /api/threats POST", error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    )
  }
}
