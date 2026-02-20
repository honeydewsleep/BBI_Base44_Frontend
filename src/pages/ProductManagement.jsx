import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Package, MapPin, ArrowRightLeft, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ProductList from "@/components/products/ProductList";
import ProductForm from "@/components/products/ProductForm";
import ProductImport from "@/components/products/ProductImport";
import LocationList from "@/components/products/LocationList";
import LocationForm from "@/components/products/LocationForm";
import InventoryMovementForm from "@/components/products/InventoryMovementForm";
import SKUMappingManager from "@/components/products/SKUMappingManager";
import StockByLocation from "@/components/products/StockByLocation";

export default function ProductManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [showProductImport, setShowProductImport] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingLocation, setEditingLocation] = useState(null);

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => base44.entities.Product.list("name")
  });

  const { data: locations = [], isLoading: loadingLocations } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.InventoryLocation.list("name")
  });

  const { data: locationStocks = [] } = useQuery({
    queryKey: ["location-stocks"],
    queryFn: () => base44.entities.ProductLocationStock.list()
  });

  const createProduct = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowProductForm(false);
      setEditingProduct(null);
    }
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowProductForm(false);
      setEditingProduct(null);
    }
  });

  const createLocation = useMutation({
    mutationFn: (data) => base44.entities.InventoryLocation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setShowLocationForm(false);
      setEditingLocation(null);
    }
  });

  const updateLocation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.InventoryLocation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setShowLocationForm(false);
      setEditingLocation(null);
    }
  });

  const handleProductSubmit = (data) => {
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data });
    } else {
      createProduct.mutate(data);
    }
  };

  const handleLocationSubmit = (data) => {
    if (editingLocation) {
      updateLocation.mutate({ id: editingLocation.id, data });
    } else {
      createLocation.mutate(data);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleEditLocation = (location) => {
    setEditingLocation(location);
    setShowLocationForm(true);
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Product Management</h1>
            <p className="text-slate-500 mt-1">Manage products, inventory, and locations</p>
          </div>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="locations" className="gap-2">
              <MapPin className="h-4 w-4" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="movements" className="gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Inventory Movements
            </TabsTrigger>
            <TabsTrigger value="sku-mapping" className="gap-2">
              <Search className="h-4 w-4" />
              SKU Mapping
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search products by name, SKU, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowProductImport(true)} variant="outline" className="border-slate-300">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button onClick={() => { setEditingProduct(null); setShowProductForm(true); }} className="bg-slate-900 hover:bg-slate-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>

            <ProductList 
              products={filteredProducts}
              onEdit={handleEditProduct}
              isLoading={loadingProducts}
            />

            <ProductForm
              open={showProductForm}
              onOpenChange={setShowProductForm}
              onSubmit={handleProductSubmit}
              product={editingProduct}
              isLoading={createProduct.isPending || updateProduct.isPending}
            />

            <ProductImport
              open={showProductImport}
              onOpenChange={setShowProductImport}
            />
          </TabsContent>

          <TabsContent value="locations" className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600">
                {locations.length} location{locations.length !== 1 ? 's' : ''} configured
              </p>
              <Button onClick={() => { setEditingLocation(null); setShowLocationForm(true); }} className="bg-slate-900 hover:bg-slate-800">
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </div>

            <LocationList 
              locations={locations}
              onEdit={handleEditLocation}
              isLoading={loadingLocations}
            />

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Stock by Location</h2>
              <StockByLocation 
                products={products}
                locations={locations}
                locationStocks={locationStocks}
              />
            </div>

            <LocationForm
              open={showLocationForm}
              onOpenChange={setShowLocationForm}
              onSubmit={handleLocationSubmit}
              location={editingLocation}
              isLoading={createLocation.isPending || updateLocation.isPending}
            />
          </TabsContent>

          <TabsContent value="movements" className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600">
                Transfer inventory between locations or record production
              </p>
              <Button onClick={() => setShowMovementForm(true)} className="bg-slate-900 hover:bg-slate-800">
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Record Movement
              </Button>
            </div>

            <InventoryMovementForm
              open={showMovementForm}
              onOpenChange={setShowMovementForm}
              products={products}
              locations={locations}
            />
          </TabsContent>

          <TabsContent value="sku-mapping" className="space-y-6">
            <SKUMappingManager products={products} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}