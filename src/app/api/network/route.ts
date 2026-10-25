import { NextResponse } from "next/server"
import {
  getRealNetworkInterfaces,
  getRealTcpConnections,
  getLoadBalancerNodes,
} from "@/lib/systemMetrics"

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
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    )
  }
}
