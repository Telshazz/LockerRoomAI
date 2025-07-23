'use client';

import React, { useState } from 'react';
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
  Calculator 
} from 'lucide-react';

interface TradePlayer {
  id: string;
  name: string;
  position: string;
  team: string;
  currentValue: number;
  projectedValue: number;
  age: number;
  injury_risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface TradeEvaluation {
  fairnessIndex: number; // 0-100
  vetoRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  winner: 'TEAM_A' | 'TEAM_B' | 'BALANCED';
  reasoning: string[];
  marketAnalysis: {
    team_a_value: number;
    team_b_value: number;
    value_difference: number;
  };
}

export function TradeEvaluator() {
  const [teamAPlayers, setTeamAPlayers] = useState<TradePlayer[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<TradePlayer[]>([]);
  const [evaluation, setEvaluation] = useState<TradeEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    // TODO: Integrate with AI API
    // Mock evaluation for demonstration
    setTimeout(() => {
      setEvaluation({
        fairnessIndex: 85,
        vetoRisk: 'LOW',
        winner: 'BALANCED',
        reasoning: [
          'Trade values are within 10% margin',
          'Both teams address positional needs',
          'Age considerations favor long-term balance',
          'No collusion indicators detected'
        ],
        marketAnalysis: {
          team_a_value: 245,
          team_b_value: 238,
          value_difference: 7
        }
      });
      setIsEvaluating(false);
    }, 3000);
  };

  const getFairnessColor = (index: number) => {
    if (index >= 80) return 'text-green-600';
    if (index >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVetoRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Scale className="h-6 w-6 text-purple-600" />
        <h1 className="text-2xl font-bold">AI Trade Evaluator</h1>
        <Badge variant="secondary">Fairness Index & Veto Risk</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team A */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Team A Gives</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <p className="text-gray-600">Add players Team A is trading away</p>
              <Button className="mt-2" variant="outline">
                Add Players
              </Button>
            </div>
            
            {teamAPlayers.map((player) => (
              <div key={player.id} className="mt-2 p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{player.name}</p>
                    <p className="text-sm text-gray-500">
                      {player.position} • {player.team}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Value: {player.currentValue}</p>
                    <Badge 
                      variant="secondary" 
                      className={
                        player.injury_risk === 'LOW' ? 'bg-green-100' :
                        player.injury_risk === 'MEDIUM' ? 'bg-yellow-100' : 'bg-red-100'
                      }
                    >
                      {player.injury_risk} risk
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Team B */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Team B Gives</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <p className="text-gray-600">Add players Team B is trading away</p>
              <Button className="mt-2" variant="outline">
                Add Players
              </Button>
            </div>
            
            {teamBPlayers.map((player) => (
              <div key={player.id} className="mt-2 p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{player.name}</p>
                    <p className="text-sm text-gray-500">
                      {player.position} • {player.team}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Value: {player.currentValue}</p>
                    <Badge 
                      variant="secondary"
                      className={
                        player.injury_risk === 'LOW' ? 'bg-green-100' :
                        player.injury_risk === 'MEDIUM' ? 'bg-yellow-100' : 'bg-red-100'
                      }
                    >
                      {player.injury_risk} risk
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Evaluate Button */}
      {(teamAPlayers.length > 0 || teamBPlayers.length > 0) && (
        <Button 
          onClick={handleEvaluate}
          disabled={isEvaluating}
          className="w-full"
          size="lg"
        >
          <Calculator className="h-4 w-4 mr-2" />
          {isEvaluating ? 'Evaluating Trade...' : 'Analyze Trade Fairness'}
        </Button>
      )}

      {/* Evaluation Results */}
      {evaluation && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Scale className="h-5 w-5 text-purple-600" />
              <span>AI Trade Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Fairness Index */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Fairness Index</span>
                <span className={`text-2xl font-bold ${getFairnessColor(evaluation.fairnessIndex)}`}>
                  {evaluation.fairnessIndex}%
                </span>
              </div>
              <Progress value={evaluation.fairnessIndex} className="h-3" />
              <p className="text-sm text-gray-600 mt-1">
                {evaluation.fairnessIndex >= 80 ? 'Highly fair trade' :
                 evaluation.fairnessIndex >= 60 ? 'Moderately fair trade' :
                 'Potentially unfair trade'}
              </p>
            </div>

            {/* Veto Risk */}
            <div className="flex items-center justify-between">
              <span className="font-medium">Veto Risk</span>
              <Badge className={getVetoRiskColor(evaluation.vetoRisk)}>
                {evaluation.vetoRisk === 'LOW' && <CheckCircle className="h-3 w-3 mr-1" />}
                {evaluation.vetoRisk === 'HIGH' && <AlertTriangle className="h-3 w-3 mr-1" />}
                {evaluation.vetoRisk}
              </Badge>
            </div>

            {/* Market Analysis */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Market Analysis</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Team A Value</p>
                  <p className="font-medium">{evaluation.marketAnalysis.team_a_value}</p>
                </div>
                <div>
                  <p className="text-gray-600">Team B Value</p>
                  <p className="font-medium">{evaluation.marketAnalysis.team_b_value}</p>
                </div>
                <div>
                  <p className="text-gray-600">Difference</p>
                  <p className="font-medium">{evaluation.marketAnalysis.value_difference}</p>
                </div>
              </div>
            </div>

            {/* AI Reasoning */}
            <div>
              <h4 className="font-medium mb-2">AI Reasoning</h4>
              <ul className="space-y-1">
                {evaluation.reasoning.map((reason, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 