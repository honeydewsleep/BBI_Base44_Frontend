import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { parseISO, isWithinInterval } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function ChannelComparison({ transactions, dateRange }) {
  const comparison = useMemo(() => {
    const filtered = transactions.filter(t => {
      if (!dateRange?.from || !dateRange?.to) return true;
      const date = parseISO(t.date);
      return isWithinInterval(date, { start: dateRange.from, end: dateRange.to });
    });

    const wholesale = {
      revenue: filtered.filter(t => t.type === 'revenue' && t.channel === 'wholesale').reduce((sum, t) => sum + (t.amount || 0), 0),
      transactions: filtered.filter(t => t.type === 'revenue' && t.channel === 'wholesale').length,
      avgOrder: 0,
      shipping: filtered.filter(t => t.type === 'revenue' && t.channel === 'wholesale').reduce((sum, t) => sum + (t.shipping_cost || 0), 0)
    };
    wholesale.avgOrder = wholesale.transactions > 0 ? wholesale.revenue / wholesale.transactions : 0;

    const d2c = {
      revenue: filtered.filter(t => t.type === 'revenue' && t.channel === 'd2c').reduce((sum, t) => sum + (t.amount || 0), 0),
      transactions: filtered.filter(t => t.type === 'revenue' && t.channel === 'd2c').length,
      avgOrder: 0,
      shipping: filtered.filter(t => t.type === 'revenue' && t.channel === 'd2c').reduce((sum, t) => sum + (t.shipping_cost || 0), 0)
    };
    d2c.avgOrder = d2c.transactions > 0 ? d2c.revenue / d2c.transactions : 0;

    const totalRevenue = wholesale.revenue + d2c.revenue;
    wholesale.percentage = totalRevenue > 0 ? (wholesale.revenue / totalRevenue) * 100 : 0;
    d2c.percentage = totalRevenue > 0 ? (d2c.revenue / totalRevenue) * 100 : 0;

    // Calculate margins (simplified - would need COGS by channel for accuracy)
    const expenses = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
    const expenseRatio = totalRevenue > 0 ? expenses / totalRevenue : 0;
    
    wholesale.margin = wholesale.revenue > 0 ? ((wholesale.revenue - (wholesale.revenue * expenseRatio * (wholesale.revenue/totalRevenue))) / wholesale.revenue) * 100 : 0;
    d2c.margin = d2c.revenue > 0 ? ((d2c.revenue - (d2c.revenue * expenseRatio * (d2c.revenue/totalRevenue))) / d2c.revenue) * 100 : 0;

    return { wholesale, d2c, totalRevenue };
  }, [transactions, dateRange]);

  const chartData = [
    {
      metric: 'Revenue',
      Wholesale: comparison.wholesale.revenue,
      D2C: comparison.d2c.revenue
    },
    {
      metric: 'Avg Order',
      Wholesale: comparison.wholesale.avgOrder,
      D2C: comparison.d2c.avgOrder
    },
    {
      metric: 'Shipping',
      Wholesale: comparison.wholesale.shipping,
      D2C: comparison.d2c.shipping
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wholesale Card */}
        <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-indigo-900">Wholesale (B2B)</CardTitle>
              <Badge className="bg-indigo-600">{comparison.wholesale.percentage.toFixed(1)}%</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-indigo-900">
                ${comparison.wholesale.revenue.toLocaleString()}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Orders</p>
                <p className="text-xl font-semibold text-slate-900">{comparison.wholesale.transactions}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Avg Order</p>
                <p className="text-xl font-semibold text-slate-900">
                  ${comparison.wholesale.avgOrder.toFixed(0)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Shipping</p>
                <p className="text-lg font-medium text-slate-900">
                  ${comparison.wholesale.shipping.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Est. Margin</p>
                <p className="text-lg font-medium text-emerald-600">
                  {comparison.wholesale.margin.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* D2C Card */}
        <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-violet-900">Direct to Consumer</CardTitle>
              <Badge className="bg-violet-600">{comparison.d2c.percentage.toFixed(1)}%</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-violet-900">
                ${comparison.d2c.revenue.toLocaleString()}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Orders</p>
                <p className="text-xl font-semibold text-slate-900">{comparison.d2c.transactions}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Avg Order</p>
                <p className="text-xl font-semibold text-slate-900">
                  ${comparison.d2c.avgOrder.toFixed(0)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Shipping</p>
                <p className="text-lg font-medium text-slate-900">
                  ${comparison.d2c.shipping.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Est. Margin</p>
                <p className="text-lg font-medium text-emerald-600">
                  {comparison.d2c.margin.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Channel Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="metric" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `$${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
                />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="Wholesale" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="D2C" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {comparison.wholesale.revenue > comparison.d2c.revenue ? (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-sm text-indigo-900">
                  <strong>Wholesale dominates:</strong> Your wholesale channel generates {comparison.wholesale.percentage.toFixed(0)}% of revenue with an average order value of ${comparison.wholesale.avgOrder.toFixed(0)}.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
                <p className="text-sm text-violet-900">
                  <strong>D2C leads:</strong> Your direct-to-consumer channel generates {comparison.d2c.percentage.toFixed(0)}% of revenue with {comparison.d2c.transactions} orders.
                </p>
              </div>
            )}
            
            {comparison.wholesale.avgOrder > comparison.d2c.avgOrder * 2 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900">
                  <strong>Order size variance:</strong> Wholesale orders are {(comparison.wholesale.avgOrder / comparison.d2c.avgOrder).toFixed(1)}x larger than D2C orders on average.
                </p>
              </div>
            )}

            {comparison.d2c.shipping > comparison.wholesale.shipping && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
                <p className="text-sm text-rose-900">
                  <strong>Shipping costs:</strong> D2C shipping costs (${comparison.d2c.shipping.toLocaleString()}) are higher than wholesale. Consider optimizing fulfillment.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}