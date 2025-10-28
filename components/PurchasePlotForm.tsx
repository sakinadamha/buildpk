import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { localApiClient } from '../utils/localApi';
import { toast } from 'sonner';
import { useWalletAuth } from '../hooks/useWalletAuth';
import { MapPin, Coins, Building2 } from 'lucide-react';

interface PurchasePlotFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  demoMode?: boolean;
  onSuccess?: () => void;
}

export function PurchasePlotForm({ open = true, onOpenChange, demoMode = false, onSuccess }: PurchasePlotFormProps) {
  const { user } = useWalletAuth();
  const [loading, setLoading] = useState(false);
  const [availablePlots, setAvailablePlots] = useState<any[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  const [userBalance, setUserBalance] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (demoMode) {
        setAvailablePlots([
          { id: '1', location: 'Clifton, Karachi', city: 'Karachi', status: 'available', price: 500 },
          { id: '2', location: 'Gulberg, Lahore', city: 'Lahore', status: 'available', price: 450 },
          { id: '4', location: 'D-Ground, Faisalabad', city: 'Faisalabad', status: 'available', price: 350 },
          { id: '5', location: 'Cantt, Multan', city: 'Multan', status: 'available', price: 300 },
          { id: '7', location: 'Blue Area, Islamabad', city: 'Islamabad', status: 'available', price: 550 },
        ]);
        setUserBalance(1250);
        return;
      }

      try {
        const [plots, balance] = await Promise.all([
          localApiClient.getChargingPlots(),
          localApiClient.getTokenBalance()
        ]);
        setAvailablePlots(plots.filter(p => p.status === 'available'));
        setUserBalance(balance.tokens);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load available plots');
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, demoMode, user]);

  const handlePurchase = async () => {
    if (!selectedPlot) return;

    if (!user && !demoMode) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (userBalance < selectedPlot.price) {
      toast.error('Insufficient BUILD tokens');
      return;
    }

    setLoading(true);
    try {
      if (demoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success(`Plot purchased successfully for ${selectedPlot.price} BUILD tokens!`);
      } else {
        await localApiClient.purchasePlot(selectedPlot.id);
        toast.success('Plot purchased successfully! You can now install chargers.');
      }

      setShowConfirmDialog(false);
      setSelectedPlot(null);
      
      if (onOpenChange) {
        onOpenChange(false);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to purchase plot');
    } finally {
      setLoading(false);
    }
  };

  const isStandalone = onOpenChange === undefined;
  const content = (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <Coins className="h-5 w-5 text-emerald-600" />
        <div>
          <p className="text-sm font-medium text-emerald-900">Your Balance</p>
          <p className="text-lg font-bold text-emerald-600">{userBalance} BUILD</p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Available Plots
        </h3>
        
        {availablePlots.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No plots available at the moment</p>
            <p className="text-sm text-gray-500 mt-1">Check back later for new listings</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
            {availablePlots.map((plot) => (
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
                    </div>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      {plot.price} BUILD
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedPlot && (
        <div className="p-4 bg-gray-50 border rounded-lg space-y-3">
          <h4 className="font-semibold text-sm">Purchase Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Plot Location</span>
              <span className="font-medium">{selectedPlot.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">City</span>
              <span className="font-medium">{selectedPlot.city}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Price</span>
              <span className="font-bold text-emerald-600">{selectedPlot.price} BUILD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Your Balance After</span>
              <span className={`font-medium ${userBalance - selectedPlot.price >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                {userBalance - selectedPlot.price} BUILD
              </span>
            </div>
          </div>
        </div>
      )}

      <Button 
        onClick={() => setShowConfirmDialog(true)}
        disabled={!selectedPlot || loading || userBalance < (selectedPlot?.price || 0)}
        className="w-full"
      >
        {loading ? 'Processing...' : `Purchase Plot${selectedPlot ? ` for ${selectedPlot.price} BUILD` : ''}`}
      </Button>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to purchase this plot for <span className="font-bold text-emerald-600">{selectedPlot?.price} BUILD tokens</span>?
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                Once purchased, you will own this plot and can install EV chargers to earn BUILD tokens from charging sessions.
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
                onClick={handlePurchase}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Processing...' : 'Confirm Purchase'}
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
            <Building2 className="h-6 w-6 text-emerald-600" />
            Purchase Charging Plot
          </h2>
          <p className="text-muted-foreground mt-1">
            Own a plot to install EV chargers and earn BUILD tokens
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
            <Building2 className="h-5 w-5 text-emerald-600" />
            Purchase Charging Plot
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
