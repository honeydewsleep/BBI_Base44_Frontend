import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, AlertTriangle, TrendingDown, Box, MapPin } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function WarehouseInventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => base44.entities.Product.list("name")
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.InventoryLocation.list("name")
  });

  const { data: locationStocks = [] } = useQuery({
    queryKey: ["location-stocks"],
    queryFn: () => base44.entities.ProductLocationStock.list()
  });

  const { data: recentMovements = [] } = useQuery({
    queryKey: ["recent-movements"],
    queryFn: () => base44.entities.InventoryMovement.list("-created_date", 50)
  });

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => p.is_active);

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    if (stockFilter === "low") {
      filtered = filtered.filter(p => p.reorder_point && p.current_stock <= p.reorder_point);
    } else if (stockFilter === "out") {
      filtered = filtered.filter(p => (p.current_stock || 0) === 0);
    }

    if (locationFilter !== "all") {
      filtered = filtered.filter(p => {
        const productStocks = locationStocks.filter(ls => ls.product_id === p.id);
        return productStocks.some(ps => ps.location_id === locationFilter && ps.quantity > 0);
      });
    }

    return filtered;
  }, [products, searchTerm, categoryFilter, stockFilter, locationFilter, locationStocks]);

  const stats = useMemo(() => {
    const totalProducts = products.filter(p => p.is_active).length;
    const lowStock = products.filter(p => p.is_active && p.reorder_point && p.current_stock <= p.reorder_point).length;
    const outOfStock = products.filter(p => p.is_active && (p.current_stock || 0) === 0).length;
    const totalValue = products.filter(p => p.is_active).reduce((sum, p) => sum + ((p.current_stock || 0) * (p.cost || 0)), 0);

    return { totalProducts, lowStock, outOfStock, totalValue };
  }, [products]);

  const getStockStatus = (product) => {
    if (!product.current_stock || product.current_stock === 0) return { label: "Out of Stock", color: "bg-rose-500", textColor: "text-rose-600" };
    if (product.reorder_point && product.current_stock <= product.reorder_point) return { label: "Low Stock", color: "bg-amber-500", textColor: "text-amber-600" };
    return { label: "In Stock", color: "bg-emerald-500", textColor: "text-emerald-600" };
  };

  const getStockPercentage = (product) => {
    if (!product.reorder_point) return 100;
    const max = product.reorder_point * 3;
    return Math.min((product.current_stock / max) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Warehouse Inventory</h1>
          <p className="text-slate-500 mt-1">Track stock levels, locations, and movements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Products</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalProducts}</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Package className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Low Stock Items</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{stats.lowStock}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Out of Stock</p>
                  <p className="text-2xl font-bold text-rose-600 mt-1">{stats.outOfStock}</p>
                </div>
                <div className="p-3 bg-rose-100 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Inventory Value</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">${stats.totalValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <Box className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, SKU, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.filter(l => l.is_active).map(loc => (
                    <SelectItem key={loc.id} value={loc.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {loc.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Stock Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Levels</SelectItem>
                  <SelectItem value="low">Low Stock Only</SelectItem>
                  <SelectItem value="out">Out of Stock Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Product List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Products */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Products ({filteredProducts.length})</h2>
              {locationFilter !== "all" && (
                <Badge variant="outline" className="text-sm">
                  <MapPin className="h-3 w-3 mr-1" />
                  {locations.find(l => l.id === locationFilter)?.name}
                </Badge>
              )}
            </div>
            {loadingProducts ? (
              <Card><CardContent className="p-8 text-center text-slate-500">Loading...</CardContent></Card>
            ) : filteredProducts.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-slate-500">No products found</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map(product => {
                  const status = getStockStatus(product);
                  const percentage = getStockPercentage(product);
                  const productStocks = locationStocks.filter(ls => ls.product_id === product.id);

                  return (
                    <Card key={product.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
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
                              {product.category && (
                                <Badge variant="outline" className="text-xs">
                                  {product.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Badge className={`${status.color} text-white ml-2`}>
                            {status.label}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-600">Current Stock</span>
                              <span className={`font-semibold ${status.textColor}`}>
                                {product.current_stock || 0} units
                              </span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>

                          {product.reorder_point && (
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Reorder Point: {product.reorder_point}</span>
                              {product.reorder_quantity && (
                                <span className="text-slate-500">Reorder Qty: {product.reorder_quantity}</span>
                              )}
                            </div>
                          )}

                          {productStocks.length > 0 && (
                            <div className="pt-2 border-t border-slate-100">
                              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Found in {productStocks.length} location{productStocks.length !== 1 ? 's' : ''}:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {productStocks
                                  .filter(ps => ps.quantity > 0)
                                  .map(ps => {
                                    const location = locations.find(l => l.id === ps.location_id);
                                    return location ? (
                                      <div key={ps.id} className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                                        locationFilter === ps.location_id 
                                          ? 'bg-indigo-100 border border-indigo-300' 
                                          : 'bg-slate-50 border border-slate-200'
                                      }`}>
                                        <MapPin className={`h-3 w-3 ${locationFilter === ps.location_id ? 'text-indigo-600' : 'text-slate-400'}`} />
                                        <span className={locationFilter === ps.location_id ? 'text-indigo-900 font-medium' : 'text-slate-600'}>
                                          {location.name}:
                                        </span>
                                        <span className="font-semibold text-slate-900">{ps.quantity}</span>
                                      </div>
                                    ) : null;
                                  })}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Movements */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Movements</h2>
            <Card>
              <CardContent className="p-4">
                {recentMovements.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No recent movements</p>
                ) : (
                  <div className="space-y-3">
                    {recentMovements.slice(0, 15).map(movement => {
                      const product = products.find(p => p.id === movement.product_id);
                      const fromLoc = locations.find(l => l.id === movement.from_location_id);
                      const toLoc = locations.find(l => l.id === movement.to_location_id);

                      return (
                        <div key={movement.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                          <div className={`p-2 rounded-lg flex-shrink-0 ${
                            movement.movement_type === 'purchase' ? 'bg-emerald-100' :
                            movement.movement_type === 'sale' ? 'bg-rose-100' :
                            movement.movement_type === 'transfer' ? 'bg-indigo-100' :
                            'bg-slate-100'
                          }`}>
                            <Package className={`h-4 w-4 ${
                              movement.movement_type === 'purchase' ? 'text-emerald-600' :
                              movement.movement_type === 'sale' ? 'text-rose-600' :
                              movement.movement_type === 'transfer' ? 'text-indigo-600' :
                              'text-slate-600'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                  {product?.name || movement.sku}
                                </p>
                                <p className="text-xs text-slate-500 capitalize">{movement.movement_type.replace('_', ' ')}</p>
                              </div>
                              <Badge variant={movement.quantity > 0 ? 'default' : 'destructive'} className="text-xs">
                                {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                              </Badge>
                            </div>
                            {(fromLoc || toLoc) && (
                              <p className="text-xs text-slate-500 mt-1">
                                {fromLoc?.name || 'External'} → {toLoc?.name || 'External'}
                              </p>
                            )}
                            {movement.notes && (
                              <p className="text-xs text-slate-400 mt-1 truncate">{movement.notes}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}