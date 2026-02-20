import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function TransactionEditForm({ transaction, customerId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    date: transaction?.date || new Date().toISOString().split('T')[0],
    amount: transaction?.amount || 0,
    channel: transaction?.channel || 'wholesale',
    order_id: transaction?.order_id || "",
    sku: transaction?.sku || "",
    quantity: transaction?.quantity || 1,
    shipping_cost: transaction?.shipping_cost || 0,
    description: transaction?.description || ""
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        type: 'revenue',
        category: 'sales',
        customer_id: customerId,
        amount: parseFloat(data.amount),
        quantity: parseFloat(data.quantity),
        shipping_cost: parseFloat(data.shipping_cost) || 0,
        unit_shipping_cost: data.quantity > 0 ? parseFloat(data.shipping_cost) / parseFloat(data.quantity) : 0
      };
      
      if (transaction) {
        return base44.entities.Transaction.update(transaction.id, payload);
      } else {
        return base44.entities.Transaction.create(payload);
      }
    },
    onSuccess: () => {
      toast.success(transaction ? "Order updated" : "Order created");
      onSuccess();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Edit Order' : 'Create Order'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Order ID</Label>
              <Input
                value={formData.order_id}
                onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                placeholder="Optional order ID"
              />
            </div>
            <div>
              <Label>Date *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label>Product (SKU) *</Label>
            <Select 
              value={formData.sku} 
              onValueChange={(value) => {
                const product = products.find(p => p.sku === value);
                setFormData({ 
                  ...formData, 
                  sku: value,
                  amount: product?.retail_price || formData.amount
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map(product => (
                  <SelectItem key={product.id} value={product.sku}>
                    {product.name} ({product.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Quantity *</Label>
              <Input
                type="number"
                step="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Amount Paid *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Shipping Cost</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.shipping_cost}
                onChange={(e) => setFormData({ ...formData, shipping_cost: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Channel *</Label>
            <Select value={formData.channel} onValueChange={(value) => setFormData({ ...formData, channel: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="d2c">Direct to Consumer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : transaction ? "Update Order" : "Create Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}