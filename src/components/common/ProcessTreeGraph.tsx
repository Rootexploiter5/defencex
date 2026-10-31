"use client"

import React, { useState, useMemo } from "react"
import { Icon } from "@/components/common/Icon"
import { ProcessInfo } from "@/types/defenx"
import { getRiskColor } from "@/lib/formatters"

interface ProcessTreeGraphProps {
  processes: ProcessInfo[]
  openDetail: (name: string) => void
  onQuarantine?: (pid: number, name: string) => void
}

interface TreeNode {
  process: ProcessInfo
  children: TreeNode[]
}

export function ProcessTreeGraph({
  processes,
  openDetail,
  onQuarantine,
}: ProcessTreeGraphProps) {
  const [expandedPids, setExpandedPids] = useState<Set<number>>(() => new Set([0, 4, 1024, 1420, 2840]))
  const [filterQuery, setFilterQuery] = useState("")

  // Build tree structure
  const treeRoots = useMemo(() => {
    const nodeMap = new Map<number, TreeNode>()
    
    for (const proc of processes) {
      nodeMap.set(proc.pid, { process: proc, children: [] })
    }

    const roots: TreeNode[] = []

    for (const proc of processes) {
      const node = nodeMap.get(proc.pid)!
      const parentNode = proc.ppid ? nodeMap.get(proc.ppid) : undefined

      if (parentNode && parentNode !== node) {
        parentNode.children.push(node)
      } else {
        roots.push(node)
      }
    }

    // Sort by peak risk
    roots.sort((a, b) => (b.process.riskScore || 0) - (a.process.riskScore || 0))
    return roots
  }, [processes])

  const toggleExpand = (pid: number) => {
    setExpandedPids((prev) => {
      const next = new Set(prev)
      if (next.has(pid)) next.delete(pid)
      else next.add(pid)
      return next
    })
  }

  const expandAll = () => {
    setExpandedPids(new Set(processes.map((p) => p.pid)))
  }

  const collapseAll = () => {
    setExpandedPids(new Set())
  }

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const { process: p, children } = node
    const isExpanded = expandedPids.has(p.pid)
    const hasChildren = children.length > 0
    const riskColor = getRiskColor(p.riskScore || 0)
    const isElevated = p.riskScore >= 40

    const matchesQuery =
      !filterQuery.trim() ||
      p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      String(p.pid).includes(filterQuery)

    return (
      <div key={p.pid} style={{ marginLeft: depth > 0 ? "24px" : "0", position: "relative" }}>
        {/* Connecting Line from Parent */}
        {depth > 0 && (
          <div
            style={{
              position: "absolute",
              left: "-16px",
              top: "22px",
              width: "14px",
              height: "2px",
              background: "#d2b48c",
            }}
          />
        )}
        {depth > 0 && (
          <div
            style={{
              position: "absolute",
              left: "-16px",
              top: "-8px",
              width: "2px",
              height: "32px",
              background: "#d2b48c",
            }}
          />
        )}

        {/* Node Card */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 14px",
            borderRadius: "10px",
            marginBottom: "8px",
            background: isElevated
              ? "linear-gradient(135deg, #fff1f2, #ffe4e6)"
              : "#fffaf1",
            border: isElevated ? "1px solid #ef4444" : "1px solid #dfcca9",
            boxShadow: isElevated
              ? "0 3px 8px rgba(239, 68, 68, 0.2)"
              : "0 1px 3px rgba(0,0,0,0.05)",
            opacity: matchesQuery ? 1 : 0.45,
            transition: "all 0.15s ease",
          }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleExpand(p.pid)}
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                border: "1px solid #c9aa7f",
                background: "#f4e7d4",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 700,
                color: "#6b0f1a",
                padding: 0,
              }}
              title={isExpanded ? "Collapse children" : "Expand children"}
            >
              {isExpanded ? "−" : "+"}
            </button>
          )}

          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "6px",
              background: isElevated ? "#ef4444" : "#e6d7c3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isElevated ? "#fff" : "#781523",
            }}
          >
            <Icon name="layers" size={15} />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <strong style={{ fontSize: "13px", color: isElevated ? "#991b1b" : "#44342a" }}>
                {p.name}
              </strong>
              <small style={{ color: "#7c6858" }}>
                PID: <b>{p.pid}</b> {p.ppid ? `(PPID: ${p.ppid})` : ""}
              </small>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: "4px",
                  background: `${riskColor}20`,
                  color: riskColor,
                  border: `1px solid ${riskColor}40`,
                }}
              >
                Risk {p.riskScore || 0}
              </span>
            </div>
            {p.riskReasons && p.riskReasons.length > 0 && (
              <small style={{ display: "block", color: "#dc2626", fontSize: "11px", marginTop: "2px" }}>
                ⚠️ {p.riskReasons[0]}
              </small>
            )}
          </div>

          <div style={{ display: "flex", gap: "6px", marginLeft: "12px" }}>
            <span style={{ fontSize: "11px", color: "#6e5d50", padding: "2px 6px", background: "#f2e4d0", borderRadius: "4px" }}>
              {p.memory}
            </span>
            <button
              className="text-button"
              onClick={() => openDetail(p.name)}
              style={{ padding: "2px 6px", fontSize: "11px" }}
            >
              Inspect
            </button>
            {isElevated && onQuarantine && (
              <button
                className="secondary-button"
                onClick={() => onQuarantine(p.pid, p.name)}
                style={{
                  padding: "2px 8px",
                  fontSize: "10px",
                  background: "#fee2e2",
                  color: "#991b1b",
                  borderColor: "#f87171",
                  fontWeight: 700,
                }}
              >
                Quarantine
              </button>
            )}
          </div>
        </div>

        {/* Render child processes if expanded */}
        {hasChildren && isExpanded && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: "16px", background: "rgba(0,0,0,0.02)", borderRadius: "14px", border: "1px solid #dfcca9" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", color: "#6b0f1a", display: "flex", alignItems: "center", gap: "8px" }}>
            <Icon name="layers" size={18} />
            Interactive Process Lineage & Spawning DAG
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#77675e" }}>
            Reveals process parentage, abnormal command shells, and child process execution trees.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            placeholder="Search tree..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            style={{
              padding: "5px 10px",
              borderRadius: "8px",
              border: "1px solid #d5bf9f",
              fontSize: "12px",
              background: "#fff",
              width: "160px",
            }}
          />
          <button className="secondary-button" onClick={expandAll} style={{ padding: "4px 10px", fontSize: "11px" }}>
            Expand All
          </button>
          <button className="secondary-button" onClick={collapseAll} style={{ padding: "4px 10px", fontSize: "11px" }}>
            Collapse All
          </button>
        </div>
      </div>

      <div style={{ overflowX: "auto", padding: "10px 4px" }}>
        {treeRoots.map((root) => renderNode(root, 0))}
      </div>
    </div>
  )
}
