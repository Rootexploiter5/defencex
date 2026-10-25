import { NextResponse } from "next/server"
import { getRealAlerts, toggleAlertReview } from "@/lib/systemMetrics"

export async function GET() {
  try {
    const alerts = await getRealAlerts()
    return NextResponse.json({
      success: true,
      count: alerts.length,
      data: alerts,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { alertId } = body
    if (!alertId) {
      return NextResponse.json({ success: false, error: "alertId is required" }, { status: 400 })
    }
    const reviewed = toggleAlertReview(alertId)
    return NextResponse.json({ success: true, alertId, reviewed })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    )
  }
}
