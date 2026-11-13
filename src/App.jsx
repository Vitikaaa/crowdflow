import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Menu, Layers, Shield, GraduationCap, LogOut } from 'lucide-react'
import Sidebar from './components/Sidebar.jsx'
import CampusOverviewPage from './pages/admin/CampusOverviewPage.jsx'
import CrowdQueueControlPage from './pages/admin/CrowdQueueControlPage.jsx'
import SmartDecisionsPage from './pages/admin/SmartDecisionsPage.jsx'
import ExploreCampusPage from './pages/student/ExploreCampusPage.jsx'
import MyQueuesPage from './pages/student/MyQueuesPage.jsx'
import MyAccountPage from './pages/student/MyAccountPage.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'
import { useCampus } from './hooks.js'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const campus = useCampus()
  const navigate = useNavigate()
  const location = useLocation()
  const { userRole = 'admin', setUserRole, isAuthenticated = true, logout, tokens = [] } = campus

  const handleToggleRole = () => {
    const nextRole = userRole === 'admin' ? 'student' : 'admin'
    if (setUserRole) setUserRole(nextRole)
    if (nextRole === 'admin') {
      navigate('/admin/overview')
    } else {
      navigate('/student/explore')
    }
  }

  const handleLogout = () => {
    if (logout) logout()
    navigate('/login')
  }

  // If on login route, render standalone without shell
  if (location.pathname === '/login') {
    return <LoginPage campus={campus} />
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#130722] font-sans selection:bg-[#FFAE96] selection:text-[#130722]">
      {/* Sidebar Navigation matching image */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={userRole}
        onToggleRole={handleToggleRole}
        onLogout={handleLogout}
        activeQueueCount={tokens.filter((t) => t.status === 'In Queue').length}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-[#130722] text-white sticky top-0 z-30 border-b border-white/10 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="rounded-xl bg-white/10 p-2 text-white hover:bg-white/20 transition"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="grid place-items-center size-8 rounded-xl bg-[#FFAE96] text-[#130722] font-black">
              <Layers size={18} />
            </span>
            <span className="font-black text-base tracking-tight">CrowdFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleRole}
              className="px-2.5 py-1 rounded-xl bg-white/10 text-xs font-bold text-[#FFAE96] flex items-center gap-1"
            >
              {userRole === 'admin' ? <Shield size={12} /> : <GraduationCap size={12} />}
              <span>{userRole === 'admin' ? 'Admin' : 'Student'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-1 rounded-lg text-white/70 hover:text-rose-400"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Primary Page Routed Content */}
        <main className="mx-auto max-w-[1500px] w-full p-4 sm:p-6 lg:p-8 flex-1">
          <Routes>
            {/* Login Route */}
            <Route path="/login" element={<LoginPage campus={campus} />} />

            {/* Root Route Redirect based on Active Role */}
            <Route
              path="/"
              element={
                !isAuthenticated ? (
                  <Navigate to="/login" replace />
                ) : userRole === 'admin' ? (
                  <Navigate to="/admin/overview" replace />
                ) : (
                  <Navigate to="/student/explore" replace />
                )
              }
            />

            {/* ADMINISTRATOR PORTAL (3 Core Pages) */}
            <Route
              path="/admin/overview"
              element={
                !isAuthenticated ? (
                  <Navigate to="/login" replace />
                ) : (
                  <CampusOverviewPage campus={campus} />
                )
              }
            />
            <Route
              path="/admin/control"
              element={
                !isAuthenticated ? (
                  <Navigate to="/login" replace />
                ) : (
                  <CrowdQueueControlPage campus={campus} />
                )
              }
            />
            <Route
              path="/admin/decisions"
              element={
                !isAuthenticated ? (
                  <Navigate to="/login" replace />
                ) : (
                  <SmartDecisionsPage campus={campus} />
                )
              }
            />

            {/* STUDENT PORTAL (3 Core Pages) */}
            <Route
              path="/student/explore"
              element={
                !isAuthenticated ? (
                  <Navigate to="/login" replace />
                ) : (
                  <ExploreCampusPage campus={campus} />
                )
              }
            />
            <Route
              path="/student/queues"
              element={
                !isAuthenticated ? (
                  <Navigate to="/login" replace />
                ) : (
                  <MyQueuesPage campus={campus} />
                )
              }
            />
            <Route
              path="/student/account"
              element={
                !isAuthenticated ? (
                  <Navigate to="/login" replace />
                ) : (
                  <MyAccountPage campus={campus} />
                )
              }
            />

            {/* Legacy URL Backward Compatibility Aliases */}
            <Route path="/dashboard" element={<Navigate to="/admin/overview" replace />} />
            <Route path="/map" element={<Navigate to="/admin/overview" replace />} />
            <Route path="/monitoring" element={<Navigate to="/admin/control" replace />} />
            <Route path="/predictions" element={<Navigate to="/admin/overview" replace />} />
            <Route path="/counterfactual" element={<Navigate to="/admin/decisions" replace />} />
            <Route path="/orchestration" element={<Navigate to="/admin/decisions" replace />} />
            <Route path="/analytics" element={<Navigate to="/admin/overview" replace />} />
            <Route path="/alerts" element={<Navigate to="/admin/overview" replace />} />
            <Route path="/settings" element={<Navigate to="/student/account" replace />} />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-ink/5 py-4 px-6 text-center text-xs font-semibold text-ink/50">
          CrowdFlow &middot; VNR VJIET Campus Crowd Management &amp; Digital Twin Platform
        </footer>
      </div>
    </div>
  )
}
