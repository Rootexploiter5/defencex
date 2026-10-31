import React, { useId, useMemo } from "react"
import { TelemetryPoint } from "@/types/defenx"

export interface SmoothPathResult {
  areaPath: string
  linePath: string
  coords: { x: number; y: number }[]
}

export function generateSmoothPath(
  points: number[],
  width: number,
  height: number,
  maxVal = 100,
): SmoothPathResult {
  if (!points || points.length === 0) {
    return {
      areaPath: `M 0 ${height} L ${width} ${height} Z`,
      linePath: `M 0 ${height / 2} L ${width} ${height / 2}`,
      coords: [],
    }
  }

  const len = points.length
  const coords = points.map((val, i) => {
    const x = len === 1 ? width / 2 : (i / (len - 1)) * width
    const clamped = Math.max(0, Math.min(maxVal, val))
    const y = height - (clamped / maxVal) * (height * 0.82) - height * 0.08
    return { x: +x.toFixed(1), y: +y.toFixed(1) }
  })

  let line = `M ${coords[0].x} ${coords[0].y}`
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1]
    const curr = coords[i]
    const midX = (prev.x + curr.x) / 2
    line += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`
  }

  const area = `${line} L ${width} ${height} L 0 ${height} Z`
  return { areaPath: area, linePath: line, coords }
}

export function Bars({ values }: { values?: number[] }) {
  const bars = useMemo(() => {
    if (values && values.length > 0) {
      return values
        .slice(-14)
        .map((v) => Math.max(10, Math.min(100, Math.round(v))))
    }
    return [25, 30, 22, 45, 60, 52, 48, 55, 68, 74, 58, 62, 70, 65]
  }, [values])

  return (
    <div className="mini-bars">
      {bars.map((h, i) => (
        <i key={i} style={{ height: `${h}%` }} />
      ))}
    </div>
  )
}

export function Sparkline({
  points,
  second = false,
}: {
  points?: number[]
  second?: boolean
}) {
  const gradientId = useId()
  const data = useMemo(() => {
    if (points && points.length >= 2) return points.slice(-8)
    return second
      ? [40, 48, 42, 35, 41, 38, 30, 22]
      : [20, 28, 35, 42, 50, 48, 62, 55]
  }, [points, second])

  const { areaPath, linePath } = useMemo(() => {
    return generateSmoothPath(data, 100, 60, 100)
  }, [data])

  return (
    <svg className="sparkline" viewBox="0 0 100 60">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor={second ? "#dca038" : "#c76a28"} stopOpacity=".55" />
          <stop
            offset="1"
            stopColor={second ? "#dca038" : "#d69e48"}
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={second ? "#dca038" : "#a76422"}
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function PerformanceChart({
  period,
  history,
}: {
  period: string
  history: TelemetryPoint[]
}) {
  const gradientId = useId()

  const cpuPoints = useMemo(() => history.map((h) => h.cpu), [history])
  const memPoints = useMemo(() => history.map((h) => h.memory), [history])

  const cpuPath = useMemo(
    () => generateSmoothPath(cpuPoints, 720, 160, 100),
    [cpuPoints],
  )
  const memPath = useMemo(
    () => generateSmoothPath(memPoints, 720, 160, 100),
    [memPoints],
  )

  const latestCpu = cpuPoints[cpuPoints.length - 1] ?? 15
  const latestMem = memPoints[memPoints.length - 1] ?? 50
  const latestTime = history[history.length - 1]?.time ?? "Live"

  const xLabels = useMemo(() => {
    if (history.length >= 5) {
      const step = Math.floor(history.length / 4)
      return [
        history[0]?.time || "Start",
        history[step]?.time || "T1",
        history[step * 2]?.time || "T2",
        history[step * 3]?.time || "T3",
        history[history.length - 1]?.time || "Now",
      ]
    }
    return ["T-12m", "T-9m", "T-6m", "T-3m", "Now"]
  }, [history])

  return (
    <div className="performance-chart">
      <div className="chart-labels">
        <span>100%</span>
        <span>75%</span>
        <span>50%</span>
        <span>25%</span>
        <span>0%</span>
      </div>
      <div className="plot">
        <svg viewBox="0 0 720 160" preserveAspectRatio="none">
          <defs>
            <linearGradient
              id={`${gradientId}-red`}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop stopColor="#a62029" stopOpacity=".5" />
              <stop offset="1" stopColor="#a62029" stopOpacity=".04" />
            </linearGradient>
            <linearGradient
              id={`${gradientId}-gold`}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop stopColor="#dbac59" stopOpacity=".45" />
              <stop offset="1" stopColor="#dbac59" stopOpacity=".06" />
            </linearGradient>
          </defs>
          {/* Memory Area */}
          <path d={memPath.areaPath} fill={`url(#${gradientId}-gold)`} />
          <path
            d={memPath.linePath}
            fill="none"
            stroke="#daa55b"
            strokeWidth="1.6"
          />
          {/* CPU Area */}
          <path d={cpuPath.areaPath} fill={`url(#${gradientId}-red)`} />
          <path
            d={cpuPath.linePath}
            fill="none"
            stroke="#bd1829"
            strokeWidth="1.8"
          />

          {/* Interactive dots at real sample points */}
          {cpuPath.coords.map((c, i) => (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={i === cpuPath.coords.length - 1 ? 5 : 2.5}
              fill={i === cpuPath.coords.length - 1 ? "#bd1829" : "#ffdde2"}
              stroke="#8b0b1b"
              strokeWidth={i === cpuPath.coords.length - 1 ? 2 : 1}
            />
          ))}
        </svg>
        <div className="chart-tooltip">
          <i />
          <strong>{latestCpu}% CPU</strong> · {latestMem}% RAM{" "}
          <span>• {latestTime}</span>
        </div>
        <div className="x-labels">
          {xLabels.map((lbl, i) => (
            <span key={i}>{lbl}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function NetworkChart({ history }: { history: TelemetryPoint[] }) {
  const gradientId = useId()
  const netPoints = useMemo(() => history.map((h) => h.network), [history])
  const { areaPath, linePath, coords } = useMemo(() => {
    return generateSmoothPath(netPoints, 350, 105, 100)
  }, [netPoints])

  const lastCoord = coords[coords.length - 1]

  return (
    <div className="network-chart">
      <div className="network-scale">
        <span>100</span>
        <span>50</span>
        <span>0</span>
      </div>
      <svg viewBox="0 0 350 105" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#a31821" stopOpacity=".7" />
            <stop offset="1" stopColor="#c25649" stopOpacity=".16" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke="#a81c26" strokeWidth="1.6" />
        {lastCoord && (
          <>
            <path
              d={`M ${lastCoord.x} 0 V 105`}
              stroke="#fff4db"
              strokeDasharray="4 3"
            />
            <circle
              cx={lastCoord.x}
              cy={lastCoord.y}
              r="5"
              fill="#ae0b22"
              stroke="#fff6e3"
              strokeWidth="2"
            />
          </>
        )}
      </svg>
    </div>
  )
}
