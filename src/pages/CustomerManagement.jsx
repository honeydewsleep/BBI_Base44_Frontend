import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Search, DollarSign, ShoppingCart } from "lucide-react";
import CustomerDetailView from "@/components/customers/CustomerDetailView";

export default function CustomerManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list('-created_date'),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-date'),
  });

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCustomerStats = (customer) => {
    const customerTransactions = transactions.filter(t => 
      t.customer_id === customer.id && t.type === 'revenue'
    );
    return {
      totalOrders: customerTransactions.length,
      totalRevenue: customerTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-slate-100 text-slate-800';
      case 'lead': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (selectedCustomer) {
    return <CustomerDetailView customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Customer Management</h1>
            <p className="text-slate-500 mt-1">View and manage all customers and their orders</p>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-400" />
            <span className="text-2xl font-bold text-slate-900">{customers.length}</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search customers by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredCustomers.map((customer) => {
            const stats = getCustomerStats(customer);
            return (
              <Card 
                key={customer.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedCustomer(customer)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{customer.name}</h3>
                        <Badge className={getStatusColor(customer.status)}>
                          {customer.status}
                        </Badge>
                        {customer.channel && (
                          <Badge variant="outline">{customer.channel}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{customer.email}</p>
                      {customer.company && (
                        <p className="text-sm text-slate-500">{customer.company}</p>
                      )}
                      {customer.tags && customer.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {customer.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-2 justify-end">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-lg font-bold text-slate-900">
                          ${stats.totalRevenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 justify-end text-sm text-slate-600">
                        <ShoppingCart className="h-4 w-4" />
                        <span>{stats.totalOrders} orders</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredCustomers.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>{searchTerm ? 'No customers found' : 'No customers yet'}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}