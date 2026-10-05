import RecommendationCard from '../components/RecommendationCard.jsx'
export default function RecommendationsPage({ campus }) {
  if (campus.loading) return <div className="skeleton h-64" />
  const { cf, regions } = campus
  return (<div className="space-y-6"><h1 className="text-3xl sm:text-4xl font-black">Orchestration</h1><div className="max-w-2xl"><RecommendationCard cf={cf} region={regions.find((r) => r.id === cf.regionId)} /></div></div>)
}
