import { useState } from 'react'
import {
  User,
  Bell,
  Globe,
  Bookmark,
  Shield,
  CheckCircle2,
  BookmarkCheck,
  CreditCard,
  QrCode,
  LogOut,
  Utensils,
  BookOpen,
  ShoppingBag,
  Trash2
} from 'lucide-react'
import TopBar from '../../components/TopBar.jsx'

export default function MyAccountPage({ campus }) {
  const { userRole, setUserRole, tokenHistory = [] } = campus

  const [notifications, setNotifications] = useState({
    queueCalls: true,
    canteenSurges: true,
    campusAdvisories: true,
    libraryQuiet: false
  })

  const [language, setLanguage] = useState('en')
  const [toast, setToast] = useState(null)

  const [savedFacilities, setSavedFacilities] = useState([
    { id: 'annapurna', name: 'Annapurna Canteen', type: 'Dining', icon: Utensils },
    { id: 'library', name: 'Central Library', type: 'Study', icon: BookOpen },
    { id: 'stationery-2', name: 'Stationery 2 (Behind A Block)', type: 'Service', icon: ShoppingBag }
  ])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleToggleNotif = (key) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      showToast(`Notification preferences updated.`)
      return next
    })
  }

  const handleRemoveSaved = (id) => {
    setSavedFacilities((prev) => prev.filter((f) => f.id !== id))
    showToast(`Removed from saved facilities.`)
  }

  return (
    <div className="space-y-6">
      <TopBar
        title="My Account"
        subtitle="Manage your student digital campus identity, notification preferences, and saved facilities"
        campus={campus}
      />

      {/* Floating Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-[#130722] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold border border-white/20">
          <CheckCircle2 size={16} className="text-[#FFAE96]" />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Profile & Digital Campus Pass (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Student Profile Card */}
          <div className="bg-white rounded-3xl border border-ink/10 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-3xl bg-peach/40 text-coral font-black text-2xl grid place-items-center border-2 border-coral/20">
                PV
              </div>
              <div>
                <h3 className="font-black text-xl text-ink">Praharshita VNR</h3>
                <p className="text-xs font-bold text-coral">Roll No: 21071A05XX</p>
                <p className="text-xs font-semibold text-ink/60">B.Tech Computer Science & Engineering</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-ink/5 space-y-2 text-xs font-semibold text-ink/75">
              <div className="flex items-center justify-between">
                <span>College:</span>
                <strong className="text-ink">VNR VJIET (Autonomous)</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Academic Year:</span>
                <strong className="text-ink">4th Year &middot; Section A</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Campus RFID ID:</span>
                <strong className="text-ink">#VNR-8849-2026</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Email:</span>
                <strong className="text-ink">praharshita@vnrvjiet.in</strong>
              </div>
            </div>

            {/* Switch Role Button */}
            <div className="pt-2">
              <button
                onClick={() => setUserRole('admin')}
                className="w-full btn bg-[#130722] hover:bg-ink/90 text-white font-extrabold text-xs py-2.5 justify-center rounded-2xl shadow-xs"
              >
                <Shield size={14} className="text-[#FFAE96]" />
                Switch to Administrator Portal
              </button>
            </div>
          </div>

          {/* Digital Campus Pass Preview */}
          <div className="bg-gradient-to-br from-[#130722] to-[#2E1256] text-white rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-[#FFAE96] tracking-wider">
                VNR VJIET Digital Smart Pass
              </span>
              <CreditCard size={18} className="text-[#FFAE96]" />
            </div>

            <div>
              <p className="text-lg font-black tracking-tight">Praharshita VNR</p>
              <p className="text-xs text-white/70 font-semibold font-mono">21071A05XX &middot; CSE</p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-white/80">
              <span>Valid: 2023 &ndash; 2027</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                Active RFID Verified
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Preferences, Language & Saved Facilities (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Notification Preferences */}
          <div className="bg-white rounded-3xl border border-ink/10 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-coral" />
              <h3 className="font-black text-base text-ink">Notification Preferences</h3>
            </div>

            <div className="space-y-3 text-xs font-bold text-ink">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2]">
                <div>
                  <p className="font-black">Queue Call SMS & Push Alerts</p>
                  <p className="text-[11px] text-ink/60 font-semibold mt-0.5">
                    Receive alert when only 2 people remain ahead in line
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.queueCalls}
                  onChange={() => handleToggleNotif('queueCalls')}
                  className="size-4 accent-coral rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2]">
                <div>
                  <p className="font-black">Annapurna Lunch Surge Warning</p>
                  <p className="text-[11px] text-ink/60 font-semibold mt-0.5">
                    Alert 15 mins before peak lunch rush (12:45 PM &ndash; 1:30 PM)
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.canteenSurges}
                  onChange={() => handleToggleNotif('canteenSurges')}
                  className="size-4 accent-coral rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2]">
                <div>
                  <p className="font-black">Campus Redirection & Smart Alternatives</p>
                  <p className="text-[11px] text-ink/60 font-semibold mt-0.5">
                    Suggest Stationery 2 when Stationery 1 queue exceeds 10
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.campusAdvisories}
                  onChange={() => handleToggleNotif('campusAdvisories')}
                  className="size-4 accent-coral rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Preferred Language */}
          <div className="bg-white rounded-3xl border border-ink/10 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-coral" />
              <h3 className="font-black text-base text-ink">Preferred Language</h3>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs font-extrabold">
              {[
                { id: 'en', label: 'English', sub: 'Default' },
                { id: 'te', label: 'తెలుగు', sub: 'Telugu' },
                { id: 'hi', label: 'हिन्दी', sub: 'Hindi' }
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setLanguage(lang.id)
                    showToast(`Language set to ${lang.label}`)
                  }}
                  className={`p-3 rounded-2xl border text-center transition ${
                    language === lang.id
                      ? 'border-coral bg-peach/30 text-ink shadow-2xs'
                      : 'border-ink/10 bg-[#FAF7F2] text-ink/70 hover:bg-cream'
                  }`}
                >
                  <p className="font-black text-sm">{lang.label}</p>
                  <p className="text-[10px] text-ink/50 mt-0.5">{lang.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Saved Favorite Facilities */}
          <div className="bg-white rounded-3xl border border-ink/10 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex items-center gap-2">
              <Bookmark size={18} className="text-coral" />
              <h3 className="font-black text-base text-ink">Saved Favorite Facilities</h3>
            </div>

            <div className="divide-y divide-ink/5">
              {savedFacilities.map((fac) => (
                <div key={fac.id} className="py-2.5 flex items-center justify-between text-xs font-bold text-ink">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-[#FAF7F2] text-coral">
                      <fac.icon size={16} />
                    </span>
                    <div>
                      <p className="font-black">{fac.name}</p>
                      <p className="text-[11px] text-ink/50 font-semibold">{fac.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveSaved(fac.id)}
                    className="p-1.5 rounded-lg text-ink/30 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

