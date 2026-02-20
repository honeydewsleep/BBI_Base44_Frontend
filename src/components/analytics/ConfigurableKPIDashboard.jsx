import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Settings, DollarSign, TrendingUp, Users, Package, ShoppingCart, Percent } from "lucide-react";
import { parseISO, isWithinInterval } from "date-fns";

export default function ConfigurableKPIDashboard({ transactions, products, customers, dateRange, channelFilter }) {
  const [showConfig, setShowConfig] = useState(false);
  const [enabledKPIs, setEnabledKPIs] = useState({
    revenue: true,
    profit: true,
    orders: true,
    avgOrder: true,
    customers: true,
    conversionRate: true,
    inventory: true,
    profitMargin: true
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (channelFilter !== 'all' && t.type === 'revenue' && t.channel !== channelFilter) return false;
      if (dateRange?.from && dateRange?.to) {
        const date = parseISO(t.date);
        return isWithinInterval(date, { start: dateRange.from, end: dateRange.to });
      }
      return true;
    });
  }, [transactions, dateRange, channelFilter]);

  const kpis = useMemo(() => {
    const revenue = filteredTransactions.filter(t => t.type === 'revenue').reduce((sum, t) => sum + (t.amount || 0), 0);
    const expenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
    const profit = revenue - expenses;
    const orders = filteredTransactions.filter(t => t.type === 'revenue').length;
    const avgOrder = orders > 0 ? revenue / orders : 0;
    
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.current_stock || 0) * (p.cost || 0), 0);
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
    
    let filteredCustomers = customers;
    if (channelFilter !== 'all') {
      filteredCustomers = customers.filter(c => c.channel === channelFilter || c.channel === 'both');
    }
    
    const activeCustomers = filteredCustomers.filter(c => c.status === 'active').length;
    const conversionRate = filteredCustomers.length > 0 ? (orders / filteredCustomers.length) * 100 : 0;

    return {
      revenue: { value: `$${revenue.toLocaleString()}`, label: 'Total Revenue', icon: DollarSign, color: 'blue' },
      profit: { value: `$${profit.toLocaleString()}`, label: 'Net Profit', icon: TrendingUp, color: profit >= 0 ? 'green' : 'red' },
      orders: { value: orders, label: 'Total Orders', icon: ShoppingCart, color: 'purple' },
      avgOrder: { value: `$${avgOrder.toFixed(2)}`, label: 'Avg Order Value', icon: DollarSign, color: 'indigo' },
      customers: { value: activeCustomers, label: 'Active Customers', icon: Users, color: 'cyan' },
      conversionRate: { value: `${conversionRate.toFixed(1)}%`, label: 'Order/Customer Ratio', icon: Percent, color: 'yellow' },
      inventory: { value: `$${totalInventoryValue.toLocaleString()}`, label: 'Inventory Value', icon: Package, color: 'orange' },
      profitMargin: { value: `${profitMargin.toFixed(1)}%`, label: 'Profit Margin', icon: Percent, color: profitMargin >= 20 ? 'green' : 'yellow' }
    };
  }, [filteredTransactions, products, customers, channelFilter]);

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  const toggleKPI = (key) => {
    setEnabledKPIs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900">Your Custom KPI Dashboard</h2>
        <Button variant="outline" onClick={() => setShowConfig(!showConfig)}>
          <Settings className="h-4 w-4 mr-2" />
          {showConfig ? 'Hide' : 'Configure KPIs'}
        </Button>
      </div>

      {showConfig && (
        <Card className="border-slate-200 bg-slate-50">
          <CardHeader>
            <CardTitle className="text-base">Select KPIs to Display</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(kpis).map(([key, data]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={enabledKPIs[key]}
                    onCheckedChange={() => toggleKPI(key)}
                  />
                  <Label htmlFor={key} className="text-sm cursor-pointer">
                    {data.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(kpis)
          .filter(([key]) => enabledKPIs[key])
          .map(([key, data]) => {
            const Icon = data.icon;
            return (
              <Card key={key} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${colorClasses[data.color]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">
                    {data.value}
                  </div>
                  <p className="text-xs text-slate-500">{data.label}</p>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {Object.values(enabledKPIs).every(v => !v) && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            <Settings className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p>No KPIs selected. Click "Configure KPIs" to choose metrics to display.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}