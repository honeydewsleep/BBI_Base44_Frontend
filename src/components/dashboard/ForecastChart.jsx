import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const isForecast = payload[0]?.payload?.isForecast;
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm font-medium text-slate-600">{label}</p>
          {isForecast && (
            <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50">
              <Sparkles className="h-3 w-3 mr-1" />
              Forecast
            </Badge>
          )}
        </div>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-slate-500 capitalize">{entry.name}:</span>
            <span className="text-sm font-semibold text-slate-900">
              ${entry.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ForecastChart({ historicalData, forecastData, insights, isLoading }) {
  const combinedData = [...historicalData, ...forecastData];
  const currentDate = historicalData.length > 0 ? historicalData[historicalData.length - 1].date : '';

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              Revenue Forecast
              <Sparkles className="h-5 w-5 text-amber-500" />
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">Historical data with AI-powered predictions</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Sparkles className="h-8 w-8 text-amber-500 animate-pulse mx-auto" />
              <p className="text-sm text-slate-500">Generating forecast...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                    tickFormatter={(value) => `$${value >= 1000 ? `${value/1000}k` : value}`}
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine 
                    x={currentDate} 
                    stroke="#94a3b8" 
                    strokeDasharray="3 3" 
                    label={{ value: 'Today', position: 'top', fill: '#64748b', fontSize: 12 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)" 
                    name="revenue"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke="#f59e0b" 
                    strokeWidth={2.5}
                    strokeDasharray="5 5"
                    fill="url(#forecastGradient)" 
                    name="forecast"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {insights && (
              <div className="mt-6 space-y-3 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 text-amber-900 font-medium">
                  <TrendingUp className="h-4 w-4" />
                  <span>AI Insights</span>
                </div>
                {insights.nextQuarter && (
                  <div className="text-sm">
                    <span className="text-slate-600">Next Quarter Forecast: </span>
                    <span className="font-semibold text-slate-900">${insights.nextQuarter.toLocaleString()}</span>
                    {insights.quarterGrowth && (
                      <span className={`ml-2 text-xs ${insights.quarterGrowth > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        ({insights.quarterGrowth > 0 ? '+' : ''}{insights.quarterGrowth}%)
                      </span>
                    )}
                  </div>
                )}
                {insights.nextYear && (
                  <div className="text-sm">
                    <span className="text-slate-600">Next Year Forecast: </span>
                    <span className="font-semibold text-slate-900">${insights.nextYear.toLocaleString()}</span>
                    {insights.yearGrowth && (
                      <span className={`ml-2 text-xs ${insights.yearGrowth > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        ({insights.yearGrowth > 0 ? '+' : ''}{insights.yearGrowth}%)
                      </span>
                    )}
                  </div>
                )}
                {insights.notes && (
                  <div className="text-sm text-slate-700 pt-2 border-t border-amber-200">
                    {insights.notes}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}