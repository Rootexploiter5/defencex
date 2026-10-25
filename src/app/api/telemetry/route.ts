import { NextResponse } from "next/server"
import { getSystemTelemetry, getTelemetryHistory } from "@/lib/systemMetrics"

export async function GET() {
  try {
    const telemetry = getSystemTelemetry()
    const history = getTelemetryHistory()
    return NextResponse.json({
      success: true,
      data: telemetry,
      history,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    )
  }
}
