import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Trophy, Medal, Star, TrendingUp, Award, Crown } from 'lucide-react';
import { localDb } from '../utils/localDb';
import { Avatar, AvatarFallback } from './ui/avatar';

interface LeaderboardEntry {
  userId: string;
  name: string;
  tokens: number;
  infraCount: number;
  rank: number;
  change: number;
  badge: string;
  achievements: string[];
}

export function Leaderboard() {
  const [category, setCategory] = useState<'tokens' | 'infrastructure' | 'weekly'>('tokens');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, [category]);

  const loadLeaderboard = () => {
    const users = localDb.getAllUsers();
    const entries: LeaderboardEntry[] = users.map((user, index) => {
      const balance = localDb.getTokenBalance(user.id);
      const totalTokens = balance.tokens + balance.staked;
      
      // Count infrastructure deployed
      const hotspots = localDb.getHotspots().filter(h => h.operatorId === user.id).length;
      const partners = localDb.getDeliveryPartners().filter(p => p.email === user.email).length;
      const farms = localDb.getFarms().filter(f => f.ownerId === user.id).length;
      const infraCount = hotspots + partners + farms;

      // Determine badge
      let badge = 'Beginner';
      let achievements: string[] = [];
      
      if (totalTokens >= 10000) {
        badge = 'Legend';
        achievements.push('Token Millionaire');
      } else if (totalTokens >= 5000) {
        badge = 'Elite';
        achievements.push('High Earner');
      } else if (totalTokens >= 2000) {
        badge = 'Expert';
        achievements.push('Professional');
      } else if (totalTokens >= 500) {
        badge = 'Advanced';
        achievements.push('Rising Star');
      }

      if (infraCount >= 10) achievements.push('Infrastructure Master');
      if (infraCount >= 5) achievements.push('Multi-Phase Builder');
      if (hotspots >= 3) achievements.push('WiFi Pioneer');

      return {
        userId: user.id,
        name: user.name || user.email,
        tokens: totalTokens,
        infraCount,
        rank: index + 1,
        change: Math.floor(Math.random() * 10) - 5, // Simulated rank change
        badge,
        achievements,
      };
    });

    // Sort based on category
    if (category === 'tokens') {
      entries.sort((a, b) => b.tokens - a.tokens);
    } else if (category === 'infrastructure') {
      entries.sort((a, b) => b.infraCount - a.infraCount);
    } else {
      // Weekly - random for demo
      entries.sort(() => Math.random() - 0.5);
    }

    // Update ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    setLeaderboard(entries);
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Legend': return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
      case 'Elite': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'Expert': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'Advanced': return 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                BuildPK Leaderboard
              </CardTitle>
              <CardDescription>
                Top performers in Pakistan's DePIN network
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              Updated Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={category} onValueChange={(v) => setCategory(v as any)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="tokens">
                <TrendingUp className="h-4 w-4 mr-2" />
                Top Earners
              </TabsTrigger>
              <TabsTrigger value="infrastructure">
                <Award className="h-4 w-4 mr-2" />
                Infrastructure
              </TabsTrigger>
              <TabsTrigger value="weekly">
                <Star className="h-4 w-4 mr-2" />
                Weekly Stars
              </TabsTrigger>
            </TabsList>

            <TabsContent value={category} className="space-y-3">
              {leaderboard.slice(0, 20).map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                    entry.rank <= 3
                      ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 shadow-md'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
                      {getInitials(entry.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base truncate">
                        {entry.name}
                      </h3>
                      <Badge className={`${getBadgeColor(entry.badge)} text-xs`}>
                        {entry.badge}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {entry.tokens.toLocaleString()} BUILD
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        {entry.infraCount} Infrastructure
                      </span>
                    </div>
                    {entry.achievements.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {entry.achievements.slice(0, 3).map((achievement, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs bg-blue-50 border-blue-200 text-blue-700"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rank Change */}
                  <div className="flex-shrink-0 text-right">
                    {entry.change !== 0 && (
                      <div
                        className={`flex items-center gap-1 text-sm font-medium ${
                          entry.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {entry.change > 0 ? '↑' : '↓'}
                        {Math.abs(entry.change)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          {leaderboard.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No leaderboard data available yet</p>
              <p className="text-sm">Start earning BUILD tokens to appear on the leaderboard!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Badges Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Achievement Badges</CardTitle>
          <CardDescription>Unlock badges by reaching milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Legend', requirement: '10,000+ BUILD tokens', color: 'from-yellow-400 to-amber-500' },
              { name: 'Elite', requirement: '5,000+ BUILD tokens', color: 'from-purple-500 to-pink-500' },
              { name: 'Expert', requirement: '2,000+ BUILD tokens', color: 'from-blue-500 to-cyan-500' },
              { name: 'Advanced', requirement: '500+ BUILD tokens', color: 'from-emerald-500 to-teal-500' },
              { name: 'Infrastructure Master', requirement: 'Deploy 10+ infrastructure', color: 'from-indigo-500 to-purple-500' },
              { name: 'Multi-Phase Builder', requirement: 'Active in 5+ phases', color: 'from-pink-500 to-rose-500' },
            ].map((badge) => (
              <div key={badge.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${badge.color} flex items-center justify-center`}>
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{badge.name}</div>
                  <div className="text-xs text-gray-600">{badge.requirement}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
