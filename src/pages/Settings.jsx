import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Key, CheckCircle, AlertCircle, Building2, Package, Bell, Warehouse, Palette, RefreshCw } from "lucide-react";
import BrandingSettings from "@/components/settings/BrandingSettings";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function Settings() {
  const queryClient = useQueryClient();
  
  // ShipStation API credentials
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Business settings
  const [businessName, setBusinessName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("America/Los_Angeles");

  // Inventory defaults
  const [defaultReorderPoint, setDefaultReorderPoint] = useState("10");
  const [defaultReorderQty, setDefaultReorderQty] = useState("50");
  const [lowStockThreshold, setLowStockThreshold] = useState("20");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState("");

  // Fetch current settings
  const { data: settings = [] } = useQuery({
    queryKey: ['appSettings'],
    queryFn: () => base44.entities.AppSettings.list(),
  });

  // Load settings into state
  useEffect(() => {
    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.setting_key] = s.setting_value;
    });

    if (settingsMap.business_name) setBusinessName(settingsMap.business_name);
    if (settingsMap.currency) setCurrency(settingsMap.currency);
    if (settingsMap.timezone) setTimezone(settingsMap.timezone);
    if (settingsMap.default_reorder_point) setDefaultReorderPoint(settingsMap.default_reorder_point);
    if (settingsMap.default_reorder_qty) setDefaultReorderQty(settingsMap.default_reorder_qty);
    if (settingsMap.low_stock_threshold) setLowStockThreshold(settingsMap.low_stock_threshold);
    if (settingsMap.email_notifications) setEmailNotifications(settingsMap.email_notifications === "true");
    if (settingsMap.low_stock_alerts) setLowStockAlerts(settingsMap.low_stock_alerts === "true");
    if (settingsMap.notification_email) setNotificationEmail(settingsMap.notification_email);
    
    // Check ShipStation connection status
    if (settingsMap.shipstation_last_sync) {
      setLastSync(settingsMap.shipstation_last_sync);
      setIsConnected(true);
    }
  }, [settings]);

  // Mutation to save settings
  const saveSetting = useMutation({
    mutationFn: async ({ key, value, type, description }) => {
      const existing = settings.find(s => s.setting_key === key);
      if (existing) {
        return base44.entities.AppSettings.update(existing.id, { setting_value: value });
      } else {
        return base44.entities.AppSettings.create({
          setting_key: key,
          setting_value: value,
          setting_type: type,
          description
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appSettings'] });
    },
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      toast.success("API credentials saved successfully");
      toast.info("ShipStation sync will start running automatically every 15 minutes");
      setApiKey("");
      setApiSecret("");
    } catch (error) {
      toast.error("Failed to save credentials");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBusinessSettings = async (e) => {
    e.preventDefault();
    try {
      await Promise.all([
        saveSetting.mutateAsync({ key: "business_name", value: businessName, type: "business", description: "Business name" }),
        saveSetting.mutateAsync({ key: "currency", value: currency, type: "business", description: "Default currency" }),
        saveSetting.mutateAsync({ key: "timezone", value: timezone, type: "business", description: "Business timezone" }),
      ]);
      toast.success("Business settings saved");
    } catch (error) {
      toast.error("Failed to save business settings");
    }
  };

  const handleSaveInventoryDefaults = async (e) => {
    e.preventDefault();
    try {
      await Promise.all([
        saveSetting.mutateAsync({ key: "default_reorder_point", value: defaultReorderPoint, type: "inventory", description: "Default reorder point for new products" }),
        saveSetting.mutateAsync({ key: "default_reorder_qty", value: defaultReorderQty, type: "inventory", description: "Default reorder quantity" }),
        saveSetting.mutateAsync({ key: "low_stock_threshold", value: lowStockThreshold, type: "inventory", description: "Low stock threshold percentage" }),
      ]);
      toast.success("Inventory defaults saved");
    } catch (error) {
      toast.error("Failed to save inventory defaults");
    }
  };

  const handleSaveNotifications = async (e) => {
    e.preventDefault();
    try {
      await Promise.all([
        saveSetting.mutateAsync({ key: "email_notifications", value: emailNotifications.toString(), type: "notification", description: "Enable email notifications" }),
        saveSetting.mutateAsync({ key: "low_stock_alerts", value: lowStockAlerts.toString(), type: "notification", description: "Enable low stock alerts" }),
        saveSetting.mutateAsync({ key: "notification_email", value: notificationEmail, type: "notification", description: "Email address for notifications" }),
      ]);
      toast.success("Notification settings saved");
    } catch (error) {
      toast.error("Failed to save notification settings");
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const result = await base44.functions.call("manual-shipstation-sync", {});
      
      if (result.success) {
        toast.success(`Synced ${result.orders_synced} orders from ShipStation`);
        const now = new Date().toISOString();
        setLastSync(now);
        setIsConnected(true);
        await saveSetting.mutateAsync({ 
          key: "shipstation_last_sync", 
          value: now, 
          type: "integration", 
          description: "Last ShipStation sync timestamp" 
        });
      } else {
        toast.error(result.error || "Sync failed");
      }
    } catch (error) {
      toast.error("Failed to sync: " + (error.message || "Unknown error"));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-slate-100 rounded-lg">
              <SettingsIcon className="h-6 w-6 text-slate-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          </div>
          <p className="text-slate-500 mt-1">Configure API integrations and system settings</p>
        </div>

        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Business
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Integrations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="branding">
            <BrandingSettings />
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Settings
            </CardTitle>
            <CardDescription>
              Configure your business information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveBusinessSettings} className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Your Business Name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Los_Angeles">Pacific (PST/PDT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain (MST/MDT)</SelectItem>
                      <SelectItem value="America/Chicago">Central (CST/CDT)</SelectItem>
                      <SelectItem value="America/New_York">Eastern (EST/EDT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
                Save Business Settings
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Inventory Defaults */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Defaults
            </CardTitle>
            <CardDescription>
              Set default values for inventory management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveInventoryDefaults} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="defaultReorderPoint">Default Reorder Point</Label>
                  <Input
                    id="defaultReorderPoint"
                    type="number"
                    value={defaultReorderPoint}
                    onChange={(e) => setDefaultReorderPoint(e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-1">Used when creating new products</p>
                </div>

                <div>
                  <Label htmlFor="defaultReorderQty">Default Reorder Quantity</Label>
                  <Input
                    id="defaultReorderQty"
                    type="number"
                    value={defaultReorderQty}
                    onChange={(e) => setDefaultReorderQty(e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-1">Suggested order quantity</p>
                </div>

                <div>
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold (%)</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-1">Alert when below this %</p>
                </div>
              </div>

              <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
                Save Inventory Defaults
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveNotifications} className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-xs text-slate-500">Receive email alerts for important events</p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Low Stock Alerts</Label>
                  <p className="text-xs text-slate-500">Get notified when products are running low</p>
                </div>
                <Switch
                  checked={lowStockAlerts}
                  onCheckedChange={setLowStockAlerts}
                />
              </div>

              <div>
                <Label htmlFor="notificationEmail">Notification Email</Label>
                <Input
                  id="notificationEmail"
                  type="email"
                  placeholder="notifications@yourbusiness.com"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-1">Where to send system notifications</p>
              </div>

              <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
                Save Notification Settings
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Storage Locations Link */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              Storage Locations
            </CardTitle>
            <CardDescription>
              Manage warehouses and storage locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Configure your storage locations, warehouses, and fulfillment centers for inventory tracking.
            </p>
            <Link to={createPageUrl("ProductManagement")}>
              <Button variant="outline">
                Manage Locations
              </Button>
            </Link>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
        {/* ShipStation Integration */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  ShipStation Integration
                </CardTitle>
                <CardDescription>
                  Connect your ShipStation account to automatically sync orders and update inventory
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  {isConnected ? (
                    <>
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700">Connected</span>
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 bg-slate-300 rounded-full"></div>
                      <span className="text-sm font-medium text-slate-500">Not Connected</span>
                    </>
                  )}
                </div>
                {lastSync && (
                  <p className="text-xs text-slate-500">
                    Last sync: {new Date(lastSync).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">How to get your API credentials:</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800">
                    <li>Log into your ShipStation account</li>
                    <li>Go to Settings → Account → API Settings</li>
                    <li>Generate new API Keys if needed</li>
                    <li>Copy your API Key and API Secret below</li>
                  </ol>
                  <p className="mt-2 font-medium">Note: This requires backend functions to be enabled in your app settings.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="apiKey">API Key *</Label>
                <Input
                  id="apiKey"
                  type="text"
                  placeholder="Enter your ShipStation API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="apiSecret">API Secret *</Label>
                <Input
                  id="apiSecret"
                  type="password"
                  placeholder="Enter your ShipStation API Secret"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  disabled={isSaving || !apiKey || !apiSecret}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  {isSaving ? "Saving..." : "Save API Credentials"}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? "Syncing..." : "Sync Now"}
                </Button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-900">
                  <p className="font-medium mb-1">What happens after you save:</p>
                  <ul className="list-disc list-inside space-y-1 text-green-800">
                    <li>Orders sync automatically every 15 minutes (scheduled in backend)</li>
                    <li>Transactions created for each order</li>
                    <li>Inventory deducted automatically</li>
                    <li>Inventory movements recorded</li>
                    <li>Customer records created/updated</li>
                  </ul>
                  <p className="mt-2 text-xs text-green-700">
                    Note: Sync interval is configured in the backend function schedule (currently 15 min)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backend Functions Notice */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-900">
                <p className="font-medium mb-1">Backend Functions Required</p>
                <p>
                  To use the ShipStation integration and other advanced features, you need to enable 
                  <strong> Backend Functions</strong> in your Base44 app dashboard under Settings.
                  Once enabled, you can configure secrets and scheduled functions will run automatically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}