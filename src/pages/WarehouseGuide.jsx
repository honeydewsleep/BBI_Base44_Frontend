import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Package, MapPin, Search, AlertTriangle, CheckCircle, Barcode } from "lucide-react";

export default function WarehouseGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Warehouse & Fulfillment Guide</h1>
              <div className="flex gap-2 mt-1">
                <Badge className="bg-indigo-600">Warehouse Access</Badge>
                <Badge className="bg-emerald-600">Fulfillment Access</Badge>
              </div>
            </div>
          </div>
          <p className="text-slate-600 mt-3">Quick reference for inventory management and fulfillment operations</p>
        </div>

        {/* Role Differences */}
        <Card className="mb-6 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-indigo-600" />
              Your Access Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <Badge className="bg-indigo-600 mb-2">Warehouse Role</Badge>
                <ul className="space-y-1 text-sm text-slate-600 mt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    View all inventory and locations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Add and edit products
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Record inventory movements
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Manage locations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Import products from files
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <Badge className="bg-emerald-600 mb-2">Fulfillment Role</Badge>
                <ul className="space-y-1 text-sm text-slate-600 mt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    View all inventory and locations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Search products by SKU/barcode
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    See stock levels and locations
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-amber-600" />
                    View-only (cannot edit)
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Finding Products */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-slate-700" />
              Finding Products & Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Searching for Items</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                <li>Use the search box to find products by name, SKU, or barcode</li>
                <li>Start typing and results appear automatically</li>
                <li>Each product card shows current stock and location details</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Filtering by Location</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                <li>Use the "Location" dropdown to select a specific warehouse or area</li>
                <li>Only products with stock in that location will be shown</li>
                <li>Great for checking what's available in a specific area</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Understanding Stock Levels</h3>
              <div className="space-y-2 mt-2">
                <div className="flex items-start gap-2 text-sm">
                  <div className="p-1 bg-red-100 rounded mt-0.5">
                    <AlertTriangle className="h-3 w-3 text-red-600" />
                  </div>
                  <div>
                    <strong className="text-slate-900">Out of Stock:</strong>
                    <span className="text-slate-600"> Red badge - needs immediate attention</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <div className="p-1 bg-amber-100 rounded mt-0.5">
                    <AlertTriangle className="h-3 w-3 text-amber-600" />
                  </div>
                  <div>
                    <strong className="text-slate-900">Low Stock:</strong>
                    <span className="text-slate-600"> Yellow badge - below reorder point</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <div className="p-1 bg-green-100 rounded mt-0.5">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  <div>
                    <strong className="text-slate-900">In Stock:</strong>
                    <span className="text-slate-600"> Green badge - healthy stock levels</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Reading Location Information</h3>
              <p className="text-sm text-slate-600 mb-2">Each product card shows where the item is stored:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                <li>Location name (e.g., "Main Warehouse", "Bin A-12")</li>
                <li>Quantity available at each location</li>
                <li>Highlighted location if you're filtering by a specific area</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Managing Products (Warehouse Only) */}
        <Card className="mb-6 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-700" />
              Managing Products <Badge className="bg-indigo-600 ml-2">Warehouse Only</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Adding New Products</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                <li>Go to Product Management page</li>
                <li>Click "Add Product" button</li>
                <li>Fill in required fields: SKU, Name</li>
                <li>Add barcode if available for easy scanning</li>
                <li>Set reorder point and quantity</li>
                <li>Enter cost and pricing information</li>
                <li>Save the product</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Recording Inventory Movements</h3>
              <p className="text-sm text-slate-600 mb-2">Use this when inventory changes:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                <li>Go to "Inventory Movements" tab on Product Management</li>
                <li>Click "Record Movement"</li>
                <li>Select the product and enter quantity</li>
                <li>Choose movement type:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li><strong>Transfer:</strong> Moving between locations</li>
                    <li><strong>Purchase:</strong> Receiving new stock</li>
                    <li><strong>Sale:</strong> Fulfilling an order</li>
                    <li><strong>Adjustment:</strong> Correcting counts</li>
                    <li><strong>Production:</strong> Manufacturing/assembly</li>
                  </ul>
                </li>
                <li>Select from/to locations as needed</li>
                <li>Add notes for tracking (e.g., "Order #1234", "Damaged items")</li>
                <li>Save - stock levels update automatically</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Importing Multiple Products</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                <li>Click "Import Products" button</li>
                <li>Download the template file</li>
                <li>Fill in product details in Excel or CSV</li>
                <li>Upload the completed file</li>
                <li>Review the preview and confirm import</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Managing Locations</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                <li>Go to "Locations" tab on Product Management</li>
                <li>Click "Add Location" to create new storage areas</li>
                <li>Enter location name (e.g., "Warehouse A", "Bin B-15")</li>
                <li>Select location type (Warehouse, Production, Stock, Retail)</li>
                <li>Add address and manager if applicable</li>
                <li>Toggle locations active/inactive as needed</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Common Tasks */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-slate-700" />
              Common Daily Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-sm text-slate-900 mb-1">📦 Finding an Item to Pick</h4>
                <p className="text-sm text-slate-600">Search by SKU or barcode → Check location → Verify quantity → Pick item</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-sm text-slate-900 mb-1">🔍 Checking Stock Availability</h4>
                <p className="text-sm text-slate-600">Use location filter → View all items in that area → Note quantities</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-sm text-slate-900 mb-1">⚠️ Identifying Low Stock Items</h4>
                <p className="text-sm text-slate-600">Use "Low Stock Only" filter → Review yellow badges → Notify purchasing</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-sm text-slate-900 mb-1">📥 Receiving New Inventory (Warehouse)</h4>
                <p className="text-sm text-slate-600">Record movement → Type: Purchase → Enter quantity → Select destination location → Add PO number in notes</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-sm text-slate-900 mb-1">🚚 Processing a Shipment (Warehouse)</h4>
                <p className="text-sm text-slate-600">Record movement → Type: Sale → Enter quantity → Select from location → Add order number in notes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <Barcode className="h-5 w-5" />
              Pro Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-700">
              <li>Use barcode scanner with the search box for quick lookups</li>
              <li>Check "Low Stock Only" filter at start of day to plan reorders</li>
              <li>Always verify location information before picking items</li>
              <li>Add detailed notes to movements for better tracking</li>
              <li>Filter by location to see everything in a specific area during cycle counts</li>
              <li>Out of stock items show red badges - prioritize restocking these</li>
              <li>Contact your admin if you need to add products or locations</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}