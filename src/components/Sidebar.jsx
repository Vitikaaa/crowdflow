import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Radio, TrendingUp, BarChart3, Bell, Lightbulb, Settings, X, Waves } from 'lucide-react'
const nav = [['/', 'Dashboard', LayoutDashboard], ['/monitoring', 'Live Monitoring', Radio], ['/predictions', 'Predictions', TrendingUp], ['/analytics', 'Analytics', BarChart3], ['/alerts', 'Alerts', Bell], ['/recommendations', 'Orchestration', Lightbulb]]
const Item = ({ to, label, Icon, onClick }) => (
  <NavLink to={to} end={to === '/'} onClick={onClick} className={({ isActive }) =>
    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition duration-150 ${isActive ? 'bg-coral text-ink' : 'text-cream/80 hover:bg-white/10'}`}>
    <Icon size={18} aria-hidden /> {label}</NavLink>)
export default function Sidebar({ open, onClose }) {
  return (<>
    {open && <div className="fixed inset-0 z-30 bg-ink/40 lg:hidden" onClick={onClose} aria-hidden />}
    <aside className={`fixed z-40 inset-y-0 left-0 w-64 bg-ink p-5 flex flex-col transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`} aria-label="Main navigation">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-cream"><span className="grid place-items-center size-9 rounded-xl bg-coral text-ink"><Waves size={20} /></span><span className="font-extrabold text-lg">CrowdFlow</span></div>
        <button className="lg:hidden text-cream" onClick={onClose} aria-label="Close menu"><X /></button>
      </div>
      <nav className="flex flex-col gap-1 flex-1">{nav.map(([to, l, I]) => <Item key={to} to={to} label={l} Icon={I} onClick={onClose} />)}</nav>
      <Item to="/settings" label="Settings" Icon={Settings} onClick={onClose} />
      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white/10 p-3 text-cream"><span className="grid place-items-center size-9 rounded-full bg-peach text-ink font-bold">AD</span><div className="text-xs"><p className="font-semibold">Admin</p><p className="opacity-70">Campus Operations</p></div></div>
    </aside></>)
}
