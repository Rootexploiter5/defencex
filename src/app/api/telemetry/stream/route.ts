import { NextResponse } from "next/server"
import { getSystemTelemetry, getTelemetryHistory, getRealAlerts, isSafeMode } from "@/lib/systemMetrics"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send initial snapshot immediately
      try {
        const initialData = {
          telemetry: getSystemTelemetry(),
          history: getTelemetryHistory(),
          alerts: [],
          safeMode: isSafeMode(),
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`))
      } catch {}

      // Push telemetry every 1.5 seconds
      const timer = setInterval(async () => {
        try {
          const telemetry = getSystemTelemetry()
          const history = getTelemetryHistory()
          const alerts = await getRealAlerts()
          const payload = {
            telemetry,
            history,
            alerts,
            safeMode: isSafeMode(),
            timestamp: Date.now(),
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
        } catch {
          clearInterval(timer)
          controller.close()
        }
      }, 1500)

      return () => {
        clearInterval(timer)
      }
    },
  })

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
