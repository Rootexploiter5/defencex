import { NextResponse } from "next/server"
import {
  getRealNetworkInterfaces,
  getRealTcpConnections,
  getLoadBalancerNodes,
} from "@/lib/systemMetrics"
import { logError } from "@/lib/logger"

export async function GET() {
  try {
    const interfaces = getRealNetworkInterfaces()
    const connections = await getRealTcpConnections()
    const loadBalancerNodes = await getLoadBalancerNodes()

    return NextResponse.json({
      success: true,
      interfaces,
      connections,
      loadBalancerNodes,
    })
  } catch (error) {
    logError("API /api/network GET", error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    )
  }
}
