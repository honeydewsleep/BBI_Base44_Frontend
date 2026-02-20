import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Package, TrendingUp, Search, ArrowUpDown } from "lucide-react";
import { parseISO, isWithinInterval } from "date-fns";

export default function InventoryTurnoverReport({ transactions, products, inventoryMovements, dateRange, channelFilter }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("turnover");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const turnoverData = useMemo(() => {
    const data = products
      .filter(p => p.is_active !== false && p.current_stock !== undefined)
      .map(product => {
        // Filter transactions in date range
        const productSales = transactions.filter(t => {
          if (t.sku !== product.sku || t.type !== 'revenue') return false;
          if (channelFilter !== 'all' && t.channel !== channelFilter) return false;
          if (dateRange?.from && dateRange?.to) {
            const date = parseISO(t.date);
            return isWithinInterval(date, { start: dateRange.from, end: dateRange.to });
          }
          return true;
        });

        const totalSold = productSales.reduce((sum, t) => sum + (t.quantity || 0), 0);
        const totalRevenue = productSales.reduce((sum, t) => sum + (t.amount || 0), 0);
        const avgStock = (product.current_stock + totalSold) / 2 || 1;
        const turnoverRatio = avgStock > 0 ? totalSold / avgStock : 0;
        const daysInPeriod = dateRange?.from && dateRange?.to 
          ? Math.ceil((dateRange.to - dateRange.from) / (1000 * 60 * 60 * 24))
          : 90;
        const annualizedTurnover = turnoverRatio * (365 / daysInPeriod);

        return {
          product,
          totalSold,
          totalRevenue,
          currentStock: product.current_stock,
          avgStock: Math.round(avgStock),
          turnoverRatio: parseFloat(turnoverRatio.toFixed(2)),
          annualizedTurnover: parseFloat(annualizedTurnover.toFixed(2)),
          daysToSell: avgStock > 0 && totalSold > 0 ? Math.round((avgStock / totalSold) * daysInPeriod) : 0,
          stockValue: product.current_stock * (product.cost || 0)
        };
      });

    return data.filter(d => 
      d.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, transactions, dateRange, channelFilter, searchTerm]);

  const sortedData = useMemo(() => {
    const sorted = [...turnoverData];
    switch (sortBy) {
      case 'turnover':
        return sorted.sort((a, b) => b.turnoverRatio - a.turnoverRatio);
      case 'revenue':
        return sorted.sort((a, b) => b.totalRevenue - a.totalRevenue);
      case 'stock':
        return sorted.sort((a, b) => b.currentStock - a.currentStock);
      case 'days':
        return sorted.sort((a, b) => b.daysToSell - a.daysToSell);
      default:
        return sorted;
    }
  }, [turnoverData, sortBy]);

  const chartData = sortedData.slice(0, 10).map(d => ({
    name: d.product.name.length > 20 ? d.product.name.substring(0, 20) + '...' : d.product.name,
    turnover: d.annualizedTurnover,
    product: d
  }));

  const getTurnoverColor = (turnover) => {
    if (turnover > 12) return '#10b981'; // High turnover - good
    if (turnover > 6) return '#f59e0b'; // Medium
    return '#ef4444'; // Low turnover - slow moving
  };

  const summary = useMemo(() => {
    const avgTurnover = turnoverData.length > 0
      ? turnoverData.reduce((sum, d) => sum + d.annualizedTurnover, 0) / turnoverData.length
      : 0;
    const totalStockValue = turnoverData.reduce((sum, d) => sum + d.stockValue, 0);
    const slowMoving = turnoverData.filter(d => d.annualizedTurnover < 4).length;
    const fastMoving = turnoverData.filter(d => d.annualizedTurnover > 12).length;

    return { avgTurnover, totalStockValue, slowMoving, fastMoving };
  }, [turnoverData]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900">
              {summary.avgTurnover.toFixed(1)}x
            </div>
            <p className="text-xs text-slate-500 mt-1">Avg Turnover Ratio</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900">
              ${summary.totalStockValue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Total Stock Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{summary.fastMoving}</div>
            <p className="text-xs text-slate-500 mt-1">Fast Moving (&gt;12x/yr)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{summary.slowMoving}</div>
            <p className="text-xs text-slate-500 mt-1">Slow Moving (&lt;4x/yr)</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Products by Turnover (Annualized)</CardTitle>
          <CardDescription>Click a bar to see detailed breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis label={{ value: 'Turnover Ratio', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload.product;
                  return (
                    <div className="bg-white p-3 border rounded shadow-lg">
                      <p className="font-semibold text-sm">{data.product.name}</p>
                      <p className="text-xs text-slate-600">SKU: {data.product.sku}</p>
                      <p className="text-xs mt-2">Annual Turnover: <strong>{data.annualizedTurnover}x</strong></p>
                      <p className="text-xs">Total Sold: {data.totalSold}</p>
                      <p className="text-xs">Revenue: ${data.totalRevenue.toLocaleString()}</p>
                    </div>
                  );
                }
                return null;
              }} />
              <Bar dataKey="turnover" radius={[8, 8, 0, 0]} onClick={(data) => setSelectedProduct(data.product)}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getTurnoverColor(entry.turnover)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detailed Turnover Analysis</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Button variant="outline" size="sm" onClick={() => {
                const options = ['turnover', 'revenue', 'stock', 'days'];
                const current = options.indexOf(sortBy);
                setSortBy(options[(current + 1) % options.length]);
              }}>
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-3 font-semibold">Product</th>
                  <th className="text-right p-3 font-semibold">Current Stock</th>
                  <th className="text-right p-3 font-semibold">Sold</th>
                  <th className="text-right p-3 font-semibold">Revenue</th>
                  <th className="text-right p-3 font-semibold">Turnover</th>
                  <th className="text-right p-3 font-semibold">Days to Sell</th>
                  <th className="text-right p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.slice(0, 50).map((item, idx) => (
                  <tr 
                    key={idx} 
                    className="border-b hover:bg-slate-50 cursor-pointer"
                    onClick={() => setSelectedProduct(item)}
                  >
                    <td className="p-3">
                      <div className="font-medium text-slate-900">{item.product.name}</div>
                      <div className="text-xs text-slate-500">{item.product.sku}</div>
                    </td>
                    <td className="text-right p-3">{item.currentStock}</td>
                    <td className="text-right p-3">{item.totalSold}</td>
                    <td className="text-right p-3">${item.totalRevenue.toLocaleString()}</td>
                    <td className="text-right p-3 font-semibold">{item.annualizedTurnover}x</td>
                    <td className="text-right p-3">{item.daysToSell} days</td>
                    <td className="text-right p-3">
                      {item.annualizedTurnover > 12 ? (
                        <Badge className="bg-green-100 text-green-800">Fast</Badge>
                      ) : item.annualizedTurnover > 6 ? (
                        <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Slow</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Drill-down Modal */}
      {selectedProduct && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-900">Product Detail: {selectedProduct.product.name}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)}>Close</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-blue-600 font-medium">SKU</p>
                <p className="text-blue-900">{selectedProduct.product.sku}</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Category</p>
                <p className="text-blue-900">{selectedProduct.product.category || 'N/A'}</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Cost</p>
                <p className="text-blue-900">${selectedProduct.product.cost || 0}</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Stock Value</p>
                <p className="text-blue-900">${selectedProduct.stockValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Turnover Ratio</p>
                <p className="text-blue-900 font-bold">{selectedProduct.turnoverRatio}x</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Annualized</p>
                <p className="text-blue-900 font-bold">{selectedProduct.annualizedTurnover}x/year</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Avg Days to Sell</p>
                <p className="text-blue-900">{selectedProduct.daysToSell} days</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Reorder Point</p>
                <p className="text-blue-900">{selectedProduct.product.reorder_point || 'Not set'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}