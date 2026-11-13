import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Clock,
  User,
  ChevronDown,
  Shield,
  GraduationCap,
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  LogOut
} from 'lucide-react'

export default function TopBar({
  title,
  subtitle,
  campus
}) {
  const navigate = useNavigate()
  const {
    userRole = 'admin',
    setUserRole,
    logout,
    simulationClock = '12:55 PM',
    alerts = [],
    dismissAlert
  } = campus

  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = () => {
    if (logout) logout()
    setShowUserMenu(false)
    navigate('/login')
  }

  return (
    <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 pt-2">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm font-semibold text-ink/70 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Controls Matching Image */}
      <div className="flex items-center gap-3">
        {/* Live Campus Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-bold text-emerald-800 shadow-2xs">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Campus</span>
        </div>

        {/* Updated Time Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border border-ink/10 text-xs font-bold text-ink shadow-2xs">
          <Clock size={14} className="text-ink/60" />
          <span>Updated: {simulationClock}</span>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative size-9 rounded-2xl bg-white border border-ink/10 grid place-items-center text-ink/80 hover:text-ink hover:bg-cream transition shadow-2xs"
            aria-label="Notifications"
          >
            <Bell size={16} />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 size-4 rounded-full bg-rose-500 text-white font-extrabold text-[10px] grid place-items-center shadow-xs">
                {alerts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-ink/10 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-ink/10">
                <span className="font-black text-xs uppercase text-ink">
                  Active Alerts ({alerts.length})
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-ink/40 hover:text-ink"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="divide-y divide-ink/5 max-h-64 overflow-y-auto mt-1">
                {alerts.length === 0 ? (
                  <p className="text-xs text-ink/60 py-4 text-center">No active alerts</p>
                ) : (
                  alerts.map((alt) => (
                    <div key={alt.id} className="py-2.5 text-xs">
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-bold text-ink leading-tight">{alt.title}</p>
                        <span className="text-[10px] text-ink/50 whitespace-nowrap">{alt.time}</span>
                      </div>
                      <p className="text-[11px] text-ink/70 mt-0.5">{alt.detail}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile / Portal Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-ink/10 text-xs font-bold text-ink hover:bg-cream transition shadow-2xs"
          >
            <span className="size-6 rounded-full bg-peach/40 text-coral grid place-items-center">
              {userRole === 'admin' ? <Shield size={13} /> : <GraduationCap size={13} />}
            </span>
            <span>{userRole === 'admin' ? 'Admin' : 'Praharshita'}</span>
            <ChevronDown size={14} className="text-ink/40" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-ink/10 p-2 z-50 text-xs font-bold animate-in fade-in zoom-in-95 duration-150">
              <p className="px-3 py-1.5 text-[10px] uppercase text-ink/50 tracking-wider">
                Switch Portal Role
              </p>
              <button
                onClick={() => {
                  if (setUserRole) setUserRole('admin')
                  setShowUserMenu(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                  userRole === 'admin' ? 'bg-ink text-white' : 'text-ink/80 hover:bg-cream'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield size={14} />
                  <span>Administrator Portal</span>
                </div>
                {userRole === 'admin' && <CheckCircle2 size={13} />}
              </button>

              <button
                onClick={() => {
                  if (setUserRole) setUserRole('student')
                  setShowUserMenu(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition mt-1 ${
                  userRole === 'student' ? 'bg-coral text-ink' : 'text-ink/80 hover:bg-cream'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap size={14} />
                  <span>Student Portal</span>
                </div>
                {userRole === 'student' && <CheckCircle2 size={13} />}
              </button>

              <div className="pt-1 mt-1 border-t border-ink/10">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition text-xs font-bold"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

