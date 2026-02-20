import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Warehouse, 
  Users,
  BookOpen,
  History,
  Settings,
  BarChart3,
  LogOut, 
  Menu, 
  X 
} from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [branding, setBranding] = useState({
    app_name: "Business Dashboard",
    primary_color: "#0f172a",
    secondary_color: "#3b82f6",
    logo_url: ""
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
    
    // Load branding settings
    base44.entities.AppSettings.list().then(settings => {
      const brandingSettings = {};
      settings.forEach(setting => {
        if (setting.setting_type === 'branding') {
          brandingSettings[setting.setting_key] = setting.setting_value;
        }
      });
      if (Object.keys(brandingSettings).length > 0) {
        setBranding(prev => ({ ...prev, ...brandingSettings }));
      }
    }).catch(() => {});
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  if (!user) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  const isAdmin = user.role === "admin";
  const isExecutive = user.role === "executive" || isAdmin;
  const isWarehouse = user.role === "warehouse" || user.role === "fulfillment" || isAdmin;

  const navigation = [
    ...(isExecutive ? [
      { name: "Dashboard", href: createPageUrl("Dashboard"), icon: LayoutDashboard, show: true },
      { name: "Advanced Analytics", href: createPageUrl("AdvancedAnalytics"), icon: BarChart3, show: true }
    ] : []),
    ...(isWarehouse ? [
      { name: "Warehouse Inventory", href: createPageUrl("WarehouseInventory"), icon: Warehouse, show: true },
      { name: "Advanced Inventory", href: createPageUrl("AdvancedInventory"), icon: Package, show: true }
    ] : []),
    { name: "Product Management", href: createPageUrl("ProductManagement"), icon: Package, show: isAdmin || isWarehouse },
    { name: "Inventory History", href: createPageUrl("InventoryHistory"), icon: History, show: isAdmin || isWarehouse || isExecutive },
    { name: "Financial Reports", href: createPageUrl("FinancialReports"), icon: FileText, show: isExecutive },
    { name: "Customers", href: createPageUrl("CustomerManagement"), icon: Users, show: isExecutive || isAdmin },
    { name: "User Management", href: createPageUrl("UserManagement"), icon: Users, show: isAdmin },
    { name: "Settings", href: createPageUrl("Settings"), icon: Settings, show: isAdmin },
    { name: "Admin Guide", href: createPageUrl("AdminGuide"), icon: BookOpen, show: isAdmin },
    { name: "Warehouse Guide", href: createPageUrl("WarehouseGuide"), icon: BookOpen, show: isWarehouse || isUser }
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        :root {
          --brand-primary: ${branding.primary_color};
          --brand-secondary: ${branding.secondary_color};
          --brand-accent: ${branding.accent_color || '#10b981'};
        }
      `}</style>
      
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand */}
            <div className="flex items-center gap-3">
              {branding.logo_url && (
                <img src={branding.logo_url} alt="Logo" className="h-8 w-8 object-contain" />
              )}
              <h1 className="text-xl font-bold" style={{ color: branding.primary_color }}>
                {branding.app_name}
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.name;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                    style={isActive ? { backgroundColor: branding.primary_color } : {}}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user.full_name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-3 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.name;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                      isActive
                        ? "text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                    style={isActive ? { backgroundColor: branding.primary_color } : {}}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between px-4 py-2 mb-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{user.full_name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <Button onClick={handleLogout} variant="outline" size="sm" className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}