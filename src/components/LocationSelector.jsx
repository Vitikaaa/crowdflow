export default function LocationSelector({ regions, value, onChange }) {
  return (<div role="tablist" aria-label="Location" className="flex gap-2 overflow-x-auto pb-1">
    {regions.map((r) => (<button key={r.id} role="tab" aria-selected={value === r.id} onClick={() => onChange(r.id)}
      className={`btn whitespace-nowrap ${value === r.id ? 'bg-ink text-cream' : 'bg-white/70 text-ink hover:bg-peach'}`}>{r.name}</button>))}</div>)
}
