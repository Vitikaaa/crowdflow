import { NavLink } from 'react-router-dom'
import {
  Map,
  Sliders,
  Sparkles,
  Compass,
  Ticket,
  User,
  Shield,
  GraduationCap,
  ChevronRight,
  Building2,
  X,
  Layers,
  LogOut
} from 'lucide-react'

export default function Sidebar({
  open,
  onClose,
  userRole = 'admin',
  onToggleRole,
  onLogout,
  activeQueueCount = 0
}) {
  // Navigation sections based on active portal
  const adminNav = [
    { to: '/admin/overview', label: 'Campus Overview', Icon: Map },
    { to: '/admin/control', label: 'Crowd & Queue Control', Icon: Sliders },
    { to: '/admin/decisions', label: 'Smart Decisions', Icon: Sparkles }
  ]

  const studentNav = [
    { to: '/student/explore', label: 'Explore Campus', Icon: Compass },
    { to: '/student/queues', label: 'My Queues', Icon: Ticket, badge: activeQueueCount > 0 ? activeQueueCount : null },
    { to: '/student/account', label: 'My Account', Icon: User }
  ]

  const activeNav = userRole === 'admin' ? adminNav : studentNav

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed z-50 inset-y-0 left-0 w-64 bg-[#130722] p-5 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Brand matching image */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-[#FFAE96] text-[#130722] grid place-items-center shadow-sm font-black">
                <Layers size={20} />
              </div>
              <div>
                <h2 className="font-black text-lg text-white leading-tight tracking-tight">
                  CrowdFlow
                </h2>
                <p className="text-[11px] font-bold text-[#B6A8CE] tracking-wider uppercase">
                  VNR VJIET
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden text-[#B6A8CE] hover:text-white p-1"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Role Pill Switcher (Administrator > / Student Portal >) */}
          <button
            onClick={onToggleRole}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition group"
            title="Click to toggle between Admin and Student view"
          >
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-white/10 text-[#FFAE96]">
                {userRole === 'admin' ? <Shield size={14} /> : <GraduationCap size={14} />}
              </span>
              <span>{userRole === 'admin' ? 'Administrator' : 'Student Portal'}</span>
            </div>
            <ChevronRight size={14} className="text-[#B6A8CE] group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-1">
            {activeNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition duration-150 ${
                    isActive
                      ? 'bg-[#FFAE96] text-[#130722] shadow-sm font-extrabold'
                      : 'text-[#B6A8CE] hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <item.Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="size-5 rounded-full bg-[#FFAE96] text-[#130722] text-[10px] font-black grid place-items-center">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom System Status matching image */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-white/80 font-bold">
            <div className="flex items-center gap-2.5">
              <Building2 size={16} className="text-[#FFAE96]" />
              <span>VNR VJIET</span>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-[#B6A8CE] hover:text-rose-400 p-1 rounded-lg transition"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#B6A8CE] font-semibold">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>System Online</span>
          </div>
        </div>
      </aside>
    </>
  )
}
