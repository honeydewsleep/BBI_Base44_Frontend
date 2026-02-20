import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format, parseISO } from "date-fns";

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

export default function TransactionList({ transactions }) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {transactions.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-500">
              No transactions yet
            </div>
          ) : (
            transactions.slice(0, 8).map((transaction) => (
              <div 
                key={transaction.id} 
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    transaction.type === 'revenue' 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-rose-100 text-rose-600'
                  }`}>
                    {transaction.type === 'revenue' 
                      ? <ArrowUpRight className="h-4 w-4" /> 
                      : <ArrowDownRight className="h-4 w-4" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {transaction.description || CATEGORY_LABELS[transaction.category]}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(parseISO(transaction.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs font-normal border-slate-200 text-slate-600">
                    {CATEGORY_LABELS[transaction.category]}
                  </Badge>
                  <span className={`text-sm font-semibold ${
                    transaction.type === 'revenue' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {transaction.type === 'revenue' ? '+' : '-'}${transaction.amount?.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}