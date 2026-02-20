import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function InventoryForecast({ products, skuVelocity, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-slate-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Package className="h-5 w-5" />
            SKU Velocity & Inventory Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            Analyzing inventory patterns...
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStockStatus = (product, velocity) => {
    if (!product.current_stock || !velocity) {
      return { status: 'unknown', daysLeft: 0, color: 'gray' };
    }
    
    const daysLeft = velocity.monthly > 0 ? (product.current_stock / (velocity.monthly / 30)) : 999;
    
    if (daysLeft < 7) return { status: 'critical', daysLeft, color: 'rose', icon: AlertTriangle };
    if (daysLeft < 30) return { status: 'low', daysLeft, color: 'amber', icon: TrendingUp };
    return { status: 'good', daysLeft, color: 'emerald', icon: CheckCircle2 };
  };

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Package className="h-5 w-5" />
          SKU Velocity & Inventory Forecast
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">Track product movement and predict reorder needs</p>
      </CardHeader>
      <CardContent>
        {(!products || products.length === 0) ? (
          <div className="text-center py-8 text-slate-500">
            No products tracked yet. Add products to see inventory forecasts.
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => {
              const velocity = skuVelocity?.[product.sku] || { daily: 0, weekly: 0, monthly: 0 };
              const stockStatus = getStockStatus(product, velocity);
              const Icon = stockStatus.icon;
              const stockPercentage = product.reorder_point > 0 
                ? Math.min(100, (product.current_stock / product.reorder_point) * 100) 
                : 100;

              return (
                <div key={product.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-900">{product.name}</h4>
                        <Badge variant="outline" className="text-xs font-mono text-slate-600">
                          {product.sku}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                        <span>Stock: <strong className="text-slate-900">{product.current_stock || 0}</strong></span>
                        {product.reorder_point && (
                          <span>Reorder at: <strong className="text-slate-900">{product.reorder_point}</strong></span>
                        )}
                      </div>
                    </div>
                    {Icon && (
                      <Badge className={`bg-${stockStatus.color}-100 text-${stockStatus.color}-700 border-${stockStatus.color}-200 flex items-center gap-1`}>
                        <Icon className="h-3 w-3" />
                        {stockStatus.status === 'critical' && 'Critical'}
                        {stockStatus.status === 'low' && 'Low Stock'}
                        {stockStatus.status === 'good' && 'Healthy'}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Stock Level</span>
                      <span>{stockStatus.daysLeft > 0 && stockStatus.daysLeft < 999 
                        ? `~${Math.round(stockStatus.daysLeft)} days remaining`
                        : 'Sufficient stock'
                      }</span>
                    </div>
                    <Progress 
                      value={stockPercentage} 
                      className={`h-2 ${
                        stockStatus.status === 'critical' ? 'bg-rose-100' : 
                        stockStatus.status === 'low' ? 'bg-amber-100' : 
                        'bg-emerald-100'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Daily Avg</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">
                        {velocity.daily?.toFixed(1) || '0.0'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Weekly Avg</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">
                        {velocity.weekly?.toFixed(1) || '0.0'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Monthly Avg</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">
                        {velocity.monthly?.toFixed(0) || '0'}
                      </p>
                    </div>
                  </div>

                  {stockStatus.status === 'critical' && (
                    <div className="mt-3 p-2 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700">
                      ⚠️ Urgent: Reorder recommended immediately
                    </div>
                  )}
                  {stockStatus.status === 'low' && (
                    <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                      📦 Consider reordering soon
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}