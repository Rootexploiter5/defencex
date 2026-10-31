import React from "react"

export type IconName = "shield" | "home" | "pulse" | "brain" | "alert" | "globe" | "search" | "file" | "settings" | "bell" | "cpu" | "database" | "layers" | "sparkles" | "bot" | "arrow" | "chevron" | "sun" | "moon" | "wallet" | "zap" | "refresh" | "check" | "lock" | "play" | "stop" | "download"

export function Icon({
  name,
  size = 24,
  className = "",
}: {
  name: IconName
  size?: number
  className?: string
}) {
  const paths: Record<IconName, React.ReactNode> = {
    shield: (
      <>
        <path d="M12 2 3 6v6c0 6 9 10 9 10s9-4 9-10V6Z" />
        <path d="m7 12 3 3 7-7" />
      </>
    ),
    home: (
      <>
        <path d="m2 11 10-9 10 9" />
        <path d="M5 9v12h5v-7h4v7h5V9" />
      </>
    ),
    pulse: <path d="M1 12h6l3-10 4 20 3-10h6" />,
    brain: (
      <>
        <path d="M9 4C5 0 2 6 5 8c-5 1-4 7 0 7-2 5 2 8 5 5V4Zm6 0c4-4 7 2 4 4 5 1 4 7 0 7 2 5-2 8-5 5V4Z" />
        <path d="M12 4v16" />
      </>
    ),
    alert: (
      <>
        <path d="m10.3 3.2-8.5 14.8c-.8 1.4.2 3 1.7 3h17c1.6 0 2.5-1.7 1.7-3L13.7 3.2c-.8-1.5-2.6-1.5-3.4 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </>
    ),
    file: (
      <>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </>
    ),
    bell: (
      <>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </>
    ),
    cpu: (
      <>
        <rect width="16" height="16" x="4" y="4" rx="2" />
        <rect width="6" height="6" x="9" y="9" rx="1" />
        <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
      </>
    ),
    layers: (
      <>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
        <path d="M5 3v4" />
        <path d="M19 17v4" />
      </>
    ),
    bot: (
      <>
        <path d="M12 8V4H8" />
        <rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2M20 14h2M15 13v2M9 13v2" />
      </>
    ),
    arrow: <path d="M5 12h14m-7-7 7 7-7 7" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </>
    ),
    moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
    wallet: (
      <>
        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
      </>
    ),
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
    refresh: (
      <>
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 16h5v5" />
      </>
    ),
    check: <polyline points="20 6 9 17 4 12" />,
    lock: (
      <>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    ),
    play: <polygon points="5 3 19 12 5 21 5 3" />,
    stop: <rect width="16" height="16" x="4" y="4" rx="2" />,
    download: (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" x2="12" y1="15" y2="3" />
      </>
    ),
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name] || paths.shield}
    </svg>
  )
}

export interface NavigationItem {
  label: string
  icon: IconName
}

export const navigation: NavigationItem[] = [
  { label: "Dashboard", icon: "home" },
  { label: "Live Monitor", icon: "pulse" },
  { label: "AI Detection", icon: "brain" },
  { label: "Threat Center", icon: "alert" },
  { label: "Network", icon: "globe" },
  { label: "Forensics", icon: "search" },
  { label: "Reports", icon: "file" },
  { label: "Settings", icon: "settings" },
]

export const tabDescriptions: Record<string, string> = {
  Dashboard:
    "Executive overview of host perimeter, behavioral ML score, and recent telemetry.",
  "Live Monitor":
    "A closer look at your real operating system performance and running processes.",
  "AI Detection":
    "Real-time behavioral heuristics analyzing active processes and open sockets.",
  "Threat Center":
    "Investigate, review, and manage live endpoint security signals with OS containment.",
  Network:
    "Live traffic streams, real network interfaces, and regional edge load balancer.",
  Forensics:
    "Follow the evidence. Explore an authentic timeline of live system activity.",
  Reports:
    "Your security posture, compiled from live system data and ready to share.",
  Settings:
    "Configure workspace options, manage defense quotas, and view machine specs.",
}
