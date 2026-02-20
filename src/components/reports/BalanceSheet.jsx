import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";

export default function BalanceSheet({ transactions, products, dateRange, onExport }) {
  const balanceSheet = useMemo(() => {
    // Assets
    const cash = transactions
      .filter(t => t.type === 'revenue')
      .reduce((sum, t) => sum + (t.amount || 0), 0) -
      transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const inventory = products.reduce((sum, p) => 
      sum + ((p.current_stock || 0) * (p.cost || 0)), 0);

    const accountsReceivable = 0; // Simplified
    const currentAssets = cash + inventory + accountsReceivable;
    const fixedAssets = 0; // Simplified
    const totalAssets = currentAssets + fixedAssets;

    // Liabilities
    const accountsPayable = 0; // Simplified
    const currentLiabilities = accountsPayable;
    const longTermDebt = 0; // Simplified
    const totalLiabilities = currentLiabilities + longTermDebt;

    // Equity
    const retainedEarnings = totalAssets - totalLiabilities;
    const totalEquity = retainedEarnings;

    return {
      assets: {
        current: { cash, inventory, accountsReceivable, total: currentAssets },
        fixed: fixedAssets,
        total: totalAssets
      },
      liabilities: {
        current: { accountsPayable, total: currentLiabilities },
        longTerm: longTermDebt,
        total: totalLiabilities
      },
      equity: {
        retainedEarnings,
        total: totalEquity
      }
    };
  }, [transactions, products]);

  const handleExport = () => {
    const data = [
      ["BALANCE SHEET"],
      ["As of", format(dateRange.to, 'MMM d, yyyy')],
      [],
      ["ASSETS"],
      ["Current Assets"],
      ["  Cash", `$${balanceSheet.assets.current.cash.toFixed(2)}`],
      ["  Inventory", `$${balanceSheet.assets.current.inventory.toFixed(2)}`],
      ["  Accounts Receivable", `$${balanceSheet.assets.current.accountsReceivable.toFixed(2)}`],
      ["Total Current Assets", `$${balanceSheet.assets.current.total.toFixed(2)}`],
      ["Fixed Assets", `$${balanceSheet.assets.fixed.toFixed(2)}`],
      ["TOTAL ASSETS", `$${balanceSheet.assets.total.toFixed(2)}`],
      [],
      ["LIABILITIES"],
      ["Current Liabilities"],
      ["  Accounts Payable", `$${balanceSheet.liabilities.current.accountsPayable.toFixed(2)}`],
      ["Total Current Liabilities", `$${balanceSheet.liabilities.current.total.toFixed(2)}`],
      ["Long-term Debt", `$${balanceSheet.liabilities.longTerm.toFixed(2)}`],
      ["TOTAL LIABILITIES", `$${balanceSheet.liabilities.total.toFixed(2)}`],
      [],
      ["EQUITY"],
      ["Retained Earnings", `$${balanceSheet.equity.retainedEarnings.toFixed(2)}`],
      ["TOTAL EQUITY", `$${balanceSheet.equity.total.toFixed(2)}`],
      [],
      ["TOTAL LIABILITIES & EQUITY", `$${(balanceSheet.liabilities.total + balanceSheet.equity.total).toFixed(2)}`]
    ];
    onExport(data);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Balance Sheet</CardTitle>
          <p className="text-sm text-slate-500 mt-1">As of {format(dateRange.to, 'MMM d, yyyy')}</p>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assets */}
          <div>
            <h3 className="font-semibold text-lg text-slate-900 mb-4 pb-2 border-b-2 border-indigo-600">Assets</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Current Assets</h4>
                <div className="space-y-1 ml-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Cash</span>
                    <span className="font-medium">${balanceSheet.assets.current.cash.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Inventory</span>
                    <span className="font-medium">${balanceSheet.assets.current.inventory.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Accounts Receivable</span>
                    <span className="font-medium">${balanceSheet.assets.current.accountsReceivable.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="font-medium text-slate-700">Total Current Assets</span>
                    <span className="font-semibold">${balanceSheet.assets.current.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">Fixed Assets</span>
                <span className="font-medium">${balanceSheet.assets.fixed.toLocaleString()}</span>
              </div>

              <div className="flex justify-between pt-3 border-t-2 border-slate-900">
                <span className="font-bold text-slate-900">TOTAL ASSETS</span>
                <span className="font-bold text-indigo-600">${balanceSheet.assets.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Liabilities & Equity */}
          <div>
            <h3 className="font-semibold text-lg text-slate-900 mb-4 pb-2 border-b-2 border-rose-600">Liabilities & Equity</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Current Liabilities</h4>
                <div className="space-y-1 ml-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Accounts Payable</span>
                    <span className="font-medium">${balanceSheet.liabilities.current.accountsPayable.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="font-medium text-slate-700">Total Current Liabilities</span>
                    <span className="font-semibold">${balanceSheet.liabilities.current.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">Long-term Debt</span>
                <span className="font-medium">${balanceSheet.liabilities.longTerm.toLocaleString()}</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-300">
                <span className="font-semibold text-slate-900">Total Liabilities</span>
                <span className="font-semibold">${balanceSheet.liabilities.total.toLocaleString()}</span>
              </div>

              <div className="pt-4">
                <h4 className="font-medium text-slate-700 mb-2">Equity</h4>
                <div className="space-y-1 ml-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Retained Earnings</span>
                    <span className="font-medium">${balanceSheet.equity.retainedEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="font-semibold text-slate-900">Total Equity</span>
                    <span className="font-semibold text-emerald-600">${balanceSheet.equity.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t-2 border-slate-900">
                <span className="font-bold text-slate-900">TOTAL L & E</span>
                <span className="font-bold text-rose-600">
                  ${(balanceSheet.liabilities.total + balanceSheet.equity.total).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}