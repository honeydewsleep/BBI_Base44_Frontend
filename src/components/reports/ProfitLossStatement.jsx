import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";

export default function ProfitLossStatement({ transactions, comparisonTransactions, dateRange, onExport }) {
  const calculatePL = (txns) => {
    const revenue = {
      sales: 0,
      services: 0,
      subscriptions: 0,
      other_revenue: 0
    };
    
    const expenses = {
      payroll: 0,
      rent: 0,
      utilities: 0,
      marketing: 0,
      supplies: 0,
      software: 0,
      travel: 0,
      shipping: 0,
      other_expense: 0
    };

    txns.forEach(t => {
      if (t.type === 'revenue') {
        revenue[t.category] = (revenue[t.category] || 0) + (t.amount || 0);
      } else if (t.type === 'expense') {
        expenses[t.category] = (expenses[t.category] || 0) + (t.amount || 0);
      }
    });

    const totalRevenue = Object.values(revenue).reduce((sum, val) => sum + val, 0);
    const totalExpenses = Object.values(expenses).reduce((sum, val) => sum + val, 0);
    const grossProfit = totalRevenue;
    const netIncome = grossProfit - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

    return { revenue, expenses, totalRevenue, totalExpenses, grossProfit, netIncome, profitMargin };
  };

  const current = useMemo(() => calculatePL(transactions), [transactions]);
  const comparison = useMemo(() => calculatePL(comparisonTransactions), [comparisonTransactions]);
  
  const revenueChange = comparison.totalRevenue > 0 
    ? ((current.totalRevenue - comparison.totalRevenue) / comparison.totalRevenue) * 100 
    : 0;
  const expenseChange = comparison.totalExpenses > 0 
    ? ((current.totalExpenses - comparison.totalExpenses) / comparison.totalExpenses) * 100 
    : 0;
  const netIncomeChange = comparison.netIncome !== 0
    ? ((current.netIncome - comparison.netIncome) / Math.abs(comparison.netIncome)) * 100 
    : 0;

  const handleExport = () => {
    const data = [
      ["PROFIT & LOSS STATEMENT"],
      ["Period", `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`],
      [],
      ["REVENUE"],
      ...Object.entries(current.revenue).map(([cat, val]) => [cat.replace(/_/g, ' ').toUpperCase(), `$${val.toFixed(2)}`]),
      ["Total Revenue", `$${current.totalRevenue.toFixed(2)}`],
      [],
      ["EXPENSES"],
      ...Object.entries(current.expenses).map(([cat, val]) => [cat.replace(/_/g, ' ').toUpperCase(), `$${val.toFixed(2)}`]),
      ["Total Expenses", `$${current.totalExpenses.toFixed(2)}`],
      [],
      ["NET INCOME", `$${current.netIncome.toFixed(2)}`],
      ["Profit Margin", `${current.profitMargin.toFixed(1)}%`]
    ];
    onExport(data);
  };

  const ChangeIndicator = ({ value }) => {
    if (!value || Math.abs(value) < 0.1) return null;
    const Icon = value > 0 ? TrendingUp : TrendingDown;
    const color = value > 0 ? 'text-emerald-600' : 'text-rose-600';
    return (
      <span className={`text-xs ${color} flex items-center gap-1 ml-2`}>
        <Icon className="h-3 w-3" />
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Profit & Loss Statement</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Revenue Section */}
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-emerald-600">
              <h3 className="font-semibold text-lg text-slate-900">Revenue</h3>
              <div className="flex items-center">
                <span className="text-lg font-bold text-emerald-600">
                  ${current.totalRevenue.toLocaleString()}
                </span>
                <ChangeIndicator value={revenueChange} />
              </div>
            </div>
            <div className="space-y-2 ml-4">
              {Object.entries(current.revenue).map(([category, amount]) => (
                amount > 0 && (
                  <div key={category} className="flex justify-between text-sm">
                    <span className="text-slate-600 capitalize">{category.replace(/_/g, ' ')}</span>
                    <span className="font-medium text-slate-900">${amount.toLocaleString()}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Gross Profit */}
          <div className="flex justify-between items-center py-2 border-y border-slate-200">
            <span className="font-semibold text-slate-900">Gross Profit</span>
            <span className="font-semibold text-slate-900">${current.grossProfit.toLocaleString()}</span>
          </div>

          {/* Expenses Section */}
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-rose-600">
              <h3 className="font-semibold text-lg text-slate-900">Operating Expenses</h3>
              <div className="flex items-center">
                <span className="text-lg font-bold text-rose-600">
                  ${current.totalExpenses.toLocaleString()}
                </span>
                <ChangeIndicator value={expenseChange} />
              </div>
            </div>
            <div className="space-y-2 ml-4">
              {Object.entries(current.expenses).map(([category, amount]) => (
                amount > 0 && (
                  <div key={category} className="flex justify-between text-sm">
                    <span className="text-slate-600 capitalize">{category.replace(/_/g, ' ')}</span>
                    <span className="font-medium text-slate-900">${amount.toLocaleString()}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Net Income */}
          <div className="pt-4 border-t-2 border-slate-900">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xl font-bold text-slate-900">Net Income</span>
              <div className="flex items-center">
                <span className={`text-xl font-bold ${current.netIncome >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ${current.netIncome.toLocaleString()}
                </span>
                <ChangeIndicator value={netIncomeChange} />
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Profit Margin</span>
              <span className={`font-semibold ${current.profitMargin >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {current.profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}