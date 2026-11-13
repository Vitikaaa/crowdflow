import { useState } from 'react'
import {
  Ticket,
  Clock,
  QrCode,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  X,
  Utensils,
  ShoppingBag,
  BookOpen,
  ArrowRight
} from 'lucide-react'
import TopBar from '../../components/TopBar.jsx'
import { CAMPUS_NODES } from '../../engine/campusGraph.js'

export default function MyQueuesPage({ campus }) {
  const {
    tokens = [],
    tokenHistory = [],
    generateToken,
    cancelToken,
    facilitySettings = {},
    regionsMap = {}
  } = campus

  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedFacility, setSelectedFacility] = useState('annapurna')
  const [serviceType, setServiceType] = useState('Hot Lunch Counter')
  const [toastMsg, setToastMsg] = useState(null)
  const [cancelDialogToken, setCancelDialogToken] = useState(null)

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const handleCreateToken = () => {
    if (generateToken) {
      const newTok = generateToken(selectedFacility, serviceType)
      setShowGenerateModal(false)
      showToast(`Generated Token #${newTok.tokenCode} for ${newTok.facilityName}!`)
    }
  }

  const handleConfirmCancel = () => {
    if (cancelDialogToken) {
      cancelToken(cancelDialogToken.id)
      setCancelDialogToken(null)
      showToast(`Cancelled Token #${cancelDialogToken.tokenCode}`)
    }
  }

  // Facilities that accept tokens
  const queueFacilities = [
    {
      id: 'annapurna',
      name: 'Annapurna Canteen',
      services: ['Hot Lunch Counter', 'Fast Food & Snacks', 'Juice Bar'],
      icon: Utensils
    },
    {
      id: 'stationery-1',
      name: 'Stationery 1 (ABC Block)',
      services: ['Laser Print & Binding', 'Lab Record Sheets', 'General Stationery'],
      icon: ShoppingBag
    },
    {
      id: 'stationery-2',
      name: 'Stationery 2 (Behind A Block)',
      services: ['Express Printing', 'Spiral Binding', 'Record Notebooks'],
      icon: ShoppingBag
    },
    {
      id: 'library',
      name: 'Central Library',
      services: ['Circulation & Book Issue', 'Digital Resource ID', 'Reference Desk'],
      icon: BookOpen
    }
  ]

  return (
    <div className="space-y-6">
      <TopBar
        title="My Queues"
        subtitle="Manage your active digital queue tokens, QR passes, and service status"
        campus={campus}
      />

      {/* Floating Action Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-[#130722] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold border border-white/20 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={16} className="text-[#FFAE96]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ACTIVE QUEUE TOKENS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-ink">Active Queue Passes</h2>
            <p className="text-xs font-semibold text-ink/60">
              Show this QR pass when your number is called at the counter
            </p>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="btn bg-coral hover:bg-coral/90 text-ink text-xs font-extrabold py-2.5 px-4 shadow-xs"
          >
            <Plus size={16} />
            Get New Token
          </button>
        </div>

        {tokens.length === 0 ? (
          <div className="bg-white rounded-3xl border border-ink/10 p-12 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
            <div className="size-16 rounded-full bg-peach/30 text-coral mx-auto grid place-items-center">
              <Ticket size={28} />
            </div>
            <h3 className="font-black text-lg text-ink">No Active Queue Tokens</h3>
            <p className="text-xs font-semibold text-ink/60 max-w-sm mx-auto">
              You don&apos;t have any active digital queue passes right now. Click below to take a token for Annapurna Canteen or Stationery.
            </p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="btn bg-[#130722] text-white text-xs font-extrabold py-2 px-5 rounded-2xl"
            >
              Get a Token
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tokens.map((tok) => (
              <div
                key={tok.id}
                className="bg-white rounded-3xl border-2 border-coral/30 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                {/* Decorative Top Accent Stripe */}
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-coral via-peach to-indigo-500" />

                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-peach/40 text-coral font-black text-[10px] uppercase tracking-wider">
                      {tok.serviceType || 'Counter Service'}
                    </span>
                    <h3 className="font-black text-3xl text-ink tracking-tight mt-1">
                      #{tok.tokenCode}
                    </h3>
                    <p className="text-xs font-extrabold text-ink/80 mt-0.5">
                      {tok.facilityName}
                    </p>
                  </div>

                  {/* QR Code Visual Illustration */}
                  <div className="p-2.5 rounded-2xl bg-[#FAF7F2] border border-ink/10 grid place-items-center shrink-0">
                    <QrCode size={52} className="text-ink" />
                  </div>
                </div>

                {/* Queue Stats Bar */}
                <div className="grid grid-cols-3 gap-2 bg-[#FAF7F2] p-3.5 rounded-2xl text-xs font-bold text-ink">
                  <div>
                    <p className="text-[10px] text-ink/50 uppercase">People Ahead</p>
                    <p className="text-lg font-black text-ink">{tok.peopleAhead ?? 4}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-ink/50 uppercase">Est. Wait</p>
                    <p className="text-lg font-black text-coral">~{tok.estimatedWaitMin || 6} min</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-ink/50 uppercase">Status</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                      {tok.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-ink/10">
                  <span className="text-ink/60 font-semibold">
                    Issued: {tok.timestamp}
                  </span>
                  <button
                    onClick={() => setCancelDialogToken(tok)}
                    className="text-rose-600 hover:text-rose-700 font-extrabold flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Cancel Token
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FACILITY QUEUE STATUS DIRECTORY */}
      <div className="bg-white rounded-3xl border border-ink/10 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
        <div>
          <h3 className="font-black text-base text-ink mb-1">Campus Queue Availability</h3>
          <p className="text-xs font-semibold text-ink/60">
            Real-time operational queue status across all student service hubs
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {queueFacilities.map((fac) => {
            const reg = regionsMap[fac.id] || {}
            const cfg = facilitySettings[fac.id] || {}
            const isPaused = cfg.tokensPaused
            const isClosed = cfg.isOpen === false

            return (
              <div
                key={fac.id}
                className="p-4 rounded-2xl bg-[#FAF7F2] border border-ink/5 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <span className="p-2 rounded-xl bg-white shadow-2xs text-coral">
                    <fac.icon size={18} />
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isClosed
                        ? 'bg-rose-100 text-rose-800'
                        : isPaused
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isClosed ? 'Closed' : isPaused ? 'Paused' : 'Accepting Tokens'}
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-sm text-ink">{fac.name}</h4>
                  <p className="text-xs text-ink/60 font-semibold mt-1">
                    Queue: <strong className="text-ink">{reg.queue || 0} waiting</strong> (~{reg.estimatedWaitMin || 2}m)
                  </p>
                </div>

                <button
                  disabled={isClosed || isPaused}
                  onClick={() => {
                    setSelectedFacility(fac.id)
                    setServiceType(fac.services[0])
                    setShowGenerateModal(true)
                  }}
                  className={`w-full py-2 rounded-xl text-xs font-extrabold transition ${
                    isClosed || isPaused
                      ? 'bg-ink/10 text-ink/40 cursor-not-allowed'
                      : 'bg-white hover:bg-cream text-ink border border-ink/10 shadow-2xs'
                  }`}
                >
                  {isClosed ? 'Facility Closed' : isPaused ? 'Queue Paused' : 'Get Token'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* TOKEN HISTORY TABLE */}
      <div className="bg-white rounded-3xl border border-ink/10 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
        <h3 className="font-black text-base text-ink">Token History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="border-b border-ink/10 text-ink/50 uppercase font-bold text-[10px]">
                <th className="pb-2">Token #</th>
                <th className="pb-2">Facility</th>
                <th className="pb-2">Service</th>
                <th className="pb-2">Timestamp</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5 text-ink">
              {tokenHistory.map((h) => (
                <tr key={h.id} className="py-2.5">
                  <td className="py-2 font-black text-coral">#{h.tokenCode}</td>
                  <td className="py-2 font-bold">{h.facilityName}</td>
                  <td className="py-2 text-ink/70">{h.serviceType}</td>
                  <td className="py-2 text-ink/50">{h.timestamp}</td>
                  <td className="py-2 text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        h.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GENERATE TOKEN MODAL */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-ink/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-lg text-ink">Take Digital Queue Token</h4>
              <button onClick={() => setShowGenerateModal(false)} className="text-ink/40 hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-ink">Select Facility:</label>
                <select
                  value={selectedFacility}
                  onChange={(e) => {
                    setSelectedFacility(e.target.value)
                    const f = queueFacilities.find((x) => x.id === e.target.value)
                    if (f) setServiceType(f.services[0])
                  }}
                  className="w-full mt-1 p-2.5 rounded-2xl border border-ink/15 font-bold text-xs bg-[#FAF7F2]"
                >
                  {queueFacilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-ink">Select Service Counter:</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-2xl border border-ink/15 font-semibold text-xs bg-[#FAF7F2]"
                >
                  {(queueFacilities.find((x) => x.id === selectedFacility)?.services || []).map((srv) => (
                    <option key={srv} value={srv}>
                      {srv}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2 text-xs font-bold text-ink/70 hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateToken}
                className="btn bg-coral hover:bg-coral/90 text-ink text-xs font-extrabold py-2.5 px-5"
              >
                Generate Token Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL CONFIRMATION MODAL */}
      {cancelDialogToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-ink/10 space-y-4 text-center">
            <div className="size-12 rounded-full bg-rose-100 text-rose-700 mx-auto grid place-items-center">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className="font-black text-lg text-ink">Cancel Token #{cancelDialogToken.tokenCode}?</h4>
              <p className="text-xs text-ink/70 font-semibold mt-1">
                You will lose your queue position ({cancelDialogToken.queueNumber}) at {cancelDialogToken.facilityName}.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setCancelDialogToken(null)}
                className="flex-1 py-2.5 rounded-2xl bg-cream text-ink font-bold text-xs"
              >
                Keep Token
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 text-white font-black text-xs hover:bg-rose-700"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

