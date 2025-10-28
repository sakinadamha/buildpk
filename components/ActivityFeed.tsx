import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  Activity, 
  Wifi, 
  Truck, 
  Sprout, 
  Heart, 
  Building, 
  TrendingUp,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { localDb } from '../utils/localDb';

interface ActivityItem {
  id: string;
  type: 'deployment' | 'earning' | 'verification' | 'system';
  phase: 'wifi' | 'logistics' | 'agriculture' | 'healthcare' | 'taxation' | 'general';
  user: string;
  action: string;
  amount?: number;
  timestamp: Date;
  status: 'success' | 'pending' | 'warning';
}

export function ActivityFeed() {
  const [allActivities, setAllActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'deployments' | 'earnings'>('all');

  useEffect(() => {
    loadActivities();
    const interval = setInterval(loadActivities, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadActivities = () => {
    const activityList: ActivityItem[] = [];
    const users = localDb.getAllUsers();

    // Get recent transactions
    users.forEach(user => {
      const transactions = localDb.getTransactions(user.id).slice(-10);
      transactions.forEach(tx => {
        activityList.push({
          id: `tx-${tx.timestamp}`,
          type: 'earning',
          phase: 'general',
          user: user.name || user.email,
          action: tx.description,
          amount: tx.amount,
          timestamp: new Date(tx.timestamp),
          status: 'success',
        });
      });
    });

    // Get recent deployments
    const hotspots = localDb.getHotspots().slice(-5);
    hotspots.forEach(h => {
      const owner = users.find(u => u.id === h.operatorId);
      activityList.push({
        id: `hotspot-${h.id}`,
        type: 'deployment',
        phase: 'wifi',
        user: owner?.name || 'Unknown',
        action: `Deployed WiFi hotspot: ${h.name}`,
        timestamp: new Date(h.createdAt),
        status: h.status === 'online' ? 'success' : 'pending',
      });
    });

    const partners = localDb.getDeliveryPartners().slice(-5);
    partners.forEach(p => {
      activityList.push({
        id: `partner-${p.id}`,
        type: 'deployment',
        phase: 'logistics',
        user: p.name,
        action: `Registered as delivery partner in ${p.vehicle}`,
        timestamp: new Date(p.createdAt),
        status: p.status === 'active' ? 'success' : 'pending',
      });
    });

    const farms = localDb.getFarms().slice(-5);
    farms.forEach(f => {
      const owner = users.find(u => u.id === f.ownerId);
      activityList.push({
        id: `farm-${f.id}`,
        type: 'deployment',
        phase: 'agriculture',
        user: owner?.name || 'Unknown',
        action: `Deployed ${f.sensors} sensors on ${f.cropType} farm`,
        timestamp: new Date(f.createdAt),
        status: 'success',
      });
    });

    // Sort by timestamp
    activityList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Store all activities (filtering will be done during render)
    setAllActivities(activityList.slice(0, 100)); // Keep latest 100
  };

  // Apply filter during render
  const getFilteredActivities = () => {
    let filtered = allActivities;
    if (filter === 'deployments') {
      filtered = allActivities.filter(a => a.type === 'deployment');
    } else if (filter === 'earnings') {
      filtered = allActivities.filter(a => a.type === 'earning');
    }
    return filtered.slice(0, 50); // Show latest 50
  };

  const activities = getFilteredActivities();

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'wifi': return <Wifi className="h-4 w-4 text-emerald-600" />;
      case 'logistics': return <Truck className="h-4 w-4 text-blue-600" />;
      case 'agriculture': return <Sprout className="h-4 w-4 text-amber-600" />;
      case 'healthcare': return <Heart className="h-4 w-4 text-pink-600" />;
      case 'taxation': return <Building className="h-4 w-4 text-purple-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default: return null;
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600" />
              Live Network Activity
            </CardTitle>
            <CardDescription>Real-time updates from across Pakistan</CardDescription>
          </div>
          <Badge variant="outline" className="animate-pulse">
            <span className="h-2 w-2 bg-green-500 rounded-full mr-2 inline-block"></span>
            Live
          </Badge>
        </div>
        
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setFilter('deployments')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'deployments'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Deployments
          </button>
          <button
            onClick={() => setFilter('earnings')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'earnings'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Earnings
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getPhaseIcon(activity.phase)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {activity.user}
                    </span>
                    {getStatusIcon(activity.status)}
                  </div>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                  {activity.amount && (
                    <div className="flex items-center gap-1 mt-1 text-emerald-600">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-sm font-medium">
                        +{activity.amount} BUILD
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-shrink-0 text-xs text-gray-500">
                  {getTimeAgo(activity.timestamp)}
                </div>
              </div>
            ))}

            {allActivities.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No recent activity</p>
                <p className="text-sm">Activity will appear here as users interact with the network</p>
              </div>
            )}
            
            {allActivities.length > 0 && activities.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No {filter === 'deployments' ? 'deployment' : 'earning'} activity</p>
                <p className="text-sm">Try selecting a different filter</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
