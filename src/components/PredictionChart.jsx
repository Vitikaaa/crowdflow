import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from 'recharts'

export default function PredictionChart({ region, forecast }) {
  // Synthesize chart data combining historical series and forecast trajectory
  const chartData = []

  // If region has historical series
  if (region.series && region.series.length > 0) {
    region.series.forEach((pt) => {
      chartData.push({
        time: pt.time,
        actual: pt.actual,
        predicted: pt.predicted,
        lowerCi: pt.predicted ? Math.max(0, pt.predicted - 5) : null,
        upperCi: pt.predicted ? pt.predicted + 5 : null
      })
    })
  } else {
    // Generate from current and forecast trajectories
    const baseTime = '12:50'
    const cur = region.current || 40
    chartData.push({ time: '12:35', actual: Math.round(cur * 0.7), predicted: null })
    chartData.push({ time: '12:40', actual: Math.round(cur * 0.82), predicted: null })
    chartData.push({ time: '12:45', actual: Math.round(cur * 0.92), predicted: null })
    chartData.push({ time: baseTime, actual: cur, predicted: cur, lowerCi: cur, upperCi: cur })

    if (forecast && forecast.trajectories) {
      forecast.trajectories.forEach((traj) => {
        const minStr = `+${traj.minute}m`
        chartData.push({
          time: minStr,
          actual: null,
          predicted: traj.occupancy,
          lowerCi: traj.lowerCi,
          upperCi: traj.upperCi
        })
      })
    }
  }

  const capacity = region.capacity || 100
  const crit90 = Math.round(capacity * 0.9)
  const mod70 = Math.round(capacity * 0.7)

  return (
    <div className="h-64 sm:h-72 min-w-[380px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#190933" stopOpacity=".22" />
              <stop offset="100%" stopColor="#190933" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EE9E8E" stopOpacity=".35" />
              <stop offset="100%" stopColor="#EE9E8E" stopOpacity=".08" />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} stroke="#190933" strokeOpacity=".08" />
          <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#190933', fontWeight: 600 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#190933' }} domain={[0, Math.round(capacity * 1.15)]} />
          
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              border: '1px solid rgba(25,9,51,0.1)',
              backgroundColor: '#FFF5E0',
              boxShadow: '0 8px 30px -12px rgba(25,9,51,.25)',
              fontFamily: 'Poppins',
              fontSize: '12px'
            }}
          />

          <ReferenceLine
            y={crit90}
            stroke="#190933"
            strokeDasharray="4 4"
            label={{ value: `Critical 90% (${crit90})`, fontSize: 10, fill: '#190933', position: 'insideTopRight', fontWeight: 700 }}
          />

          <ReferenceLine
            y={mod70}
            stroke="#EE9E8E"
            strokeDasharray="3 3"
            strokeOpacity={0.8}
            label={{ value: `Threshold 70% (${mod70})`, fontSize: 10, fill: '#EE9E8E', position: 'insideTopRight', fontWeight: 700 }}
          />

          {/* Uncertainty Envelope (Upper CI area) */}
          <Area
            dataKey="upperCi"
            name="95% CI Upper"
            stroke="transparent"
            fill="url(#ciGrad)"
            connectNulls={true}
          />

          {/* Actual series area & line */}
          <Area
            dataKey="actual"
            name="Observed Occupancy"
            stroke="#190933"
            strokeWidth={3}
            fill="url(#actualGrad)"
            connectNulls={false}
          />

          {/* Predicted trajectory line */}
          <Line
            dataKey="predicted"
            name="Forecast Trajectory"
            stroke="#EE9E8E"
            strokeWidth={3}
            strokeDasharray="6 4"
            dot={{ r: 4.5, fill: '#EE9E8E', stroke: '#190933', strokeWidth: 1.5 }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
