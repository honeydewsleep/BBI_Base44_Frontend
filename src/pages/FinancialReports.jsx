import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, BarChart3, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { subDays, parseISO, isWithinInterval, format } from "date-fns";

import DateRangeFilter from "@/components/dashboard/DateRangeFilter";
import ChannelFilter from "@/components/dashboard/ChannelFilter";
import ProfitLossStatement from "@/components/reports/ProfitLossStatement";
import BalanceSheet from "@/components/reports/BalanceSheet";
import CashFlowStatement from "@/components/reports/CashFlowStatement";
import FinancialRatios from "@/components/reports/FinancialRatios";
import ChannelComparison from "@/components/reports/ChannelComparison";

export default function FinancialReports() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [comparisonRange, setComparisonRange] = useState({
    from: subDays(new Date(), 60),
    to: subDays(new Date(), 30)
  });
  const [channelFilter, setChannelFilter] = useState("all");

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => base44.entities.Transaction.list("-date")
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => base44.entities.Product.list()
  });

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    
    if (channelFilter !== "all") {
      filtered = filtered.filter(t => 
        t.type === 'expense' || t.channel === channelFilter
      );
    }
    
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter(t => {
        const date = parseISO(t.date);
        return isWithinInterval(date, { start: dateRange.from, end: dateRange.to });
      });
    }
    
    return filtered;
  }, [transactions, channelFilter, dateRange]);

  const comparisonTransactions = useMemo(() => {
    if (!comparisonRange?.from || !comparisonRange?.to) return [];
    
    let filtered = transactions;
    
    if (channelFilter !== "all") {
      filtered = filtered.filter(t => 
        t.type === 'expense' || t.channel === channelFilter
      );
    }
    
    return filtered.filter(t => {
      const date = parseISO(t.date);
      return isWithinInterval(date, { start: comparisonRange.from, end: comparisonRange.to });
    });
  }, [transactions, channelFilter, comparisonRange]);

  const exportReport = (reportName, data) => {
    const csvContent = [
      ["Financial Report", reportName],
      ["Period", `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`],
      ["Channel", channelFilter === 'all' ? 'All Channels' : channelFilter],
      [],
      ...data
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${reportName}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Financial Reports</h1>
            <p className="text-slate-500 mt-1">Comprehensive financial analysis and statements</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ChannelFilter value={channelFilter} onChange={setChannelFilter} />
            <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
          </div>
        </div>

        <Tabs defaultValue="pnl" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="pnl" className="gap-2">
              <DollarSign className="h-4 w-4" />
              P&L Statement
            </TabsTrigger>
            <TabsTrigger value="balance" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Balance Sheet
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Cash Flow
            </TabsTrigger>
            <TabsTrigger value="ratios" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Financial Ratios
            </TabsTrigger>
            <TabsTrigger value="comparison" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Channel Comparison
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pnl">
            <ProfitLossStatement 
              transactions={filteredTransactions}
              comparisonTransactions={comparisonTransactions}
              dateRange={dateRange}
              onExport={(data) => exportReport('ProfitLoss', data)}
            />
          </TabsContent>

          <TabsContent value="balance">
            <BalanceSheet 
              transactions={filteredTransactions}
              products={products}
              dateRange={dateRange}
              onExport={(data) => exportReport('BalanceSheet', data)}
            />
          </TabsContent>

          <TabsContent value="cashflow">
            <CashFlowStatement 
              transactions={filteredTransactions}
              dateRange={dateRange}
              onExport={(data) => exportReport('CashFlow', data)}
            />
          </TabsContent>

          <TabsContent value="ratios">
            <FinancialRatios 
              transactions={filteredTransactions}
              products={products}
            />
          </TabsContent>

          <TabsContent value="comparison">
            <ChannelComparison 
              transactions={transactions}
              dateRange={dateRange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}