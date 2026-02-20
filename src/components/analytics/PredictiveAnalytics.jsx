import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Users, ShoppingCart, RefreshCw, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function PredictiveAnalytics({ transactions, customers, products, dateRange }) {
  const [predictions, setPredictions] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePredictions = async () => {
    setIsGenerating(true);
    try {
      // Prepare historical data
      const revenueByMonth = {};
      transactions.filter(t => t.type === 'revenue').forEach(t => {
        const month = t.date.substring(0, 7);
        revenueByMonth[month] = (revenueByMonth[month] || 0) + (t.amount || 0);
      });

      const customerGrowth = {};
      customers.forEach(c => {
        const month = c.created_date.substring(0, 7);
        customerGrowth[month] = (customerGrowth[month] || 0) + 1;
      });

      const prompt = `You are a business analytics AI expert. Analyze historical data and provide predictions.

Historical Revenue by Month: ${JSON.stringify(revenueByMonth)}
Customer Growth by Month: ${JSON.stringify(customerGrowth)}
Total Products: ${products.length}
Active Customers: ${customers.filter(c => c.status === 'active').length}

Provide predictions for:
1. Next 6 months revenue forecast
2. Expected customer growth (new customers per month for next 6 months)
3. Revenue growth rate (percentage)
4. Customer churn risk (low/medium/high)
5. Top 3 recommendations for growth
6. Predicted customer lifetime value
7. Best performing customer segment prediction
8. Confidence level for predictions (0-100)`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            revenue_forecast: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  month: { type: "string" },
                  predicted_revenue: { type: "number" }
                }
              }
            },
            customer_forecast: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  month: { type: "string" },
                  new_customers: { type: "number" }
                }
              }
            },
            revenue_growth_rate: { type: "number" },
            churn_risk: { type: "string", enum: ["low", "medium", "high"] },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            predicted_clv: { type: "number" },
            best_segment: { type: "string" },
            confidence: { type: "number" }
          }
        }
      });

      setPredictions(result);
    } catch (error) {
      console.error("Prediction generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const chartData = predictions?.revenue_forecast?.map((item, idx) => ({
    month: item.month,
    revenue: item.predicted_revenue,
    customers: predictions.customer_forecast[idx]?.new_customers || 0
  })) || [];

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  AI Predictive Analytics
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </CardTitle>
                <CardDescription>
                  ML-powered forecasts for revenue, customer growth, and business trends
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={generatePredictions}
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
                  Generate Predictions
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {!predictions && !isGenerating && (
          <CardContent>
            <div className="text-center py-12 text-slate-500">
              <Brain className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-sm">Click "Generate Predictions" to analyze trends with AI</p>
            </div>
          </CardContent>
        )}
      </Card>

      {predictions && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-slate-500">Growth Rate</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  +{predictions.revenue_growth_rate.toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-slate-500">Predicted CLV</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  ${predictions.predicted_clv.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-slate-500">Best Segment</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {predictions.best_segment}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-slate-600" />
                  <span className="text-xs text-slate-500">Confidence</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {predictions.confidence}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Forecast Chart */}
          <Card>
            <CardHeader>
              <CardTitle>6-Month Revenue & Customer Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    name="Predicted Revenue ($)"
                    strokeDasharray="5 5"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="customers" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="New Customers"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Churn Risk & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Churn Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Badge className={`${getRiskColor(predictions.churn_risk)} text-lg px-4 py-2`}>
                      {predictions.churn_risk.toUpperCase()} RISK
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600">
                    {predictions.churn_risk === 'low' && 'Customer retention is strong. Continue current strategies.'}
                    {predictions.churn_risk === 'medium' && 'Monitor customer engagement. Consider loyalty programs.'}
                    {predictions.churn_risk === 'high' && 'Immediate action needed. Focus on retention campaigns.'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {predictions.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">{idx + 1}.</span>
                      <span className="text-sm text-slate-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Forecast Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed 6-Month Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-3">Month</th>
                      <th className="text-right p-3">Predicted Revenue</th>
                      <th className="text-right p-3">New Customers</th>
                      <th className="text-right p-3">Avg Revenue/Customer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((item, idx) => (
                      <tr key={idx} className="border-b hover:bg-slate-50">
                        <td className="p-3 font-medium">{item.month}</td>
                        <td className="text-right p-3">${item.revenue.toLocaleString()}</td>
                        <td className="text-right p-3">{item.customers}</td>
                        <td className="text-right p-3">
                          ${item.customers > 0 ? (item.revenue / item.customers).toFixed(2) : '0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}