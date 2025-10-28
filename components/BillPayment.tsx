import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Zap, 
  Heart, 
  Building, 
  Receipt, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { localDb } from '../utils/localDb';
import { toast } from 'sonner';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';

interface BillPaymentProps {
  userBalance: number;
  userId: string;
  onPaymentComplete: () => void;
}

interface BillProvider {
  id: string;
  name: string;
  category: 'electricity' | 'healthcare' | 'taxation';
  icon: React.ReactNode;
  iconColor: string;
  conversionRate: number; // PKR per BUILD token
  minAmount: number;
  maxAmount: number;
}

const billProviders: BillProvider[] = [
  {
    id: 'kelectric',
    name: 'K-Electric',
    category: 'electricity',
    icon: <Zap className="h-5 w-5" />,
    iconColor: 'text-yellow-600',
    conversionRate: 250, // 1 BUILD = 250 PKR
    minAmount: 500,
    maxAmount: 50000,
  },
  {
    id: 'lesco',
    name: 'LESCO',
    category: 'electricity',
    icon: <Zap className="h-5 w-5" />,
    iconColor: 'text-yellow-600',
    conversionRate: 250,
    minAmount: 500,
    maxAmount: 50000,
  },
  {
    id: 'iesco',
    name: 'IESCO',
    category: 'electricity',
    icon: <Zap className="h-5 w-5" />,
    iconColor: 'text-yellow-600',
    conversionRate: 250,
    minAmount: 500,
    maxAmount: 50000,
  },
  {
    id: 'agha-khan',
    name: 'Agha Khan Hospital',
    category: 'healthcare',
    icon: <Heart className="h-5 w-5" />,
    iconColor: 'text-pink-600',
    conversionRate: 250,
    minAmount: 1000,
    maxAmount: 100000,
  },
  {
    id: 'shaukat-khanum',
    name: 'Shaukat Khanum Hospital',
    category: 'healthcare',
    icon: <Heart className="h-5 w-5" />,
    iconColor: 'text-pink-600',
    conversionRate: 250,
    minAmount: 1000,
    maxAmount: 100000,
  },
  {
    id: 'fbr-tax',
    name: 'FBR Tax Payment',
    category: 'taxation',
    icon: <Building className="h-5 w-5" />,
    iconColor: 'text-purple-600',
    conversionRate: 250,
    minAmount: 1000,
    maxAmount: 500000,
  },
  {
    id: 'punjab-revenue',
    name: 'Punjab Revenue',
    category: 'taxation',
    icon: <Building className="h-5 w-5" />,
    iconColor: 'text-purple-600',
    conversionRate: 250,
    minAmount: 500,
    maxAmount: 200000,
  },
];

interface BillPaymentProps {
  userBalance: number;
  userId: string;
  onPaymentComplete: () => void;
}

export function BillPayment({ userBalance, userId, onPaymentComplete }: BillPaymentProps) {
  const [selectedProvider, setSelectedProvider] = useState<BillProvider | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = () => {
    const allPayments = localDb.getBillPayments();
    const userPayments = allPayments.filter(payment => payment.userId === userId);
    setPaymentHistory(userPayments.slice(-5).reverse()); // Show latest 5 payments for this user
  };

  const handleProviderSelect = (providerId: string) => {
    const provider = billProviders.find(p => p.id === providerId);
    setSelectedProvider(provider || null);
    setAccountNumber('');
    setBillAmount('');
  };

  const calculateBuildTokens = () => {
    if (!billAmount || !selectedProvider) return 0;
    const amount = parseFloat(billAmount);
    return Math.ceil(amount / selectedProvider.conversionRate);
  };

  const handlePayBill = async () => {
    if (!selectedProvider || !accountNumber || !billAmount) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(billAmount);
    const tokensRequired = calculateBuildTokens();

    if (amount < selectedProvider.minAmount) {
      toast.error(`Minimum bill amount is PKR ${selectedProvider.minAmount}`);
      return;
    }

    if (amount > selectedProvider.maxAmount) {
      toast.error(`Maximum bill amount is PKR ${selectedProvider.maxAmount}`);
      return;
    }

    if (tokensRequired > userBalance) {
      toast.error(`Insufficient BUILD tokens. You need ${tokensRequired} BUILD but have ${userBalance} BUILD`);
      return;
    }

    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Record payment
      localDb.createBillPayment({
        userId: userId,
        provider: selectedProvider.name,
        category: selectedProvider.category,
        accountNumber,
        billAmount: amount,
        buildTokensUsed: tokensRequired,
        conversionRate: selectedProvider.conversionRate,
      });

      // Create transaction record
      localDb.createTransaction(userId, {
        type: 'transferred',
        amount: -tokensRequired,
        description: `Bill payment: ${selectedProvider.name} - PKR ${amount}`,
      });

      toast.success('Bill payment successful!', {
        description: `Paid PKR ${amount} using ${tokensRequired} BUILD tokens`,
      });

      setSelectedProvider(null);
      setAccountNumber('');
      setBillAmount('');
      loadPaymentHistory();
      onPaymentComplete();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'electricity': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'healthcare': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'taxation': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-emerald-600" />
            Pay Bills with BUILD Tokens
          </CardTitle>
          <CardDescription>
            Redeem your BUILD tokens to pay electricity, healthcare, and tax bills at PKR 250 per BUILD token
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label>Select Service Provider</Label>
            <Select value={selectedProvider?.id || ''} onValueChange={handleProviderSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a provider..." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {billProviders.map(provider => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProvider && (
            <>
              {/* Account Number */}
              <div className="space-y-2">
                <Label>Account / Reference Number</Label>
                <Input
                  placeholder={`Enter your ${selectedProvider.name} account number`}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>

              {/* Bill Amount */}
              <div className="space-y-2">
                <Label>Bill Amount (PKR)</Label>
                <Input
                  type="number"
                  placeholder="Enter bill amount"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  min={selectedProvider.minAmount}
                  max={selectedProvider.maxAmount}
                />
                <p className="text-xs text-gray-500">
                  Min: PKR {selectedProvider.minAmount.toLocaleString()} | Max: PKR {selectedProvider.maxAmount.toLocaleString()}
                </p>
              </div>

              {/* Payment Preview */}
              {billAmount && parseFloat(billAmount) > 0 && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-3">
                  <h4 className="font-medium text-emerald-900">Payment Preview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bill Amount:</span>
                      <span className="font-medium">PKR {parseFloat(billAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conversion Rate:</span>
                      <span className="font-medium">1 BUILD = PKR {selectedProvider.conversionRate}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-emerald-300">
                      <span className="text-emerald-700 font-medium">BUILD Tokens Required:</span>
                      <span className="font-bold text-lg text-emerald-900">{calculateBuildTokens()} BUILD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Your Balance:</span>
                      <span className={`font-medium ${userBalance >= calculateBuildTokens() ? 'text-green-600' : 'text-red-600'}`}>
                        {userBalance} BUILD
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <Button
                onClick={handlePayBill}
                disabled={processing || !accountNumber || !billAmount || calculateBuildTokens() > userBalance}
                className="w-full"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Pay {calculateBuildTokens()} BUILD Tokens
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Payments</CardTitle>
            <CardDescription>Your last 5 bill payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      payment.category === 'electricity' ? 'bg-yellow-100' :
                      payment.category === 'healthcare' ? 'bg-pink-100' :
                      'bg-purple-100'
                    }`}>
                      {payment.category === 'electricity' && <Zap className="h-4 w-4 text-yellow-600" />}
                      {payment.category === 'healthcare' && <Heart className="h-4 w-4 text-pink-600" />}
                      {payment.category === 'taxation' && <Building className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{payment.provider}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(payment.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">PKR {payment.billAmount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{payment.buildTokensUsed} BUILD</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
