import { NextResponse } from "next/server"
import { getForensicsEvents, addForensicsEvent, RealEvent } from "@/lib/systemMetrics"

export async function GET() {
  try {
    const events = getForensicsEvents()
    return NextResponse.json({
      success: true,
      count: events.length,
      data: events,
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
    const { event, source, category, result } = body as {
      event: string
      source: string
      category: RealEvent["category"]
      result: RealEvent["result"]
    }
    if (!event || !source) {
      return NextResponse.json({ success: false, error: "Missing event fields" }, { status: 400 })
    }
    addForensicsEvent(event, source, category || "System", result || "Normal")
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    )
  }
}
