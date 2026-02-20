import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-xl">
        <p className="text-sm font-medium text-slate-600 mb-2">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-violet-500" />
          <span className="text-sm text-slate-500">New Customers:</span>
          <span className="text-sm font-semibold text-slate-900">{payload[0]?.value}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function CustomerGrowthChart({ data }) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-900">Customer Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="customers" 
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`rgba(139, 92, 246, ${0.4 + (index / data.length) * 0.6})`} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}