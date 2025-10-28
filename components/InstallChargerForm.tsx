import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { localApiClient } from '../utils/localApi';
import { toast } from 'sonner';
import { useWalletAuth } from '../hooks/useWalletAuth';
import { Zap } from 'lucide-react';
import { PurchasePlotForm } from './PurchasePlotForm';

interface InstallChargerFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  demoMode?: boolean;
  onSuccess?: () => void;
}

export function InstallChargerForm({ open = true, onOpenChange, demoMode = false, onSuccess }: InstallChargerFormProps) {
  const { user } = useWalletAuth();
  const [loading, setLoading] = useState(false);
  const [userPlots, setUserPlots] = useState<any[]>([]);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [formData, setFormData] = useState({
    plotId: '',
    name: '',
    type: '',
    powerOutput: '',
    pricingModel: 'per_kwh',
    perKwh: '',
    perSecond: ''
  });

  const chargerTypes = [
    { value: 'level1', label: 'Level 1 (3.3 kW)', power: 3.3, cost: 100 },
    { value: 'level2', label: 'Level 2 (7.2 kW)', power: 7.2, cost: 250 },
    { value: 'dcfast', label: 'DC Fast (50 kW)', power: 50, cost: 500 },
    { value: 'tesla_supercharger', label: 'Tesla Supercharger (150 kW)', power: 150, cost: 1000 }
  ];

  useEffect(() => {
    const fetchUserPlots = async () => {
      if (demoMode) {
        setUserPlots([
          { id: '1', location: 'F-7, Islamabad', city: 'Islamabad' },
          { id: '2', location: 'DHA Phase 5, Karachi', city: 'Karachi' }
        ]);
        return;
      }

      try {
        const plots = await localApiClient.getChargingPlots();
        const myPlots = plots.filter(p => p.ownerId === user?.id && p.status === 'occupied');
        setUserPlots(myPlots);
      } catch (error) {
        console.error('Failed to fetch plots:', error);
      }
    };

    if (open) {
      fetchUserPlots();
    }
  }, [open, demoMode, user]);

  const selectedChargerType = chargerTypes.find(t => t.value === formData.type);
  const installCost = selectedChargerType?.cost || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.plotId || !formData.name || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.pricingModel === 'per_kwh' && !formData.perKwh) {
      toast.error('Please set price per kWh');
      return;
    }

    if (formData.pricingModel === 'per_second' && !formData.perSecond) {
      toast.error('Please set price per second');
      return;
    }

    setLoading(true);
    try {
      const chargerData = {
        plotId: formData.plotId,
        name: formData.name,
        type: formData.type,
        powerOutput: selectedChargerType?.power || 0,
        status: 'online',
        pricing: {
          model: formData.pricingModel,
          perKwh: formData.pricingModel === 'per_kwh' ? parseFloat(formData.perKwh) : undefined,
          perSecond: formData.pricingModel === 'per_second' ? parseFloat(formData.perSecond) : undefined
        },
        installCost
      };

      if (demoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success(`Charger "${formData.name}" installed successfully!`);
      } else {
        await localApiClient.installCharger(chargerData);
        toast.success('Charger installed successfully!');
      }

      setFormData({
        plotId: '',
        name: '',
        type: '',
        powerOutput: '',
        pricingModel: 'per_kwh',
        perKwh: '',
        perSecond: ''
      });
      onOpenChange?.(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to install charger');
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
          {userPlots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You don't own any plots yet.</p>
              <p className="text-sm text-gray-500 mb-4">Purchase a plot first to install chargers.</p>
              <Button type="button" onClick={() => setShowPurchaseDialog(true)}>
                Purchase a Plot
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="plotId">Select Plot *</Label>
                <Select value={formData.plotId} onValueChange={(value) => setFormData({ ...formData, plotId: value })}>
                  <SelectTrigger className="bg-white z-[200]">
                    <SelectValue placeholder="Choose your plot" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-[200]">
                    {userPlots.map((plot) => (
                      <SelectItem key={plot.id} value={plot.id}>
                        {plot.location}, {plot.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Charger Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Downtown Karachi Supercharger"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Charger Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-white z-[200]">
                    <SelectValue placeholder="Select charger type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-[200]">
                    {chargerTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} - {type.cost} BUILD
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricingModel">Pricing Model *</Label>
                <Select value={formData.pricingModel} onValueChange={(value) => setFormData({ ...formData, pricingModel: value })}>
                  <SelectTrigger className="bg-white z-[200]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-[200]">
                    <SelectItem value="per_kwh">Per kWh (Energy-based)</SelectItem>
                    <SelectItem value="per_second">Per Second (Time-based)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.pricingModel === 'per_kwh' ? (
                <div className="space-y-2">
                  <Label htmlFor="perKwh">Price per kWh (PKR) *</Label>
                  <Input
                    id="perKwh"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 50"
                    value={formData.perKwh}
                    onChange={(e) => setFormData({ ...formData, perKwh: e.target.value })}
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="perSecond">Price per Second (PKR) *</Label>
                  <Input
                    id="perSecond"
                    type="number"
                    step="0.001"
                    placeholder="e.g., 0.5"
                    value={formData.perSecond}
                    onChange={(e) => setFormData({ ...formData, perSecond: e.target.value })}
                    required
                  />
                </div>
              )}

              {selectedChargerType && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Power Output</span>
                    <span className="font-medium">{selectedChargerType.power} kW</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-emerald-200 pt-2">
                    <span className="font-semibold">Installation Cost</span>
                    <span className="font-bold text-emerald-600">{installCost} BUILD</span>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={loading || userPlots.length === 0}>
                  {loading ? 'Installing...' : `Install Charger (${installCost} BUILD)`}
                </Button>
              </div>
            </>
          )}
    </form>
  );

  // If no onOpenChange prop, render as standalone (for use in tabs)
  if (!onOpenChange) {
    return (
      <>
        <div className="max-w-[500px] mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              Install EV Charger
            </h2>
            <p className="text-gray-600 mt-2">Deploy charging stations on your owned plots</p>
          </div>
          {formContent}
        </div>

        <PurchasePlotForm 
          open={showPurchaseDialog} 
          onOpenChange={setShowPurchaseDialog}
          demoMode={demoMode}
          onSuccess={async () => {
            const plots = await localApiClient.getChargingPlots();
            const myPlots = plots.filter((p: any) => p.ownerId === user?.id && p.status === 'occupied');
            setUserPlots(myPlots);
          }}
        />
      </>
    );
  }

  // Modal mode with Dialog wrapper
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white z-[200]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Install EV Charger
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>

      <PurchasePlotForm 
        open={showPurchaseDialog} 
        onOpenChange={setShowPurchaseDialog}
        demoMode={demoMode}
        onSuccess={async () => {
          const plots = await localApiClient.getChargingPlots();
          const myPlots = plots.filter((p: any) => p.ownerId === user?.id && p.status === 'occupied');
          setUserPlots(myPlots);
        }}
      />
    </>
  );
}
