import { useState, useEffect } from 'react';
import { MapPin, Zap, Lock, Check, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { localApiClient } from '../utils/localApi';
import { toast } from 'sonner';
import { useWalletAuth } from '../hooks/useWalletAuth';
import { PurchasePlotForm } from './PurchasePlotForm';
import { SellPlotForm } from './SellPlotForm';

interface ChargingMapProps {
  demoMode?: boolean;
}

export function ChargingMap({ demoMode = false }: ChargingMapProps) {
  const { user } = useWalletAuth();
  const [plots, setPlots] = useState<any[]>([]);
  const [userPlots, setUserPlots] = useState<any[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [showSellDialog, setShowSellDialog] = useState(false);

  useEffect(() => {
    const fetchPlots = async () => {
      if (demoMode) {
        const demoPlots = [
          { id: '1', location: 'Clifton, Karachi', latitude: 24.8138, longitude: 67.0295, city: 'Karachi', status: 'available', price: 500, ownerId: '' },
          { id: '2', location: 'Gulberg, Lahore', latitude: 31.5165, longitude: 74.3416, city: 'Lahore', status: 'available', price: 450, ownerId: '' },
          { id: '3', location: 'F-7, Islamabad', latitude: 33.7202, longitude: 73.0565, city: 'Islamabad', status: 'occupied', price: 600, ownerId: 'demo-user' },
          { id: '4', location: 'D-Ground, Faisalabad', latitude: 31.4186, longitude: 73.0791, city: 'Faisalabad', status: 'available', price: 350, ownerId: '' },
          { id: '5', location: 'Cantt, Multan', latitude: 30.1956, longitude: 71.4757, city: 'Multan', status: 'available', price: 300, ownerId: '' },
          { id: '6', location: 'Saddar, Rawalpindi', latitude: 33.5967, longitude: 73.0478, city: 'Rawalpindi', status: 'occupied', price: 400, ownerId: 'user-2' },
          { id: '7', location: 'Blue Area, Islamabad', latitude: 33.7077, longitude: 73.0501, city: 'Islamabad', status: 'available', price: 550, ownerId: '' },
          { id: '8', location: 'DHA Phase 5, Karachi', latitude: 24.8050, longitude: 67.0652, city: 'Karachi', status: 'reserved', price: 700, ownerId: '' },
        ];
        setPlots(demoPlots);
        setUserPlots(demoPlots.filter(p => p.ownerId === 'demo-user'));
        return;
      }

      try {
        const allPlots = await localApiClient.getChargingPlots();
        setPlots(allPlots);
        setUserPlots(allPlots.filter(p => p.ownerId === user?.id));
      } catch (error) {
        console.error('Failed to fetch plots:', error);
        toast.error('Failed to load charging plots');
      }
    };

    fetchPlots();
  }, [demoMode, user]);

  const handlePurchasePlot = async (plotId: string) => {
    if (!user && !demoMode) {
      toast.error('Please connect your wallet first');
      return;
    }

    setPurchasing(true);
    try {
      if (demoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const updatedPlots = plots.map(p => 
          p.id === plotId 
            ? { ...p, status: 'occupied', ownerId: 'demo-user', purchasedAt: new Date().toISOString() }
            : p
        );
        setPlots(updatedPlots);
        setUserPlots(updatedPlots.filter(p => p.ownerId === 'demo-user'));
        toast.success('Plot purchased successfully! You can now install chargers.');
        setSelectedPlot(null);
        setPurchasing(false);
        return;
      }

      await localApiClient.purchasePlot(plotId);
      const updatedPlots = await localApiClient.getChargingPlots();
      setPlots(updatedPlots);
      setUserPlots(updatedPlots.filter(p => p.ownerId === user?.id));
      toast.success('Plot purchased successfully!');
      setSelectedPlot(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to purchase plot');
    } finally {
      setPurchasing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700 border-green-200';
      case 'occupied': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'reserved': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <Check className="h-4 w-4" />;
      case 'occupied': return <Lock className="h-4 w-4" />;
      case 'reserved': return <TrendingUp className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const availablePlots = plots.filter(p => p.status === 'available');
  const occupiedPlots = plots.filter(p => p.status === 'occupied');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-emerald-900">⚡ Charging Plot Map</h2>
          <p className="text-gray-600 mt-1">Limited spots across Pakistan - Own plots, install chargers, earn revenue</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowBuyDialog(true)} variant="default">
            Buy Plot
          </Button>
          <Button onClick={() => setShowSellDialog(true)} variant="outline">
            Sell Plot
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Plots</p>
                <p className="text-2xl font-bold">{plots.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">{availablePlots.length}</p>
              </div>
              <Check className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Occupied</p>
                <p className="text-2xl font-bold text-gray-600">{occupiedPlots.length}</p>
              </div>
              <Lock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Your Plots</p>
                <p className="text-2xl font-bold text-emerald-600">{userPlots.length}</p>
              </div>
              <Zap className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plot Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Available Charging Plots</CardTitle>
          <CardDescription>Purchase plots to install chargers and earn revenue from drivers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plots.map((plot) => (
              <Card key={plot.id} className={`hover:shadow-lg transition-shadow ${plot.status === 'available' ? 'border-green-200' : ''}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <p className="text-sm font-semibold">{plot.location}</p>
                      </div>
                      <p className="text-xs text-gray-500">{plot.city}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(plot.status)}>
                      {getStatusIcon(plot.status)}
                      <span className="ml-1 capitalize">{plot.status}</span>
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-t">
                      <span className="text-sm text-gray-600">Price</span>
                      <span className="text-lg font-bold text-emerald-600">{plot.price} BUILD</span>
                    </div>

                    {plot.status === 'available' ? (
                      <Dialog open={selectedPlot?.id === plot.id} onOpenChange={(open) => !open && setSelectedPlot(null)}>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full" 
                            onClick={() => setSelectedPlot(plot)}
                          >
                            Purchase Plot
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Purchase Charging Plot</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Location</span>
                                <span className="text-sm font-medium">{plot.location}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">City</span>
                                <span className="text-sm font-medium">{plot.city}</span>
                              </div>
                              <div className="flex justify-between border-t pt-2">
                                <span className="text-sm font-semibold">Total Cost</span>
                                <span className="text-lg font-bold text-emerald-600">{plot.price} BUILD</span>
                              </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm text-blue-800">
                                <strong>💡 Tip:</strong> After purchasing, you can install chargers on this plot to earn revenue from drivers!
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <Button variant="outline" className="flex-1" onClick={() => setSelectedPlot(null)}>
                                Cancel
                              </Button>
                              <Button 
                                className="flex-1" 
                                onClick={() => handlePurchasePlot(plot.id)}
                                disabled={purchasing}
                              >
                                {purchasing ? 'Purchasing...' : 'Confirm Purchase'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : plot.ownerId === user?.id || (demoMode && plot.ownerId === 'demo-user') ? (
                      <Button variant="outline" className="w-full" disabled>
                        <Check className="h-4 w-4 mr-2" />
                        You Own This Plot
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        <Lock className="h-4 w-4 mr-2" />
                        {plot.status === 'reserved' ? 'Reserved' : 'Occupied'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User's Plots */}
      {userPlots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Owned Plots</CardTitle>
            <CardDescription>Manage your charging infrastructure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userPlots.map((plot) => (
                <div key={plot.id} className="flex items-center justify-between p-4 rounded-lg border border-emerald-100 bg-emerald-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{plot.location}</p>
                      <p className="text-sm text-gray-600">{plot.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold">{plot.price} BUILD</p>
                      <p className="text-xs text-gray-500">Investment</p>
                    </div>
                    <Button size="sm">
                      Install Charger
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <PurchasePlotForm 
        open={showBuyDialog} 
        onOpenChange={setShowBuyDialog}
        demoMode={demoMode}
        onSuccess={async () => {
          const allPlots = await localApiClient.getChargingPlots();
          setPlots(allPlots);
          setUserPlots(allPlots.filter(p => p.ownerId === (demoMode ? 'demo-user' : user?.id)));
        }}
      />

      <SellPlotForm 
        open={showSellDialog} 
        onOpenChange={setShowSellDialog}
        demoMode={demoMode}
        onSuccess={async () => {
          const allPlots = await localApiClient.getChargingPlots();
          setPlots(allPlots);
          setUserPlots(allPlots.filter(p => p.ownerId === (demoMode ? 'demo-user' : user?.id)));
        }}
      />
    </div>
  );
}
