import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { localApiClient } from '../utils/localApi';
import { toast } from 'sonner';
import { useWalletAuth } from '../hooks/useWalletAuth';
import { MapPin, Coins, Building2, TrendingUp } from 'lucide-react';

interface SellPlotFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  demoMode?: boolean;
  onSuccess?: () => void;
}

export function SellPlotForm({ open = true, onOpenChange, demoMode = false, onSuccess }: SellPlotFormProps) {
  const { user } = useWalletAuth();
  const [loading, setLoading] = useState(false);
  const [ownedPlots, setOwnedPlots] = useState<any[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  const [salePrice, setSalePrice] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const fetchOwnedPlots = async () => {
      if (demoMode) {
        setOwnedPlots([
          { id: '3', location: 'F-7, Islamabad', city: 'Islamabad', status: 'occupied', price: 600, ownerId: 'demo-user', purchasedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
          { id: '9', location: 'DHA Phase 5, Karachi', city: 'Karachi', status: 'occupied', price: 700, ownerId: 'demo-user', purchasedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() }
        ]);
        return;
      }

      try {
        const plots = await localApiClient.getChargingPlots();
        const myPlots = plots.filter(p => p.ownerId === user?.id && p.status === 'occupied');
        setOwnedPlots(myPlots);
      } catch (error) {
        console.error('Failed to fetch owned plots:', error);
        toast.error('Failed to load your plots');
      }
    };

    if (open) {
      fetchOwnedPlots();
    }
  }, [open, demoMode, user]);

  const handleListForSale = async () => {
    if (!selectedPlot) return;

    if (!salePrice || parseFloat(salePrice) <= 0) {
      toast.error('Please enter a valid sale price');
      return;
    }

    if (!user && !demoMode) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const price = parseFloat(salePrice);
      
      if (demoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success(`Plot listed for sale at ${price} BUILD tokens!`);
      } else {
        await localApiClient.sellPlot(selectedPlot.id, price);
        toast.success('Plot listed successfully on the marketplace!');
      }

      setShowConfirmDialog(false);
      setSelectedPlot(null);
      setSalePrice('');
      
      if (onOpenChange) {
        onOpenChange(false);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to list plot for sale');
    } finally {
      setLoading(false);
    }
  };

  const isStandalone = onOpenChange === undefined;
  const purchasedDaysAgo = selectedPlot?.purchasedAt 
    ? Math.floor((Date.now() - new Date(selectedPlot.purchasedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const minSuggestedPrice = selectedPlot ? Math.floor(selectedPlot.price * 0.8) : 0;
  const maxSuggestedPrice = selectedPlot ? Math.ceil(selectedPlot.price * 1.3) : 0;
  
  const content = (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Your Owned Plots
        </h3>
        
        {ownedPlots.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">You don't own any plots yet</p>
            <p className="text-sm text-gray-500 mt-1">Purchase a plot first to list it for sale</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
            {ownedPlots.map((plot) => (
              <Card 
                key={plot.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedPlot?.id === plot.id ? 'border-emerald-500 ring-2 ring-emerald-200' : ''
                }`}
                onClick={() => setSelectedPlot(plot)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        {plot.location}
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {plot.city}
                      </CardDescription>
                      {plot.purchasedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Purchased {Math.floor((Date.now() - new Date(plot.purchasedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Cost: {plot.price} BUILD
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedPlot && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Pricing Suggestion
            </h4>
            <p className="text-xs text-blue-700">
              Original purchase price: <span className="font-bold">{selectedPlot.price} BUILD</span>
            </p>
            <p className="text-xs text-blue-700">
              Suggested range: <span className="font-bold">{minSuggestedPrice} - {maxSuggestedPrice} BUILD</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salePrice">Sale Price (BUILD Tokens) *</Label>
            <Input
              id="salePrice"
              type="number"
              placeholder={`e.g., ${selectedPlot.price}`}
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              min={0}
            />
            <p className="text-xs text-gray-500">
              Set a competitive price to attract buyers
            </p>
          </div>

          {salePrice && parseFloat(salePrice) > 0 && (
            <div className="p-4 bg-gray-50 border rounded-lg space-y-3">
              <h4 className="font-semibold text-sm">Sale Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plot Location</span>
                  <span className="font-medium">{selectedPlot.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Original Price</span>
                  <span className="font-medium">{selectedPlot.price} BUILD</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Your Sale Price</span>
                  <span className="font-bold text-emerald-600">{parseFloat(salePrice)} BUILD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Potential Profit/Loss</span>
                  <span className={`font-medium ${parseFloat(salePrice) >= selectedPlot.price ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(salePrice) >= selectedPlot.price ? '+' : ''}{(parseFloat(salePrice) - selectedPlot.price).toFixed(0)} BUILD 
                    ({((parseFloat(salePrice) / selectedPlot.price - 1) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <Button 
        onClick={() => setShowConfirmDialog(true)}
        disabled={!selectedPlot || !salePrice || parseFloat(salePrice) <= 0 || loading}
        className="w-full"
      >
        {loading ? 'Listing...' : 'List Plot for Sale'}
      </Button>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Plot Listing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              List your plot at <span className="font-bold">{selectedPlot?.location}</span> for sale at <span className="font-bold text-emerald-600">{salePrice} BUILD tokens</span>?
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                Once listed, your plot will appear on the marketplace. You won't be able to install new chargers until the listing is removed or sold.
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleListForSale}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Listing...' : 'Confirm Listing'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  if (isStandalone) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
            Sell Charging Plot
          </h2>
          <p className="text-muted-foreground mt-1">
            List your owned plots for sale on the marketplace
          </p>
        </div>
        {content}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Sell Charging Plot
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
