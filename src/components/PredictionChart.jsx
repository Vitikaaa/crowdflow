import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from 'recharts'
export default function PredictionChart({ region }) {
  return (<div className="h-64 sm:h-72 min-w-[420px]"><ResponsiveContainer width="100%" height="100%">
    <ComposedChart data={region.series} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#190933" stopOpacity=".25" /><stop offset="100%" stopColor="#190933" stopOpacity="0" /></linearGradient></defs>
      <CartesianGrid vertical={false} stroke="#190933" strokeOpacity=".08" />
      <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#190933' }} />
      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#190933' }} domain={[0, region.capacity]} />
      <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 8px 30px -12px rgba(25,9,51,.3)', fontFamily: 'Poppins' }} />
      <ReferenceLine y={region.capacity * 0.9} stroke="#EE9E8E" strokeDasharray="4 4" label={{ value: 'Critical 90%', fontSize: 11, fill: '#190933', position: 'insideTopRight' }} />
      <Area dataKey="actual" name="Actual" stroke="#190933" strokeWidth={3} fill="url(#g)" connectNulls={false} />
      <Line dataKey="predicted" name="Predicted" stroke="#EE9E8E" strokeWidth={3} strokeDasharray="6 5" dot={{ r: 4, fill: '#EE9E8E', strokeWidth: 0 }} />
    </ComposedChart></ResponsiveContainer></div>)
}
