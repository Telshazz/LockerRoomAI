'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Scale, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Users,
  Calculator,
  Zap,
  Target,
  Award,
  Shield,
  Brain,
  BarChart3,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import mock data
import mockData from './mock/trades.json';

interface TradePlayer {
  id: string;
  name: string;
  position: string;
  team: string;
  currentValue: number;
  projectedValue: number;
  age: number | null;
  injuryRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'NONE';
  recentPerformance: string;
  seasonStats?: any;
  pickDetails?: {
    year: number;
    round: number;
    originalTeam: string;
  };
}

interface TradeEvaluation {
  fairnessIndex: number;
  vetoRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  winner: 'TEAM_A' | 'TEAM_B' | 'BALANCED';
  reasoning: string[];
  marketAnalysis: {
    teamAValue: number;
    teamBValue: number;
    valueDifference: number;
    fairnessScore: number;
  };
  riskFactors: string[];
  positionalNeeds: {
    teamA: string;
    teamB: string;
  };
}

export function TradeEvaluator() {
  const [teamAPlayers, setTeamAPlayers] = useState<TradePlayer[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<TradePlayer[]>([]);
  const [evaluation, setEvaluation] = useState<TradeEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Load mock data on component mount
  useEffect(() => {
    setTeamAPlayers(mockData.sampleTrade.teamA.players);
    setTeamBPlayers(mockData.sampleTrade.teamB.players);
    setEvaluation(mockData.sampleTrade.evaluation);
    setShowResults(true);
  }, []);

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setShowResults(false);
    
    // Simulate AI evaluation
    setTimeout(() => {
      setEvaluation(mockData.sampleTrade.evaluation);
      setIsEvaluating(false);
      setShowResults(true);
    }, 3000);
  };

  const getFairnessColor = (index: number) => {
    if (index >= 85) return 'text-success-600';
    if (index >= 70) return 'text-warning-600';
    return 'text-error-600';
  };

  const getVetoRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-success-100 text-success-800 border-success-200';
      case 'MEDIUM': return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'HIGH': return 'bg-error-100 text-error-800 border-error-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInjuryRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-success-100 text-success-700';
      case 'MEDIUM': return 'bg-warning-100 text-warning-700';
      case 'HIGH': return 'bg-error-100 text-error-700';
      case 'NONE': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderPlayerCard = (player: TradePlayer, teamSide: 'A' | 'B') => (
    <motion.div
      key={player.id}
      initial={{ opacity: 0, x: teamSide === 'A' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-lg">{player.name}</h4>
          <p className="text-sm text-gray-500">
            {player.position} • {player.team}
            {player.age && ` • Age ${player.age}`}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-primary-600">
            {player.currentValue}
          </div>
          <div className="text-xs text-gray-500">Current Value</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Projected Value:</span>
          <span className={`font-medium ${
            player.projectedValue > player.currentValue 
              ? 'text-success-600' 
              : player.projectedValue < player.currentValue 
                ? 'text-error-600' 
                : 'text-gray-600'
          }`}>
            {player.projectedValue}
            {player.projectedValue !== player.currentValue && (
              <span className="ml-1 text-xs">
                ({player.projectedValue > player.currentValue ? '+' : ''}
                {player.projectedValue - player.currentValue})
              </span>
            )}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Injury Risk:</span>
          <Badge className={`text-xs ${getInjuryRiskColor(player.injuryRisk)}`}>
            {player.injuryRisk}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Recent Form:</span>
          <span className="text-sm font-medium">{player.recentPerformance}</span>
        </div>

        {player.pickDetails && (
          <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
            <div className="text-sm font-medium text-purple-700">
              {player.pickDetails.year} Round {player.pickDetails.round} Pick
            </div>
            <div className="text-xs text-purple-600">
              Originally: {player.pickDetails.originalTeam}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <Scale className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Trade Evaluator
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Analyze trade fairness with AI-powered market evaluation and veto risk assessment
        </p>
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          <Shield className="h-4 w-4 mr-1" />
          Fairness Index • Veto Risk Analysis
        </Badge>
      </motion.div>

      {/* Trade Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Team A */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="immersive-card">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800">Team A Gives</span>
                <Badge className="bg-blue-200 text-blue-800">
                  Value: {teamAPlayers.reduce((sum, p) => sum + p.currentValue, 0)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {teamAPlayers.map(player => renderPlayerCard(player, 'A'))}
                
                {teamAPlayers.length === 0 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Add players Team A is trading away</p>
                    <Button className="mt-4" variant="outline">
                      Add Players
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team B */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="immersive-card">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="text-purple-800">Team B Gives</span>
                <Badge className="bg-purple-200 text-purple-800">
                  Value: {teamBPlayers.reduce((sum, p) => sum + p.currentValue, 0)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {teamBPlayers.map(player => renderPlayerCard(player, 'B'))}
                
                {teamBPlayers.length === 0 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Add players Team B is trading away</p>
                    <Button className="mt-4" variant="outline">
                      Add Players
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Evaluate Button */}
      {(teamAPlayers.length > 0 || teamBPlayers.length > 0) && (
        <div className="text-center">
          <Button 
            onClick={handleEvaluate}
            disabled={isEvaluating}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-8 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            <Calculator className="h-5 w-5 mr-2" />
            {isEvaluating ? 'Evaluating Trade...' : 'Analyze Trade Fairness'}
          </Button>
        </div>
      )}

      {/* Loading State */}
      <AnimatePresence>
        {isEvaluating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="immersive-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="animate-pulse-glow">
                    <Brain className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold">AI Trade Analysis in Progress</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Calculating market values...</span>
                    <span className="text-purple-500">100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Analyzing positional needs...</span>
                    <span className="text-purple-500">90%</span>
                  </div>
                  <Progress value={90} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Assessing veto risk factors...</span>
                    <span className="text-purple-500">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Evaluation Results */}
      <AnimatePresence>
        {evaluation && showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Main Results Card */}
            <Card className="immersive-card border-2 border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center space-x-2">
                  <Scale className="h-6 w-6 text-purple-600" />
                  <span className="text-purple-800">AI Trade Analysis Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Key Metrics */}
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Fairness Index */}
                  <div className="text-center">
                    <div className="mb-4">
                      <div className={`text-4xl font-bold ${getFairnessColor(evaluation.fairnessIndex)}`}>
                        {evaluation.fairnessIndex}%
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Fairness Index</div>
                    </div>
                    <Progress value={evaluation.fairnessIndex} className="h-3" />
                    <p className="text-xs text-gray-500 mt-2">
                      {evaluation.fairnessIndex >= 85 ? 'Highly fair trade' :
                       evaluation.fairnessIndex >= 70 ? 'Moderately fair trade' :
                       'Potentially unfair trade'}
                    </p>
                  </div>

                  {/* Veto Risk */}
                  <div className="text-center">
                    <div className="mb-4">
                      <Badge className={`text-lg px-4 py-2 ${getVetoRiskColor(evaluation.vetoRisk)}`}>
                        {evaluation.vetoRisk === 'LOW' && <CheckCircle className="h-4 w-4 mr-2" />}
                        {evaluation.vetoRisk === 'HIGH' && <AlertTriangle className="h-4 w-4 mr-2" />}
                        {evaluation.vetoRisk === 'MEDIUM' && <Info className="h-4 w-4 mr-2" />}
                        {evaluation.vetoRisk} RISK
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">Veto Probability</div>
                  </div>

                  {/* Trade Winner */}
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-gray-700">
                        {evaluation.winner === 'BALANCED' ? 'BALANCED' : 
                         evaluation.winner === 'TEAM_A' ? 'TEAM A WINS' : 'TEAM B WINS'}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Trade Outcome</div>
                    </div>
                    {evaluation.winner !== 'BALANCED' && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                        <Award className="h-3 w-3 mr-1" />
                        Slight Advantage
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Market Analysis */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                  <h4 className="font-semibold mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                    Market Analysis
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-blue-600">{evaluation.marketAnalysis.teamAValue}</div>
                      <div className="text-sm text-gray-600">Team A Value</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-purple-600">{evaluation.marketAnalysis.teamBValue}</div>
                      <div className="text-sm text-gray-600">Team B Value</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-700">{evaluation.marketAnalysis.valueDifference}</div>
                      <div className="text-sm text-gray-600">Difference</div>
                    </div>
                  </div>
                </div>

                {/* AI Reasoning */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-purple-600" />
                    AI Analysis & Reasoning
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-success-700 mb-2">Positive Factors</h5>
                      <ul className="space-y-2">
                        {evaluation.reasoning.slice(0, 3).map((reason, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-success-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-warning-700 mb-2">Risk Factors</h5>
                      <ul className="space-y-2">
                        {evaluation.riskFactors.map((risk, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-warning-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Positional Needs */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
                  <h4 className="font-semibold mb-4 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-green-600" />
                    Positional Analysis
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-blue-700 mb-2">Team A Needs</h5>
                      <p className="text-sm text-gray-700">{evaluation.positionalNeeds.teamA}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-purple-700 mb-2">Team B Needs</h5>
                      <p className="text-sm text-gray-700">{evaluation.positionalNeeds.teamB}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}