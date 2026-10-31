"use client" /* Metric Summaries */ /* Traffic Stream & Security State */ /* Global Load Balancer Panel */ /* Network Interfaces */ /* Active TCP Sockets with Firewall Block Actions */

import React, { useState } from "react"
import { Icon } from "@/components/common/Icon"
import { NetworkChart } from "@/components/common/Charts"
import {
  TelemetrySnapshot,
  TelemetryPoint,
  RealNetworkInterface,
  NetworkConnection,
  LoadBalancerNode,
} from "@/types/defenx"

interface NetworkTopologyViewProps {
  telemetry: TelemetrySnapshot | null
  history: TelemetryPoint[]
  interfaces: RealNetworkInterface[]
  connections: NetworkConnection[]
  loadBalancerNodes: LoadBalancerNode[]
  blockIp: (ip: string) => Promise<void>
}

export function NetworkTopologyView({
  telemetry,
  history,
  interfaces,
  connections,
  loadBalancerNodes,
  blockIp,
}: NetworkTopologyViewProps) {
  const [blockingIp, setBlockingIp] = useState<string | null>(null)

  const handleBlock = async (ip: string) => {
    setBlockingIp(ip)
    await blockIp(ip)
    setBlockingIp(null)
  }

  return (
    <>
      {}
      <div className="tab-summary">
        <article className="card summary-card">
          <div className="stat-icon">
            <Icon name="pulse" size={27} />
          </div>
          <div>
            <span>Download speed</span>
            <strong>{telemetry?.downloadSpeedMbps ?? 0} Mbps</strong>
            <small>Real-time estimated throughput</small>
          </div>
        </article>

        <article className="card summary-card">
          <div className="stat-icon">
            <Icon name="globe" size={27} />
          </div>
          <div>
            <span>Upload speed</span>
            <strong>{telemetry?.uploadSpeedMbps ?? 0} Mbps</strong>
            <small>Outgoing telemetry bandwidth</small>
          </div>
        </article>

        <article className="card summary-card">
          <div className="stat-icon">
            <Icon name="cpu" size={27} />
          </div>
          <div>
            <span>Active Interfaces</span>
            <strong>{interfaces.length}</strong>
            <small>
              {interfaces[0]?.ip
                ? `Primary: ${interfaces[0].ip}`
                : "Tracking network adapters"}
            </small>
          </div>
        </article>
      </div>

      {}
      <div className="tab-columns">
        <section className="card tab-panel traffic-panel">
          <div className="section-heading">
            <h2>
              <Icon name="globe" />
              Traffic Stream
            </h2>
            <span className="live">
              <i />
              Live Bandwidth
            </span>
          </div>
          <NetworkChart history={history} />
          <div className="network-speeds">
            <span>
              <b>↓</b>
              {telemetry?.downloadSpeedMbps ?? 0} Mbps
            </span>
            <span>
              <b>↑</b>
              {telemetry?.uploadSpeedMbps ?? 0} Mbps
            </span>
          </div>
        </section>

        <section className="card tab-panel">
          <h2>
            <Icon name="shield" />
            Connection Security State
          </h2>
          <div className="connection-health">
            <Icon name="shield" size={46} />
            <h3>Endpoint Perimeter Protected</h3>
            <p>
              Monitoring {connections.length} active sockets across{" "}
              {interfaces.length} hardware network interfaces.
            </p>
          </div>
        </section>
      </div>

      {}
      <section className="card tab-panel load-balancer-panel">
        <div className="section-heading">
          <h2>
            <Icon name="pulse" size={26} />
            Host Gateway & WAN Edge Connectivity Probes
          </h2>
          <span className="live">
            <i />
            Real Latency Probes
          </span>
        </div>
        <div className="balancer-grid">
          {loadBalancerNodes.map((node) => (
            <div className="balancer-node" key={node.name}>
              <div className="node-head">
                <span>
                  {node.name} ({node.region})
                </span>
                <b className="status-badge online">{node.status}</b>
              </div>
              <div className="node-metric">
                <span>Latency Metric</span>
                <strong>{node.latencyMs} ms</strong>
              </div>
              <div className="node-bar">
                <div style={{ width: `${Math.min(100, Math.max(10, node.loadPercent))}%` }} />
              </div>
              <small>
                Round-trip latency to edge endpoint: {node.latencyMs}ms
              </small>
            </div>
          ))}
        </div>
        <div className="balancer-summary">
          <span>
            <b>Probe Engine:</b> Active Real-Time HTTP/DNS Latency
          </span>
          <span>
            <b>Hardware Adapters:</b> {interfaces.length} Active System Interfaces
          </span>
          <span>
            <b>Active TCP Sockets:</b> {connections.length} Endpoints
          </span>
        </div>
      </section>

      {}
      <section className="card tab-panel">
        <h2>
          <Icon name="cpu" />
          Active System Network Interfaces ({interfaces.length})
        </h2>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Interface</th>
                <th>IP Address</th>
                <th>MAC Address</th>
                <th>Family</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {interfaces.map((iface) => (
                <tr key={`${iface.name}-${iface.ip}`}>
                  <td>{iface.name}</td>
                  <td>
                    <strong>{iface.ip}</strong>
                  </td>
                  <td>{iface.mac}</td>
                  <td>{iface.family}</td>
                  <td>{iface.type}</td>
                  <td>
                    <span
                      className={
                        iface.status === "Active" ? "normal" : "review-badge"
                      }
                    >
                      <i />
                      {iface.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {}
      <section className="card tab-panel">
        <h2>
          <Icon name="globe" />
          Active TCP Sockets ({connections.length})
        </h2>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Local Address:Port</th>
                <th>Remote Address:Port</th>
                <th>State</th>
                <th>PID</th>
                <th>Indicators</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {connections.slice(0, 20).map((conn, idx) => {
                const isRemote =
                  conn.remoteAddress !== "0.0.0.0" &&
                  conn.remoteAddress !== "127.0.0.1" &&
                  !conn.remoteAddress.startsWith("192.168.")
                const isProcessing = blockingIp === conn.remoteAddress

                return (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor: conn.isSuspicious
                        ? "rgba(220, 38, 38, 0.05)"
                        : undefined,
                    }}
                  >
                    <td>
                      {conn.localAddress}:{conn.localPort}
                    </td>
                    <td>
                      <strong
                        style={{
                          color: conn.isSuspicious ? "#b91c1c" : undefined,
                        }}
                      >
                        {conn.remoteAddress}:{conn.remotePort}
                      </strong>
                    </td>
                    <td>
                      <span
                        className={
                          conn.state === "Listening" ? "review-badge" : "normal"
                        }
                      >
                        <i />
                        {conn.state}
                      </span>
                    </td>
                    <td>{conn.pid}</td>
                    <td>
                      {conn.isSuspicious ? (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: "4px",
                            backgroundColor: "#fee2e2",
                            color: "#b91c1c",
                          }}
                        >
                          ⚠️ Flagged C2 Port
                        </span>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#6b7280" }}>
                          Standard
                        </span>
                      )}
                    </td>
                    <td>
                      {isRemote && (
                        <button
                          className="secondary-button"
                          disabled={isProcessing}
                          onClick={() => handleBlock(conn.remoteAddress)}
                          style={{
                            padding: "4px 8px",
                            fontSize: "11px",
                            borderColor: conn.isSuspicious
                              ? "#ef4444"
                              : undefined,
                            color: conn.isSuspicious ? "#b91c1c" : undefined,
                          }}
                        >
                          {isProcessing ? "Blocking..." : "Block IP (netsh)"}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
