import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function ProductForm({ open, onOpenChange, onSubmit, product, isLoading }) {
  const [formData, setFormData] = useState({
    sku: "",
    barcode: "",
    name: "",
    description: "",
    category: "",
    cost: "",
    retail_price: "",
    wholesale_price: "",
    current_stock: "0",
    reorder_point: "",
    reorder_quantity: "",
    weight: "",
    weight_unit: "lb",
    supplier: "",
    lead_time_days: "",
    is_active: true
  });

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || "",
        barcode: product.barcode || "",
        name: product.name || "",
        description: product.description || "",
        category: product.category || "",
        cost: product.cost?.toString() || "",
        retail_price: product.retail_price?.toString() || "",
        wholesale_price: product.wholesale_price?.toString() || "",
        current_stock: product.current_stock?.toString() || "0",
        reorder_point: product.reorder_point?.toString() || "",
        reorder_quantity: product.reorder_quantity?.toString() || "",
        weight: product.weight?.toString() || "",
        weight_unit: product.weight_unit || "lb",
        supplier: product.supplier || "",
        lead_time_days: product.lead_time_days?.toString() || "",
        is_active: product.is_active !== false
      });
    } else {
      setFormData({
        sku: "",
        barcode: "",
        name: "",
        description: "",
        category: "",
        cost: "",
        retail_price: "",
        wholesale_price: "",
        current_stock: "0",
        reorder_point: "",
        reorder_quantity: "",
        weight: "",
        weight_unit: "lb",
        supplier: "",
        lead_time_days: "",
        is_active: true
      });
    }
  }, [product, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      retail_price: formData.retail_price ? parseFloat(formData.retail_price) : undefined,
      wholesale_price: formData.wholesale_price ? parseFloat(formData.wholesale_price) : undefined,
      current_stock: formData.current_stock ? parseFloat(formData.current_stock) : 0,
      reorder_point: formData.reorder_point ? parseFloat(formData.reorder_point) : undefined,
      reorder_quantity: formData.reorder_quantity ? parseFloat(formData.reorder_quantity) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      lead_time_days: formData.lead_time_days ? parseInt(formData.lead_time_days) : undefined
    };
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                placeholder="PROD-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode (UPC/EAN)</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                placeholder="012345678901"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Product name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Product description..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                placeholder="Electronics, Apparel, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                placeholder="Supplier name"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost (COGS)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="retail_price">Retail Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <Input
                  id="retail_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.retail_price}
                  onChange={(e) => setFormData({...formData, retail_price: e.target.value})}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wholesale_price">Wholesale Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <Input
                  id="wholesale_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.wholesale_price}
                  onChange={(e) => setFormData({...formData, wholesale_price: e.target.value})}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_stock">Current Stock</Label>
              <Input
                id="current_stock"
                type="number"
                min="0"
                value={formData.current_stock}
                onChange={(e) => setFormData({...formData, current_stock: e.target.value})}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorder_point">Reorder Point</Label>
              <Input
                id="reorder_point"
                type="number"
                min="0"
                value={formData.reorder_point}
                onChange={(e) => setFormData({...formData, reorder_point: e.target.value})}
                placeholder="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorder_quantity">Reorder Qty</Label>
              <Input
                id="reorder_quantity"
                type="number"
                min="0"
                value={formData.reorder_quantity}
                onChange={(e) => setFormData({...formData, reorder_quantity: e.target.value})}
                placeholder="50"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                min="0"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight_unit">Unit</Label>
              <Select value={formData.weight_unit} onValueChange={(v) => setFormData({...formData, weight_unit: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oz">Ounces (oz)</SelectItem>
                  <SelectItem value="lb">Pounds (lb)</SelectItem>
                  <SelectItem value="g">Grams (g)</SelectItem>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead_time_days">Lead Time (days)</Label>
            <Input
              id="lead_time_days"
              type="number"
              min="0"
              value={formData.lead_time_days}
              onChange={(e) => setFormData({...formData, lead_time_days: e.target.value})}
              placeholder="7"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <Label htmlFor="is_active" className="text-sm font-medium">Active Product</Label>
              <p className="text-xs text-slate-500 mt-1">Inactive products won't appear in reports</p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.sku || !formData.name}
              className="flex-1 bg-slate-900 hover:bg-slate-800"
            >
              {isLoading ? "Saving..." : product ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}