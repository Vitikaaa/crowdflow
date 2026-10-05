export default function EmptyState({ title, text }) {
  return (<div className="card grid place-items-center text-center py-16"><h2 className="text-2xl font-extrabold">{title}</h2><p className="mt-2 max-w-md text-sm opacity-70">{text}</p></div>)
}
