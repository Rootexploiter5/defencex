import { NextResponse } from "next/server"
import {
  getSystemTelemetry,
  getTelemetryHistory,
  isSafeMode,
} from "@/lib/systemMetrics"
import { logError } from "@/lib/logger"

export async function GET() {
  try {
    const telemetry = getSystemTelemetry()
    const history = getTelemetryHistory()
    const safeMode = isSafeMode()

    return NextResponse.json({
      success: true,
      data: telemetry,
      history,
      safeMode,
    })
  } catch (error) {
    logError("API /api/telemetry", error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    )
  }
}
