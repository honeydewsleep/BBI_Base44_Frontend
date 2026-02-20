import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Clock, AlertTriangle, Package } from "lucide-react";
import { parseISO, differenceInDays } from "date-fns";

export default function StockAgingReport({ products, inventoryMovements, snapshots, transactions }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const agingData = useMemo(() => {
    return products
      .filter(p => p.is_active !== false && p.current_stock > 0)
      .map(product => {
        // Find last sale
        const productSales = transactions
          .filter(t => t.sku === product.sku && t.type === 'revenue')
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const lastSaleDate = productSales.length > 0 ? parseISO(productSales[0].date) : null;
        const daysSinceLastSale = lastSaleDate ? differenceInDays(new Date(), lastSaleDate) : 999;

        // Find last inventory movement
        const lastMovement = inventoryMovements
          .filter(m => m.sku === product.sku)
          .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
        
        const lastMovementDate = lastMovement ? parseISO(lastMovement.created_date) : null;
        const daysSinceMovement = lastMovementDate ? differenceInDays(new Date(), lastMovementDate) : 999;

        const daysInStock = Math.min(daysSinceLastSale, daysSinceMovement);
        const stockValue = product.current_stock * (product.cost || 0);

        let ageCategory = 'fresh';
        if (daysInStock > 180) ageCategory = 'dead';
        else if (daysInStock > 90) ageCategory = 'old';
        else if (daysInStock > 30) ageCategory = 'aging';

        return {
          product,
          daysInStock,
          daysSinceLastSale,
          ageCategory,
          stockValue,
          lastSaleDate: lastSaleDate ? lastSaleDate.toISOString().split('T')[0] : 'Never'
        };
      });
  }, [products, transactions, inventoryMovements]);

  const categorySummary = useMemo(() => {
    const summary = {
      fresh: { count: 0, value: 0, label: '0-30 days', color: '#10b981' },
      aging: { count: 0, value: 0, label: '31-90 days', color: '#f59e0b' },
      old: { count: 0, value: 0, label: '91-180 days', color: '#ef4444' },
      dead: { count: 0, value: 0, label: '180+ days', color: '#7c3aed' }
    };

    agingData.forEach(item => {
      summary[item.ageCategory].count++;
      summary[item.ageCategory].value += item.stockValue;
    });

    return summary;
  }, [agingData]);

  const pieData = Object.entries(categorySummary).map(([key, data]) => ({
    name: data.label,
    value: data.count,
    stockValue: data.value,
    color: data.color,
    category: key
  }));

  const filteredProducts = selectedCategory 
    ? agingData.filter(item => item.ageCategory === selectedCategory)
    : agingData;

  const totalStockValue = agingData.reduce((sum, item) => sum + item.stockValue, 0);
  const atRiskValue = (categorySummary.old.value + categorySummary.dead.value);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900">
              {agingData.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Products with Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900">
              ${totalStockValue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Total Stock Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              ${atRiskValue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">At Risk Stock Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {categorySummary.dead.count}
            </div>
            <p className="text-xs text-slate-500 mt-1">Dead Stock Items</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stock Age Distribution</CardTitle>
            <CardDescription>Click a segment to filter the table below</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={(data) => setSelectedCategory(data.category)}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="cursor-pointer hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border rounded shadow-lg">
                        <p className="font-semibold text-sm">{data.name}</p>
                        <p className="text-xs">Products: {data.value}</p>
                        <p className="text-xs">Value: ${data.stockValue.toLocaleString()}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(categorySummary).map(([key, data]) => (
                <div 
                  key={key}
                  className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                  onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: data.color }}
                      />
                      <span className="font-medium text-slate-900">{data.label}</span>
                      {key === 'dead' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    </div>
                    {selectedCategory === key && <Badge>Selected</Badge>}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Products</p>
                      <p className="font-semibold">{data.count}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Stock Value</p>
                      <p className="font-semibold">${data.value.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedCategory ? `${categorySummary[selectedCategory].label} Stock` : 'All Stock Items'}
          </CardTitle>
          {selectedCategory && (
            <button 
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setSelectedCategory(null)}
            >
              Clear filter
            </button>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-3 font-semibold">Product</th>
                  <th className="text-right p-3 font-semibold">Stock</th>
                  <th className="text-right p-3 font-semibold">Stock Value</th>
                  <th className="text-right p-3 font-semibold">Days in Stock</th>
                  <th className="text-right p-3 font-semibold">Last Sale</th>
                  <th className="text-right p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts
                  .sort((a, b) => b.daysInStock - a.daysInStock)
                  .slice(0, 50)
                  .map((item, idx) => (
                    <tr key={idx} className="border-b hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-medium text-slate-900">{item.product.name}</div>
                        <div className="text-xs text-slate-500">{item.product.sku}</div>
                      </td>
                      <td className="text-right p-3">{item.product.current_stock}</td>
                      <td className="text-right p-3">${item.stockValue.toLocaleString()}</td>
                      <td className="text-right p-3 font-semibold">{item.daysInStock} days</td>
                      <td className="text-right p-3">{item.lastSaleDate}</td>
                      <td className="text-right p-3">
                        <Badge 
                          style={{ 
                            backgroundColor: categorySummary[item.ageCategory].color + '20',
                            color: categorySummary[item.ageCategory].color,
                            borderColor: categorySummary[item.ageCategory].color
                          }}
                          className="border"
                        >
                          {categorySummary[item.ageCategory].label}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}