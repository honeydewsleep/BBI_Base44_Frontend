import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Hash, ClipboardCheck, ArrowLeftRight } from "lucide-react";
import BatchLotManager from "@/components/inventory/BatchLotManager";
import SerialNumberTracker from "@/components/inventory/SerialNumberTracker";
import StockCountManager from "@/components/inventory/StockCountManager";
import LocationTransferForm from "@/components/inventory/LocationTransferForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdvancedInventory() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Advanced Inventory Management</h1>
          <p className="text-slate-500 mt-1">Batch tracking, serial numbers, stock counts, and transfers</p>
        </div>

        <Tabs defaultValue="transfers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="transfers" className="flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              <span className="hidden sm:inline">Transfers</span>
            </TabsTrigger>
            <TabsTrigger value="batches" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Batch/Lot</span>
            </TabsTrigger>
            <TabsTrigger value="serials" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              <span className="hidden sm:inline">Serial Numbers</span>
            </TabsTrigger>
            <TabsTrigger value="counts" className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Stock Counts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transfers">
            <LocationTransferForm />
          </TabsContent>

          <TabsContent value="batches" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Product for Batch Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedProduct?.id}
                  onValueChange={(value) => {
                    const product = products.find(p => p.id === value);
                    setSelectedProduct(product);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedProduct && (
              <Card>
                <CardContent className="pt-6">
                  <BatchLotManager 
                    productId={selectedProduct.id} 
                    sku={selectedProduct.sku}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="serials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Product for Serial Number Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedProduct?.id}
                  onValueChange={(value) => {
                    const product = products.find(p => p.id === value);
                    setSelectedProduct(product);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedProduct && (
              <Card>
                <CardContent className="pt-6">
                  <SerialNumberTracker 
                    productId={selectedProduct.id} 
                    sku={selectedProduct.sku}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="counts">
            <StockCountManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}