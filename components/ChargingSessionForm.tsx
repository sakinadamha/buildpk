import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { localApiClient } from '../utils/localApi';
import { toast } from 'sonner';
import { useWalletAuth } from '../hooks/useWalletAuth';
import { Battery, Zap, Award } from 'lucide-react';
import { Badge } from './ui/badge';
import { PurchasePlotForm } from './PurchasePlotForm';

interface ChargingSessionFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  demoMode?: boolean;
  onSuccess?: () => void;
}

export function ChargingSessionForm({ open = true, onOpenChange, demoMode = false, onSuccess }: ChargingSessionFormProps) {
  const { user } = useWalletAuth();
  const [loading, setLoading] = useState(false);
  const [chargers, setChargers] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [sessionStep, setSessionStep] = useState<'select' | 'active' | 'complete'>('select');
  const [formData, setFormData] = useState({
    chargerId: '',
    vehicleType: '',
    paymentMethod: 'fiat'
  });
  const [energyUsed, setEnergyUsed] = useState('');

  useEffect(() => {
    const fetchChargers = async () => {
      if (demoMode) {
        setChargers([
          { id: '1', name: 'Karachi Supercharger Station', location: 'Clifton, Karachi', type: 'tesla_supercharger', powerOutput: 150, status: 'online', pricing: { model: 'per_kwh', perKwh: 50 } },
          { id: '2', name: 'Lahore Fast Charge Hub', location: 'Gulberg, Lahore', type: 'dcfast', powerOutput: 50, status: 'online', pricing: { model: 'per_kwh', perKwh: 45 } },
          { id: '3', name: 'Islamabad Green Charge', location: 'F-7, Islamabad', type: 'level2', powerOutput: 7.2, status: 'online', pricing: { model: 'per_second', perSecond: 0.5 } }
        ]);
        return;
      }

      try {
        const allChargers = await localApiClient.getEVChargers();
        const onlineChargers = allChargers.filter(c => c.status === 'online');
        setChargers(onlineChargers);
      } catch (error) {
        console.error('Failed to fetch chargers:', error);
      }
    };

    if (open) {
      fetchChargers();
    }
  }, [open, demoMode]);

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.chargerId || !formData.vehicleType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (demoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const selectedCharger = chargers.find(c => c.id === formData.chargerId);
        setActiveSession({
          id: 'demo-session',
          chargerId: formData.chargerId,
          vehicleType: formData.vehicleType,
          startTime: new Date().toISOString(),
          chargerName: selectedCharger?.name,
          chargerPower: selectedCharger?.powerOutput,
          pricing: selectedCharger?.pricing
        });
        setSessionStep('active');
        toast.success('Charging session started!');
      } else {
        const session = await localApiClient.startChargingSession({
          chargerId: formData.chargerId,
          vehicleType: formData.vehicleType,
          paymentMethod: formData.paymentMethod
        });
        setActiveSession(session);
        setSessionStep('active');
        toast.success('Charging session started!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!energyUsed || parseFloat(energyUsed) <= 0) {
      toast.error('Please enter valid energy amount');
      return;
    }

    setLoading(true);
    try {
      if (demoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const energy = parseFloat(energyUsed);
        const pointsEarned = Math.floor(energy * 10);
        toast.success(`Session completed! Earned ${pointsEarned} points`);
        setSessionStep('complete');
      } else {
        const result = await localApiClient.endChargingSession(activeSession.id, parseFloat(energyUsed));
        toast.success(`Session completed! Earned ${result.pointsEarned} points`);
        setSessionStep('complete');
      }

      setTimeout(() => {
        setSessionStep('select');
        setActiveSession(null);
        setFormData({ chargerId: '', vehicleType: '', paymentMethod: 'fiat' });
        setEnergyUsed('');
        onOpenChange?.(false);
        onSuccess?.();
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to end session');
    } finally {
      setLoading(false);
    }
  };

  const selectedCharger = chargers.find(c => c.id === formData.chargerId);
  const sessionDuration = activeSession ? Math.floor((Date.now() - new Date(activeSession.startTime).getTime()) / 1000) : 0;
  const estimatedCost = activeSession && energyUsed ? (
    activeSession.pricing?.model === 'per_kwh' 
      ? parseFloat(energyUsed) * (activeSession.pricing?.perKwh || 0)
      : sessionDuration * (activeSession.pricing?.perSecond || 0)
  ) : 0;

  const sessionContent = (
    <>
      {sessionStep === 'select' && (
          <form onSubmit={handleStartSession} className="space-y-4">
            {chargers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No chargers available.</p>
                <p className="text-sm mt-2">Check back later or install your own charger!</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="chargerId">Select Charger *</Label>
                  <Select value={formData.chargerId} onValueChange={(value) => setFormData({ ...formData, chargerId: value })}>
                    <SelectTrigger className="bg-white z-[200]">
                      <SelectValue placeholder="Choose charging station" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-[200]">
                      {chargers.map((charger) => (
                        <SelectItem key={charger.id} value={charger.id}>
                          {charger.name} - {charger.powerOutput} kW
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCharger && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Location</span>
                      <span className="font-medium">{selectedCharger.location}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Power Output</span>
                      <span className="font-medium">{selectedCharger.powerOutput} kW</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pricing</span>
                      <span className="font-medium">
                        {selectedCharger.pricing?.model === 'per_kwh' 
                          ? `${selectedCharger.pricing.perKwh} PKR/kWh`
                          : `${selectedCharger.pricing?.perSecond} PKR/sec`
                        }
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Type *</Label>
                  <Input
                    id="vehicleType"
                    placeholder="e.g., Tesla Model 3, BYD Atto 3"
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                    <SelectTrigger className="bg-white z-[200]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-[200]">
                      <SelectItem value="fiat">Fiat (PKR)</SelectItem>
                      <SelectItem value="solana_pay">Solana Pay</SelectItem>
                      <SelectItem value="build_tokens">BUILD Tokens</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={loading || chargers.length === 0}>
                    {loading ? 'Starting...' : 'Start Charging'}
                  </Button>
                </div>
              </>
            )}
          </form>
        )}

        {sessionStep === 'active' && activeSession && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-700">Charging in progress...</span>
              </div>
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Charger</span>
                  <span className="font-medium">{activeSession.chargerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vehicle</span>
                  <span className="font-medium">{activeSession.vehicleType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{Math.floor(sessionDuration / 60)}m {sessionDuration % 60}s</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="energyUsed">Energy Used (kWh) *</Label>
              <Input
                id="energyUsed"
                type="number"
                step="0.1"
                placeholder="e.g., 25.5"
                value={energyUsed}
                onChange={(e) => setEnergyUsed(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">Enter the final energy reading from your vehicle</p>
            </div>

            {energyUsed && parseFloat(energyUsed) > 0 && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Energy</span>
                  <span className="font-medium">{parseFloat(energyUsed).toFixed(2)} kWh</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Cost</span>
                  <span className="font-medium">{estimatedCost.toFixed(2)} PKR</span>
                </div>
                <div className="flex justify-between text-sm border-t border-emerald-200 pt-2">
                  <span className="font-semibold flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    Points Earned
                  </span>
                  <span className="font-bold text-emerald-600">{Math.floor(parseFloat(energyUsed) * 10)} points</span>
                </div>
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={handleEndSession}
              disabled={loading || !energyUsed || parseFloat(energyUsed) <= 0}
            >
              {loading ? 'Ending Session...' : 'End Charging & Earn Points'}
            </Button>
          </div>
        )}

      {sessionStep === 'complete' && (
        <div className="py-8 text-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-900 mb-2">Session Complete!</h3>
          <p className="text-gray-600 mb-4">Thank you for charging with BuildPK</p>
          <Badge variant="secondary" className="text-lg py-2 px-4">
            <Award className="h-5 w-5 mr-2" />
            +{Math.floor(parseFloat(energyUsed) * 10)} Points Earned
          </Badge>
        </div>
      )}
    </>
  );

  // If no onOpenChange prop, render as standalone (for use in tabs)
  if (!onOpenChange) {
    return (
      <div className="max-w-[500px] mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Battery className="h-6 w-6 text-blue-500" />
            {sessionStep === 'select' ? 'Start Charging Session' : sessionStep === 'active' ? 'Active Charging' : 'Session Complete'}
          </h2>
          <p className="text-gray-600 mt-2">
            {sessionStep === 'select' && 'Begin charging your EV and earn points'}
            {sessionStep === 'active' && 'Charging in progress...'}
            {sessionStep === 'complete' && 'Session completed successfully'}
          </p>
        </div>
        {sessionContent}
      </div>
    );
  }

  // Modal mode with Dialog wrapper
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white z-[200]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Battery className="h-5 w-5 text-blue-500" />
            {sessionStep === 'select' ? 'Start Charging Session' : sessionStep === 'active' ? 'Active Charging' : 'Session Complete'}
          </DialogTitle>
        </DialogHeader>
        {sessionContent}
      </DialogContent>
    </Dialog>
  );
}
