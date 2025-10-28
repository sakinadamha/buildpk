import { useState, useEffect } from 'react';
import { Battery, Zap, MapPin, TrendingUp, Users, Award, ArrowUpRight, Clock, LayoutDashboard, Map, Plug, Play, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { localApiClient } from '../utils/localApi';
import { toast } from 'sonner';
import { useWalletAuth } from '../hooks/useWalletAuth';
import { ChargingMap } from './ChargingMap';
import { InstallChargerForm } from './InstallChargerForm';
import { ChargingSessionForm } from './ChargingSessionForm';
import { PointsMarketplace } from './PointsMarketplace';

interface PowerDashboardProps {
  demoMode?: boolean;
}

export function PowerDashboard({ demoMode = false }: PowerDashboardProps) {
  const { user } = useWalletAuth();
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSessions] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [chargers, setChargers] = useState<any[]>([]);
  const [plots, setPlots] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalChargers: 0,
    activeChargers: 0,
    totalEnergy: 0,
    totalSessions: 0,
    totalRevenue: 0,
    totalPoints: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (demoMode) {
          // Demo data
          setActiveSessions([
            {
              id: 'session-1',
              chargerId: 'charger-1',
              userId: 'demo-user',
              vehicleType: 'Tesla Model 3',
              startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
              energyUsed: 12.5,
              duration: 900,
              pointsEarned: 125,
              status: 'active',
              chargerName: 'Karachi Supercharger Station',
              location: 'Clifton, Karachi'
            },
            {
              id: 'session-2',
              chargerId: 'charger-2',
              userId: 'user-2',
              vehicleType: 'BYD Atto 3',
              startTime: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
              energyUsed: 8.2,
              duration: 480,
              pointsEarned: 82,
              status: 'active',
              chargerName: 'Lahore Fast Charge Hub',
              location: 'Gulberg, Lahore'
            }
          ]);

          setRecentSessions([
            {
              id: 'session-3',
              vehicleType: 'MG ZS EV',
              energyUsed: 25.3,
              pointsEarned: 253,
              cost: 1265,
              endTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              chargerName: 'Islamabad Green Charge',
              location: 'F-7, Islamabad'
            },
            {
              id: 'session-4',
              vehicleType: 'Hyundai Ioniq 5',
              energyUsed: 18.7,
              pointsEarned: 187,
              cost: 935,
              endTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
              chargerName: 'Faisalabad Quick Charge',
              location: 'D-Ground, Faisalabad'
            },
            {
              id: 'session-5',
              vehicleType: 'Nissan Leaf',
              energyUsed: 15.0,
              pointsEarned: 150,
              cost: 750,
              endTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
              chargerName: 'Multan Power Point',
              location: 'Cantt, Multan'
            }
          ]);

          setStats({
            totalChargers: 48,
            activeChargers: 32,
            totalEnergy: 12450,
            totalSessions: 3240,
            totalRevenue: 622500,
            totalPoints: 124500
          });

          setLoading(false);
          return;
        }

        const [sessions, allChargers, allPlots] = await Promise.all([
          localApiClient.getActiveChargingSessions(),
          localApiClient.getEVChargers(),
          localApiClient.getChargingPlots()
        ]);

        setActiveSessions(sessions);
        setChargers(allChargers);
        setPlots(allPlots);

        // Calculate stats
        const activeChargers = allChargers.filter(c => c.status === 'online' || c.status === 'charging');
        const totalEnergy = allChargers.reduce((sum, c) => sum + c.totalEnergy, 0);
        const totalSessions = allChargers.reduce((sum, c) => sum + c.totalSessions, 0);
        const totalRevenue = allChargers.reduce((sum, c) => sum + c.earnings, 0);

        setStats({
          totalChargers: allChargers.length,
          activeChargers: activeChargers.length,
          totalEnergy,
          totalSessions,
          totalRevenue,
          totalPoints: 0 // Will be updated from user's points
        });

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch Power data:', error);
        toast.error('Failed to load charging data');
        setLoading(false);
      }
    };

    fetchData();

    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [demoMode]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
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
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-emerald-900">⚡ Power Sector</h2>
        <p className="text-gray-600 mt-2">Gamified EV Charging Network - Own plots, earn rewards, trade points</p>
      </div>

      {/* Sub-navigation */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="map">
            <Map className="h-4 w-4 mr-2" />
            Charging Map
          </TabsTrigger>
          <TabsTrigger value="install">
            <Plug className="h-4 w-4 mr-2" />
            Install Charger
          </TabsTrigger>
          <TabsTrigger value="session">
            <Play className="h-4 w-4 mr-2" />
            Start Session
          </TabsTrigger>
          <TabsTrigger value="marketplace">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Marketplace
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 mt-6">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chargers</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChargers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 font-semibold">{stats.activeChargers} active</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Energy Delivered</CardTitle>
            <Battery className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnergy.toLocaleString()} kWh</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.totalSessions.toLocaleString()} sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} BUILD</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalPoints.toLocaleString()} points issued
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live Charging Feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                Live Charging Feed
              </CardTitle>
              <CardDescription>Real-time charging sessions across Pakistan</CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {activeSession.length} active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {activeSession.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Battery className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No active charging sessions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSession.map((session) => (
                <div key={session.id} className="flex items-start gap-4 p-4 rounded-lg border border-green-100 bg-gradient-to-r from-green-50 to-transparent">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{session.vehicleType}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {session.chargerName || session.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{session.energyUsed} kWh</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                          <Clock className="h-3 w-3" />
                          {formatDuration(session.duration)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        {session.pointsEarned} points
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Started {formatTime(session.startTime)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Completed Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Completed Sessions</CardTitle>
          <CardDescription>Last 24 hours of charging activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Battery className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{session.vehicleType}</p>
                    <p className="text-xs text-gray-500">{session.chargerName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{session.energyUsed} kWh</p>
                  <p className="text-xs text-gray-500">{formatTime(session.endTime)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">+{session.pointsEarned} pts</p>
                  <p className="text-xs text-gray-500">{session.cost} PKR</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

        </TabsContent>

        <TabsContent value="map" className="mt-6">
          <ChargingMap demoMode={demoMode} />
        </TabsContent>

        <TabsContent value="install" className="mt-6">
          <InstallChargerForm demoMode={demoMode} />
        </TabsContent>

        <TabsContent value="session" className="mt-6">
          <ChargingSessionForm demoMode={demoMode} />
        </TabsContent>

        <TabsContent value="marketplace" className="mt-6">
          <PointsMarketplace demoMode={demoMode} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
