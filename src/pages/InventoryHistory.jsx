import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Search, Package, MapPin, History } from "lucide-react";
import { format } from "date-fns";

export default function InventoryHistory() {
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: snapshots = [], isLoading } = useQuery({
    queryKey: ["inventory-snapshots", selectedDate],
    queryFn: () => {
      if (selectedDate) {
        return base44.entities.InventorySnapshot.filter({ snapshot_date: selectedDate });
      }
      return [];
    },
    enabled: !!selectedDate
  });

  const { data: availableDates = [] } = useQuery({
    queryKey: ["snapshot-dates"],
    queryFn: async () => {
      const allSnapshots = await base44.entities.InventorySnapshot.list("-snapshot_date", 1000);
      const uniqueDates = [...new Set(allSnapshots.map(s => s.snapshot_date))];
      return uniqueDates.sort((a, b) => b.localeCompare(a));
    }
  });

  const filteredSnapshots = snapshots.filter(s =>
    !searchTerm || 
    s.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = filteredSnapshots.reduce((sum, s) => sum + (s.total_stock * (s.cost || 0)), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <History className="h-6 w-6 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Inventory History</h1>
          </div>
          <p className="text-slate-500 mt-1">View daily inventory snapshots captured at 11:59 PM PST</p>
        </div>

        {/* Date Selector */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-700 mb-2 block">Select Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full"
                />
                {availableDates.length > 0 && (
                  <p className="text-xs text-slate-500 mt-2">
                    Available snapshots from {format(new Date(availableDates[availableDates.length - 1]), 'MMM d, yyyy')} to {format(new Date(availableDates[0]), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Recent Snapshots</label>
                <div className="flex flex-wrap gap-2">
                  {availableDates.slice(0, 5).map(date => (
                    <Button
                      key={date}
                      variant={selectedDate === date ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDate(date)}
                    >
                      {format(new Date(date), 'MMM d')}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedDate && (
          <>
            {/* Summary */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Snapshot Date</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {format(new Date(selectedDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Products</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{filteredSnapshots.length}</p>
                    </div>
                    <Package className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Total Inventory Value</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <History className="h-8 w-8 text-violet-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Snapshot</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-center text-slate-500 py-8">Loading...</p>
                ) : filteredSnapshots.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No inventory data for this date</p>
                ) : (
                  <div className="space-y-3">
                    {filteredSnapshots.map((snapshot) => (
                      <div
                        key={snapshot.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900">{snapshot.product_name}</h3>
                            <Badge variant="outline">{snapshot.sku}</Badge>
                          </div>
                          
                          {snapshot.location_breakdown && snapshot.location_breakdown.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {snapshot.location_breakdown.map((loc, idx) => (
                                <div key={idx} className="flex items-center gap-1 text-xs bg-slate-100 px-2 py-1 rounded">
                                  <MapPin className="h-3 w-3 text-slate-400" />
                                  <span className="text-slate-600">{loc.location_name}:</span>
                                  <span className="font-medium text-slate-900">{loc.quantity}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="text-right ml-4">
                          <p className="text-2xl font-bold text-slate-900">{snapshot.total_stock}</p>
                          <p className="text-xs text-slate-500">units</p>
                          {snapshot.cost && (
                            <p className="text-sm text-slate-600 mt-1">
                              ${(snapshot.total_stock * snapshot.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {!selectedDate && availableDates.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <History className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Snapshots Yet</h3>
              <p className="text-slate-500">
                Daily snapshots are captured at 11:59 PM PST. Check back tomorrow to see your first snapshot.
              </p>
            </CardContent>
          </Card>
        )}

        {!selectedDate && availableDates.length > 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Select a Date</h3>
              <p className="text-slate-500">Choose a date above to view historical inventory data</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}