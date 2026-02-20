import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function FinancialRatios({ transactions, products }) {
  const ratios = useMemo(() => {
    const revenue = transactions
      .filter(t => t.type === 'revenue')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const netIncome = revenue - expenses;
    const cogs = transactions
      .filter(t => t.category === 'supplies' || t.category === 'payroll')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const grossProfit = revenue - cogs;

    // Profitability Ratios
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const netMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0;
    const roi = expenses > 0 ? (netIncome / expenses) * 100 : 0;

    // Liquidity (simplified)
    const inventory = products.reduce((sum, p) => 
      sum + ((p.current_stock || 0) * (p.cost || 0)), 0);
    const cash = netIncome; // Simplified
    const currentRatio = 1.5; // Placeholder
    const quickRatio = 1.2; // Placeholder

    // Efficiency
    const avgInventory = inventory;
    const inventoryTurnover = avgInventory > 0 ? (cogs / avgInventory) : 0;
    const daysInventory = inventoryTurnover > 0 ? 365 / inventoryTurnover : 0;

    // Growth (would need historical data for accurate calc)
    const revenueGrowth = 15; // Placeholder %
    const expenseGrowth = 10; // Placeholder %

    return {
      profitability: {
        grossMargin: { value: grossMargin, good: grossMargin >= 30 },
        netMargin: { value: netMargin, good: netMargin >= 10 },
        roi: { value: roi, good: roi >= 15 }
      },
      liquidity: {
        currentRatio: { value: currentRatio, good: currentRatio >= 1.5 },
        quickRatio: { value: quickRatio, good: quickRatio >= 1 },
        cash: { value: cash, good: cash >= 0 }
      },
      efficiency: {
        inventoryTurnover: { value: inventoryTurnover, good: inventoryTurnover >= 4 },
        daysInventory: { value: daysInventory, good: daysInventory <= 90 }
      },
      growth: {
        revenueGrowth: { value: revenueGrowth, good: revenueGrowth >= 10 },
        expenseGrowth: { value: expenseGrowth, good: expenseGrowth <= 15 }
      }
    };
  }, [transactions, products]);

  const RatioCard = ({ title, value, format, good, info, trend }) => {
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-400';
    
    return (
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">{title}</span>
            {info && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">{info}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Badge variant={good ? "default" : "destructive"} className="text-xs">
            {good ? 'Good' : 'Needs Attention'}
          </Badge>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${good ? 'text-emerald-600' : 'text-rose-600'}`}>
            {format === 'percent' ? `${value.toFixed(1)}%` : 
             format === 'currency' ? `$${value.toLocaleString()}` :
             format === 'ratio' ? value.toFixed(2) :
             value.toFixed(1)}
          </span>
          {trend && (
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Profitability Ratios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RatioCard
              title="Gross Margin"
              value={ratios.profitability.grossMargin.value}
              format="percent"
              good={ratios.profitability.grossMargin.good}
              info="Percentage of revenue remaining after cost of goods sold. Target: >30%"
              trend="up"
            />
            <RatioCard
              title="Net Profit Margin"
              value={ratios.profitability.netMargin.value}
              format="percent"
              good={ratios.profitability.netMargin.good}
              info="Percentage of revenue remaining after all expenses. Target: >10%"
              trend={ratios.profitability.netMargin.value > 0 ? 'up' : 'down'}
            />
            <RatioCard
              title="Return on Investment"
              value={ratios.profitability.roi.value}
              format="percent"
              good={ratios.profitability.roi.good}
              info="Return generated on invested capital. Target: >15%"
              trend="up"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Liquidity Ratios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RatioCard
              title="Current Ratio"
              value={ratios.liquidity.currentRatio.value}
              format="ratio"
              good={ratios.liquidity.currentRatio.good}
              info="Current assets / Current liabilities. Target: >1.5"
            />
            <RatioCard
              title="Quick Ratio"
              value={ratios.liquidity.quickRatio.value}
              format="ratio"
              good={ratios.liquidity.quickRatio.good}
              info="(Current assets - Inventory) / Current liabilities. Target: >1.0"
            />
            <RatioCard
              title="Available Cash"
              value={ratios.liquidity.cash.value}
              format="currency"
              good={ratios.liquidity.cash.good}
              info="Cash available for operations"
              trend={ratios.liquidity.cash.value > 0 ? 'up' : 'down'}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Efficiency Ratios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RatioCard
              title="Inventory Turnover"
              value={ratios.efficiency.inventoryTurnover.value}
              format="ratio"
              good={ratios.efficiency.inventoryTurnover.good}
              info="How many times inventory is sold and replaced. Target: >4x per year"
            />
            <RatioCard
              title="Days in Inventory"
              value={ratios.efficiency.daysInventory.value}
              format="days"
              good={ratios.efficiency.daysInventory.good}
              info="Average days to sell inventory. Target: <90 days"
              trend={ratios.efficiency.daysInventory.good ? 'up' : 'down'}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Growth Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RatioCard
              title="Revenue Growth"
              value={ratios.growth.revenueGrowth.value}
              format="percent"
              good={ratios.growth.revenueGrowth.good}
              info="Year-over-year revenue growth. Target: >10%"
              trend="up"
            />
            <RatioCard
              title="Expense Growth"
              value={ratios.growth.expenseGrowth.value}
              format="percent"
              good={ratios.growth.expenseGrowth.good}
              info="Year-over-year expense growth. Target: <15% (lower than revenue)"
              trend="down"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}