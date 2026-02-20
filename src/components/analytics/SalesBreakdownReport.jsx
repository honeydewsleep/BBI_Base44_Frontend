import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Badge } from "@/components/ui/badge";
import { parseISO, isWithinInterval, format, eachMonthOfInterval } from "date-fns";

export default function SalesBreakdownReport({ transactions, products, customers, dateRange, channelFilter }) {
  const [drilldownProduct, setDrilldownProduct] = useState(null);
  const [drilldownCategory, setDrilldownCategory] = useState(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (t.type !== 'revenue') return false;
      if (channelFilter !== 'all' && t.channel !== channelFilter) return false;
      if (dateRange?.from && dateRange?.to) {
        const date = parseISO(t.date);
        return isWithinInterval(date, { start: dateRange.from, end: dateRange.to });
      }
      return true;
    });
  }, [transactions, dateRange, channelFilter]);

  // By Product
  const productBreakdown = useMemo(() => {
    const breakdown = {};
    filteredTransactions.forEach(t => {
      if (t.sku) {
        if (!breakdown[t.sku]) {
          const product = products.find(p => p.sku === t.sku);
          breakdown[t.sku] = {
            sku: t.sku,
            name: product?.name || t.sku,
            revenue: 0,
            quantity: 0,
            orders: 0,
            category: product?.category || 'Uncategorized'
          };
        }
        breakdown[t.sku].revenue += t.amount || 0;
        breakdown[t.sku].quantity += t.quantity || 0;
        breakdown[t.sku].orders += 1;
      }
    });
    return Object.values(breakdown).sort((a, b) => b.revenue - a.revenue);
  }, [filteredTransactions, products]);

  // By Category
  const categoryBreakdown = useMemo(() => {
    const breakdown = {};
    filteredTransactions.forEach(t => {
      if (t.sku) {
        const product = products.find(p => p.sku === t.sku);
        const category = product?.category || 'Uncategorized';
        if (!breakdown[category]) {
          breakdown[category] = { name: category, revenue: 0, quantity: 0, orders: 0 };
        }
        breakdown[category].revenue += t.amount || 0;
        breakdown[category].quantity += t.quantity || 0;
        breakdown[category].orders += 1;
      }
    });
    return Object.values(breakdown).sort((a, b) => b.revenue - a.revenue);
  }, [filteredTransactions, products]);

  // By Channel
  const channelBreakdown = useMemo(() => {
    const breakdown = { wholesale: 0, d2c: 0, other: 0 };
    filteredTransactions.forEach(t => {
      breakdown[t.channel || 'other'] += t.amount || 0;
    });
    return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  // Time series
  const timeSeries = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return [];
    const months = eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });
    return months.map((month, idx) => {
      const monthEnd = months[idx + 1] || dateRange.to;
      const monthTransactions = filteredTransactions.filter(t => {
        const date = parseISO(t.date);
        return date >= month && date < monthEnd;
      });
      return {
        month: format(month, 'MMM yyyy'),
        revenue: monthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0),
        orders: monthTransactions.length
      };
    });
  }, [filteredTransactions, dateRange]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="product">
        <TabsList>
          <TabsTrigger value="product">By Product</TabsTrigger>
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="channel">By Channel</TabsTrigger>
          <TabsTrigger value="time">Over Time</TabsTrigger>
        </TabsList>

        <TabsContent value="product" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Products by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productBreakdown.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip content={({ active, payload }) => {
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-semibold text-sm">{data.name}</p>
                          <p className="text-xs">Revenue: ${data.revenue.toLocaleString()}</p>
                          <p className="text-xs">Units: {data.quantity}</p>
                          <p className="text-xs">Orders: {data.orders}</p>
                          <p className="text-xs">Avg: ${(data.revenue / data.orders).toFixed(2)}/order</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Bar 
                    dataKey="revenue" 
                    fill="#3b82f6" 
                    radius={[8, 8, 0, 0]}
                    onClick={(data) => setDrilldownProduct(data)}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Products Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-3">Product</th>
                      <th className="text-right p-3">Revenue</th>
                      <th className="text-right p-3">Units Sold</th>
                      <th className="text-right p-3">Orders</th>
                      <th className="text-right p-3">Avg Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productBreakdown.map((item, idx) => (
                      <tr 
                        key={idx} 
                        className="border-b hover:bg-slate-50 cursor-pointer"
                        onClick={() => setDrilldownProduct(item)}
                      >
                        <td className="p-3">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-slate-500">{item.sku}</div>
                        </td>
                        <td className="text-right p-3 font-semibold">${item.revenue.toLocaleString()}</td>
                        <td className="text-right p-3">{item.quantity}</td>
                        <td className="text-right p-3">{item.orders}</td>
                        <td className="text-right p-3">${(item.revenue / item.orders).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="revenue"
                      onClick={(data) => setDrilldownCategory(data.name)}
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryBreakdown.map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                      onClick={() => setDrilldownCategory(item.name)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{item.name}</span>
                        <Badge style={{ backgroundColor: COLORS[idx % COLORS.length] }}>
                          ${item.revenue.toLocaleString()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <span>Units: {item.quantity}</span>
                        <span>Orders: {item.orders}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="channel">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Channel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={channelBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Orders Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Drill-down modals */}
      {drilldownProduct && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-blue-900">Product Detail: {drilldownProduct.name}</CardTitle>
                <p className="text-sm text-blue-700 mt-1">SKU: {drilldownProduct.sku}</p>
              </div>
              <button 
                className="text-blue-600 hover:text-blue-800"
                onClick={() => setDrilldownProduct(null)}
              >
                Close
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-blue-600">Total Revenue</p>
                <p className="text-lg font-bold text-blue-900">${drilldownProduct.revenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600">Units Sold</p>
                <p className="text-lg font-bold text-blue-900">{drilldownProduct.quantity}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600">Total Orders</p>
                <p className="text-lg font-bold text-blue-900">{drilldownProduct.orders}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600">Avg Order Value</p>
                <p className="text-lg font-bold text-blue-900">
                  ${(drilldownProduct.revenue / drilldownProduct.orders).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {drilldownCategory && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-purple-900">Category: {drilldownCategory}</CardTitle>
              <button 
                className="text-purple-600 hover:text-purple-800"
                onClick={() => setDrilldownCategory(null)}
              >
                Close
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-purple-700">Products in this category:</p>
              <div className="grid gap-2">
                {productBreakdown
                  .filter(p => p.category === drilldownCategory)
                  .map((p, idx) => (
                    <div key={idx} className="p-2 bg-white rounded border flex justify-between text-sm">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-purple-700">${p.revenue.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}