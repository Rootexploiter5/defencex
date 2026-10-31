"use client"

import React from "react"
import { Icon } from "@/components/common/Icon"
import { TelemetrySnapshot } from "@/types/defenx"

interface BalanceModalProps {
  isOpen: boolean
  onClose: () => void
  balance: number
  rechargeBalance: (amount: number) => void
  telemetry: TelemetrySnapshot | null
}

export function BalanceModal({
  isOpen,
  onClose,
  balance,
  rechargeBalance,
  telemetry,
}: BalanceModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <section
        className="modal card balance-modal"
        role="dialog"
        aria-modal="true"
        aria-label="DefenX Security Quota & Balance Hub"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="close-modal"
          aria-label="Close dialog"
          onClick={onClose}
        >
          ×
        </button>
        <div className="modal-icon">
          <Icon name="wallet" size={32} />
        </div>
        <h2>Defense Operations Balance</h2>
        <p>
          DefenX credits power real-time neural anomaly heuristics, deep packet
          inspection, and OS containment dispatch.
        </p>

        <div className="balance-hero">
          <div className="balance-hero-text">
            <h3>Available Defense Balance</h3>
            <div className="big-credits">
              {balance.toLocaleString()} <span>Credits</span>
            </div>
            <p>≈ ${(balance / 10).toFixed(2)} USD allocated bandwidth</p>
          </div>
          <div className="balance-hero-badge">
            <span>Anomaly Index: {telemetry?.anomalyScore ?? 15}/100</span>
          </div>
        </div>

        <div className="balance-breakdown">
          <div className="breakdown-item">
            <span>Real-Time AI Query</span>
            <strong>5 Cr / query</strong>
          </div>
          <div className="breakdown-item">
            <span>Socket Telemetry</span>
            <strong>2 Cr / hour</strong>
          </div>
          <div className="breakdown-item">
            <span>Heuristic Audit</span>
            <strong>10 Cr / scan</strong>
          </div>
        </div>

        <div className="recharge-section">
          <h4>Instant Quota Top-Up</h4>
          <div className="recharge-grid">
            <button
              className="recharge-btn"
              onClick={() => rechargeBalance(250)}
            >
              <strong>+250 Credits</strong>
              <small>$25 · Instant</small>
            </button>
            <button
              className="recharge-btn"
              onClick={() => rechargeBalance(1000)}
            >
              <strong>+1,000 Credits</strong>
              <small>$90 · Save 10%</small>
            </button>
            <button
              className="recharge-btn"
              onClick={() => rechargeBalance(5000)}
            >
              <strong>+5,000 Credits</strong>
              <small>$400 · Enterprise</small>
            </button>
          </div>
        </div>

        <button className="primary-button" onClick={onClose}>
          Done <Icon name="arrow" size={18} />
        </button>
      </section>
    </div>
  )
}
