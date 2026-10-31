"use client"

// Modular Feature Views
/* Decorative Silk Backgrounds & Gold Accents */ /* Sidebar Navigation */ /* Main Workspace */ /* Action Notice Notification Banner */ /* Dashboard Entry View */ /* Tab Feature Pages */ /* AI Threat Analyst Drawer/Modal */ /* Quota & Balance Management Modal */ /* Item Detail Inspector Modal */

import React, { useMemo } from "react"
import { useDefenXController } from "@/hooks/useDefenXController"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"
import { AssistantModal } from "@/components/layout/AssistantModal"
import { BalanceModal } from "@/components/layout/BalanceModal"
import { DetailModal } from "@/components/layout/DetailModal"
import { tabDescriptions } from "@/components/common/Icon"
import { DashboardView } from "@/components/views/DashboardView"
import { LiveMonitorView } from "@/components/views/LiveMonitorView"
import { NeuralSandboxView } from "@/components/views/NeuralSandboxView"
import { ThreatCenterView } from "@/components/views/ThreatCenterView"
import { NetworkTopologyView } from "@/components/views/NetworkTopologyView"
import { ForensicsView } from "@/components/views/ForensicsView"
import { ReportsView } from "@/components/views/ReportsView"
import { OperationsHubView } from "@/components/views/OperationsHubView"

export default function App() {
  const {
    active,
    setActive,
    dark,
    setDark,
    safeMode,
    toggleSafeMode,
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
    quarantineProcess,
    blockIp,
    triggerAttack,
  } = useDefenXController()

  const unreviewedAlertCount = useMemo(
    () => alerts.filter((a) => !a.reviewed).length,
    [alerts],
  )

  return (
    <div className={`app ${dark ? "dark-mode" : ""}`}>
      {}
      <div className="silk silk-one" />
      <div className="silk silk-two" />
      <div className="gold-thread thread-one" />
      <div className="gold-thread thread-two" />

      {}
      <Sidebar
        active={active}
        setActive={setActive}
        dark={dark}
        setDark={setDark}
        telemetry={telemetry}
        unreviewedAlertCount={unreviewedAlertCount}
      />

      {}
      <main>
        <TopBar
          query={query}
          setQuery={setQuery}
          processes={processes}
          alerts={alerts}
          balance={balance}
          setBalanceModalOpen={setBalanceModalOpen}
          safeMode={safeMode}
          toggleSafeMode={toggleSafeMode}
          notifications={notifications}
          setNotifications={setNotifications}
          profileOpen={profileOpen}
          setProfileOpen={setProfileOpen}
          setAssistantModalOpen={setAssistantModalOpen}
          openDetail={openDetail}
          setActive={setActive}
          telemetry={telemetry}
          unreviewedAlertCount={unreviewedAlertCount}
        />

        {}
        {notice && (
          <div
            role="status"
            style={{
              marginBottom: "16px",
              padding: "12px 18px",
              borderRadius: "12px",
              background: "linear-gradient(110deg, #510009, #380004)",
              border: "1px solid #e0b25c",
              color: "#f8eee0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 4px 12px rgba(81,0,9,0.3)",
              fontSize: "14px",
            }}
          >
            <span>{notice}</span>
            <button
              onClick={() => setNotice("")}
              style={{
                background: "none",
                border: "none",
                color: "#f0cf80",
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              ×
            </button>
          </div>
        )}

        {}
        <div hidden={active !== "Dashboard"}>
          <DashboardView
            telemetry={telemetry}
            history={history}
            processes={processes}
            alerts={alerts}
            unreviewedAlertCount={unreviewedAlertCount}
            openDetail={openDetail}
            setActive={setActive}
            prompt={prompt}
            setPrompt={setPrompt}
            asking={asking}
            answer={answer}
            askAssistant={askAssistant}
          />
        </div>

        {}
        <div hidden={active === "Dashboard"}>
          <section className="tab-page" aria-labelledby="page-title">
            <div className="tab-page-heading">
              <div>
                <span className="eyebrow">DEFENX / {active.toUpperCase()}</span>
                <h1 id="page-title">{active}</h1>
                <p>
                  {tabDescriptions[active] ||
                    "Real-Time Defense & Intelligence Platform"}
                </p>
              </div>
              <div className="demo-label">
                Real Telemetry: {telemetry?.hostname || "Local Node"}
              </div>
            </div>

            {active === "Live Monitor" && (
              <LiveMonitorView
                telemetry={telemetry}
                history={history}
                processes={processes}
                refreshAll={refreshAll}
                openDetail={openDetail}
              />
            )}

            {active === "AI Detection" && (
              <NeuralSandboxView
                telemetry={telemetry}
                processes={processes}
                connections={connections}
                safeMode={safeMode}
                toggleSafeMode={toggleSafeMode}
                triggerAttack={triggerAttack}
                openDetail={openDetail}
                refreshAll={refreshAll}
              />
            )}

            {active === "Threat Center" && (
              <ThreatCenterView
                alerts={alerts}
                telemetry={telemetry}
                safeMode={safeMode}
                toggleSafeMode={toggleSafeMode}
                toggleAlertReviewHandler={toggleAlertReviewHandler}
                quarantineProcess={quarantineProcess}
                blockIp={blockIp}
                openDetail={openDetail}
              />
            )}

            {active === "Network" && (
              <NetworkTopologyView
                telemetry={telemetry}
                history={history}
                interfaces={interfaces}
                connections={connections}
                loadBalancerNodes={loadBalancerNodes}
                blockIp={blockIp}
              />
            )}

            {active === "Forensics" && (
              <ForensicsView events={events} telemetry={telemetry} />
            )}

            {active === "Reports" && (
              <ReportsView
                telemetry={telemetry}
                alerts={alerts}
                processes={processes}
                interfaces={interfaces}
                connections={connections}
                balance={balance}
                setNotice={setNotice}
              />
            )}

            {active === "Settings" && (
              <OperationsHubView
                telemetry={telemetry}
                balance={balance}
                setBalanceModalOpen={setBalanceModalOpen}
                dark={dark}
                setDark={setDark}
                safeMode={safeMode}
                toggleSafeMode={toggleSafeMode}
              />
            )}
          </section>
        </div>
      </main>

      {}
      <AssistantModal
        isOpen={assistantModalOpen}
        onClose={() => setAssistantModalOpen(false)}
        telemetry={telemetry}
        asking={asking}
        answer={answer}
        askAssistant={askAssistant}
      />

      {}
      <BalanceModal
        isOpen={balanceModalOpen}
        onClose={() => setBalanceModalOpen(false)}
        balance={balance}
        rechargeBalance={rechargeBalance}
        telemetry={telemetry}
      />

      {}
      <DetailModal
        modal={modal}
        onClose={closeModal}
        alerts={alerts}
        processes={processes}
        connections={connections}
        telemetry={telemetry}
      />
    </div>
  )
}
