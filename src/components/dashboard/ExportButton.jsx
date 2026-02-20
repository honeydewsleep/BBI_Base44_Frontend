import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileText, Table } from "lucide-react";
import { format } from "date-fns";

export default function ExportButton({ transactions, customers, dateRange }) {
  const exportToCSV = (data, filename, headers) => {
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(h => {
        const value = row[h.toLowerCase().replace(/ /g, '_')] ?? '';
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const exportTransactions = () => {
    const headers = ["Date", "Type", "Category", "Amount", "Description"];
    const data = transactions.map(t => ({
      date: t.date,
      type: t.type,
      category: t.category,
      amount: t.amount,
      description: t.description || ''
    }));
    exportToCSV(data, 'transactions', headers);
  };

  const exportCustomers = () => {
    const headers = ["Name", "Email", "Company", "Status", "Lifetime_Value"];
    const data = customers.map(c => ({
      name: c.name,
      email: c.email,
      company: c.company || '',
      status: c.status,
      lifetime_value: c.lifetime_value || 0
    }));
    exportToCSV(data, 'customers', headers);
  };

  const exportSummary = () => {
    const totalRevenue = transactions.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const activeCustomers = customers.filter(c => c.status === 'active').length;

    const headers = ["Metric", "Value"];
    const data = [
      { metric: "Report Period", value: dateRange?.from && dateRange?.to ? `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}` : 'All time' },
      { metric: "Total Revenue", value: `$${totalRevenue.toLocaleString()}` },
      { metric: "Total Expenses", value: `$${totalExpenses.toLocaleString()}` },
      { metric: "Net Profit", value: `$${netProfit.toLocaleString()}` },
      { metric: "Profit Margin", value: totalRevenue > 0 ? `${((netProfit / totalRevenue) * 100).toFixed(1)}%` : '0%' },
      { metric: "Total Customers", value: customers.length },
      { metric: "Active Customers", value: activeCustomers }
    ];
    exportToCSV(data, 'business_summary', headers);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={exportSummary} className="cursor-pointer">
          <FileText className="h-4 w-4 mr-2 text-slate-500" />
          Summary Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportTransactions} className="cursor-pointer">
          <Table className="h-4 w-4 mr-2 text-slate-500" />
          All Transactions
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportCustomers} className="cursor-pointer">
          <Table className="h-4 w-4 mr-2 text-slate-500" />
          Customer List
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}