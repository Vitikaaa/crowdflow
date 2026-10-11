import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Menu, Waves } from 'lucide-react'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import LiveMonitoringPage from './pages/LiveMonitoringPage.jsx'
import PredictionsPage from './pages/PredictionsPage.jsx'
import CounterfactualLab from './pages/CounterfactualLab.jsx'
import OrchestrationPage from './pages/OrchestrationPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import AlertsPage from './pages/AlertsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import { useCampus } from './hooks.js'

export default function App() {
  const [open, setOpen] = useState(false)
  const campus = useCampus()

  return (
    <div className="min-h-screen bg-cream text-ink font-sans selection:bg-coral selection:text-ink">
      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        alertCount={campus.alerts?.length || 0}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-ink text-cream border-b border-white/10 sticky top-0 z-20">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="rounded-xl bg-white/10 p-2 text-cream hover:bg-white/20 transition"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="grid place-items-center size-7 rounded-lg bg-coral text-ink font-black">
              <Waves size={16} />
            </span>
            <span className="font-black text-base tracking-tight">CrowdFlow</span>
          </div>
          <span className="text-xs bg-peach/30 text-peach px-2 py-0.5 rounded-full font-bold">
            Live
          </span>
        </div>

        {/* Main Routed Content */}
        <main className="mx-auto max-w-7xl w-full p-4 sm:p-6 lg:p-8 flex-1">
          <Routes>
            <Route path="/" element={<Dashboard campus={campus} />} />
            <Route path="/monitoring" element={<LiveMonitoringPage campus={campus} />} />
            <Route path="/predictions" element={<PredictionsPage campus={campus} />} />
            <Route path="/counterfactual" element={<CounterfactualLab campus={campus} />} />
            <Route path="/orchestration" element={<OrchestrationPage campus={campus} />} />
            {/* Backwards compatibility for old recommendations link */}
            <Route path="/recommendations" element={<Navigate to="/orchestration" replace />} />
            <Route path="/analytics" element={<AnalyticsPage campus={campus} />} />
            <Route path="/alerts" element={<AlertsPage campus={campus} />} />
            <Route path="/settings" element={<SettingsPage campus={campus} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-ink/10 py-4 px-6 text-center text-xs text-ink/60">
          CrowdFlow · A System and Method for Predictive Counterfactual Orchestration of Crowd Flow Across Interconnected Service Regions
        </footer>
      </div>
    </div>
  )
}
