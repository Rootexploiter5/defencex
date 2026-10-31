import { NextResponse } from "next/server"
import { getForensicsEvents, addForensicsEvent } from "@/lib/systemMetrics"
import { ForensicEvent } from "@/types/defenx"
import { logError } from "@/lib/logger"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format")
    const events = getForensicsEvents()

    if (format === "csv") {
      const headers = [
        "ID",
        "Timestamp",
        "Time",
        "Actor",
        "Category",
        "Action",
        "Target",
        "Status",
        "Event",
        "Source",
        "Result",
      ]
      const rows = events.map((e) => [
        e.id,
        new Date(e.timestamp).toISOString(),
        `"${e.time}"`,
        `"${e.actor || ""}"`,
        `"${e.category || ""}"`,
        `"${e.action || ""}"`,
        `"${e.target || ""}"`,
        `"${e.status || ""}"`,
        `"${(e.event || "").replace(/"/g, '""')}"`,
        `"${e.source || ""}"`,
        `"${e.result || ""}"`,
      ])
      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
        "\n",
      )

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="defenx_forensics_${Date.now()}.csv"`,
        },
      })
    }

    return NextResponse.json({
      success: true,
      count: events.length,
      data: events,
    })
  } catch (error) {
    logError("API /api/forensics GET", error)
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
      category?: ForensicEvent["category"]
      result?: ForensicEvent["result"]
    }

    if (!event || !source) {
      return NextResponse.json(
        { success: false, error: "Missing event or source fields" },
        { status: 400 },
      )
    }

    const created = addForensicsEvent(
      event,
      source,
      category || "System",
      result || "Normal",
    )
    return NextResponse.json({ success: true, event: created })
  } catch (error) {
    logError("API /api/forensics POST", error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    )
  }
}
