import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Package, Download } from "lucide-react";
import DateRangeFilter from "@/components/dashboard/DateRangeFilter";
import ChannelFilter from "@/components/dashboard/ChannelFilter";
import InventoryTurnoverReport from "@/components/analytics/InventoryTurnoverReport";
import StockAgingReport from "@/components/analytics/StockAgingReport";
import SalesBreakdownReport from "@/components/analytics/SalesBreakdownReport";
import PredictiveAnalytics from "@/components/analytics/PredictiveAnalytics";
import ConfigurableKPIDashboard from "@/components/analytics/ConfigurableKPIDashboard";
import { subDays } from "date-fns";

export default function AdvancedAnalytics() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 90),
    to: new Date()
  });
  const [channelFilter, setChannelFilter] = useState("all");

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-date', 1000),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list(),
  });

  const { data: inventoryMovements = [] } = useQuery({
    queryKey: ['inventoryMovements'],
    queryFn: () => base44.entities.InventoryMovement.list('-created_date', 1000),
  });

  const { data: snapshots = [] } = useQuery({
    queryKey: ['inventorySnapshots'],
    queryFn: () => base44.entities.InventorySnapshot.list('-snapshot_date', 500),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Advanced Analytics</h1>
              <p className="text-slate-500 mt-1">Deep insights and predictive analytics</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ChannelFilter value={channelFilter} onChange={setChannelFilter} />
            <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
          </div>
        </div>

        <Tabs defaultValue="kpis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="kpis" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">KPI Dashboard</span>
              <span className="sm:hidden">KPIs</span>
            </TabsTrigger>
            <TabsTrigger value="turnover" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Inventory Turnover</span>
              <span className="sm:hidden">Turnover</span>
            </TabsTrigger>
            <TabsTrigger value="aging" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Stock Aging</span>
              <span className="sm:hidden">Aging</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Sales Breakdown</span>
              <span className="sm:hidden">Sales</span>
            </TabsTrigger>
            <TabsTrigger value="predictive" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Predictive</span>
              <span className="sm:hidden">Predict</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kpis">
            <ConfigurableKPIDashboard
              transactions={transactions}
              products={products}
              customers={customers}
              dateRange={dateRange}
              channelFilter={channelFilter}
            />
          </TabsContent>

          <TabsContent value="turnover">
            <InventoryTurnoverReport
              transactions={transactions}
              products={products}
              inventoryMovements={inventoryMovements}
              dateRange={dateRange}
              channelFilter={channelFilter}
            />
          </TabsContent>

          <TabsContent value="aging">
            <StockAgingReport
              products={products}
              inventoryMovements={inventoryMovements}
              snapshots={snapshots}
              transactions={transactions}
            />
          </TabsContent>

          <TabsContent value="sales">
            <SalesBreakdownReport
              transactions={transactions}
              products={products}
              customers={customers}
              dateRange={dateRange}
              channelFilter={channelFilter}
            />
          </TabsContent>

          <TabsContent value="predictive">
            <PredictiveAnalytics
              transactions={transactions}
              customers={customers}
              products={products}
              dateRange={dateRange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}