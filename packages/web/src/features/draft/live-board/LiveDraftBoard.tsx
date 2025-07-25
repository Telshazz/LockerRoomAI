'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Clock, 
  Target, 
  Brain,
  Search,
  Filter,
  Zap,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle,
  Timer,
  Trophy,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import mock data
import mockData from './mock/draftData.json';

interface Player {
  playerId: string;
  name: string;
  position: string;
  team: string;
  adp: number;
  projectedPoints: number;
  tier: number;
  aiRecommendation: {
    rank: number;
    confidence: number;
    reasoning: string;
    valueGrade: string;
    riskLevel: string;
  };
}

interface DraftPick {
  pickNumber: number;
  round: number;
  teamId: string;
  teamName: string;
  playerId: string;
  playerName: string;
  position: string;
  team: string;
  timestamp: string;
}

export function LiveDraftBoard() {
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [draftBoard, setDraftBoard] = useState<DraftPick[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [currentPick, setCurrentPick] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isUserTurn, setIsUserTurn] = useState(false);

  // Load mock data
  useEffect(() => {
    setAvailablePlayers(mockData.availablePlayers);
    setDraftBoard(mockData.draftBoard);
    setCurrentPick(mockData.draftInfo.currentPick);
    setTimeRemaining(mockData.draftInfo.currentTurn.timeRemaining);
    setIsUserTurn(mockData.draftInfo.currentTurn.teamId === mockData.userTeam.teamId);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const filteredPlayers = availablePlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.team.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === 'ALL' || player.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-success-100 text-success-800 border-success-200';
      case 'A': return 'bg-success-100 text-success-700 border-success-200';
      case 'A-': return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'B+': return 'bg-warning-100 text-warning-600 border-warning-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-success-600';
      case 'MEDIUM': return 'text-warning-600';
      case 'HIGH': return 'text-error-600';
      default: return 'text-gray-600';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Live Draft Board
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Real-time draft with AI copilot assistance and advanced analytics
        </p>
      </motion.div>

      {/* Draft Status Bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-2xl p-6 text-white ${
          isUserTurn 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse-glow' 
            : 'bg-gradient-to-r from-blue-500 to-purple-500'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Timer className="h-6 w-6" />
              <div>
                <div className="text-lg font-semibold">
                  {isUserTurn ? 'YOUR TURN!' : `${mockData.draftInfo.currentTurn.teamName}'s Turn`}
                </div>
                <div className="text-sm opacity-90">
                  Pick {currentPick} of {mockData.draftInfo.totalPicks} • Round {mockData.draftInfo.currentRound}
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-3xl font-bold ${timeRemaining <= 30 ? 'animate-bounce-subtle' : ''}`}>
              {formatTime(timeRemaining)}
            </div>
            <div className="text-sm opacity-90">Time Remaining</div>
          </div>
        </div>
        
        <div className="mt-4">
          <Progress 
            value={(mockData.draftInfo.pickTimeLimit - timeRemaining) / mockData.draftInfo.pickTimeLimit * 100} 
            className="h-2 bg-white/20"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Players */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="immersive-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Available Players</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {filteredPlayers.length} players
                </Badge>
              </CardTitle>
              
              {/* Search and Filter */}
              <div className="flex space-x-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ALL">All Positions</option>
                  <option value="QB">QB</option>
                  <option value="RB">RB</option>
                  <option value="WR">WR</option>
                  <option value="TE">TE</option>
                  <option value="K">K</option>
                  <option value="DEF">DEF</option>
                </select>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredPlayers.map((player, index) => (
                  <motion.div
                    key={player.playerId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary-600">
                            {player.aiRecommendation.rank}
                          </div>
                          <div className="text-xs text-gray-500">AI Rank</div>
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold">{player.name}</h4>
                            <Badge className={getGradeColor(player.aiRecommendation.valueGrade)}>
                              {player.aiRecommendation.valueGrade}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {player.position} • {player.team} • ADP: {player.adp}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {player.aiRecommendation.reasoning}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="text-lg font-bold">{player.projectedPoints}</div>
                        <div className="text-xs text-gray-500">Proj. Points</div>
                        <div className={`text-xs font-medium ${getRiskColor(player.aiRecommendation.riskLevel)}`}>
                          {player.aiRecommendation.riskLevel} Risk
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Copilot & Draft Board */}
        <div className="space-y-4">
          {/* AI Copilot */}
          <Card className="immersive-card border-2 border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-green-600" />
                <span className="text-green-800">AI Copilot</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Current Recommendation */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-800">Top Recommendation</span>
                </div>
                <div className="space-y-2">
                  <div className="font-semibold">{mockData.availablePlayers[0].name}</div>
                  <div className="text-sm text-gray-600">
                    {mockData.aiInsights.currentRecommendation.reasoning}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      94% Confidence
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Draft Strategy */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Draft Strategy
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phase:</span>
                    <span className="font-medium">{mockData.aiInsights.draftStrategy.phase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Focus:</span>
                    <span className="font-medium">{mockData.aiInsights.draftStrategy.focus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Risk:</span>
                    <span className="font-medium">{mockData.aiInsights.draftStrategy.riskTolerance}</span>
                  </div>
                </div>
              </div>

              {/* Position Needs */}
              <div className="space-y-3">
                <h4 className="font-semibold">Position Priorities</h4>
                <div className="space-y-2">
                  {mockData.userTeam.needs.map((position, index) => (
                    <div key={position} className="flex items-center space-x-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">{position}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Picks */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Your Next Picks</h4>
                <div className="flex space-x-2">
                  {mockData.userTeam.picksRemaining.slice(0, 3).map((pick, index) => (
                    <Badge key={pick} variant="outline" className="text-xs">
                      {pick}
                    </Badge>
                  ))}
                  <span className="text-xs text-gray-500">+{mockData.userTeam.picksRemaining.length - 3} more</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Picks */}
          <Card className="immersive-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recent Picks</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-64 overflow-y-auto">
                {draftBoard.slice().reverse().map((pick, index) => (
                  <motion.div
                    key={pick.pickNumber}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">{pick.playerName}</div>
                        <div className="text-xs text-gray-500">
                          {pick.position} • {pick.team}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">#{pick.pickNumber}</div>
                        <div className="text-xs text-gray-500">R{pick.round}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Action Button */}
      {isUserTurn && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2"
        >
          <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 text-lg shadow-2xl animate-pulse-glow">
            <Zap className="h-5 w-5 mr-2" />
            Make Your Pick
          </Button>
        </motion.div>
      )}
    </div>
  );
}