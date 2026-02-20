import { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, TrendingDown, Users, Wallet, Package } from "lucide-react";
import { format, parseISO, subDays, isWithinInterval, eachMonthOfInterval, eachWeekOfInterval, differenceInDays } from "date-fns";

import MetricCard from "@/components/dashboard/MetricCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import CustomerGrowthChart from "@/components/dashboard/CustomerGrowthChart";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import TransactionList from "@/components/dashboard/TransactionList";
import DateRangeFilter from "@/components/dashboard/DateRangeFilter";
import ExportButton from "@/components/dashboard/ExportButton";
import TransactionForm from "@/components/forms/TransactionForm";
import CustomerForm from "@/components/forms/CustomerForm";
import ChannelFilter from "@/components/dashboard/ChannelFilter";
import ForecastChart from "@/components/dashboard/ForecastChart";
import InventoryForecast from "@/components/dashboard/InventoryForecast";
import CustomerSegmentation from "@/components/dashboard/CustomerSegmentation";
import AIInventoryForecast from "@/components/inventory/AIInventoryForecast";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [channelFilter, setChannelFilter] = useState("all");
  const [segmentBy, setSegmentBy] = useState("value");
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [forecastData, setForecastData] = useState({ data: [], insights: null });
  const [isForecastLoading, setIsForecastLoading] = useState(false);

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => base44.entities.Transaction.list("-date")
  });

  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list("-created_date")
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => base44.entities.Product.list("sku")
  });

  const createTransaction = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setShowTransactionForm(false);
    }
  });

  const createCustomer = useMutation({
    mutationFn: (data) => base44.entities.Customer.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setShowCustomerForm(false);
    }
  });

  // Filter transactions by channel and date range
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

  const metrics = useMemo(() => {
    const revenue = filteredTransactions.filter(t => t.type === "revenue").reduce((sum, t) => sum + (t.amount || 0), 0);
    const expenses = filteredTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + (t.amount || 0), 0);
    const profit = revenue - expenses;
    
    // Calculate shipping costs
    const shippingCosts = filteredTransactions
      .filter(t => t.type === "revenue" && t.shipping_cost)
      .reduce((sum, t) => sum + (t.shipping_cost || 0), 0);
    
    const transactionsWithShipping = filteredTransactions
      .filter(t => t.type === "revenue" && t.unit_shipping_cost);
    const avgUnitShipping = transactionsWithShipping.length > 0
      ? transactionsWithShipping.reduce((sum, t) => sum + (t.unit_shipping_cost || 0), 0) / transactionsWithShipping.length
      : 0;

    let filteredCustomers = customers;
    if (channelFilter !== "all") {
      filteredCustomers = customers.filter(c => 
        c.channel === channelFilter || c.channel === "both"
      );
    }

    const activeCustomers = filteredCustomers.filter(c => c.status === "active").length;

    return {
      revenue,
      expenses,
      profit,
      shippingCosts,
      avgUnitShipping,
      activeCustomers,
      totalCustomers: filteredCustomers.length
    };
  }, [filteredTransactions, customers, channelFilter]);

  const chartData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return [];
    
    const daysDiff = Math.ceil((dateRange.to - dateRange.from) / (1000 * 60 * 60 * 24));
    const useWeeks = daysDiff > 60;
    
    const intervals = useWeeks 
      ? eachWeekOfInterval({ start: dateRange.from, end: dateRange.to })
      : eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });

    return intervals.map((intervalStart, idx) => {
      const intervalEnd = intervals[idx + 1] || dateRange.to;
      const intervalTransactions = filteredTransactions.filter(t => {
        const date = parseISO(t.date);
        return date >= intervalStart && date < intervalEnd;
      });

      return {
        date: format(intervalStart, useWeeks ? "MMM d" : "MMM yyyy"),
        revenue: intervalTransactions.filter(t => t.type === "revenue").reduce((sum, t) => sum + (t.amount || 0), 0),
        expenses: intervalTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + (t.amount || 0), 0),
        isForecast: false
      };
    });
  }, [filteredTransactions, dateRange]);

  const customerGrowthData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return [];
    
    let filteredCustomers = customers;
    if (channelFilter !== "all") {
      filteredCustomers = customers.filter(c => 
        c.channel === channelFilter || c.channel === "both"
      );
    }
    
    const months = eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });
    
    return months.map((month, idx) => {
      const monthEnd = months[idx + 1] || dateRange.to;
      const newCustomers = filteredCustomers.filter(c => {
        const date = parseISO(c.created_date);
        return date >= month && date < monthEnd;
      }).length;

      return {
        date: format(month, "MMM"),
        customers: newCustomers
      };
    });
  }, [customers, dateRange, channelFilter]);

  const categoryData = useMemo(() => {
    const revenueByCategory = {};
    const expenseByCategory = {};

    filteredTransactions.forEach(t => {
      if (t.type === "revenue") {
        revenueByCategory[t.category] = (revenueByCategory[t.category] || 0) + (t.amount || 0);
      } else {
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + (t.amount || 0);
      }
    });

    return {
      revenue: Object.entries(revenueByCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      expense: Object.entries(expenseByCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    };
  }, [filteredTransactions]);

  // Calculate SKU velocity
  const skuVelocity = useMemo(() => {
    const velocity = {};
    
    const last30Days = subDays(new Date(), 30);
    const last7Days = subDays(new Date(), 7);
    
    transactions.forEach(t => {
      if (t.sku && t.quantity && t.type === "revenue") {
        if (!velocity[t.sku]) {
          velocity[t.sku] = { daily: 0, weekly: 0, monthly: 0, totalQty: 0 };
        }
        
        const txDate = parseISO(t.date);
        velocity[t.sku].totalQty += t.quantity;
        
        if (txDate >= last7Days) {
          velocity[t.sku].weekly += t.quantity;
        }
        if (txDate >= last30Days) {
          velocity[t.sku].monthly += t.quantity;
        }
      }
    });
    
    Object.keys(velocity).forEach(sku => {
      velocity[sku].daily = velocity[sku].weekly / 7;
    });
    
    return velocity;
  }, [transactions]);

  // Generate forecast
  useEffect(() => {
    const generateForecast = async () => {
      if (chartData.length < 3) return;
      
      setIsForecastLoading(true);
      
      try {
        const historicalRevenue = chartData.map(d => d.revenue);
        const historicalExpenses = chartData.map(d => d.expenses);
        
        const prompt = `You are a financial forecasting expert. Based on the following historical data, predict revenue for the next 6 periods.

Historical Revenue Data (last ${chartData.length} periods): ${JSON.stringify(historicalRevenue)}
Historical Expenses Data: ${JSON.stringify(historicalExpenses)}

Current metrics:
- Total Revenue: $${metrics.revenue.toLocaleString()}
- Total Expenses: $${metrics.expenses.toLocaleString()}
- Net Profit: $${metrics.profit.toLocaleString()}

Provide:
1. Forecasted revenue for next 6 periods
2. Predicted quarterly total (sum of next 3 months)
3. Predicted yearly total (sum of next 12 months, extrapolate if needed)
4. Growth percentage for quarter and year
5. Brief insights on the trend (1 sentence)`;

        const result = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              forecast: {
                type: "array",
                items: { type: "number" }
              },
              nextQuarter: { type: "number" },
              nextYear: { type: "number" },
              quarterGrowth: { type: "number" },
              yearGrowth: { type: "number" },
              notes: { type: "string" }
            }
          }
        });

        const forecastPoints = result.forecast.slice(0, 6).map((value, idx) => ({
          date: `Forecast ${idx + 1}`,
          revenue: 0,
          expenses: 0,
          forecast: Math.round(value),
          isForecast: true
        }));

        setForecastData({
          data: forecastPoints,
          insights: {
            nextQuarter: result.nextQuarter,
            nextYear: result.nextYear,
            quarterGrowth: result.quarterGrowth,
            yearGrowth: result.yearGrowth,
            notes: result.notes
          }
        });
      } catch (error) {
        console.error("Forecast generation failed:", error);
      } finally {
        setIsForecastLoading(false);
      }
    };

    generateForecast();
  }, [chartData, metrics]);

  const isLoading = loadingTransactions || loadingCustomers || loadingProducts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Business Dashboard</h1>
            <p className="text-slate-500 mt-1">Track performance and forecast growth</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ChannelFilter value={channelFilter} onChange={setChannelFilter} />
            <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
            <ExportButton transactions={filteredTransactions} customers={customers} dateRange={dateRange} />
            <Button onClick={() => setShowTransactionForm(true)} className="bg-slate-900 hover:bg-slate-800">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <MetricCard
            title="Total Revenue"
            value={`$${metrics.revenue.toLocaleString()}`}
            icon={DollarSign}
            variant="revenue"
            trend={metrics.revenue > 0 ? "up" : undefined}
          />
          <MetricCard
            title="Total Expenses"
            value={`$${metrics.expenses.toLocaleString()}`}
            icon={TrendingDown}
            variant="expense"
          />
          <MetricCard
            title="Net Profit"
            value={`$${metrics.profit.toLocaleString()}`}
            icon={Wallet}
            variant={metrics.profit >= 0 ? "revenue" : "expense"}
            trend={metrics.profit > 0 ? "up" : metrics.profit < 0 ? "down" : undefined}
          />
          <MetricCard
            title="Shipping Costs"
            value={`$${metrics.shippingCosts.toLocaleString()}`}
            icon={Package}
            variant="default"
            trendValue={metrics.avgUnitShipping > 0 ? `$${metrics.avgUnitShipping.toFixed(2)}/unit avg` : undefined}
          />
          <MetricCard
            title="Active Customers"
            value={metrics.activeCustomers}
            icon={Users}
            variant="customers"
            trendValue={`${metrics.totalCustomers} total`}
          />
        </div>

        {/* Forecast Chart */}
        <div className="mb-8">
          <ForecastChart 
            historicalData={chartData} 
            forecastData={forecastData.data}
            insights={forecastData.insights}
            isLoading={isForecastLoading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RevenueChart data={chartData} title="Historical Revenue vs Expenses" />
          <CustomerGrowthChart data={customerGrowthData} />
        </div>

        {/* Category Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CategoryBreakdown data={categoryData.revenue} type="revenue" />
          <CategoryBreakdown data={categoryData.expense} type="expense" />
        </div>

        {/* AI Inventory Forecast */}
        <div className="mb-8">
          <AIInventoryForecast />
        </div>

        {/* Inventory Forecast */}
        <div className="mb-8">
          <InventoryForecast 
            products={products} 
            skuVelocity={skuVelocity}
            isLoading={loadingProducts}
          />
        </div>

        {/* Customer Segmentation */}
        <div className="mb-8">
          <CustomerSegmentation 
            customers={customers} 
            segmentBy={segmentBy}
            onSegmentChange={setSegmentBy}
          />
        </div>

        {/* Transactions & Customer Button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
          <Button variant="outline" onClick={() => setShowCustomerForm(true)} className="border-slate-200">
            <Users className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
        <TransactionList transactions={filteredTransactions} />

        {/* Forms */}
        <TransactionForm
          open={showTransactionForm}
          onOpenChange={setShowTransactionForm}
          onSubmit={(data) => createTransaction.mutate(data)}
          isLoading={createTransaction.isPending}
        />
        <CustomerForm
          open={showCustomerForm}
          onOpenChange={setShowCustomerForm}
          onSubmit={(data) => createCustomer.mutate(data)}
          isLoading={createCustomer.isPending}
        />
      </div>
    </div>
  );
}