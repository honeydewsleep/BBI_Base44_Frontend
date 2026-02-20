import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const REVENUE_CATEGORIES = [
  { value: "sales", label: "Sales" },
  { value: "services", label: "Services" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "other_revenue", label: "Other" }
];

const EXPENSE_CATEGORIES = [
  { value: "payroll", label: "Payroll" },
  { value: "rent", label: "Rent" },
  { value: "utilities", label: "Utilities" },
  { value: "marketing", label: "Marketing" },
  { value: "supplies", label: "Supplies" },
  { value: "software", label: "Software" },
  { value: "travel", label: "Travel" },
  { value: "shipping", label: "Shipping" },
  { value: "other_expense", label: "Other" }
];

export default function TransactionForm({ open, onOpenChange, onSubmit, isLoading }) {
  const [type, setType] = useState("revenue");
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    channel: "d2c",
    date: new Date().toISOString().split("T")[0],
    description: "",
    sku: "",
    quantity: "",
    shipping_cost: ""
  });

  const categories = type === "revenue" ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e) => {
    e.preventDefault();
    const quantity = parseFloat(formData.quantity) || 0;
    const shipping = parseFloat(formData.shipping_cost) || 0;
    const unitShipping = quantity > 0 ? shipping / quantity : 0;
    
    onSubmit({
      ...formData,
      type,
      amount: parseFloat(formData.amount),
      quantity: quantity || undefined,
      shipping_cost: shipping || undefined,
      unit_shipping_cost: unitShipping || undefined,
      sku: formData.sku || undefined
    });
    setFormData({
      amount: "",
      category: "",
      channel: "d2c",
      date: new Date().toISOString().split("T")[0],
      description: "",
      sku: "",
      quantity: "",
      shipping_cost: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <Tabs value={type} onValueChange={(v) => { setType(v); setFormData({...formData, category: ""}); }}>
            <TabsList className="grid w-full grid-cols-2 bg-slate-100">
              <TabsTrigger value="revenue" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                Revenue
              </TabsTrigger>
              <TabsTrigger value="expense" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
                Expense
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-slate-700">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="pl-8"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-slate-700">Category</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === "revenue" && (
            <div className="space-y-2">
              <Label htmlFor="channel" className="text-slate-700">Channel</Label>
              <Select value={formData.channel} onValueChange={(v) => setFormData({...formData, channel: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                  <SelectItem value="d2c">Direct to Consumer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="date" className="text-slate-700">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku" className="text-slate-700">SKU (optional)</Label>
              <Input
                id="sku"
                placeholder="Product SKU"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-slate-700">Quantity (optional)</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                placeholder="0"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              />
            </div>
          </div>

          {type === "revenue" && (
            <div className="space-y-2">
              <Label htmlFor="shipping_cost" className="text-slate-700">Shipping Cost (optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <Input
                  id="shipping_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-8"
                  value={formData.shipping_cost}
                  onChange={(e) => setFormData({...formData, shipping_cost: e.target.value})}
                />
              </div>
              {formData.quantity && formData.shipping_cost && (
                <p className="text-xs text-slate-500">
                  Unit shipping cost: ${(parseFloat(formData.shipping_cost) / parseFloat(formData.quantity)).toFixed(2)}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-700">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a note..."
              className="resize-none"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.amount || !formData.category}
              className={`flex-1 ${type === 'revenue' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
            >
              {isLoading ? "Adding..." : "Add Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}