import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Radio,
  TrendingUp,
  FlaskConical,
  Compass,
  BarChart3,
  Bell,
  Settings,
  X,
  Waves
} from 'lucide-react'

const nav = [
  ['/', 'Dashboard', LayoutDashboard],
  ['/monitoring', 'Live Monitoring', Radio],
  ['/predictions', 'Predictions', TrendingUp],
  ['/counterfactual', 'Counterfactual Lab', FlaskConical],
  ['/orchestration', 'Orchestration', Compass],
  ['/analytics', 'Analytics', BarChart3],
  ['/alerts', 'Alerts', Bell]
]

const Item = ({ to, label, Icon, onClick, badge }) => (
  <NavLink
    to={to}
    end={to === '/'}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition duration-150 ${
        isActive ? 'bg-coral text-ink shadow-sm' : 'text-cream/80 hover:bg-white/10'
      }`
    }
  >
    <div className="flex items-center gap-3">
      <Icon size={18} aria-hidden />
      <span>{label}</span>
    </div>
    {badge && (
      <span className="rounded-full bg-peach/30 px-2 py-0.5 text-[10px] font-bold text-coral">
        {badge}
      </span>
    )}
  </NavLink>
)

export default function Sidebar({ open, onClose, alertCount = 0 }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-ink p-5 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        <div>
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-2.5 text-cream">
              <span className="grid place-items-center size-9 rounded-xl bg-coral text-ink shadow-sm">
                <Waves size={20} />
              </span>
              <div>
                <span className="font-extrabold text-lg tracking-tight block leading-tight">CrowdFlow</span>
                <span className="text-[10px] uppercase tracking-widest text-peach/70 font-semibold">Digital Twin</span>
              </div>
            </div>
            <button className="lg:hidden text-cream" onClick={onClose} aria-label="Close menu">
              <X />
            </button>
          </div>

          <nav className="flex flex-col gap-1.5">
            {nav.map(([to, l, I]) => (
              <Item
                key={to}
                to={to}
                label={l}
                Icon={I}
                onClick={onClose}
                badge={to === '/alerts' && alertCount > 0 ? alertCount : to === '/counterfactual' ? 'AI' : null}
              />
            ))}
          </nav>
        </div>

        <div>
          <Item to="/settings" label="Settings" Icon={Settings} onClick={onClose} />
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/10 p-3 text-cream border border-white/5">
            <span className="grid place-items-center size-9 rounded-full bg-peach text-ink font-bold text-xs shrink-0">
              OR
            </span>
            <div className="text-xs min-w-0">
              <p className="font-semibold truncate">Campus Operations</p>
              <p className="opacity-70 text-[11px] truncate">Control Room · Mode: Live Twin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
