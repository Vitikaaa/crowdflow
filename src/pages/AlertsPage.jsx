import { useState } from 'react'
import AlertCard from '../components/AlertCard.jsx'
export default function AlertsPage({ campus }) {
  const [gone, setGone] = useState([]); if (campus.loading) return <div className="skeleton h-64" />
  return (<div className="space-y-6"><h1 className="text-3xl sm:text-4xl font-black">Alerts</h1><div className="card space-y-3">
    {campus.alerts.filter((a) => !gone.includes(a.id)).map((a) => <AlertCard key={a.id} alert={a} onDismiss={(id) => setGone([...gone, id])} />)}</div></div>)
}
