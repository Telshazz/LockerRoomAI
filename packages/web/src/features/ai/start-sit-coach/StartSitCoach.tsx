'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  opponent: string;
  projectedPoints: number;
  confidence: number;
  reasoning: string[];
}

interface StartSitRecommendation {
  action: 'START' | 'SIT' | 'FLEX';
  confidence: number;
  reasoning: string[];
}

export function StartSitCoach() {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [recommendations, setRecommendations] = useState<Record<string, StartSitRecommendation>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // TODO: Integrate with AI API
    // Mock delay for demonstration
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Brain className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">AI Start/Sit Coach</h1>
        <Badge variant="secondary">No betting factors</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Weekly Lineup Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Player Selection Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-gray-600">
              Add players from your roster to get personalized start/sit recommendations
            </p>
            <Button className="mt-2" variant="outline">
              Add Players
            </Button>
          </div>

          {/* Selected Players */}
          {selectedPlayers.length > 0 && (
            <div className="space-y-2">
              {selectedPlayers.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium">{player.name}</p>
                      <p className="text-sm text-gray-500">
                        {player.position} • {player.team} vs {player.opponent}
                      </p>
                    </div>
                  </div>
                  
                  {recommendations[player.id] && (
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={recommendations[player.id].action === 'START' ? 'default' : 'secondary'}
                        className="flex items-center space-x-1"
                      >
                        {recommendations[player.id].action === 'START' ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{recommendations[player.id].action}</span>
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {recommendations[player.id].confidence}% confidence
                      </span>
                    </div>
                  )}
                </div>
              ))}

              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? 'Analyzing...' : 'Get AI Recommendations'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Select players to receive personalized recommendations based on:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-500">
            <li>• Matchup analysis & defensive rankings</li>
            <li>• Weather conditions & game environment</li>
            <li>• Recent performance trends</li>
            <li>• Injury reports & snap count projections</li>
            <li>• Game script & pace predictions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 