import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download, FileSpreadsheet, Link as LinkIcon, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ProductImport({ open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [googleSheetUrl, setGoogleSheetUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);

  const downloadTemplate = () => {
    const template = [
      ["sku", "barcode", "name", "description", "category", "cost", "retail_price", "wholesale_price", "current_stock", "reorder_point", "reorder_quantity", "weight", "weight_unit", "supplier", "lead_time_days", "is_active"],
      ["PROD-001", "012345678901", "Sample Product", "Product description", "Electronics", "50.00", "99.99", "75.00", "100", "20", "50", "2.5", "lb", "Acme Supplier", "14", "true"],
      ["PROD-002", "012345678902", "Another Product", "Another description", "Apparel", "25.00", "49.99", "35.00", "50", "10", "25", "1.0", "lb", "Best Supplier", "7", "true"]
    ];

    const csv = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product_import_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setGoogleSheetUrl("");
    }
  };

  const processImport = async (fileUrl) => {
    const schema = {
      type: "array",
      items: {
        type: "object",
        properties: {
          sku: { type: "string" },
          barcode: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          cost: { type: "number" },
          retail_price: { type: "number" },
          wholesale_price: { type: "number" },
          current_stock: { type: "number" },
          reorder_point: { type: "number" },
          reorder_quantity: { type: "number" },
          weight: { type: "number" },
          weight_unit: { type: "string" },
          supplier: { type: "string" },
          lead_time_days: { type: "number" },
          is_active: { type: "boolean" }
        }
      }
    };

    const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url: fileUrl,
      json_schema: schema
    });

    if (result.status === "error") {
      throw new Error(result.details || "Failed to parse file");
    }

    return result.output;
  };

  const handleImport = async () => {
    try {
      setImporting(true);
      setResults(null);

      let fileUrl;

      if (file) {
        const uploadResult = await base44.integrations.Core.UploadFile({ file });
        fileUrl = uploadResult.file_url;
      } else if (googleSheetUrl) {
        // For Google Sheets, we can use the URL directly
        fileUrl = googleSheetUrl;
      } else {
        toast.error("Please select a file or enter a Google Sheets URL");
        return;
      }

      const products = await processImport(fileUrl);

      if (!products || products.length === 0) {
        toast.error("No valid products found in file");
        return;
      }

      // Create products in bulk
      const created = await base44.entities.Product.bulkCreate(products);

      setResults({
        success: true,
        count: created.length,
        products: created
      });

      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Successfully imported ${created.length} products`);

    } catch (error) {
      console.error("Import error:", error);
      toast.error(error.message || "Failed to import products");
      setResults({
        success: false,
        error: error.message
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setGoogleSheetUrl("");
    setResults(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Products
          </DialogTitle>
        </DialogHeader>

        {!results ? (
          <div className="space-y-6 mt-4">
            {/* Template Download */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 mb-1">Need a template?</p>
                  <p className="text-xs text-slate-600">Download our CSV template with sample data</p>
                </div>
                <Button onClick={downloadTemplate} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Template
                </Button>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Upload CSV or Excel File</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {file && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                )}
              </div>
              {file && (
                <p className="text-xs text-slate-600">Selected: {file.name}</p>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-slate-200" />
              <span className="text-xs text-slate-500">OR</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            {/* Google Sheets URL */}
            <div className="space-y-2">
              <Label htmlFor="sheet-url">Google Sheets URL (Public or Exported as CSV)</Label>
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <Input
                  id="sheet-url"
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/..."
                  value={googleSheetUrl}
                  onChange={(e) => {
                    setGoogleSheetUrl(e.target.value);
                    setFile(null);
                  }}
                />
              </div>
              <p className="text-xs text-slate-500">
                Paste a link to a public Google Sheet or CSV export URL
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1" 
                onClick={handleClose}
                disabled={importing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleImport}
                disabled={importing || (!file && !googleSheetUrl)}
                className="flex-1 bg-slate-900 hover:bg-slate-800"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Products
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {results.success ? (
              <div className="text-center py-6">
                <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Import Successful!
                </h3>
                <p className="text-sm text-slate-600">
                  Successfully imported {results.count} product{results.count !== 1 ? 's' : ''}
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="mx-auto w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Import Failed
                </h3>
                <p className="text-sm text-slate-600">{results.error}</p>
              </div>
            )}
            <Button onClick={handleClose} className="w-full bg-slate-900">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}