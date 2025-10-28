import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Award, ArrowRightLeft, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { localApiClient } from '../utils/localApi';
import { toast } from 'sonner';
import { useWalletAuth } from '../hooks/useWalletAuth';

interface PointsMarketplaceProps {
  demoMode?: boolean;
}

export function PointsMarketplace({ demoMode = false }: PointsMarketplaceProps) {
  const { user } = useWalletAuth();
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const [listings, setListings] = useState<any[]>([]);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [buyAmount, setBuyAmount] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (demoMode) {
          setUserPoints(250);
          setListings([
            {
              id: '1',
              sellerId: 'user-1',
              sellerName: 'Ahmed K.',
              points: 500,
              buildTokens: 40,
              discount: 20,
              regularPrice: 50,
              location: 'Karachi'
            },
            {
              id: '2',
              sellerId: 'user-2',
              sellerName: 'Fatima S.',
              points: 1000,
              buildTokens: 75,
              discount: 25,
              regularPrice: 100,
              location: 'Lahore'
            },
            {
              id: '3',
              sellerId: 'user-3',
              sellerName: 'Hassan M.',
              points: 250,
              buildTokens: 22,
              discount: 12,
              regularPrice: 25,
              location: 'Islamabad'
            },
            {
              id: '4',
              sellerId: 'user-4',
              sellerName: 'Ayesha R.',
              points: 750,
              buildTokens: 58,
              discount: 23,
              regularPrice: 75,
              location: 'Faisalabad'
            }
          ]);
          setLoading(false);
          return;
        }

        const [points, marketplaceListings] = await Promise.all([
          localApiClient.getChargingPoints(user?.id || ''),
          localApiClient.getMarketplaceListings()
        ]);
        
        setUserPoints(points.points);
        setListings(marketplaceListings);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch marketplace data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [demoMode, user]);

  const handleBuyPoints = async () => {
    if (!selectedListing || !buyAmount) return;

    const pointsToBuy = parseInt(buyAmount);
    if (pointsToBuy > selectedListing.points) {
      toast.error('Not enough points available in this listing');
      return;
    }

    const cost = Math.ceil((pointsToBuy / selectedListing.points) * selectedListing.buildTokens);

    try {
      setLoading(true);
      
      if (demoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUserPoints(prev => prev + pointsToBuy);
        toast.success(`Purchased ${pointsToBuy} points for ${cost} BUILD tokens!`);
      } else {
        await localApiClient.buyPoints(selectedListing.id, pointsToBuy);
        // Refresh data
        const [points, marketplaceListings] = await Promise.all([
          localApiClient.getChargingPoints(user?.id || ''),
          localApiClient.getMarketplaceListings()
        ]);
        setUserPoints(points.points);
        setListings(marketplaceListings);
        toast.success(`Purchased ${pointsToBuy} points successfully!`);
      }
      
      setShowBuyDialog(false);
      setBuyAmount('');
      setSelectedListing(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to purchase points');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-emerald-900">⚡ Points Marketplace</h2>
        <p className="text-gray-600 mt-1">Buy charging points at discounted rates from Web3 community</p>
      </div>

      {/* User Points Balance */}
      <Card className="bg-gradient-to-r from-emerald-50 to-transparent border-emerald-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Your Charging Points</p>
              <p className="text-3xl font-bold text-emerald-900">{userPoints.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Use at any charging station</p>
            </div>
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <Award className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marketplace Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold">{listings.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Discount</p>
                <p className="text-2xl font-bold text-green-600">20%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Volume</p>
                <p className="text-2xl font-bold">12.5K</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Marketplace Listings */}
      <Card>
        <CardHeader>
          <CardTitle>Available Point Offers</CardTitle>
          <CardDescription>Buy charging points from drivers at discounted rates</CardDescription>
        </CardHeader>
        <CardContent>
          {listings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ArrowRightLeft className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No listings available</p>
              <p className="text-sm mt-2">Check back later for point trading opportunities</p>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => (
                <div key={listing.id} className="flex items-center justify-between p-4 rounded-lg border hover:border-emerald-200 hover:bg-emerald-50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold">
                      {listing.sellerName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{listing.sellerName}</p>
                        <Badge variant="outline" className="text-xs">
                          {listing.location}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Offering {listing.points.toLocaleString()} points
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-sm line-through text-gray-400">{listing.regularPrice} BUILD</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          -{listing.discount}%
                        </Badge>
                      </div>
                      <p className="text-lg font-bold text-emerald-600 mt-1">{listing.buildTokens} BUILD</p>
                    </div>

                    <Dialog open={showBuyDialog && selectedListing?.id === listing.id} onOpenChange={(open) => {
                      setShowBuyDialog(open);
                      if (!open) {
                        setSelectedListing(null);
                        setBuyAmount('');
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm"
                          onClick={() => setSelectedListing(listing)}
                        >
                          Buy Points
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[450px] bg-white z-[200]">
                        <DialogHeader>
                          <DialogTitle>Purchase Charging Points</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Seller</span>
                              <span className="text-sm font-medium">{listing.sellerName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Available Points</span>
                              <span className="text-sm font-medium">{listing.points.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Price per 100 points</span>
                              <span className="text-sm font-medium">{Math.ceil(listing.buildTokens / (listing.points / 100))} BUILD</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                              <span className="text-sm font-semibold text-green-600">Discount</span>
                              <span className="text-sm font-bold text-green-600">-{listing.discount}%</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="buyAmount">Points to Buy</Label>
                            <Input
                              id="buyAmount"
                              type="number"
                              placeholder={`Max: ${listing.points}`}
                              value={buyAmount}
                              onChange={(e) => setBuyAmount(e.target.value)}
                              max={listing.points}
                            />
                          </div>

                          {buyAmount && parseInt(buyAmount) > 0 && (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Points</span>
                                <span className="font-medium">{parseInt(buyAmount).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between border-t border-emerald-200 pt-2">
                                <span className="font-semibold">Total Cost</span>
                                <span className="font-bold text-emerald-600">
                                  {Math.ceil((parseInt(buyAmount) / listing.points) * listing.buildTokens)} BUILD
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1" 
                              onClick={() => {
                                setShowBuyDialog(false);
                                setBuyAmount('');
                                setSelectedListing(null);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button 
                              className="flex-1"
                              onClick={handleBuyPoints}
                              disabled={!buyAmount || parseInt(buyAmount) <= 0 || parseInt(buyAmount) > listing.points}
                            >
                              Confirm Purchase
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 How Points Trading Works</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Drivers earn points for every kWh charged (10 points per kWh)</li>
            <li>• Sell your points to Web3 users at any price you set</li>
            <li>• Buyers get discounted charging using purchased points</li>
            <li>• All transactions recorded on-chain for transparency</li>
            <li>• Instant transfers via Solana smart contracts</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
