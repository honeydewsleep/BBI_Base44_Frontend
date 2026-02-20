import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Upload, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function BrandingSettings() {
  const [formData, setFormData] = useState({
    app_name: "Business Dashboard",
    primary_color: "#0f172a",
    secondary_color: "#3b82f6",
    accent_color: "#10b981",
    logo_url: ""
  });
  const [uploading, setUploading] = useState(false);

  const queryClient = useQueryClient();

  const { data: settings = [] } = useQuery({
    queryKey: ['appSettings'],
    queryFn: () => base44.entities.AppSettings.list(),
  });

  useEffect(() => {
    if (settings.length > 0) {
      const brandingSettings = {};
      settings.forEach(setting => {
        if (setting.setting_type === 'branding') {
          brandingSettings[setting.setting_key] = setting.setting_value;
        }
      });
      setFormData(prev => ({ ...prev, ...brandingSettings }));
    }
  }, [settings]);

  const saveSetting = async (key, value, type = 'branding', description = '') => {
    const existing = settings.find(s => s.setting_key === key);
    if (existing) {
      await base44.entities.AppSettings.update(existing.id, { setting_value: value });
    } else {
      await base44.entities.AppSettings.create({
        setting_key: key,
        setting_value: value,
        setting_type: type,
        description
      });
    }
  };

  const updateSettings = useMutation({
    mutationFn: async (data) => {
      await saveSetting('app_name', data.app_name, 'branding', 'Application name');
      await saveSetting('primary_color', data.primary_color, 'branding', 'Primary brand color');
      await saveSetting('secondary_color', data.secondary_color, 'branding', 'Secondary brand color');
      await saveSetting('accent_color', data.accent_color, 'branding', 'Accent color');
      if (data.logo_url) {
        await saveSetting('logo_url', data.logo_url, 'branding', 'Company logo URL');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['appSettings']);
      toast.success("Branding updated successfully");
      window.location.reload(); // Reload to apply changes
    },
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, logo_url: result.file_url });
      toast.success("Logo uploaded");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-600" />
          <CardTitle>Branding & Appearance</CardTitle>
        </div>
        <CardDescription>Customize your dashboard's look and feel</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* App Name */}
          <div>
            <Label>Application Name</Label>
            <Input
              value={formData.app_name}
              onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
              placeholder="Business Dashboard"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <Label>Company Logo</Label>
            <div className="flex items-center gap-4">
              {formData.logo_url && (
                <img 
                  src={formData.logo_url} 
                  alt="Logo" 
                  className="h-16 w-16 object-contain border rounded"
                />
              )}
              <div className="flex-1">
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 border-2 border-dashed rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <Upload className="h-5 w-5 text-slate-400" />
                    <span className="text-sm text-slate-600">
                      {uploading ? "Uploading..." : "Click to upload logo"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Color Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Primary Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  placeholder="#0f172a"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Navigation & headers</p>
            </div>

            <div>
              <Label>Secondary Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <Input
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Buttons & links</p>
            </div>

            <div>
              <Label>Accent Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.accent_color}
                  onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <Input
                  value={formData.accent_color}
                  onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                  placeholder="#10b981"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Highlights & success</p>
            </div>
          </div>

          {/* Preview */}
          <div className="border rounded-lg p-4 bg-slate-50">
            <p className="text-sm font-medium mb-3">Preview</p>
            <div className="space-y-2">
              <div 
                className="p-3 rounded text-white"
                style={{ backgroundColor: formData.primary_color }}
              >
                Primary: {formData.app_name}
              </div>
              <div 
                className="p-3 rounded text-white"
                style={{ backgroundColor: formData.secondary_color }}
              >
                Secondary: Buttons & Actions
              </div>
              <div 
                className="p-3 rounded text-white"
                style={{ backgroundColor: formData.accent_color }}
              >
                Accent: Success States
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={updateSettings.isPending}
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {updateSettings.isPending ? "Applying Changes..." : "Apply Branding"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}