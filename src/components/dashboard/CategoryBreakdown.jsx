import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = {
  revenue: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
  expense: ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffe4e6', '#fef2f2']
};

const CATEGORY_LABELS = {
  sales: 'Sales',
  services: 'Services',
  subscriptions: 'Subscriptions',
  other_revenue: 'Other Revenue',
  payroll: 'Payroll',
  rent: 'Rent',
  utilities: 'Utilities',
  marketing: 'Marketing',
  supplies: 'Supplies',
  software: 'Software',
  travel: 'Travel',
  other_expense: 'Other'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-xl">
        <p className="text-sm font-medium text-slate-900">{payload[0].name}</p>
        <p className="text-sm text-slate-600">${payload[0].value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function CategoryBreakdown({ data, type = "revenue" }) {
  const colors = COLORS[type];
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-900 capitalize">
          {type} by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="h-48 w-48 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {data.slice(0, 5).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-sm text-slate-600">{CATEGORY_LABELS[item.name] || item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-900">
                    ${item.value?.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 w-12 text-right">
                    {total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}