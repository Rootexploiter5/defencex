"use client"

// Modals & Panels

// AI Assistant Chat State

// Live Data States

// Sync tab with URL hash

// Telemetry Fetcher

// Processes Fetcher

// Network Fetcher

// Alerts Fetcher

// Forensics Fetcher

// Continuous background polling (every 3 seconds)

// Toggle alert review state

// Quarantine Process Action

// Firewall Block IP Action

// Toggle Safe Mode

// Trigger Simulated Attack Scenario

// AI Assistant Ask Query

import { useState, useEffect, useCallback, useTransition } from "react"
import {
  TelemetrySnapshot,
  TelemetryPoint,
  ProcessInfo,
  NetworkConnection,
  RealNetworkInterface,
  ThreatAlert,
  ForensicEvent,
  LoadBalancerNode,
  AttackSimulationType,
} from "@/types/defenx"
import { navigation } from "@/components/common/Icon"

export function useDefenXController() {
  const [active, setActiveState] = useState<string>("Dashboard")
  const [dark, setDarkState] = useState<boolean>(false)
  const [safeMode, setSafeModeState] = useState<boolean>(true)
  const [balance, setBalance] = useState<number>(2450)

  // Hydrate client preferences safely after mount to prevent hydration mismatch
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("defenx_theme")
      if (savedTheme) {
        setDarkState(savedTheme === "dark")
      }
      const savedBalance = localStorage.getItem("defenx_balance")
      if (savedBalance) {
        setBalance(parseInt(savedBalance, 10))
      }
      const hash = window.location.hash.slice(1)
      if (hash) {
        const match = navigation.find(
          (item) => item.label.toLowerCase().replace(/ /g, "-") === hash,
        )
        if (match) setActiveState(match.label)
      }
    } catch {}
  }, [])
  const [balanceModalOpen, setBalanceModalOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState(false)
  const [modal, setModal] = useState<string | null>(null)
  const [assistantModalOpen, setAssistantModalOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [notice, setNotice] = useState("")
  const [prompt, setPrompt] = useState("")
  const [asking, setAsking] = useState(false)
  const [answer, setAnswer] = useState(
    "DefenX Real-Time Neural Shield active. Live telemetry stream established with host operating system.",
  )
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot | null>(null)
  const [history, setHistory] = useState<TelemetryPoint[]>([])
  const [processes, setProcesses] = useState<ProcessInfo[]>([])
  const [alerts, setAlerts] = useState<ThreatAlert[]>([])
  const [events, setEvents] = useState<ForensicEvent[]>([])
  const [interfaces, setInterfaces] = useState<RealNetworkInterface[]>([])
  const [connections, setConnections] = useState<NetworkConnection[]>([])
  const [loadBalancerNodes, setLoadBalancerNodes] =
    useState<LoadBalancerNode[]>([
      {
        name: "Node US-East",
        region: "N. Virginia",
        latencyMs: 28,
        loadPercent: 35,
        status: "Healthy",
        reqPerSec: 1350,
      },
      {
        name: "Node EU-Central",
        region: "Frankfurt",
        latencyMs: 24,
        loadPercent: 41,
        status: "Healthy",
        reqPerSec: 1620,
      },
      {
        name: "Node AP-South",
        region: "Mumbai",
        latencyMs: 18,
        loadPercent: 24,
        status: "Healthy",
        reqPerSec: 1950,
      },
    ])
  const setActive = useCallback((tab: string) => {
    setActiveState(tab)
    if (
      typeof window !==
      "undefined"
    ) {
      window.location.hash = tab.toLowerCase().replace(/ /g, "-")
    }
  }, [])

  const setDark = useCallback((value: boolean) => {
    setDarkState(value)
    try {
      localStorage.setItem("defenx_theme", value ? "dark" : "light")
    } catch {}
  }, [])

  const rechargeBalance = useCallback((amount: number) => {
    setBalance((prev) => {
      const next =
        prev +
        amount
      try {
        localStorage.setItem("defenx_balance", next.toString())
      } catch {}
      return next
    })
    setNotice(`Added ${amount} credits to DefenX security operations balance`)
  }, [])
  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch("/api/telemetry", { cache: "no-store" })
      if (!res.ok) return
      const json = await res.json()
      if (json.success && json.data) {
        setTelemetry(json.data)
        if (json.history) setHistory(json.history)
        if (
          typeof json.safeMode ===
          "boolean"
        )
          setSafeModeState(json.safeMode)
      }
    } catch {}
  }, [])
  const fetchProcesses = useCallback(async () => {
    try {
      const res = await fetch("/api/processes", { cache: "no-store" })
      if (!res.ok) return
      const json = await res.json()
      if (json.success && json.data) {
        setProcesses(json.data)
      }
    } catch {}
  }, [])
  const fetchNetwork = useCallback(async () => {
    try {
      const res = await fetch("/api/network", { cache: "no-store" })
      if (!res.ok) return
      const json = await res.json()
      if (json.success) {
        if (json.interfaces) setInterfaces(json.interfaces)
        if (json.connections) setConnections(json.connections)
        if (json.loadBalancerNodes) setLoadBalancerNodes(json.loadBalancerNodes)
      }
    } catch {}
  }, [])
  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/threats", { cache: "no-store" })
      if (!res.ok) return
      const json = await res.json()
      if (json.success && json.data) {
        setAlerts(json.data)
        if (
          typeof json.safeMode ===
          "boolean"
        )
          setSafeModeState(json.safeMode)
      }
    } catch {}
  }, [])
  const fetchForensics = useCallback(async () => {
    try {
      const res = await fetch("/api/forensics", { cache: "no-store" })
      if (!res.ok) return
      const json = await res.json()
      if (json.success && json.data) {
        setEvents(json.data)
      }
    } catch {}
  }, [])

  const refreshAll = useCallback(() => {
    fetchTelemetry()
    fetchProcesses()
    fetchNetwork()
    fetchAlerts()
    fetchForensics()
  }, [
    fetchTelemetry,
    fetchProcesses,
    fetchNetwork,
    fetchAlerts,
    fetchForensics,
  ])
  useEffect(() => {
    refreshAll()
    const interval = setInterval(() => {
      fetchTelemetry()
      fetchAlerts()
      fetchProcesses()
    }, 3000)

    const slowInterval = setInterval(() => {
      fetchNetwork()
      fetchForensics()
    }, 6000)

    return () => {
      clearInterval(interval)
      clearInterval(slowInterval)
    }
  }, [
    refreshAll,
    fetchTelemetry,
    fetchAlerts,
    fetchProcesses,
    fetchNetwork,
    fetchForensics,
  ])
  const toggleAlertReviewHandler = useCallback(
    async (alertId: string) => {
      try {
        setAlerts((prev) =>
          prev.map((a) =>
            a.id ===
            alertId
              ? {
                  ...a,
                  reviewed: !a.reviewed,
                  status: !a.reviewed ? "Reviewed" : "Active",
                }
              : a,
          ),
        )
        const res = await fetch("/api/threats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "review", alertId }),
        })
        const json = await res.json()
        if (json.success) {
          fetchForensics()
        }
      } catch {}
    },
    [fetchForensics],
  )
  const quarantineProcessAction = useCallback(
    async (pid: number, processName?: string, alertId?: string) => {
      try {
        const res = await fetch("/api/threats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "quarantine",
            pid,
            processName,
            alertId,
          }),
        })
        const json = await res.json()
        if (json.success) {
          setNotice(
            `Quarantine dispatched for PID ${pid} (${
              json.result?.mode ||
              "safe-mode"
            })`,
          )
          refreshAll()
        } else {
          setNotice(
            `Quarantine failed: ${
              json.error ||
              json.result?.message
            }`,
          )
        }
      } catch (err) {
        setNotice(`Quarantine request error: ${(err as Error).message}`)
      }
    },
    [refreshAll],
  )
  const blockIpAction = useCallback(
    async (remoteIp: string, alertId?: string) => {
      try {
        const res = await fetch("/api/threats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "block_ip", remoteIp, alertId }),
        })
        const json = await res.json()
        if (json.success) {
          setNotice(
            `Firewall block rule created for ${remoteIp} (${
              json.result?.mode ||
              "safe-mode"
            })`,
          )
          refreshAll()
        } else {
          setNotice(
            `Block failed: ${
              json.error ||
              json.result?.message
            }`,
          )
        }
      } catch (err) {
        setNotice(`Firewall request error: ${(err as Error).message}`)
      }
    },
    [refreshAll],
  )
  const toggleSafeModeAction = useCallback(async () => {
    try {
      const res = await fetch("/api/threats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_safe_mode" }),
      })
      const json = await res.json()
      if (json.success) {
        setSafeModeState(json.safeMode)
        setNotice(
          `Containment guard set to ${
            json.safeMode ? "SAFE-MODE (Dry-Run)" : "LIVE ENFORCEMENT"
          }`,
        )
        fetchForensics()
      }
    } catch {}
  }, [fetchForensics])
  const triggerAttack = useCallback(
    async (type: AttackSimulationType) => {
      try {
        const res = await fetch("/api/threats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "simulate", attackType: type }),
        })
        const json = await res.json()
        if (json.success) {
          setNotice(
            `Simulated attack '${type}' activated. Monitoring behavioral deviation.`,
          )
          refreshAll()
        }
      } catch (err) {
        setNotice(`Attack simulation error: ${(err as Error).message}`)
      }
    },
    [refreshAll],
  )
  const askAssistant = useCallback(
    async (customPrompt?: string) => {
      const textToAsk = customPrompt || prompt
      if (!textToAsk.trim() || asking) return

      setAsking(true)
      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: textToAsk }),
        })
        const json = await res.json()
        if (json.success && json.answer) {
          setAnswer(json.answer)
          setBalance((prev) => {
            const next = Math.max(0, prev - 5)
            try {
              localStorage.setItem("defenx_balance", next.toString())
            } catch {}
            return next
          })
          fetchForensics()
        } else {
          setAnswer(
            `Neural Analysis error: ${json.error || "Unknown server response"}`,
          )
        }
      } catch {
        setAnswer(
          "Host neural triage engine is busy. Please retry in a few seconds.",
        )
      } finally {
        setAsking(false)
        setPrompt("")
      }
    },
    [prompt, asking, fetchForensics],
  )

  const openDetail = useCallback((title: string) => {
    setModal(title)
  }, [])

  const closeModal = useCallback(() => {
    setModal(null)
  }, [])

  return {
    active,
    setActive,
    dark,
    setDark,
    safeMode,
    toggleSafeMode: toggleSafeModeAction,
    balance,
    rechargeBalance,
    balanceModalOpen,
    setBalanceModalOpen,
    profileOpen,
    setProfileOpen,
    notifications,
    setNotifications,
    modal,
    openDetail,
    closeModal,
    assistantModalOpen,
    setAssistantModalOpen,
    query,
    setQuery,
    notice,
    setNotice,
    prompt,
    setPrompt,
    asking,
    answer,
    askAssistant,
    telemetry,
    history,
    processes,
    alerts,
    events,
    interfaces,
    connections,
    loadBalancerNodes,
    refreshAll,
    toggleAlertReviewHandler,
    quarantineProcess: quarantineProcessAction,
    blockIp: blockIpAction,
    triggerAttack,
  }
}
