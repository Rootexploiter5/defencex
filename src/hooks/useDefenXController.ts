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
  PlaybookPolicy,
} from "@/types/defenx"
import { navigation } from "@/components/common/Icon"

export function useDefenXController() {
  const [active, setActiveState] = useState<string>("Dashboard")
  const [dark, setDarkState] = useState<boolean>(false)
  const [safeMode, setSafeModeState] = useState<boolean>(true)

  // Hydrate client preferences safely after mount to prevent hydration mismatch
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("defenx_theme")
      if (savedTheme) {
        setDarkState(savedTheme === "dark")
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
  const [playbooks, setPlaybooks] = useState<PlaybookPolicy[]>([])
  const [events, setEvents] = useState<ForensicEvent[]>([])
  const [interfaces, setInterfaces] = useState<RealNetworkInterface[]>([])
  const [connections, setConnections] = useState<NetworkConnection[]>([])
  const [loadBalancerNodes, setLoadBalancerNodes] = useState<LoadBalancerNode[]>([])
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
        if (json.playbooks) setPlaybooks(json.playbooks)
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

    // Establish live SSE stream for sub-second telemetry push
    let eventSource: EventSource | null = null
    try {
      eventSource = new EventSource("/api/telemetry/stream")
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          if (payload.telemetry) setTelemetry(payload.telemetry)
          if (payload.history) setHistory(payload.history)
          if (payload.alerts && payload.alerts.length > 0) setAlerts(payload.alerts)
          if (typeof payload.safeMode === "boolean") setSafeModeState(payload.safeMode)
        } catch {}
      }
      eventSource.onerror = () => {
        eventSource?.close()
      }
    } catch {}

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
      eventSource?.close()
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
  const togglePlaybookAction = useCallback(
    async (policyId: string) => {
      try {
        const res = await fetch("/api/threats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "toggle_playbook", policyId }),
        })
        const json = await res.json()
        if (json.success && json.playbooks) {
          setPlaybooks(json.playbooks)
          setNotice(`SOAR Playbook policy updated: ${json.enabled ? "ENABLED" : "DISABLED"}`)
          fetchForensics()
        }
      } catch {}
    },
    [fetchForensics],
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
    playbooks,
    togglePlaybook: togglePlaybookAction,
  }
}
