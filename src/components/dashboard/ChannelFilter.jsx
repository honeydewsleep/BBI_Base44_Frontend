import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Building2, ShoppingCart } from "lucide-react";

export default function ChannelFilter({ value, onChange }) {
  return (
    <Tabs value={value} onValueChange={onChange} className="w-auto">
      <TabsList className="bg-white border border-slate-200 p-1">
        <TabsTrigger 
          value="all" 
          className="data-[state=active]:bg-slate-900 data-[state=active]:text-white gap-2"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">Global View</span>
          <span className="sm:hidden">All</span>
        </TabsTrigger>
        <TabsTrigger 
          value="wholesale" 
          className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white gap-2"
        >
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">Wholesale</span>
          <span className="sm:hidden">B2B</span>
        </TabsTrigger>
        <TabsTrigger 
          value="d2c" 
          className="data-[state=active]:bg-violet-600 data-[state=active]:text-white gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">Direct to Consumer</span>
          <span className="sm:hidden">D2C</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}