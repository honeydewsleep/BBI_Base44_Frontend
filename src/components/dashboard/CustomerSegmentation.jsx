import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Award, TrendingUp, DollarSign } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-xl">
        <p className="text-sm font-medium text-slate-900">{payload[0].name}</p>
        <p className="text-sm text-slate-600">{payload[0].value} customers</p>
        <p className="text-xs text-slate-500 mt-1">
          {((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}% of total
        </p>
      </div>
    );
  }
  return null;
};

export default function CustomerSegmentation({ customers, segmentBy, onSegmentChange }) {
  const getSegmentData = () => {
    const segments = {};
    
    customers.forEach(customer => {
      let key;
      
      if (segmentBy === 'status') {
        key = customer.status || 'unknown';
      } else if (segmentBy === 'channel') {
        key = customer.channel || 'unknown';
      } else if (segmentBy === 'value') {
        const ltv = customer.lifetime_value || 0;
        if (ltv >= 20000) key = 'VIP (>$20k)';
        else if (ltv >= 10000) key = 'High Value ($10k-$20k)';
        else if (ltv >= 5000) key = 'Medium Value ($5k-$10k)';
        else if (ltv > 0) key = 'Low Value (<$5k)';
        else key = 'No Purchases';
      } else if (segmentBy === 'tags') {
        const tags = customer.tags || [];
        if (tags.length === 0) {
          key = 'Untagged';
        } else {
          tags.forEach(tag => {
            segments[tag] = (segments[tag] || 0) + 1;
          });
          return;
        }
      }
      
      segments[key] = (segments[key] || 0) + 1;
    });

    const total = customers.length;
    return Object.entries(segments).map(([name, value]) => ({
      name,
      value,
      total
    }));
  };

  const segmentData = getSegmentData();
  
  const getHighValueCustomers = () => {
    return customers
      .filter(c => (c.lifetime_value || 0) >= 10000)
      .sort((a, b) => (b.lifetime_value || 0) - (a.lifetime_value || 0))
      .slice(0, 5);
  };

  const highValueCustomers = getHighValueCustomers();
  const totalValue = customers.reduce((sum, c) => sum + (c.lifetime_value || 0), 0);
  const avgValue = customers.length > 0 ? totalValue / customers.length : 0;

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Segmentation
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">Analyze customer groups and insights</p>
          </div>
          <Select value={segmentBy} onValueChange={onSegmentChange}>
            <SelectTrigger className="w-40 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status">By Status</SelectItem>
              <SelectItem value="value">By Value</SelectItem>
              <SelectItem value="channel">By Channel</SelectItem>
              <SelectItem value="tags">By Tags</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={segmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {segmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {segmentData.map((segment, index) => (
                <div key={segment.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-slate-700">{segment.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-900">{segment.value}</span>
                    <span className="text-xs text-slate-400 w-12 text-right">
                      {((segment.value / segment.total) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg">
                <div className="flex items-center gap-2 text-violet-600 mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-medium">Total</span>
                </div>
                <p className="text-2xl font-bold text-violet-900">{customers.length}</p>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-medium">Avg Value</span>
                </div>
                <p className="text-2xl font-bold text-emerald-900">${avgValue.toFixed(0)}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 text-amber-600 mb-3">
                <Award className="h-4 w-4" />
                <span className="text-sm font-medium">High-Value Customers</span>
              </div>
              <div className="space-y-2">
                {highValueCustomers.length === 0 ? (
                  <p className="text-sm text-slate-500">No high-value customers yet</p>
                ) : (
                  highValueCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-2 bg-amber-50/50 rounded border border-amber-100">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{customer.name}</p>
                        <p className="text-xs text-slate-500">{customer.email}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 bg-emerald-50">
                          ${(customer.lifetime_value || 0).toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs font-medium">Total Customer Value</span>
              </div>
              <p className="text-xl font-bold text-slate-900">${totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}