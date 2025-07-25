'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Brain,
  BarChart3,
  Calendar,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import mock data
import mockData from './mock/leagues.json';

interface League {
  leagueId: string;
  name: string;
  platform: string;
  season: number;
  status: string;
  week: number;
  teamName: string;
  record: {
    wins: number;
    losses: number;
    ties: number;
  };
  standing: number;
  totalTeams: number;
  pointsFor: number;
  pointsAgainst: number;
  playoffPosition: string;
  nextMatchup: {
    opponent: string;
    projectedScore: number;
    opponentProjected: number;
    winProbability: number;
  };
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
  aiInsights: {
    weeklyAdvice: string;
    tradeOpportunities: number;
    rosterStrength: string;
    playoffOutlook: string;
  };
}

export function MultiLeagueDashboard() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [aggregateStats, setAggregateStats] = useState<any>(null);

  useEffect(() => {
    setLeagues(mockData.userLeagues);
    setAggregateStats(mockData.aggregateStats);
  }, []);

  const getPlayoffPositionColor = (position: string) => {
    switch (position) {
      case 'LOCKED': return 'bg-success-100 text-success-800 border-success-200';
      case 'BUBBLE': return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'ELIMINATED': return 'bg-error-100 text-error-800 border-error-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRosterStrengthColor = (strength: string) => {
    switch (strength) {
      case 'ELITE': return 'text-purple-600';
      case 'STRONG': return 'text-success-600';
      case 'AVERAGE': return 'text-warning-600';
      case 'WEAK': return 'text-error-600';
      default: return 'text-gray-600';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Sleeper': return 'bg-blue-100 text-blue-800';
      case 'ESPN': return 'bg-red-100 text-red-800';
      case 'Yahoo': return 'bg-purple-100 text-purple-800';
      case 'Underdog': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Multi-League Dashboard
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Manage all your fantasy leagues from one powerful command center
        </p>
      </motion.div>

      {/* Aggregate Stats */}
      {aggregateStats && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card className="immersive-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {aggregateStats.totalLeagues}
              </div>
              <div className="text-sm text-gray-600">Active Leagues</div>
            </CardContent>
          </Card>
          
          <Card className="immersive-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-success-600 mb-2">
                {aggregateStats.winPercentage}%
              </div>
              <div className="text-sm text-gray-600">Win Rate</div>
            </CardContent>
          </Card>
          
          <Card className="immersive-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {aggregateStats.playoffTeams}
              </div>
              <div className="text-sm text-gray-600">Playoff Teams</div>
            </CardContent>
          </Card>
          
          <Card className="immersive-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {aggregateStats.championshipContenders}
              </div>
              <div className="text-sm text-gray-600">Title Contenders</div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* League Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {leagues.map((league, index) => (
          <motion.div
            key={league.leagueId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="immersive-card hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedLeague(selectedLeague === league.leagueId ? null : league.leagueId)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{league.name}</CardTitle>
                    <p className="text-sm text-gray-500">{league.teamName}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPlatformColor(league.platform)}>
                      {league.platform}
                    </Badge>
                    <Badge className={getPlayoffPositionColor(league.playoffPosition)}>
                      {league.playoffPosition}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Record and Standing */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">
                        {league.record.wins}-{league.record.losses}
                      </div>
                      <div className="text-xs text-gray-500">Record</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary-600">
                        #{league.standing}
                      </div>
                      <div className="text-xs text-gray-500">of {league.totalTeams}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold">{league.pointsFor.toFixed(1)}</div>
                    <div className="text-xs text-gray-500">Points For</div>
                  </div>
                </div>

                {/* Next Matchup */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Week {league.week} vs {league.nextMatchup.opponent}</span>
                    <Badge className={`${league.nextMatchup.winProbability >= 60 ? 'bg-success-100 text-success-800' : 
                                      league.nextMatchup.winProbability >= 40 ? 'bg-warning-100 text-warning-800' : 
                                      'bg-error-100 text-error-800'}`}>
                      {league.nextMatchup.winProbability}% Win Prob
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>You: {league.nextMatchup.projectedScore}</span>
                    <span>Opp: {league.nextMatchup.opponentProjected}</span>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">AI Insights</span>
                  </div>
                  <p className="text-sm text-gray-600">{league.aiInsights.weeklyAdvice}</p>
                  <div className="flex items-center space-x-4 text-xs">
                    <span className={`font-medium ${getRosterStrengthColor(league.aiInsights.rosterStrength)}`}>
                      {league.aiInsights.rosterStrength} Roster
                    </span>
                    {league.aiInsights.tradeOpportunities > 0 && (
                      <span className="text-blue-600">
                        {league.aiInsights.tradeOpportunities} Trade Ops
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {selectedLeague === league.leagueId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-4 border-t border-gray-200"
                    >
                      {/* Recent Activity */}
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center">
                          <Activity className="h-4 w-4 mr-2" />
                          Recent Activity
                        </h4>
                        <div className="space-y-2">
                          {league.recentActivity.map((activity, idx) => (
                            <div key={idx} className="text-sm p-2 bg-gray-50 rounded">
                              <div className="font-medium">{activity.description}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(activity.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1">
                          <Target className="h-4 w-4 mr-1" />
                          Set Lineup
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Users className="h-4 w-4 mr-1" />
                          View League
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Cross-League AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="immersive-card border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <span className="text-purple-800">Cross-League AI Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Top Performers */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Top Performing Leagues
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {mockData.crossLeagueInsights.topPerformers.map((performer, index) => (
                  <div key={index} className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{leagues.find(l => l.leagueId === performer.leagueId)?.name}</div>
                        <div className="text-sm text-gray-600">{performer.metric}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-600">{performer.value}</div>
                        <Badge className="bg-yellow-100 text-yellow-800">#{performer.rank}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Areas */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                Improvement Opportunities
              </h4>
              <div className="space-y-3">
                {mockData.crossLeagueInsights.improvementAreas.map((area, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">{leagues.find(l => l.leagueId === area.leagueId)?.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{area.issue}</div>
                        <div className="text-sm text-blue-600 mt-2 font-medium">{area.recommendation}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-500" />
                Strategic Recommendations
              </h4>
              <div className="space-y-2">
                {mockData.crossLeagueInsights.aiRecommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5" />
                    <span className="text-sm text-gray-700">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}