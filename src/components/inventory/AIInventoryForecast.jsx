import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Calendar, Package, RefreshCw, Sparkles } from "lucide-react";
import { format, addDays } from "date-fns";

export default function AIInventoryForecast() {
  const [forecasts, setForecasts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-date', 500),
  });

  const { data: inventoryMovements = [] } = useQuery({
    queryKey: ['inventoryMovements'],
    queryFn: () => base44.entities.InventoryMovement.list('-created_date', 500),
  });

  const { data: snapshots = [] } = useQuery({
    queryKey: ['inventorySnapshots'],
    queryFn: () => base44.entities.InventorySnapshot.list('-snapshot_date', 200),
  });

  const generateForecasts = async () => {
    if (products.length === 0) return;
    
    setIsGenerating(true);
    try {
      // Get top 10 products by sales or stock value
      const topProducts = products
        .filter(p => p.is_active !== false)
        .sort((a, b) => (b.current_stock * (b.cost || 0)) - (a.current_stock * (a.cost || 0)))
        .slice(0, 10);

      const productForecasts = [];

      for (const product of topProducts) {
        // Gather historical sales data
        const salesData = transactions
          .filter(t => t.sku === product.sku && t.type === 'revenue' && t.quantity)
          .map(t => ({ date: t.date, quantity: t.quantity }));

        // Get inventory movement history
        const movements = inventoryMovements
          .filter(m => m.sku === product.sku)
          .slice(0, 30);

        // Get snapshot history
        const productSnapshots = snapshots
          .filter(s => s.sku === product.sku)
          .slice(0, 30);

        const prompt = `You are an inventory management AI. Analyze this product's data and provide actionable forecasts.

Product: ${product.name}
SKU: ${product.sku}
Current Stock: ${product.current_stock || 0}
Reorder Point: ${product.reorder_point || 0}
Cost: $${product.cost || 0}
Lead Time: ${product.lead_time_days || 14} days

Recent Sales (last 30 transactions): ${JSON.stringify(salesData.slice(0, 30))}
Recent Inventory Movements: ${movements.length} movements in last 30 days
Historical Snapshots: ${productSnapshots.length} snapshots available

Based on this data:
1. Predict daily demand rate for next 30 days
2. Calculate days until stockout (when stock reaches 0)
3. Identify stockout risk level (low, medium, high, critical)
4. Suggest optimal reorder date (considering lead time)
5. Recommend reorder quantity
6. Provide confidence level (0-100)
7. Brief insight (1 sentence)`;

        const result = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              daily_demand: { type: "number" },
              days_until_stockout: { type: "number" },
              stockout_risk: { 
                type: "string",
                enum: ["low", "medium", "high", "critical"]
              },
              suggested_reorder_date: { type: "string" },
              recommended_quantity: { type: "number" },
              confidence: { type: "number" },
              insight: { type: "string" }
            }
          }
        });

        productForecasts.push({
          product,
          ...result
        });
      }

      // Sort by risk level
      const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      productForecasts.sort((a, b) => 
        riskOrder[a.stockout_risk] - riskOrder[b.stockout_risk]
      );

      setForecasts(productForecasts);
      setLastGenerated(new Date());
    } catch (error) {
      console.error("Forecast generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getRiskIcon = (risk) => {
    if (risk === 'critical' || risk === 'high') {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <TrendingUp className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                AI Inventory Forecasting
                <Sparkles className="h-4 w-4 text-purple-600" />
              </CardTitle>
              <CardDescription>
                AI-powered demand prediction and stockout risk analysis
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={generateForecasts}
            disabled={isGenerating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate Forecasts
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {forecasts.length === 0 && !isGenerating && (
          <div className="text-center py-12 text-slate-500">
            <Brain className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-sm">Click "Generate Forecasts" to analyze inventory data with AI</p>
          </div>
        )}

        {lastGenerated && (
          <div className="mb-4 text-xs text-slate-500 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Last generated: {format(lastGenerated, 'MMM d, yyyy h:mm a')}
          </div>
        )}

        <div className="space-y-4">
          {forecasts.map((forecast, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{forecast.product.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {forecast.product.sku}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">{forecast.insight}</p>
                </div>
                <Badge className={`${getRiskColor(forecast.stockout_risk)} border flex items-center gap-1`}>
                  {getRiskIcon(forecast.stockout_risk)}
                  {forecast.stockout_risk} risk
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Current Stock</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {forecast.product.current_stock || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Daily Demand</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {forecast.daily_demand.toFixed(1)} units/day
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Days to Stockout</p>
                  <p className="text-lg font-semibold text-orange-600">
                    {Math.max(0, forecast.days_until_stockout)} days
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Confidence</p>
                  <p className="text-lg font-semibold text-green-600">
                    {forecast.confidence}%
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">Reorder by:</span>
                    <span className="font-semibold text-slate-900">
                      {forecast.suggested_reorder_date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">Suggested quantity:</span>
                    <span className="font-semibold text-purple-600">
                      {forecast.recommended_quantity} units
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}