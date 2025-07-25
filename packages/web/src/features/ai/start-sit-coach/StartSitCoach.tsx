'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Zap,
  Target,
  CheckCircle,
  XCircle,
  Info,
  Sparkles,
  Users,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import mock data
import mockData from './mock/players.json';

interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  opponent: string;
  projectedPoints: number;
  confidence: number;
  recommendation: 'START' | 'SIT';
  reasoning: string[];
  matchupData: {
    defenseRank: number;
    pointsAllowed: number;
    weather: string;
    gameScript: string;
  };
}

interface StartSitRecommendation {
  action: 'START' | 'SIT';
  confidence: number;
  reasoning: string[];
}

export function StartSitCoach() {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [recommendations, setRecommendations] = useState<Record<string, StartSitRecommendation>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(12);

  // Load mock data on component mount
  useEffect(() => {
    setSelectedPlayers(mockData.userRoster);
    setCurrentWeek(mockData.weekInfo.week);
    
    // Simulate initial recommendations
    const initialRecs: Record<string, StartSitRecommendation> = {};
    mockData.userRoster.forEach(player => {
      initialRecs[player.id] = {
        action: player.recommendation,
        confidence: player.confidence,
        reasoning: player.reasoning
      };
    });
    setRecommendations(initialRecs);
    setShowResults(true);
  }, []);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setShowResults(false);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      const newRecs: Record<string, StartSitRecommendation> = {};
      selectedPlayers.forEach(player => {
        newRecs[player.id] = {
          action: player.recommendation,
          confidence: player.confidence,
          reasoning: player.reasoning
        };
      });
      setRecommendations(newRecs);
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2500);
  };

  const getRecommendationColor = (action: 'START' | 'SIT') => {
    return action === 'START' 
      ? 'from-success-500 to-success-600' 
      : 'from-error-500 to-error-600';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-success-600';
    if (confidence >= 60) return 'text-warning-600';
    return 'text-error-600';
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-locker-gradient rounded-full">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-locker-gradient bg-clip-text text-transparent">
            AI Start/Sit Coach
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get personalized recommendations powered by advanced AI analysis
        </p>
        <Badge variant="secondary" className="bg-success-100 text-success-800">
          <CheckCircle className="h-4 w-4 mr-1" />
          No betting factors • Pure fantasy focus
        </Badge>
      </motion.div>

      {/* Week Info Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Calendar className="h-6 w-6" />
            <div>
              <h3 className="text-lg font-semibold">Week {currentWeek} Analysis</h3>
              <p className="text-primary-100">Lineup decisions due Sunday at 1:00 PM ET</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{selectedPlayers.length}</div>
            <div className="text-sm text-primary-100">Players analyzed</div>
          </div>
        </div>
      </motion.div>

      {/* Analysis Button */}
      <div className="text-center">
        <Button 
          onClick={handleAnalyze}
          disabled={isAnalyzing || selectedPlayers.length === 0}
          className="locker-button text-lg px-8 py-4"
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="h-5 w-5 mr-2 animate-spin" />
              Analyzing Matchups...
            </>
          ) : (
            <>
              <Brain className="h-5 w-5 mr-2" />
              Get AI Recommendations
            </>
          )}
        </Button>
      </div>

      {/* Loading State */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <Card className="immersive-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="animate-pulse-glow">
                    <Brain className="h-6 w-6 text-primary-500" />
                  </div>
                  <h3 className="text-lg font-semibold">AI Analysis in Progress</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Analyzing matchup data...</span>
                    <span className="text-primary-500">100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Processing weather conditions...</span>
                    <span className="text-primary-500">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Evaluating recent performance trends...</span>
                    <span className="text-primary-500">70%</span>
                  </div>
                  <Progress value={70} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {selectedPlayers.map((player, index) => {
                const rec = recommendations[player.id];
                if (!rec) return null;

                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`immersive-card hover:scale-105 transition-all duration-300 ${
                      rec.action === 'START' ? 'ring-2 ring-success-200' : 'ring-2 ring-error-200'
                    }`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{player.name}</CardTitle>
                            <p className="text-sm text-gray-500">
                              {player.position} • {player.team} vs {player.opponent}
                            </p>
                          </div>
                          <Badge 
                            className={`bg-gradient-to-r ${getRecommendationColor(rec.action)} text-white font-bold px-3 py-1`}
                          >
                            {rec.action === 'START' ? (
                              <TrendingUp className="h-4 w-4 mr-1" />
                            ) : (
                              <TrendingDown className="h-4 w-4 mr-1" />
                            )}
                            {rec.action}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Confidence Score */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Confidence</span>
                            <span className={`text-lg font-bold ${getConfidenceColor(rec.confidence)}`}>
                              {rec.confidence}%
                            </span>
                          </div>
                          <Progress 
                            value={rec.confidence} 
                            className={`h-2 ${rec.confidence >= 80 ? 'bg-success-100' : rec.confidence >= 60 ? 'bg-warning-100' : 'bg-error-100'}`}
                          />
                        </div>

                        {/* Projected Points */}
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">Projected Points</span>
                          <span className="text-xl font-bold text-primary-600">
                            {player.projectedPoints}
                          </span>
                        </div>

                        {/* Matchup Info */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="font-semibold text-blue-600">#{player.matchupData.defenseRank}</div>
                            <div className="text-blue-500">Def Rank</div>
                          </div>
                          <div className="text-center p-2 bg-purple-50 rounded">
                            <div className="font-semibold text-purple-600">{player.matchupData.pointsAllowed}</div>
                            <div className="text-purple-500">Pts Allowed</div>
                          </div>
                        </div>

                        {/* AI Reasoning */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Sparkles className="h-4 w-4 text-primary-500" />
                            <span className="text-sm font-medium">AI Analysis</span>
                          </div>
                          <ul className="space-y-1">
                            {rec.reasoning.slice(0, 2).map((reason, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start space-x-2">
                                <CheckCircle className="h-3 w-3 text-success-500 mt-0.5 flex-shrink-0" />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Weather & Game Script */}
                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Weather: {player.matchupData.weather}</span>
                            <span>Script: {player.matchupData.gameScript}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Insights Summary */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="immersive-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-primary-500" />
                <span>Weekly Strategy Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-success-600 mb-2">
                    {selectedPlayers.filter(p => recommendations[p.id]?.action === 'START').length}
                  </div>
                  <div className="text-sm text-gray-600">Recommended Starts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-error-600 mb-2">
                    {selectedPlayers.filter(p => recommendations[p.id]?.action === 'SIT').length}
                  </div>
                  <div className="text-sm text-gray-600">Recommended Sits</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    {Math.round(Object.values(recommendations).reduce((acc, rec) => acc + rec.confidence, 0) / Object.values(recommendations).length)}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Confidence</div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-primary-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-primary-700 mb-1">AI Methodology</h4>
                    <p className="text-sm text-gray-600">
                      Our AI analyzes matchup data, weather conditions, recent performance trends, 
                      injury reports, and game script projections to provide personalized recommendations. 
                      No betting odds or gambling factors are considered.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}