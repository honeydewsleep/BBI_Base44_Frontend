import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, MapPin, Building2, Package, Warehouse } from "lucide-react";

const LOCATION_ICONS = {
  warehouse: Warehouse,
  production: Package,
  stock: Building2,
  retail: Building2,
  other: MapPin
};

export default function LocationList({ locations, onEdit, isLoading }) {
  if (isLoading) {
    return <div className="text-center py-8 text-slate-500">Loading locations...</div>;
  }

  if (locations.length === 0) {
    return (
      <Card className="p-12 text-center">
        <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No locations yet</h3>
        <p className="text-slate-500">Add your first location to track inventory</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {locations.map((location) => {
        const Icon = LOCATION_ICONS[location.type] || MapPin;
        
        return (
          <Card key={location.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Icon className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{location.name}</h3>
                  <Badge variant="outline" className="text-xs mt-1 capitalize">
                    {location.type}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onEdit(location)}>
                <Edit className="h-4 w-4 text-slate-500" />
              </Button>
            </div>

            <div className="space-y-2 text-sm">
              {location.address && (
                <p className="text-slate-600 text-xs line-clamp-2">{location.address}</p>
              )}
              {location.manager && (
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Manager:</span>
                  <span className="font-medium text-slate-900">{location.manager}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <Badge variant={location.is_active ? "default" : "outline"} className="text-xs">
                  {location.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}