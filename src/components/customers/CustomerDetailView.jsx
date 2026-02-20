import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import CustomerEditForm from "./CustomerEditForm";
import TransactionEditForm from "./TransactionEditForm";
import { toast } from "sonner";

export default function CustomerDetailView({ customer, onBack }) {
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [creatingTransaction, setCreatingTransaction] = useState(false);
  const queryClient = useQueryClient();

  const { data: transactions = [] } = useQuery({
    queryKey: ['customerTransactions', customer.id],
    queryFn: () => base44.entities.Transaction.filter({ customer_id: customer.id }),
  });

  const deleteTransaction = useMutation({
    mutationFn: (id) => base44.entities.Transaction.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['customerTransactions']);
      queryClient.invalidateQueries(['transactions']);
      toast.success("Transaction deleted");
    },
  });

  const revenueTransactions = transactions.filter(t => t.type === 'revenue').sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  const totalRevenue = revenueTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="outline" onClick={onBack} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{customer.name}</CardTitle>
                  <p className="text-slate-600 mt-1">{customer.email}</p>
                  {customer.company && (
                    <p className="text-slate-500 text-sm mt-1">{customer.company}</p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => setEditingCustomer(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Status</p>
                  <Badge className="mt-1">{customer.status}</Badge>
                </div>
                <div>
                  <p className="text-slate-500">Channel</p>
                  <p className="font-medium mt-1">{customer.channel || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Customer Since</p>
                  <p className="font-medium mt-1">
                    {format(parseISO(customer.created_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Total Orders</p>
                  <p className="font-medium mt-1">{revenueTransactions.length}</p>
                </div>
              </div>
              {customer.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-slate-500 text-sm">Notes</p>
                  <p className="text-slate-900 mt-1">{customer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Total Revenue</p>
                  <p className="text-3xl font-bold text-slate-900">
                    ${totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Average Order Value</p>
                  <p className="text-xl font-semibold text-slate-900">
                    ${revenueTransactions.length > 0 
                      ? (totalRevenue / revenueTransactions.length).toFixed(2) 
                      : '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Lifetime Value</p>
                  <p className="text-xl font-semibold text-slate-900">
                    ${(customer.lifetime_value || totalRevenue).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Order History</CardTitle>
              <Button onClick={() => setCreatingTransaction(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Order
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Order ID</th>
                    <th className="text-left p-3">SKU</th>
                    <th className="text-right p-3">Quantity</th>
                    <th className="text-right p-3">Amount</th>
                    <th className="text-right p-3">Shipping</th>
                    <th className="text-left p-3">Channel</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-slate-50">
                      <td className="p-3">{format(parseISO(transaction.date), 'MMM d, yyyy')}</td>
                      <td className="p-3 font-mono text-xs">{transaction.order_id || 'N/A'}</td>
                      <td className="p-3">{transaction.sku || 'N/A'}</td>
                      <td className="text-right p-3">{transaction.quantity || '-'}</td>
                      <td className="text-right p-3 font-semibold">${transaction.amount.toFixed(2)}</td>
                      <td className="text-right p-3">{transaction.shipping_cost ? `$${transaction.shipping_cost.toFixed(2)}` : '-'}</td>
                      <td className="p-3">
                        <Badge variant="outline">{transaction.channel}</Badge>
                      </td>
                      <td className="text-right p-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTransaction(transaction)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Delete this transaction?')) {
                                deleteTransaction.mutate(transaction.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {revenueTransactions.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <p>No orders yet for this customer</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {editingCustomer && (
        <CustomerEditForm
          customer={customer}
          onClose={() => setEditingCustomer(false)}
          onSuccess={() => {
            setEditingCustomer(false);
            queryClient.invalidateQueries(['customers']);
            onBack();
          }}
        />
      )}

      {(editingTransaction || creatingTransaction) && (
        <TransactionEditForm
          transaction={editingTransaction}
          customerId={customer.id}
          onClose={() => {
            setEditingTransaction(null);
            setCreatingTransaction(false);
          }}
          onSuccess={() => {
            setEditingTransaction(null);
            setCreatingTransaction(false);
            queryClient.invalidateQueries(['customerTransactions']);
            queryClient.invalidateQueries(['transactions']);
          }}
        />
      )}
    </div>
  );
}