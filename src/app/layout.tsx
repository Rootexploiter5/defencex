import type { Metadata } from "next"
import "@/index.css"

export const metadata: Metadata = {
  title: "DefenX - AI Cybersecurity & Threat Intelligence Platform",
  description:
    "DefenX is an enterprise AI cybersecurity platform delivering real-time telemetry, threat detection, and global load balancing.",
  icons: {
    icon: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
