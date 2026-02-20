import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format, parseISO, eachMonthOfInterval } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function CashFlowStatement({ transactions, dateRange, onExport }) {
  const cashFlow = useMemo(() => {
    const operating = transactions
      .filter(t => t.type === 'revenue')
      .reduce((sum, t) => sum + (t.amount || 0), 0) -
      transactions
      .filter(t => t.type === 'expense' && !['other_expense'].includes(t.category))
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const investing = 0; // Simplified
    const financing = 0; // Simplified
    
    const netCashFlow = operating + investing + financing;
    const beginningCash = 0; // Simplified
    const endingCash = beginningCash + netCashFlow;

    return {
      operating,
      investing,
      financing,
      netCashFlow,
      beginningCash,
      endingCash
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return [];
    
    const months = eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });
    let cumulativeCash = 0;

    return months.map(month => {
      const monthEnd = new Date(month);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const monthTransactions = transactions.filter(t => {
        const date = parseISO(t.date);
        return date >= month && date < monthEnd;
      });

      const cashIn = monthTransactions
        .filter(t => t.type === 'revenue')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      
      const cashOut = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      cumulativeCash += (cashIn - cashOut);

      return {
        month: format(month, 'MMM'),
        cashIn,
        cashOut,
        net: cashIn - cashOut,
        cumulative: cumulativeCash
      };
    });
  }, [transactions, dateRange]);

  const handleExport = () => {
    const data = [
      ["CASH FLOW STATEMENT"],
      ["Period", `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`],
      [],
      ["OPERATING ACTIVITIES", `$${cashFlow.operating.toFixed(2)}`],
      ["INVESTING ACTIVITIES", `$${cashFlow.investing.toFixed(2)}`],
      ["FINANCING ACTIVITIES", `$${cashFlow.financing.toFixed(2)}`],
      [],
      ["Net Cash Flow", `$${cashFlow.netCashFlow.toFixed(2)}`],
      ["Beginning Cash", `$${cashFlow.beginningCash.toFixed(2)}`],
      ["Ending Cash", `$${cashFlow.endingCash.toFixed(2)}`]
    ];
    onExport(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Cash Flow Statement</CardTitle>
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
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-semibold text-slate-900">Operating Activities</span>
                <span className={`font-semibold ${cashFlow.operating >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ${cashFlow.operating.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-semibold text-slate-900">Investing Activities</span>
                <span className={`font-semibold ${cashFlow.investing >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ${cashFlow.investing.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-semibold text-slate-900">Financing Activities</span>
                <span className={`font-semibold ${cashFlow.financing >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ${cashFlow.financing.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-slate-900 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-slate-900">Net Cash Flow</span>
                <span className={`text-lg font-bold ${cashFlow.netCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ${cashFlow.netCashFlow.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Beginning Cash</span>
                <span className="font-medium">${cashFlow.beginningCash.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-300">
                <span className="font-semibold text-slate-900">Ending Cash</span>
                <span className="font-bold text-indigo-600">${cashFlow.endingCash.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cash Flow Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `$${value >= 1000 ? `${value/1000}k` : value}`}
                />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#6366f1" 
                  strokeWidth={2.5}
                  fill="url(#cumulativeGradient)" 
                  name="Cumulative Cash"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}