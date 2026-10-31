import { NextResponse } from "next/server"
import { getRealProcesses } from "@/lib/systemMetrics"
import { logError } from "@/lib/logger"

export async function GET() {
  try {
    const processes = await getRealProcesses()
    return NextResponse.json({
      success: true,
      count: processes.length,
      data: processes,
    })
  } catch (error) {
    logError("API /api/processes GET", error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    )
  }
}
