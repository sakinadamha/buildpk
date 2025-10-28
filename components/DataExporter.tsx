import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Download, 
  FileText, 
  Database, 
  CheckCircle,
  Wifi,
  Truck,
  Sprout,
  Heart,
  Building
} from 'lucide-react';
import { localDb } from '../utils/localDb';
import { toast } from 'sonner';

interface ExportOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  format: 'csv' | 'json';
  dataType: 'hotspots' | 'partners' | 'farms' | 'healthcare' | 'tax' | 'analytics' | 'all';
}

export function DataExporter() {
  const [exporting, setExporting] = useState<string | null>(null);

  const exportOptions: ExportOption[] = [
    {
      id: 'wifi-csv',
      name: 'WiFi Hotspots (CSV)',
      description: 'Export all WiFi hotspot data',
      icon: <Wifi className="h-5 w-5 text-emerald-600" />,
      format: 'csv',
      dataType: 'hotspots',
    },
    {
      id: 'wifi-json',
      name: 'WiFi Hotspots (JSON)',
      description: 'Export all WiFi hotspot data',
      icon: <Wifi className="h-5 w-5 text-emerald-600" />,
      format: 'json',
      dataType: 'hotspots',
    },
    {
      id: 'logistics-csv',
      name: 'Delivery Partners (CSV)',
      description: 'Export logistics partner data',
      icon: <Truck className="h-5 w-5 text-blue-600" />,
      format: 'csv',
      dataType: 'partners',
    },
    {
      id: 'logistics-json',
      name: 'Delivery Partners (JSON)',
      description: 'Export logistics partner data',
      icon: <Truck className="h-5 w-5 text-blue-600" />,
      format: 'json',
      dataType: 'partners',
    },
    {
      id: 'agriculture-csv',
      name: 'Agricultural Farms (CSV)',
      description: 'Export farm monitoring data',
      icon: <Sprout className="h-5 w-5 text-amber-600" />,
      format: 'csv',
      dataType: 'farms',
    },
    {
      id: 'agriculture-json',
      name: 'Agricultural Farms (JSON)',
      description: 'Export farm monitoring data',
      icon: <Sprout className="h-5 w-5 text-amber-600" />,
      format: 'json',
      dataType: 'farms',
    },
    {
      id: 'healthcare-csv',
      name: 'Healthcare Providers (CSV)',
      description: 'Export healthcare provider data',
      icon: <Heart className="h-5 w-5 text-pink-600" />,
      format: 'csv',
      dataType: 'healthcare',
    },
    {
      id: 'healthcare-json',
      name: 'Healthcare Providers (JSON)',
      description: 'Export healthcare provider data',
      icon: <Heart className="h-5 w-5 text-pink-600" />,
      format: 'json',
      dataType: 'healthcare',
    },
    {
      id: 'taxation-csv',
      name: 'Tax Collection Points (CSV)',
      description: 'Export taxation infrastructure data',
      icon: <Building className="h-5 w-5 text-purple-600" />,
      format: 'csv',
      dataType: 'tax',
    },
    {
      id: 'taxation-json',
      name: 'Tax Collection Points (JSON)',
      description: 'Export taxation infrastructure data',
      icon: <Building className="h-5 w-5 text-purple-600" />,
      format: 'json',
      dataType: 'tax',
    },
    {
      id: 'all-json',
      name: 'Complete Database (JSON)',
      description: 'Export all BuildPK data',
      icon: <Database className="h-5 w-5 text-gray-600" />,
      format: 'json',
      dataType: 'all',
    },
  ];

  const exportData = async (option: ExportOption) => {
    setExporting(option.id);
    
    try {
      let data: any;
      let filename: string;

      // Get data based on type
      switch (option.dataType) {
        case 'hotspots':
          data = localDb.getHotspots();
          filename = `buildpk-hotspots-${Date.now()}`;
          break;
        case 'partners':
          data = localDb.getDeliveryPartners();
          filename = `buildpk-partners-${Date.now()}`;
          break;
        case 'farms':
          data = localDb.getFarms();
          filename = `buildpk-farms-${Date.now()}`;
          break;
        case 'healthcare':
          data = localDb.getHealthcareProviders();
          filename = `buildpk-healthcare-${Date.now()}`;
          break;
        case 'tax':
          data = localDb.getTaxCollectionPoints();
          filename = `buildpk-taxation-${Date.now()}`;
          break;
        case 'all':
          data = {
            hotspots: localDb.getHotspots(),
            partners: localDb.getDeliveryPartners(),
            farms: localDb.getFarms(),
            healthcare: localDb.getHealthcareProviders(),
            tax: localDb.getTaxCollectionPoints(),
            users: localDb.getAllUsers(),
            exportedAt: new Date().toISOString(),
          };
          filename = `buildpk-complete-${Date.now()}`;
          break;
        default:
          throw new Error('Invalid data type');
      }

      // Export based on format
      if (option.format === 'json') {
        downloadJSON(data, `${filename}.json`);
      } else {
        downloadCSV(data, `${filename}.csv`);
      }

      toast.success(`Successfully exported ${option.name}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setExporting(null);
    }
  };

  const downloadJSON = (data: any, filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value ?? '');
          if (stringValue.includes(',') || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-emerald-600" />
          Data Export Center
        </CardTitle>
        <CardDescription>
          Export your infrastructure and analytics data in CSV or JSON format
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exportOptions.map((option) => (
            <div
              key={option.id}
              className="border rounded-lg p-4 hover:border-emerald-300 transition-colors bg-white"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {option.icon}
                  <Badge variant="outline" className="text-xs">
                    {option.format.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <h3 className="font-semibold text-sm mb-1">{option.name}</h3>
              <p className="text-xs text-gray-600 mb-4">{option.description}</p>
              
              <Button
                size="sm"
                className="w-full"
                onClick={() => exportData(option)}
                disabled={exporting === option.id}
              >
                {exporting === option.id ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-sm text-blue-900">Data Privacy</h4>
              <p className="text-xs text-blue-700 mt-1">
                All exported data is processed locally on your device. No data is sent to external servers.
                Exports include only the data you have access to in your current session.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
