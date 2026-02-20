import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, AlertTriangle, CheckCircle2, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductList({ products, onEdit, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No products yet</h3>
        <p className="text-slate-500">Add your first product to get started</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => {
        const stockStatus = product.reorder_point 
          ? product.current_stock <= product.reorder_point 
            ? 'low' 
            : 'good'
          : 'unknown';

        return (
          <Card key={product.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="outline" className="text-xs font-mono">
                    {product.sku}
                  </Badge>
                  {product.barcode && (
                    <Badge variant="outline" className="text-xs font-mono bg-slate-50">
                      {product.barcode}
                    </Badge>
                  )}
                  {!product.is_active && (
                    <Badge variant="outline" className="text-xs text-rose-600 border-rose-200">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
                <Edit className="h-4 w-4 text-slate-500" />
              </Button>
            </div>

            {product.description && (
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{product.description}</p>
            )}

            <div className="space-y-2 text-sm">
              {product.category && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-medium text-slate-900">{product.category}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Stock:</span>
                <div className="flex items-center gap-2">
                  {stockStatus === 'low' ? (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  ) : stockStatus === 'good' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : null}
                  <span className="font-medium text-slate-900">
                    {product.current_stock || 0}
                  </span>
                </div>
              </div>

              {product.reorder_point && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Reorder at:</span>
                  <span className="font-medium text-slate-900">{product.reorder_point}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 space-y-1">
                {product.cost && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cost:</span>
                    <span className="font-medium text-slate-900">${product.cost.toFixed(2)}</span>
                  </div>
                )}
                {product.retail_price && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Retail:</span>
                    <span className="font-medium text-emerald-600">${product.retail_price.toFixed(2)}</span>
                  </div>
                )}
                {product.wholesale_price && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Wholesale:</span>
                    <span className="font-medium text-indigo-600">${product.wholesale_price.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}