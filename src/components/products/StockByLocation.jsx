import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StockByLocation({ products, locations, locationStocks }) {
  if (!products || !locations || products.length === 0 || locations.length === 0) {
    return <p className="text-slate-500 text-sm">Add products and locations to track stock by location</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 font-medium text-slate-700">Product</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">SKU</th>
            {locations.map(loc => (
              <th key={loc.id} className="text-center py-3 px-4 font-medium text-slate-700">
                {loc.name}
              </th>
            ))}
            <th className="text-center py-3 px-4 font-medium text-slate-700">Total</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => {
            const productStocks = locationStocks.filter(ls => ls.product_id === product.id);
            
            return (
              <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">{product.name}</td>
                <td className="py-3 px-4">
                  <Badge variant="outline" className="font-mono text-xs">{product.sku}</Badge>
                </td>
                {locations.map(loc => {
                  const stock = productStocks.find(ps => ps.location_id === loc.id);
                  const qty = stock?.quantity || 0;
                  
                  return (
                    <td key={loc.id} className="py-3 px-4 text-center">
                      <span className={qty > 0 ? "font-medium text-slate-900" : "text-slate-400"}>
                        {qty}
                      </span>
                    </td>
                  );
                })}
                <td className="py-3 px-4 text-center">
                  <span className="font-semibold text-slate-900">
                    {product.current_stock || 0}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}