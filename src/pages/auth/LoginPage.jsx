import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layers,
  Shield,
  GraduationCap,
  ArrowRight,
  Lock,
  Mail,
  User,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Building2,
  Zap
} from 'lucide-react'

export default function LoginPage({ campus }) {
  const navigate = useNavigate()
  const { login } = campus

  const [activeRole, setActiveRole] = useState('admin') // 'admin' | 'student'

  // Admin form state
  const [adminEmail, setAdminEmail] = useState('admin@vnrvjiet.in')
  const [adminPassword, setAdminPassword] = useState('••••••••••••')

  // Student form state
  const [studentRoll, setStudentRoll] = useState('21071A05XX')
  const [studentPassword, setStudentPassword] = useState('••••••••••••')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  const handleAdminSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      login('admin', {
        name: 'Admin (Lalit)',
        email: adminEmail
      })
      navigate('/admin/overview')
    }, 400)
  }

  const handleStudentSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      login('student', {
        name: 'Praharshita VNR',
        email: 'praharshita@vnrvjiet.in',
        rollNumber: studentRoll
      })
      navigate('/student/explore')
    }, 400)
  }

  const handleQuickDemoAdmin = () => {
    setLoading(true)
    setTimeout(() => {
      login('admin', {
        name: 'Admin (Lalit)',
        email: 'admin@vnrvjiet.in'
      })
      navigate('/admin/overview')
    }, 250)
  }

  const handleQuickDemoStudent = () => {
    setLoading(true)
    setTimeout(() => {
      login('student', {
        name: 'Praharshita VNR',
        email: 'praharshita@vnrvjiet.in',
        rollNumber: '21071A05XX'
      })
      navigate('/student/explore')
    }, 250)
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#130722] flex flex-col justify-between selection:bg-[#FFAE96] selection:text-[#130722]">
      {/* Top Simple Brand Bar */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-ink/5">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-2xl bg-[#FFAE96] text-[#130722] grid place-items-center font-black shadow-xs">
            <Layers size={19} />
          </div>
          <div>
            <h1 className="font-black text-lg text-ink leading-tight">CrowdFlow</h1>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/50">VNR VJIET Digital Twin</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-ink/70">
          <Building2 size={15} className="text-coral" />
          <span>Bachupally, Hyderabad</span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="max-w-md w-full bg-white rounded-3xl border border-ink/10 shadow-[0_8px_30px_rgba(19,7,34,0.06)] p-6 sm:p-8 space-y-6">
          {/* Welcome Title */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-peach/40 text-coral text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles size={13} />
              VNR VJIET Campus Portal
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              Sign In to CrowdFlow
            </h2>
            <p className="text-xs font-semibold text-ink/60">
              Select your institutional portal role below to continue
            </p>
          </div>

          {/* Role Tabs: Administrator | Student */}
          <div className="flex items-center bg-[#FAF7F2] p-1.5 rounded-2xl border border-ink/5">
            <button
              type="button"
              onClick={() => setActiveRole('admin')}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 ${
                activeRole === 'admin'
                  ? 'bg-[#130722] text-white shadow-xs'
                  : 'text-ink/70 hover:text-ink'
              }`}
            >
              <Shield size={14} className={activeRole === 'admin' ? 'text-[#FFAE96]' : ''} />
              <span>Administrator</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRole('student')}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 ${
                activeRole === 'student'
                  ? 'bg-coral text-ink shadow-xs'
                  : 'text-ink/70 hover:text-ink'
              }`}
            >
              <GraduationCap size={15} />
              <span>Student Portal</span>
            </button>
          </div>

          {/* ADMINISTRATOR LOGIN FORM */}
          {activeRole === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-ink block mb-1">Institutional Email:</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@vnrvjiet.in"
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-ink/15 font-semibold text-xs text-ink bg-[#FAF7F2] focus:outline-coral"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Password:</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-ink/15 font-semibold text-xs text-ink bg-[#FAF7F2] focus:outline-coral"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-ink/65 font-semibold pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="size-3.5 accent-coral rounded" />
                  <span>Remember Session</span>
                </label>
                <span className="text-coral hover:underline cursor-pointer">Reset Password?</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn bg-[#130722] hover:bg-ink/90 text-white font-extrabold text-xs py-3 justify-center rounded-2xl shadow-sm transition"
              >
                <span>Sign In to Admin Console</span>
                <ArrowRight size={15} />
              </button>

              {/* Instant 1-Click Demo Button */}
              <button
                type="button"
                onClick={handleQuickDemoAdmin}
                disabled={loading}
                className="w-full py-2.5 rounded-2xl bg-peach/30 hover:bg-peach/50 text-ink font-black text-xs flex items-center justify-center gap-2 transition border border-coral/30"
              >
                <Zap size={15} className="text-coral" />
                <span>1-Click Instant Demo Login (Admin)</span>
              </button>
            </form>
          )}

          {/* STUDENT LOGIN FORM */}
          {activeRole === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-ink block mb-1">Student Roll Number / Email:</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
                    <input
                      type="text"
                      required
                      value={studentRoll}
                      onChange={(e) => setStudentRoll(e.target.value)}
                      placeholder="21071A05XX or email"
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-ink/15 font-semibold text-xs text-ink bg-[#FAF7F2] focus:outline-coral"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Campus Password / PIN:</label>
                  <div className="relative">
                    <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
                    <input
                      type="password"
                      required
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-ink/15 font-semibold text-xs text-ink bg-[#FAF7F2] focus:outline-coral"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-ink/65 font-semibold pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="size-3.5 accent-coral rounded" />
                  <span>Remember Roll Number</span>
                </label>
                <span className="text-coral hover:underline cursor-pointer">Need Help?</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn bg-coral hover:bg-coral/90 text-ink font-black text-xs py-3 justify-center rounded-2xl shadow-xs transition"
              >
                <span>Sign In to Student Portal</span>
                <ArrowRight size={15} />
              </button>

              {/* Instant 1-Click Demo Button */}
              <button
                type="button"
                onClick={handleQuickDemoStudent}
                disabled={loading}
                className="w-full py-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-cream text-ink font-black text-xs flex items-center justify-center gap-2 transition border border-ink/10"
              >
                <Zap size={15} className="text-coral" />
                <span>1-Click Instant Demo Login (Praharshita)</span>
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs font-semibold text-ink/50 border-t border-ink/5">
        CrowdFlow &middot; Vallurupalli Nageswara Rao Vignana Jyothi Institute of Engineering &amp; Technology
      </footer>
    </div>
  )
}

