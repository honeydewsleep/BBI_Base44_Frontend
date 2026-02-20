import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Link } from "lucide-react";
import { toast } from "sonner";

export default function SKUMappingManager({ products }) {
  const queryClient = useQueryClient();
  const [newMapping, setNewMapping] = useState({
    customer_sku: "",
    internal_sku: "",
    customer_name: "",
    notes: ""
  });

  const { data: mappings = [] } = useQuery({
    queryKey: ["sku-mappings"],
    queryFn: () => base44.entities.SKUMapping.list()
  });

  const createMapping = useMutation({
    mutationFn: (data) => {
      const product = products.find(p => p.sku === data.internal_sku);
      return base44.entities.SKUMapping.create({
        ...data,
        product_id: product?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sku-mappings"] });
      setNewMapping({ customer_sku: "", internal_sku: "", customer_name: "", notes: "" });
      toast.success("SKU mapping added");
    }
  });

  const deleteMapping = useMutation({
    mutationFn: (id) => base44.entities.SKUMapping.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sku-mappings"] });
      toast.success("SKU mapping deleted");
    }
  });

  const handleAdd = () => {
    if (!newMapping.customer_sku || !newMapping.internal_sku) {
      toast.error("Please fill in required fields");
      return;
    }
    createMapping.mutate(newMapping);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Add New SKU Mapping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Customer/Vendor SKU *</Label>
              <Input
                placeholder="Customer's SKU code"
                value={newMapping.customer_sku}
                onChange={(e) => setNewMapping({...newMapping, customer_sku: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Internal SKU *</Label>
              <Select 
                value={newMapping.internal_sku} 
                onValueChange={(v) => setNewMapping({...newMapping, internal_sku: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.sku}>
                      {p.sku} - {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Customer/Vendor Name</Label>
              <Input
                placeholder="Company name"
                value={newMapping.customer_name}
                onChange={(e) => setNewMapping({...newMapping, customer_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                placeholder="Additional notes"
                value={newMapping.notes}
                onChange={(e) => setNewMapping({...newMapping, notes: e.target.value})}
              />
            </div>
          </div>
          <Button onClick={handleAdd} disabled={createMapping.isPending} className="bg-slate-900">
            <Plus className="h-4 w-4 mr-2" />
            Add Mapping
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing SKU Mappings ({mappings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {mappings.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No SKU mappings yet</p>
          ) : (
            <div className="space-y-2">
              {mappings.map((mapping) => (
                <div key={mapping.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Customer SKU</p>
                      <p className="font-medium text-slate-900">{mapping.customer_sku}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Internal SKU</p>
                      <Badge variant="outline" className="font-mono">{mapping.internal_sku}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Customer</p>
                      <p className="text-sm text-slate-700">{mapping.customer_name || 'N/A'}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMapping.mutate(mapping.id)}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}