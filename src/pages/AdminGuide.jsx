import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Package, BarChart3, Settings, CheckCircle, AlertCircle } from "lucide-react";

export default function AdminGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-rose-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Admin User Guide</h1>
              <Badge className="bg-rose-600 mt-1">Administrator Access</Badge>
            </div>
          </div>
          <p className="text-slate-600 mt-3">Complete guide to managing your business platform</p>
        </div>

        {/* Quick Start */}
        <Card className="mb-6 border-rose-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-rose-600" />
              Quick Start Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Invite team members (User Management)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Set up inventory locations (Product Management)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Import or add products (Product Management)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Add customers (Dashboard)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Start recording transactions (Dashboard)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-700" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Inviting Users</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                <li>Go to User Management page</li>
                <li>Click "Invite User" button</li>
                <li>Enter their email and select appropriate role</li>
                <li>Click "Send Invitation" - they'll receive an email</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Available Roles</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <Badge className="bg-rose-600 mt-0.5">Admin</Badge>
                  <span className="text-slate-600">Full access to everything including user management</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Badge className="bg-violet-600 mt-0.5">Executive</Badge>
                  <span className="text-slate-600">Dashboard and financial reports access</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Badge className="bg-indigo-600 mt-0.5">Warehouse</Badge>
                  <span className="text-slate-600">Product management and full inventory control</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Badge className="bg-emerald-600 mt-0.5">Fulfillment</Badge>
                  <span className="text-slate-600">View-only access to warehouse inventory</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Changing User Roles</h3>
              <p className="text-sm text-slate-600">On the User Management page, use the dropdown next to each user to change their role instantly</p>
            </div>
          </CardContent>
        </Card>

        {/* Product Management */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-slate-700" />
              Product & Inventory Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Setting Up Locations</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                <li>Go to Product Management page</li>
                <li>Click on "Locations" tab</li>
                <li>Click "Add Location" and enter details (name, type, address, manager)</li>
                <li>Create locations like "Main Warehouse", "Production Floor", "Retail Store", etc.</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Adding Products</h3>
              <p className="text-sm text-slate-600 mb-2"><strong>Option 1: Manual Entry</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 mb-3">
                <li>Click "Add Product" button</li>
                <li>Fill in SKU, name, pricing, and stock details</li>
                <li>Set reorder points and quantities</li>
                <li>Save</li>
              </ol>

              <p className="text-sm text-slate-600 mb-2"><strong>Option 2: Import from File</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                <li>Click "Import Products" button</li>
                <li>Download the template file (CSV or Excel)</li>
                <li>Fill in your product data in the template</li>
                <li>Upload the completed file</li>
                <li>Review and confirm the import</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Recording Inventory Movements</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                <li>Go to "Inventory Movements" tab</li>
                <li>Click "Record Movement"</li>
                <li>Select product, enter quantity (positive or negative)</li>
                <li>Choose movement type: Transfer, Production, Sale, Purchase, or Adjustment</li>
                <li>Select from/to locations if applicable</li>
                <li>Add notes and save</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Managing SKU Mappings</h3>
              <p className="text-sm text-slate-600 mb-2">Use SKU mappings to connect customer/vendor SKUs to your internal SKUs:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                <li>Go to "SKU Mapping" tab</li>
                <li>Click "Add Mapping"</li>
                <li>Enter customer's SKU and map it to your internal SKU</li>
                <li>Useful for wholesale orders with different product codes</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard & Transactions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-700" />
              Dashboard & Financial Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Adding Transactions</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                <li>Click "Add Transaction" on Dashboard</li>
                <li>Choose Revenue or Expense tab</li>
                <li>Enter amount, select category, and date</li>
                <li>For revenue: select channel (Wholesale/D2C)</li>
                <li>Add SKU, quantity, and shipping costs for detailed tracking</li>
                <li>Save</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Managing Customers</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                <li>Click "Add Customer" on Dashboard</li>
                <li>Enter name, email, company details</li>
                <li>Select status (Active/Inactive/Lead) and channel</li>
                <li>Add tags for segmentation</li>
                <li>Customer lifetime value is calculated automatically</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Using Filters</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                <li>Date Range: Filter all metrics by time period</li>
                <li>Channel Filter: View Global, Wholesale, or D2C data separately</li>
                <li>Charts update automatically based on filters</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Financial Reports */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-700" />
              Financial Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Available Reports</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                <li><strong>Profit & Loss:</strong> Income statement showing revenue, expenses, and profitability</li>
                <li><strong>Balance Sheet:</strong> Assets, inventory value, and financial position</li>
                <li><strong>Cash Flow:</strong> Operating, investing activities and net cash flow</li>
                <li><strong>Financial Ratios:</strong> Profit margin, ROI, inventory turnover metrics</li>
                <li><strong>Channel Comparison:</strong> Side-by-side performance of Wholesale vs D2C</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Exporting Reports</h3>
              <p className="text-sm text-slate-600">Click "Export PDF" on any report to download a professional PDF document for sharing or record-keeping</p>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertCircle className="h-5 w-5" />
              Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-700">
              <li>Record transactions daily for accurate financial tracking</li>
              <li>Set reorder points for all products to prevent stockouts</li>
              <li>Use SKU mappings for all wholesale customers to avoid confusion</li>
              <li>Regularly review inventory movements for accuracy</li>
              <li>Assign appropriate roles to team members (principle of least privilege)</li>
              <li>Use location tracking to know exactly where inventory is stored</li>
              <li>Review financial reports monthly to track business health</li>
              <li>Add detailed descriptions and notes to transactions for future reference</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}