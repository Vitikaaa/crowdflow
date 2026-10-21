import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AlertsPage from './pages/AlertsPage.jsx'
import RecommendationsPage from './pages/RecommendationsPage.jsx'
import MonitoringPage from './pages/MonitoringPage.jsx'
import PredictionsPage from './pages/PredictionsPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import { useCampus } from './hooks.js'
export default function App() {
  const [open, setOpen] = useState(false); const campus = useCampus()
  return (<div className="min-h-screen"><Sidebar open={open} onClose={() => setOpen(false)} />
    <div className="lg:pl-64"><div className="lg:hidden flex items-center gap-3 p-4"><button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-xl bg-ink p-2 text-cream"><Menu /></button><span className="font-extrabold">CrowdFlow</span></div>
      <main className="mx-auto max-w-7xl p-4 sm:p-8"><Routes>
        <Route path="/" element={<Dashboard campus={campus} />} />
        <Route path="/monitoring" element={<MonitoringPage campus={campus} />} />
        <Route path="/predictions" element={<PredictionsPage campus={campus} />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/alerts" element={<AlertsPage campus={campus} />} />
        <Route path="/recommendations" element={<RecommendationsPage campus={campus} />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes></main></div></div>)
}
