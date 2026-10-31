"use client" /* Live System Context Pills */ /* Response Bubble */ /* Suggested Queries */ /* Input Form */

import React, { useState } from "react"
import { Icon } from "@/components/common/Icon"
import { TelemetrySnapshot } from "@/types/defenx"

interface AssistantModalProps {
  isOpen: boolean
  onClose: () => void
  telemetry: TelemetrySnapshot | null
  asking: boolean
  answer: string
  askAssistant: (customPrompt?: string) => Promise<void>
}

export function AssistantModal({
  isOpen,
  onClose,
  telemetry,
  asking,
  answer,
  askAssistant,
}: AssistantModalProps) {
  const [localPrompt, setLocalPrompt] = useState("")

  if (!isOpen) return null

  const quickQuestions = [
    "Analyze highest priority threats and containment options",
    "Audit open TCP sockets for suspicious remote IPs",
    "Explain behavioral anomaly baseline and current Z-scores",
    "Inspect top memory and CPU consuming processes",
  ]

  const handleSend = () => {
    if (!localPrompt.trim() || asking) return
    askAssistant(localPrompt)
    setLocalPrompt("")
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <section
        className="modal card"
        role="dialog"
        aria-modal="true"
        aria-label="AI Neural Triage Assistant"
        style={{ maxWidth: "680px", width: "95%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="close-modal"
          aria-label="Close dialog"
          onClick={onClose}
        >
          ×
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div className="modal-icon" style={{ margin: 0 }}>
            <Icon name="bot" size={32} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "24px" }}>
              DefenX Neural Analyst
            </h2>
            <span style={{ fontSize: "13px", color: "#8c6328" }}>
              Context-Aware Windows Host Threat Intelligence
            </span>
          </div>
        </div>

        {}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
          <span
            className="demo-label"
            style={{ fontSize: "11px", padding: "4px 9px" }}
          >
            Host: {telemetry?.hostname || "Local Node"}
          </span>
          <span
            className="demo-label"
            style={{ fontSize: "11px", padding: "4px 9px" }}
          >
            CPU: {telemetry?.cpuUsage ?? 15}%
          </span>
          <span
            className="demo-label"
            style={{ fontSize: "11px", padding: "4px 9px" }}
          >
            RAM: {telemetry?.memoryUsage ?? 50}%
          </span>
          <span
            className="demo-label"
            style={{
              fontSize: "11px",
              padding: "4px 9px",
              backgroundColor:
                (telemetry?.anomalyScore ?? 0) > 75 ? "#fee2e2" : "#fef3c7",
              borderColor:
                (telemetry?.anomalyScore ?? 0) > 75 ? "#ef4444" : "#f59e0b",
              color:
                (telemetry?.anomalyScore ?? 0) > 75 ? "#b91c1c" : "#b45309",
            }}
          >
            Anomaly Index: {telemetry?.anomalyScore ?? 15}/100 (
            {telemetry?.baselineStatus || "learning"})
          </span>
        </div>

        {}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(82, 9, 20, 0.08), rgba(219, 172, 89, 0.12))",
            border: "1px solid #d8b884",
            borderRadius: "14px",
            padding: "18px",
            marginBottom: "16px",
            maxHeight: "260px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <Icon name="sparkles" size={18} />
            <strong style={{ fontSize: "15px", color: "#781523" }}>
              Neural Inference
            </strong>
            {asking && (
              <small style={{ color: "#8c6328" }}>
                Evaluating live host telemetry...
              </small>
            )}
          </div>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              lineHeight: "1.6",
              color: "#3c2a21",
            }}
          >
            {asking
              ? "Processing real-time CIM handles, sockets, and baseline statistics..."
              : answer}
          </p>
        </div>

        {}
        <div style={{ marginBottom: "16px" }}>
          <small
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#8c6328",
              fontWeight: 600,
            }}
          >
            RECOMMENDED TRIAGE QUERIES
          </small>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                disabled={asking}
                onClick={() => askAssistant(q)}
                style={{
                  textAlign: "left",
                  padding: "8px 12px",
                  fontSize: "13px",
                  borderRadius: "8px",
                  background: "#fff9ee",
                  border: "1px solid #e2cbaf",
                  color: "#6b2c34",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <span>{q}</span>
                <Icon name="arrow" size={14} />
              </button>
            ))}
          </div>
        </div>

        {}
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid #d2b48c",
              fontSize: "14px",
              background: "#fff",
            }}
            placeholder="Ask neural assistant about endpoint telemetry, threats, or lineage..."
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend()
            }}
          />
          <button
            className="secondary-button"
            disabled={asking || !localPrompt.trim()}
            onClick={handleSend}
            style={{ padding: "10px 18px", fontWeight: 600 }}
          >
            Ask <Icon name="arrow" size={16} />
          </button>
        </div>
        <small
          style={{
            display: "block",
            marginTop: "8px",
            color: "#817167",
            fontSize: "11px",
          }}
        >
          * Deducts 5 DefenX credits per neural query from defense quota.
        </small>
      </section>
    </div>
  )
}
