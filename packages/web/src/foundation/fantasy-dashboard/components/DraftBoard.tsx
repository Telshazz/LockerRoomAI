import React, { useState, useEffect, useMemo } from 'react';
import { Player, Roster, User, League, Draft, DraftPick as SleeperDraftPick, TradedPick } from '../types/sleeper';
import { fetchLeagueDrafts, fetchDraft, fetchDraftPicks, fetchTradedPicks } from '../services/sleeper-api';

// KTC Rookie Rankings for 2025 (fetched from https://keeptradecut.com/dynasty-rankings/rookie-rankings)
const KTC_ROOKIE_RANKINGS = [
  { name: "Ashton Jeanty", position: "RB" },
  { name: "Omarion Hampton", position: "RB" },
  { name: "Travis Hunter", position: "WR" },
  { name: "Cam Ward", position: "QB" },
  { name: "Tetairoa McMillan", position: "WR" },
  { name: "TreVeyon Henderson", position: "RB" },
  { name: "Quinshon Judkins", position: "RB" },
  { name: "Emeka Egbuka", position: "WR" },
  { name: "Tyler Warren", position: "TE" },
  { name: "Colston Loveland", position: "TE" },
  { name: "Matthew Golden", position: "WR" },
  { name: "Jaxson Dart", position: "QB" },
  { name: "Kaleb Johnson", position: "RB" },
  { name: "Luther Burden", position: "WR" },
  { name: "Cam Skattebo", position: "RB" },
  { name: "Jalen Milroe", position: "QB" },
  { name: "Jayden Higgins", position: "WR" },
  { name: "Tre Harris", position: "WR" },
  { name: "RJ Harvey", position: "RB" },
  { name: "Shedeur Sanders", position: "QB" },
  { name: "Dylan Sampson", position: "RB" },
  { name: "Jack Bech", position: "WR" },
  { name: "Jaylin Noel", position: "WR" },
  { name: "Devin Neal", position: "RB" },
  { name: "Trevor Etienne", position: "RB" },
  { name: "Bhayshul Tuten", position: "RB" },
  { name: "Ollie Gordon", position: "RB" },
  { name: "Elijah Arroyo", position: "TE" },
  { name: "Elic Ayomanor", position: "WR" },
  { name: "Tyler Shough", position: "QB" },
  { name: "DJ Giddens", position: "RB" },
  { name: "Harold Fannin", position: "TE" },
  { name: "Isaiah Bond", position: "WR" },
  { name: "Jalen Royals", position: "WR" },
  { name: "Quinn Ewers", position: "QB" },
  { name: "Dillon Gabriel", position: "QB" },
  { name: "Xavier Restrepo", position: "WR" },
  { name: "Damien Martinez", position: "RB" },
  { name: "Mason Taylor", position: "TE" },
  { name: "Jaydon Blue", position: "RB" },
  { name: "Will Howard", position: "QB" },
  { name: "Tez Johnson", position: "WR" },
  { name: "Terrance Ferguson", position: "TE" },
  { name: "Jordan James", position: "RB" },
  { name: "Gunnar Helm", position: "TE" },
  { name: "Kyle McCord", position: "QB" },
  { name: "Riley Leonard", position: "QB" },
  { name: "Donovan Edwards", position: "RB" },
  { name: "Brashard Smith", position: "RB" },
  { name: "Tory Horton", position: "WR" }
];

// Define types for draft-specific data
interface DraftPlayer extends Player {
  rank: number;
  adp?: number; // Average Draft Position (optional)
  team_needs_fit?: number; // 1-10 score of how well player fits team needs
  isRookie: boolean;
  ktcRank?: number; // KTC ranking if available
}

interface DraftPickData {
  round: number;
  original_roster_id: number;
  roster_id: number;
  pick_number: number;
  player_id?: string;
  is_traded: boolean;
}

// Define a type for team need data
interface PositionNeedData {
  count: number;
  avg: number;
  diff: number;
  score: number;
}

interface DraftTeam {
  roster_id: number;
  user_id: string;
  username: string;
  team_name?: string;
  avatar?: string;
  picks: DraftPickData[];
  needs: Record<string, PositionNeedData>;
}

interface DraftBoardProps {
  players: { [key: string]: Player };
  rosters: Roster[];
  users: User[];
  league: League;
}

// Rookie year threshold (players with years_exp <= this number are considered rookies)
const ROOKIE_THRESHOLD = 0;

const DraftBoard: React.FC<DraftBoardProps> = ({ players, rosters, users, league }) => {
  const [rookies, setRookies] = useState<DraftPlayer[]>([]);
  const [draftOrder, setDraftOrder] = useState<DraftTeam[]>([]);
  const [draggedPlayer, setDraggedPlayer] = useState<DraftPlayer | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'rank' | 'name' | 'position'>('rank');
  const [totalRounds, setTotalRounds] = useState(5); // Default, will be updated from API
  const [customRankingsMode, setCustomRankingsMode] = useState(false);
  const [savedRankings, setSavedRankings] = useState<Record<string, number>>({});
  const [showVeterans, setShowVeterans] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teamSelections, setTeamSelections] = useState<Record<string, string>>({});
  const [cheatSheet, setCheatSheet] = useState<string[]>([]); // IDs of players in cheat sheet
  const [draftData, setDraftData] = useState<{
    draft: Draft | null;
    picks: SleeperDraftPick[];
    tradedPicks: TradedPick[];
  }>({ draft: null, picks: [], tradedPicks: [] });
  
  // Mobile-friendly selection states
  const [selectedPlayer, setSelectedPlayer] = useState<DraftPlayer | null>(null);
  const [selectionMode, setSelectionMode] = useState<'draft' | 'watchlist' | null>(null);
  const [showMobileSelector, setShowMobileSelector] = useState(false);
  const [targetPick, setTargetPick] = useState<{teamIndex: number, pick: DraftPickData} | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  // Get valid positions from league settings
  const validPositions = useMemo(() => {
    if (!league || !league.roster_positions) return ['QB', 'RB', 'WR', 'TE'];
    
    // Extract unique offensive positions and filter out defensive positions, kickers, and defenses
    return [...new Set(league.roster_positions)].filter(pos => 
      ['QB', 'RB', 'WR', 'TE', 'FLEX', 'SUPER_FLEX', 'REC_FLEX'].includes(pos)
    );
  }, [league]);
  
  // Check if a player's position is valid for this league
  const isValidPosition = (position: string): boolean => {
    if (!position) return false;
    
    // Only consider offensive skill positions
    if (['QB', 'RB', 'WR', 'TE'].includes(position)) {
      // Check if this position or a FLEX that could accommodate it is in valid positions
      return validPositions.some(pos => {
        if (pos === position) return true;
        if (pos === 'FLEX' && ['RB', 'WR', 'TE'].includes(position)) return true;
        if (pos === 'SUPER_FLEX' && ['QB', 'RB', 'WR', 'TE'].includes(position)) return true;
        if (pos === 'REC_FLEX' && ['WR', 'TE'].includes(position)) return true;
        return false;
      });
    }
    
    return false;
  };

  // Helper function to match a player with KTC rankings
  const findKtcRanking = (player: Player): number | undefined => {
    if (!player.first_name || !player.last_name) return undefined;
    
    const playerFullName = `${player.first_name} ${player.last_name}`.toLowerCase();
    const playerFirstName = player.first_name.toLowerCase();
    const playerLastName = player.last_name.toLowerCase();
    
    // Try to find an exact match first
    const exactMatch = KTC_ROOKIE_RANKINGS.findIndex(
      ktcPlayer => ktcPlayer.name.toLowerCase() === playerFullName && 
                   ktcPlayer.position === player.position
    );
    
    if (exactMatch !== -1) {
      return exactMatch + 1; // KTC ranks are 1-based
    }
    
    // Try to find a match with common name variations
    const nameVariationMatch = KTC_ROOKIE_RANKINGS.findIndex(
      ktcPlayer => {
        const ktcName = ktcPlayer.name.toLowerCase();
        const ktcParts = ktcName.split(' ');
        
        // Handle common nickname/full name variations
        const nameVariations = [
          // Cameron -> Cam
          playerFirstName === 'cameron' && ktcName.includes('cam '),
          // Cam -> Cameron  
          playerFirstName === 'cam' && ktcName.includes('cameron '),
          // Check if last names match and first names are similar
          ktcParts[ktcParts.length - 1] === playerLastName && 
          (ktcParts[0] === playerFirstName || 
           ktcParts[0].startsWith(playerFirstName.substring(0, 3)) ||
           playerFirstName.startsWith(ktcParts[0].substring(0, 3))),
        ];
        
        return nameVariations.some(variation => variation) && 
               ktcPlayer.position === player.position;
      }
    );
    
    if (nameVariationMatch !== -1) {
      return nameVariationMatch + 1;
    }
    
    // Try to find a partial match (e.g., if names are slightly different)
    const partialMatch = KTC_ROOKIE_RANKINGS.findIndex(
      ktcPlayer => {
        const ktcName = ktcPlayer.name.toLowerCase();
        return ktcName.includes(playerFirstName) && 
               ktcName.includes(playerLastName) &&
               ktcPlayer.position === player.position;
      }
    );
    
    if (partialMatch !== -1) {
      return partialMatch + 1;
    }
    
    return undefined;
  };
  
  // Load saved rankings, team selections, and cheat sheet from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rookieRankings');
      if (saved) {
        try {
          setSavedRankings(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load saved rankings:', e);
        }
      }
      
      const savedSelections = localStorage.getItem('teamSelections');
      if (savedSelections) {
        try {
          setTeamSelections(JSON.parse(savedSelections));
        } catch (e) {
          console.error('Failed to load saved team selections:', e);
        }
      }
      
      const savedCheatSheet = localStorage.getItem('draftCheatSheet');
      if (savedCheatSheet) {
        try {
          setCheatSheet(JSON.parse(savedCheatSheet));
        } catch (e) {
          console.error('Failed to load saved cheat sheet:', e);
        }
      }
    }
  }, []);
  
  // Save rankings to localStorage when they change
  const saveRankings = (rankings: Record<string, number>) => {
    setSavedRankings(rankings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rookieRankings', JSON.stringify(rankings));
    }
  };
  
  // Save team selections to localStorage when they change
  const saveTeamSelections = (selections: Record<string, string>) => {
    setTeamSelections(selections);
    if (typeof window !== 'undefined') {
      localStorage.setItem('teamSelections', JSON.stringify(selections));
    }
  };
  
  // Save cheat sheet to localStorage when it changes
  const saveCheatSheet = (sheet: string[]) => {
    setCheatSheet(sheet);
    if (typeof window !== 'undefined') {
      localStorage.setItem('draftCheatSheet', JSON.stringify(sheet));
    }
  };
  
  // Toggle custom rankings mode and save rankings when exiting
  const toggleCustomRankingsMode = () => {
    if (customRankingsMode) {
      // We're exiting custom mode, save the current rankings
      const rankings: Record<string, number> = {};
      rookies.forEach((player, idx) => {
        rankings[player.player_id] = idx + 1;
      });
      saveRankings(rankings);
    }
    setCustomRankingsMode(!customRankingsMode);
  };

  // Fetch draft data
  useEffect(() => {
    const fetchDraftData = async () => {
      if (!league || !league.league_id) return;
      
      setIsLoading(true);
      
      try {
        // Get all drafts for the league
        const drafts = await fetchLeagueDrafts(league.league_id);
        
        // Find the most recent draft (usually for the current season)
        // or use the draft_id from the league if available
        const targetDraftId = league.draft_id || 
          (drafts && drafts.length > 0 ? 
            drafts.sort((a, b) => b.created - a.created)[0].draft_id : null);
        
        if (!targetDraftId) {
          console.error("Could not find a valid draft ID");
          setIsLoading(false);
          return;
        }

        // Fetch the draft details, picks, and traded picks
        const [draft, picks, tradedPicks] = await Promise.all([
          fetchDraft(targetDraftId),
          fetchDraftPicks(targetDraftId),
          fetchTradedPicks(targetDraftId)
        ]);
        
        setDraftData({ draft, picks, tradedPicks });
        
        // Update total rounds from draft settings
        if (draft && draft.settings && draft.settings.rounds) {
          setTotalRounds(draft.settings.rounds);
        }
        
      } catch (error) {
        console.error("Error fetching draft data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDraftData();
  }, [league]);

  // Process players to identify rookies and veterans
  useEffect(() => {
    // More accurate rookie detection
    const isRookie = (player: Player): boolean => {
      if (!player) return false;
      
      // Primary check: years of experience - strictly 0 for rookies
      if (typeof player.years_exp === 'number' && player.years_exp === 0) return true;
      
      // Player with "R" status (rookie)
      if (player.status === 'R') return true;
      
      // Look for other rookie indicators, but still ensure years_exp is 0
      const isCurrentYearRookie = Boolean(player.college) && 
        (typeof player.years_exp === 'number' && player.years_exp === 0);
      
      return isCurrentYearRookie;
    };

    // Filter and process players
    const processedPlayers: DraftPlayer[] = Object.values(players)
      .filter(player => 
        // Filter based on position validity
        isValidPosition(player.position) && 
        // Filter based on rookie status if showVeterans is false
        (showVeterans || isRookie(player))
      )
      .map((player) => {
        // Find KTC ranking if available
        const ktcRank = findKtcRanking(player);
        
        // Determine rank - if in custom ranking mode and there's a saved ranking, use that first
        // Otherwise use KTC if available, or a high value to put unranked players at the end
        const rank = customRankingsMode && savedRankings[player.player_id] 
          ? savedRankings[player.player_id] 
          : ktcRank || savedRankings[player.player_id] || 9999;
        

        
        return {
          ...player,
          rank,
          ktcRank,
          isRookie: isRookie(player)
        };
      })
      // Sort by rank (Custom ranks first if in custom mode, otherwise KTC ranks first)
      .sort((a, b) => {
        if (customRankingsMode) {
          // In custom mode, always use our rank first
          if (savedRankings[a.player_id] && savedRankings[b.player_id]) {
            return savedRankings[a.player_id] - savedRankings[b.player_id];
          }
          // If only one has a saved ranking, prioritize that one
          if (savedRankings[a.player_id]) return -1;
          if (savedRankings[b.player_id]) return 1;
        }
        
        // If both have KTC rank, use those
        if (a.ktcRank && b.ktcRank) return a.ktcRank - b.ktcRank;
        // If only one has KTC rank, prioritize that one
        if (a.ktcRank) return -1;
        if (b.ktcRank) return 1;
        // Otherwise use our rank
        return a.rank - b.rank;
      });
    
    setRookies(processedPlayers);
    
  }, [players, validPositions, savedRankings, showVeterans, customRankingsMode]);

  // Process draft order and picks
  useEffect(() => {
    if (isLoading || !draftData.draft) return;
    
    // Create a mapping of roster_id to team
    const teamsMap: Record<number, DraftTeam> = {};

    // Calculate league-wide positional averages
    const positionCounts: Record<string, number[]> = {};
    
    // Get valid positions for this league
    const leaguePositions = validPositions.filter(pos => 
      ['QB', 'RB', 'WR', 'TE'].includes(pos)
    );
    
    // Initialize position counts for each position
    leaguePositions.forEach(pos => {
      positionCounts[pos] = [];
    });
    
    // First pass: count players by position across all rosters
    rosters.forEach(roster => {
      // Count positions for this roster
      const rosterPositionCount: Record<string, number> = {};
      
      // Initialize counts
      leaguePositions.forEach(pos => {
        rosterPositionCount[pos] = 0;
      });
      
      // Count players by position
      roster.players.forEach(playerId => {
        const player = players[playerId];
        if (player && player.position && leaguePositions.includes(player.position)) {
          rosterPositionCount[player.position]++;
        }
      });
      
      // Add counts to our collection
      leaguePositions.forEach(pos => {
        positionCounts[pos].push(rosterPositionCount[pos]);
      });
    });
    
    // Calculate averages for each position
    const positionAverages: Record<string, number> = {};
    leaguePositions.forEach(pos => {
      const sum = positionCounts[pos].reduce((acc, count) => acc + count, 0);
      positionAverages[pos] = sum / positionCounts[pos].length;
    });
    
    // Process each roster into a team
    rosters.forEach(roster => {
      const user = users.find(u => u.user_id === roster.owner_id) || {
        user_id: 'unknown',
        username: 'Unknown User',
        display_name: 'Unknown',
        avatar: ''
      };
      
      // Count players by position to determine team needs
      const rosterPositionCount: Record<string, number> = {};
      
      // Initialize counts for valid positions
      leaguePositions.forEach(pos => {
        rosterPositionCount[pos] = 0;
      });

      // Count existing players
      roster.players.forEach(playerId => {
        const player = players[playerId];
        if (player && player.position && leaguePositions.includes(player.position)) {
          rosterPositionCount[player.position]++;
        }
      });

      // Calculate needs based on comparison to league average
      // Negative values mean below average (need), positive values mean above average (strength)
      const needs: Record<string, PositionNeedData> = {};
      
      leaguePositions.forEach(pos => {
        const count = rosterPositionCount[pos];
        const avg = positionAverages[pos];
        const diff = count - avg;
        
        // Calculate a score from -10 to 10 where:
        // -10 = significantly below average (need)
        // 0 = average
        // 10 = significantly above average (strength)
        // Normalize using a reasonable scale - if count is 50% below avg, score = -5
        const score = Math.max(-10, Math.min(10, Math.round(diff / (avg * 0.1) * 10) / 10));
        
        needs[pos] = { count, avg, diff, score };
      });

      teamsMap[roster.roster_id] = {
        roster_id: roster.roster_id,
        user_id: user.user_id,
        username: user.display_name || user.username,
        team_name: user.metadata?.team_name,
        avatar: user.avatar,
        picks: [],
        needs
      };
    });
    
    // Map to track if a pick has been traded
    const tradedPicksMap: Record<string, TradedPick> = {};
    
    // Process traded picks
    draftData.tradedPicks.forEach(tradedPick => {
      const key = `${tradedPick.season}_${tradedPick.round}_${tradedPick.roster_id}`;
      tradedPicksMap[key] = tradedPick;
    });
    
    // Get draft order from the draft data if available
    let draftSlotToRosterId: Record<string, number> = {};
    if (draftData.draft && draftData.draft.slot_to_roster_id) {
      draftSlotToRosterId = draftData.draft.slot_to_roster_id;
    }
    
    // Create a draft order based on current draft state
    const allPicks: DraftPickData[] = [];
    
    // If we have actual picks, use those
    if (draftData.picks.length > 0) {
      // Process existing picks from the API
      draftData.picks.forEach(pick => {
        allPicks.push({
          round: pick.round,
          original_roster_id: pick.roster_id,
          roster_id: pick.roster_id,
          pick_number: pick.pick_no,
          player_id: pick.player_id,
          is_traded: false
        });
      });
    } else {
      // Generate expected picks if no actual picks exist yet
      // This is a fallback for pre-draft situations
      const numTeams = Object.keys(teamsMap).length;
      
      for (let round = 1; round <= totalRounds; round++) {
        for (let slot = 1; slot <= numTeams; slot++) {
          // Snake draft logic
          const isSnake = Array.isArray(draftData.draft?.settings?.rounds_reversal) && 
                          draftData.draft?.settings?.rounds_reversal.includes(round);
          const actualSlot = isSnake ? numTeams - slot + 1 : slot;
          
          // Get the roster_id for this slot
          const roster_id = draftSlotToRosterId[actualSlot.toString()] || slot;
          
          // Calculate pick number
          const pick_number = (round - 1) * numTeams + slot;
          
          // Check if this pick has been traded
          const key = `${draftData.draft?.season || new Date().getFullYear()}_${round}_${roster_id}`;
          const tradedPick = tradedPicksMap[key];
          
          allPicks.push({
            round,
            original_roster_id: roster_id,
            roster_id: tradedPick ? Number(tradedPick.owner_id) : roster_id,
            pick_number,
            is_traded: tradedPick ? true : false
          } as DraftPickData);
        }
      }
    }
    
    // Assign picks to teams
    allPicks.forEach(pick => {
      if (teamsMap[pick.roster_id]) {
        // Check if there's a saved player selection for this pick
        const pickKey = `${pick.round}_${pick.pick_number}`;
        if (teamSelections[pickKey]) {
          pick.player_id = teamSelections[pickKey];
        }
        teamsMap[pick.roster_id].picks.push(pick);
      }
    });
    
    // Convert map to array for rendering
    setDraftOrder(Object.values(teamsMap));
    
  }, [draftData, rosters, users, players, isLoading, totalRounds, validPositions, teamSelections]);

  // Filter and sort rookies
  const filteredRookies = useMemo(() => {
    return rookies
      .filter(player => {
        // Apply search filter
        const searchMatch = 
          player.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          player.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (player.team && player.team.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Apply position filter
        const positionMatch = positionFilter === 'ALL' || player.position === positionFilter;
        
        return searchMatch && positionMatch;
      })
      .sort((a, b) => {
        // Apply sorting
        if (sortBy === 'rank') {
          if (customRankingsMode) {
            // In custom mode, always use our rank first
            if (savedRankings[a.player_id] && savedRankings[b.player_id]) {
              return savedRankings[a.player_id] - savedRankings[b.player_id];
            }
            // If only one has a saved ranking, prioritize that one
            if (savedRankings[a.player_id]) return -1;
            if (savedRankings[b.player_id]) return 1;
          }
          
          // If both have KTC rank, use those
          if (a.ktcRank && b.ktcRank) return a.ktcRank - b.ktcRank;
          // If only one has KTC rank, prioritize that one
          if (a.ktcRank) return -1;
          if (b.ktcRank) return 1;
          // Otherwise use our rank
          return a.rank - b.rank;
        }
        if (sortBy === 'name') return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        if (sortBy === 'position') return a.position.localeCompare(b.position);
        return 0;
      });
  }, [rookies, searchQuery, positionFilter, sortBy, savedRankings, customRankingsMode]);

  // Simplified mobile player selection
  const handlePlayerSelect = (player: DraftPlayer) => {
    if (isMobile) {
      if (selectedPlayer?.player_id === player.player_id) {
        // Deselect if same player
        setSelectedPlayer(null);
        setShowQuickActions(false);
      } else {
        // Select new player and show quick actions
        setSelectedPlayer(player);
        setShowQuickActions(true);
      }
    } else {
      // Desktop drag and drop
      setDraggedPlayer(player);
      setIsDragging(true);
    }
  };

  // Handle mobile pick selection - direct assignment
  const handleMobilePickSelect = (teamIndex: number, pick: DraftPickData) => {
    if (isMobile && selectedPlayer) {
      // Direct assignment - no modal needed
      handleDrop(teamIndex, pick);
      setSelectedPlayer(null);
      setShowQuickActions(false);
    }
  };

  // Quick watchlist toggle
  const handleQuickWatchlistToggle = () => {
    if (selectedPlayer) {
      const isInWatchlist = cheatSheet.includes(selectedPlayer.player_id);
      if (isInWatchlist) {
        handleRemoveFromCheatSheet(selectedPlayer.player_id);
      } else {
        handleAddToCheatSheet(selectedPlayer.player_id);
      }
    }
  };

  // Clear mobile selection
  const clearMobileSelection = () => {
    setSelectedPlayer(null);
    setShowQuickActions(false);
  };

  // Handle drag start (desktop only)
  const handleDragStart = (player: DraftPlayer) => {
    if (!isMobile) {
      setDraggedPlayer(player);
      setIsDragging(true);
    }
  };

  // Handle drag end (desktop only)
  const handleDragEnd = () => {
    if (!isMobile) {
      setDraggedPlayer(null);
      setIsDragging(false);
    }
  };

  // Handle dropping player for reranking in custom mode
  const handleDragRankChange = (targetIndex: number) => {
    if (!draggedPlayer || !customRankingsMode) return;
    
    // Find current index of the dragged player
    const currentIndex = rookies.findIndex(p => p.player_id === draggedPlayer.player_id);
    if (currentIndex === -1 || currentIndex === targetIndex) return;
    
    const newRookies = [...rookies];
    
    // Remove player from current position
    const [movedPlayer] = newRookies.splice(currentIndex, 1);
    // Insert at new position
    newRookies.splice(targetIndex, 0, movedPlayer);
    
    // Update ranks
    const updatedRookies = newRookies.map((player, idx) => ({
      ...player,
      rank: idx + 1
    }));
    
    setRookies(updatedRookies);
    
    // Update saved rankings
    const rankings: Record<string, number> = {};
    updatedRookies.forEach((player, idx) => {
      rankings[player.player_id] = idx + 1;
    });
    saveRankings(rankings);
  };

  // Handle dropping player on a team (works for both mobile and desktop)
  const handleDrop = (teamIndex: number, pickData: DraftPickData) => {
    const playerToAssign = isMobile ? selectedPlayer : draggedPlayer;
    if (!playerToAssign) return;

    const updatedTeams = [...draftOrder];
    const team = updatedTeams[teamIndex];
    
    // Find the specific pick in the team's pick array
    const pickIndex = team.picks.findIndex(
      p => p.round === pickData.round && p.pick_number === pickData.pick_number
    );
    
    if (pickIndex === -1) return;
    
    // Update the pick with the selected player
    team.picks[pickIndex].player_id = playerToAssign.player_id;
    
    // Update the draft order
    setDraftOrder(updatedTeams);
    
    // Clear selection states
    if (isMobile) {
      setSelectedPlayer(null);
      setShowQuickActions(false);
    } else {
      setDraggedPlayer(null);
      setIsDragging(false);
    }
    
    // Update team selections in localStorage
    const pickKey = `${pickData.round}_${pickData.pick_number}`;
    const newTeamSelections = { ...teamSelections, [pickKey]: playerToAssign.player_id };
    saveTeamSelections(newTeamSelections);
  };

  // Handle dropping player in cheat sheet
  const handleDropInCheatSheet = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedPlayer) return;
    
    // Add to cheat sheet if not already there
    if (!cheatSheet.includes(draggedPlayer.player_id)) {
      const updatedCheatSheet = [...cheatSheet, draggedPlayer.player_id];
      saveCheatSheet(updatedCheatSheet);
    }
    
    setDraggedPlayer(null);
    setIsDragging(false);
  };
  
  // Handle adding player to cheat sheet
  const handleAddToCheatSheet = (playerId: string) => {
    if (!cheatSheet.includes(playerId)) {
      const updatedCheatSheet = [...cheatSheet, playerId];
      saveCheatSheet(updatedCheatSheet);
    }
  };
  
  // Handle removing player from cheat sheet
  const handleRemoveFromCheatSheet = (playerId: string) => {
    const updatedCheatSheet = cheatSheet.filter(id => id !== playerId);
    saveCheatSheet(updatedCheatSheet);
  };
  
  // Find team and pick for a drafted player
  const getPlayerDraftInfo = (playerId: string) => {
    for (const team of draftOrder) {
      for (const pick of team.picks) {
        if (pick.player_id === playerId) {
          return {
            teamName: team.team_name || team.username,
            round: pick.round,
            pickNumber: pick.pick_number
          };
        }
      }
    }
    return null;
  };
  
  // Handle removing a player from a team
  const handleRemovePlayer = (teamIndex: number, pickData: DraftPickData) => {
    if (!pickData.player_id) return;
    
    // Update the draft order by removing player from pick
    const updatedTeams = [...draftOrder];
    const team = updatedTeams[teamIndex];
    const pickIndex = team.picks.findIndex(
      p => p.round === pickData.round && p.pick_number === pickData.pick_number
    );
    
    if (pickIndex === -1) return;
    
    // Remove player from pick
    team.picks[pickIndex].player_id = undefined;
    setDraftOrder(updatedTeams);
    
    // Update team selections in localStorage by removing this pick
    const pickKey = `${pickData.round}_${pickData.pick_number}`;
    const newTeamSelections = { ...teamSelections };
    delete newTeamSelections[pickKey];
    saveTeamSelections(newTeamSelections);
  };

  // Handle custom ranking reordering
  const movePlayer = (direction: 'up' | 'down', playerIndex: number) => {
    if (!customRankingsMode) return;
    
    const newRookies = [...rookies];
    
    if (direction === 'up' && playerIndex > 0) {
      // Move player up
      [newRookies[playerIndex - 1], newRookies[playerIndex]] = 
        [newRookies[playerIndex], newRookies[playerIndex - 1]];
    } else if (direction === 'down' && playerIndex < newRookies.length - 1) {
      // Move player down
      [newRookies[playerIndex], newRookies[playerIndex + 1]] = 
        [newRookies[playerIndex + 1], newRookies[playerIndex]];
    }
    
    // Update ranks
    const updatedRookies = newRookies.map((player, idx) => ({
      ...player,
      rank: idx + 1
    }));
    
    setRookies(updatedRookies);
    
    // Update saved rankings
    const rankings: Record<string, number> = {};
    updatedRookies.forEach((player, idx) => {
      rankings[player.player_id] = idx + 1;
    });
    saveRankings(rankings);
  };

  // Get all picks for a specific round, sorted by pick number
  const getRoundPicks = (round: number) => {
    const picks: Array<{ team: DraftTeam, pick: DraftPickData }> = [];
    
    draftOrder.forEach(team => {
      team.picks
        .filter(pick => pick.round === round)
        .forEach(pick => {
          picks.push({ team, pick });
        });
    });
    
    return picks.sort((a, b) => a.pick.pick_number - b.pick.pick_number);
  };

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="draft-board bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading draft data...</span>
        </div>
      </div>
    );
  }

  // Render draft board
  return (
    <div className="draft-board bg-white dark:bg-dark-800 rounded-xl shadow-lg p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-dark-900 dark:text-white mb-2">Rookie Draft Board</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm sm:text-base">Create your custom draft board with KTC rankings integration</p>
        
        {/* Filters and controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Players</label>
            <input
              type="text"
              id="search"
              placeholder="Search by name or team..."
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
            <select
              id="position"
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
            >
              <option value="ALL">All Positions</option>
              {validPositions.filter(pos => ['QB', 'RB', 'WR', 'TE'].includes(pos)).map(pos => (
                <option key={pos} value={pos}>{pos}s</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
            <select
              id="sort"
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rank' | 'name' | 'position')}
            >
              <option value="rank">Rank</option>
              <option value="name">Name</option>
              <option value="position">Position</option>
            </select>
          </div>
          
          <div>
            <div className="flex justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Player Filters</label>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="flex items-center">
                <input
                  id="show-veterans"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 border-gray-300 dark:border-dark-600 rounded"
                  checked={showVeterans}
                  onChange={() => setShowVeterans(!showVeterans)}
                />
                <label htmlFor="show-veterans" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Show Veterans
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="custom-ranking"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 border-gray-300 dark:border-dark-600 rounded"
                  checked={customRankingsMode}
                  onChange={() => setCustomRankingsMode(!customRankingsMode)}
                />
                <label htmlFor="custom-ranking" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Custom Ranking
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Instructions Banner */}
        {isMobile && !selectedPlayer && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  How to Draft (Mobile)
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>👆 Tap a player to select them</li>
                    <li>🎯 Tap any draft pick to assign the player</li>
                    <li>⭐ Use the action bar to add to watchlist</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Mobile Selection Status */}
        {isMobile && selectedPlayer && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  {selectedPlayer.first_name} {selectedPlayer.last_name} Selected
                </h3>
                <div className="mt-1 text-sm text-green-700 dark:text-green-300">
                  Now tap any draft pick to assign this player, or use the action bar below.
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Main content - Mobile-first responsive layout */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Mobile: Stack vertically, Desktop: Side by side */}
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Available players section */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-dark-800 dark:text-white">
                  Available Players ({filteredRookies.length})
                  {!showVeterans && <span className="ml-2 text-xs sm:text-sm text-gray-500">Rookies Only</span>}
                </h3>
              </div>
              <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3 sm:p-4 h-[400px] sm:h-[500px] lg:h-[600px] overflow-y-auto">
                {filteredRookies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No players match your filters
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredRookies.map((player, index) => {
                      const draftInfo = getPlayerDraftInfo(player.player_id);
                      
                      // Determine display rank based on context
                      const displayRank = customRankingsMode 
                        ? index + 1 // Show position in list when in custom mode
                        : player.ktcRank || savedRankings[player.player_id] || index + 1;
                        
                      const isInCheatSheet = cheatSheet.includes(player.player_id);
                      
                      return (
                        <div
                          key={player.player_id}
                          className={`bg-white dark:bg-dark-700 rounded-lg p-2 sm:p-3 border ${
                            player.ktcRank ? 'border-primary-200 dark:border-primary-800' : 'border-gray-200 dark:border-dark-600'
                          } hover:border-primary-400 dark:hover:border-primary-600 shadow-sm transition duration-200 flex items-center relative ${
                            isMobile ? 'cursor-pointer active:scale-95' : 'cursor-move draggable'
                          } ${
                            draftInfo ? 'opacity-75' : ''
                          } ${isInCheatSheet ? 'border-amber-300 dark:border-amber-700' : ''} ${
                            selectedPlayer?.player_id === player.player_id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg' : ''
                          }`}
                          draggable={!isMobile}
                          onClick={() => isMobile ? handlePlayerSelect(player) : undefined}
                          onDragStart={() => handleDragStart(player)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => {
                            if (customRankingsMode && !isMobile) {
                              e.preventDefault();
                              e.currentTarget.classList.add('border-primary-500');
                            }
                          }}
                          onDragLeave={(e) => {
                            if (customRankingsMode && !isMobile) {
                              e.currentTarget.classList.remove('border-primary-500');
                            }
                          }}
                          onDrop={(e) => {
                            if (customRankingsMode && !isMobile) {
                              e.preventDefault();
                              e.currentTarget.classList.remove('border-primary-500');
                              handleDragRankChange(index);
                            }
                          }}
                        >
                          {/* Mobile tap indicator */}
                          {isMobile && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16l13-8z" />
                              </svg>
                            </div>
                          )}
                          
                          <div className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center ${
                            player.ktcRank ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100' : 'bg-gray-100 dark:bg-dark-600 text-gray-800 dark:text-gray-200'
                          } rounded-full font-semibold text-xs sm:text-sm mr-2 sm:mr-3`}>
                            {displayRank}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-dark-900 dark:text-white flex items-center flex-wrap gap-1">
                              <span className="truncate">{player.first_name} {player.last_name}</span>
                              {player.ktcRank && (
                                <span className="px-1.5 sm:px-2 py-0.5 text-xs bg-primary-50 text-primary-700 rounded-full whitespace-nowrap">
                                  KTC #{player.ktcRank}
                                </span>
                              )}
                              {!player.isRookie && (
                                <span className="px-1.5 sm:px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full whitespace-nowrap">
                                  Veteran
                                </span>
                              )}
                              {isInCheatSheet && (
                                <span className="px-1.5 sm:px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full whitespace-nowrap">
                                  Watchlist
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center flex-wrap gap-1 sm:gap-2">
                              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                player.position === 'QB' ? 'bg-red-100 text-red-800' :
                                player.position === 'RB' ? 'bg-blue-100 text-blue-800' :
                                player.position === 'WR' ? 'bg-green-100 text-green-800' :
                                player.position === 'TE' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {player.position}
                              </span>
                              <span>{player.team || 'FA'}</span>
                              {player.college && <span className="hidden sm:inline">{player.college}</span>}
                              <span>Exp: {player.years_exp}</span>
                            </div>
                            
                            {/* Show draft info if player has been drafted */}
                            {draftInfo && (
                              <div className="mt-1 text-xs font-medium text-primary-600 dark:text-primary-400">
                                Drafted: Round {draftInfo.round}, Pick {draftInfo.pickNumber} ({draftInfo.teamName})
                              </div>
                            )}
                          </div>
                          
                          {customRankingsMode && (
                            <div className="flex flex-col space-y-1 ml-2">
                              <button
                                className="p-1 text-gray-500 hover:text-primary-600 disabled:opacity-30 touch-manipulation"
                                onClick={() => movePlayer('up', index)}
                                disabled={index === 0}
                                aria-label="Move up"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button
                                className="p-1 text-gray-500 hover:text-primary-600 disabled:opacity-30 touch-manipulation"
                                onClick={() => movePlayer('down', index)}
                                disabled={index === filteredRookies.length - 1}
                                aria-label="Move down"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="mt-2 px-3 sm:px-4 py-2 bg-gray-50 dark:bg-dark-700 rounded-lg text-xs text-gray-500 dark:text-gray-400">
                <p>Rankings sourced from <a href="https://keeptradecut.com/dynasty-rankings/rookie-rankings" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">KeepTradeCut</a></p>
              </div>
            </div>
            
            {/* Draft board section */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <div className="flex flex-wrap gap-2 mb-3">
                {Array.from({ length: totalRounds }).map((_, index) => (
                  <button
                    key={index}
                    className={`px-2 sm:px-3 py-1 mb-2 text-xs sm:text-sm rounded-lg font-medium touch-manipulation ${
                      currentRound === index + 1
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setCurrentRound(index + 1)}
                  >
                    Round {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-2 sm:p-4 h-[400px] sm:h-[500px] lg:h-[600px] overflow-auto">
                {getRoundPicks(currentRound).length > 0 ? (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-dark-600">
                            <th className="pb-2 font-medium w-12">Pick</th>
                            <th className="pb-2 font-medium">Team</th>
                            <th className="pb-2 font-medium">Needs</th>
                            <th className="pb-2 font-medium">Selection</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getRoundPicks(currentRound).map(({ team, pick }, index) => {
                            // Find original owner team
                            const originalOwnerTeam = draftOrder.find(t => 
                              t.roster_id === pick.original_roster_id
                            );
                            
                            // Check if the pick is traded
                            const isTraded = pick.is_traded || pick.original_roster_id !== pick.roster_id;
                                  
                            return (
                              <tr key={`${team.user_id}-${pick.round}-${pick.pick_number}`} className="border-b border-gray-100 dark:border-dark-600">
                                <td className="py-3 font-bold text-dark-900 dark:text-white">{pick.pick_number}</td>
                                <td className="py-3">
                                  <div className="flex items-center">
                                    {team.avatar && (
                                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                                        <img 
                                          src={`https://sleepercdn.com/avatars/${team.avatar}`}
                                          alt={team.username}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-medium text-dark-900 dark:text-white">{team.team_name || team.username}</div>
                                      {isTraded && originalOwnerTeam && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          From: {originalOwnerTeam.team_name || originalOwnerTeam.username}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3">
                                                                     {/* Simplified Team Needs Display */}
                                   <div className="flex flex-wrap gap-1">
                                     {Object.entries(team.needs)
                                       .sort(([posA, dataA], [posB, dataB]) => dataB.score - dataA.score) // Sort by need score
                                       .map(([position, data]) => {
                                         // Generate label and color based on need score
                                         const scoreText = `${data.count}${data.diff !== 0 ? (data.diff > 0 ? ' +' : ' ') + data.diff.toFixed(1) : ''}`;
                                         
                                         // Red for needs, green for strengths
                                         let bgColor, textColor;
                                         if (data.score < -5) {
                                           bgColor = 'bg-red-100';
                                           textColor = 'text-red-800';
                                         } else if (data.score < 0) {
                                           bgColor = 'bg-red-50';
                                           textColor = 'text-red-700';
                                         } else if (data.score > 5) {
                                           bgColor = 'bg-green-100';
                                           textColor = 'text-green-800';
                                         } else if (data.score > 0) {
                                           bgColor = 'bg-green-50';
                                           textColor = 'text-green-700';
                                         } else {
                                           bgColor = 'bg-gray-100';
                                           textColor = 'text-gray-700';
                                         }
                                         
                                         return (
                                           <div 
                                             key={position} 
                                             className={`px-2 py-1 rounded-md text-xs ${bgColor} ${textColor}`}
                                             title={`League avg: ${data.avg.toFixed(1)}`}
                                           >
                                             <span className="font-medium">{position}</span> {scoreText}
                                           </div>
                                         );
                                       })
                                     }
                                  </div>
                                </td>
                                <td className="py-3">
                                  <div 
                                    className={`h-16 w-full border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg hover:border-primary-400 dark:hover:border-primary-600 p-2 transition duration-200 ${
                                      isMobile ? 'cursor-pointer' : 'drop-target'
                                    }`}
                                    onClick={() => isMobile ? handleMobilePickSelect(draftOrder.findIndex(t => t.user_id === team.user_id), pick) : undefined}
                                    onDragOver={(e) => {
                                      if (!isMobile) {
                                        e.preventDefault();
                                        e.currentTarget.classList.add('active');
                                      }
                                    }}
                                    onDragLeave={(e) => {
                                      if (!isMobile) {
                                        e.currentTarget.classList.remove('active');
                                      }
                                    }}
                                    onDrop={(e) => {
                                      if (!isMobile) {
                                        e.preventDefault();
                                        e.currentTarget.classList.remove('active');
                                        handleDrop(
                                          draftOrder.findIndex(t => t.user_id === team.user_id),
                                          pick
                                        );
                                      }
                                    }}
                                  >
                                    {pick.player_id ? (
                                      <div className="flex items-center justify-between h-full">
                                        <div className="flex items-center flex-1">
                                          <div className={`w-2 h-full rounded-l-md ${
                                            players[pick.player_id]?.position === 'QB' ? 'bg-red-500' :
                                            players[pick.player_id]?.position === 'RB' ? 'bg-blue-500' :
                                            players[pick.player_id]?.position === 'WR' ? 'bg-green-500' :
                                            players[pick.player_id]?.position === 'TE' ? 'bg-purple-500' :
                                            'bg-gray-500'
                                          }`} />
                                          <div className="pl-2">
                                            <div className="font-medium text-dark-900 dark:text-white">
                                              {players[pick.player_id]?.first_name} {players[pick.player_id]?.last_name}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                              {players[pick.player_id]?.position} · {players[pick.player_id]?.team || 'FA'}
                                            </div>
                                          </div>
                                        </div>
                                                                                 <button 
                                           onClick={() => handleRemovePlayer(
                                             draftOrder.findIndex(t => t.user_id === team.user_id),
                                             pick
                                           )}
                                           className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
                                           title="Remove player"
                                         >
                                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                           </svg>
                                         </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center text-gray-400 text-sm relative">
                                        {isMobile && selectedPlayer ? (
                                          <>
                                            <span className="text-primary-600 dark:text-primary-400 font-medium text-xs">
                                              Tap to assign
                                            </span>
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                                          </>
                                        ) : (
                                          "Drop player here"
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-3">
                      {getRoundPicks(currentRound).map(({ team, pick }, index) => {
                        // Find original owner team
                        const originalOwnerTeam = draftOrder.find(t => 
                          t.roster_id === pick.original_roster_id
                        );
                        
                        // Check if the pick is traded
                        const isTraded = pick.is_traded || pick.original_roster_id !== pick.roster_id;
                              
                        return (
                          <div key={`${team.user_id}-${pick.round}-${pick.pick_number}`} className="bg-white dark:bg-dark-800 rounded-lg p-3 border border-gray-200 dark:border-dark-600">
                            {/* Pick Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100 rounded-full flex items-center justify-center font-bold text-sm mr-3">
                                  {pick.pick_number}
                                </div>
                                <div className="flex items-center">
                                  {team.avatar && (
                                    <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                                      <img 
                                        src={`https://sleepercdn.com/avatars/${team.avatar}`}
                                        alt={team.username}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-medium text-dark-900 dark:text-white text-sm">{team.team_name || team.username}</div>
                                    {isTraded && originalOwnerTeam && (
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        From: {originalOwnerTeam.team_name || originalOwnerTeam.username}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Team Needs */}
                            <div className="mb-3">
                              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Team Needs:</div>
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(team.needs)
                                  .sort(([posA, dataA], [posB, dataB]) => dataB.score - dataA.score)
                                  .slice(0, 4) // Show only top 4 needs on mobile
                                  .map(([position, data]) => {
                                    const scoreText = `${data.count}${data.diff !== 0 ? (data.diff > 0 ? ' +' : ' ') + data.diff.toFixed(1) : ''}`;
                                    
                                    let bgColor, textColor;
                                    if (data.score < -5) {
                                      bgColor = 'bg-red-100';
                                      textColor = 'text-red-800';
                                    } else if (data.score < 0) {
                                      bgColor = 'bg-red-50';
                                      textColor = 'text-red-700';
                                    } else if (data.score > 5) {
                                      bgColor = 'bg-green-100';
                                      textColor = 'text-green-800';
                                    } else if (data.score > 0) {
                                      bgColor = 'bg-green-50';
                                      textColor = 'text-green-700';
                                    } else {
                                      bgColor = 'bg-gray-100';
                                      textColor = 'text-gray-700';
                                    }
                                    
                                    return (
                                      <div 
                                        key={position} 
                                        className={`px-2 py-1 rounded-md text-xs ${bgColor} ${textColor}`}
                                      >
                                        <span className="font-medium">{position}</span> {scoreText}
                                      </div>
                                    );
                                  })
                                }
                              </div>
                            </div>
                            
                            {/* Selection Area */}
                            <div 
                              className={`border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg hover:border-primary-400 dark:hover:border-primary-600 p-3 transition duration-200 min-h-[60px] ${
                                isMobile ? 'cursor-pointer' : 'drop-target'
                              } ${
                                selectedPlayer ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 relative' : ''
                              }`}
                              onClick={() => isMobile ? handleMobilePickSelect(draftOrder.findIndex(t => t.user_id === team.user_id), pick) : undefined}
                              onDragOver={(e) => {
                                if (!isMobile) {
                                  e.preventDefault();
                                  e.currentTarget.classList.add('active');
                                }
                              }}
                              onDragLeave={(e) => {
                                if (!isMobile) {
                                  e.currentTarget.classList.remove('active');
                                }
                              }}
                              onDrop={(e) => {
                                if (!isMobile) {
                                  e.preventDefault();
                                  e.currentTarget.classList.remove('active');
                                  handleDrop(
                                    draftOrder.findIndex(t => t.user_id === team.user_id),
                                    pick
                                  );
                                }
                              }}
                            >
                              {pick.player_id ? (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center flex-1">
                                    <div className={`w-3 h-12 rounded-l-md mr-3 ${
                                      players[pick.player_id]?.position === 'QB' ? 'bg-red-500' :
                                      players[pick.player_id]?.position === 'RB' ? 'bg-blue-500' :
                                      players[pick.player_id]?.position === 'WR' ? 'bg-green-500' :
                                      players[pick.player_id]?.position === 'TE' ? 'bg-purple-500' :
                                      'bg-gray-500'
                                    }`} />
                                    <div>
                                      <div className="font-medium text-dark-900 dark:text-white">
                                        {players[pick.player_id]?.first_name} {players[pick.player_id]?.last_name}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {players[pick.player_id]?.position} · {players[pick.player_id]?.team || 'FA'}
                                      </div>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => handleRemovePlayer(
                                      draftOrder.findIndex(t => t.user_id === team.user_id),
                                      pick
                                    )}
                                    className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
                                    title="Remove player"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center text-gray-400 text-sm relative">
                                  {isMobile && selectedPlayer ? (
                                    <>
                                      <span className="text-primary-600 dark:text-primary-400 font-medium">
                                        Tap to assign {selectedPlayer.first_name} {selectedPlayer.last_name}
                                      </span>
                                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center animate-pulse">
                                        <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                        </svg>
                                      </div>
                                    </>
                                  ) : (
                                    "Drop player here"
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500 dark:text-gray-400">No picks available for this round</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Watchlist - Mobile responsive */}
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-dark-800 dark:text-white">
                Draft Watchlist ({cheatSheet.length})
              </h3>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Drag players here to add to your watchlist
              </div>
            </div>
            <div 
              className={`bg-amber-50 dark:bg-amber-900/30 border-2 border-dashed border-amber-200 dark:border-amber-700 rounded-lg p-3 sm:p-4 min-h-[100px] sm:min-h-[120px] overflow-x-auto ${
                isMobile ? 'cursor-pointer' : ''
              }`}
              onClick={() => {
                if (isMobile && selectedPlayer) {
                  handleQuickWatchlistToggle();
                }
              }}
              onDragOver={(e) => {
                if (!isMobile) {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-amber-400', 'dark:border-amber-500');
                }
              }}
              onDragLeave={(e) => {
                if (!isMobile) {
                  e.currentTarget.classList.remove('border-amber-400', 'dark:border-amber-500');
                }
              }}
              onDrop={(e) => {
                if (!isMobile) {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-amber-400', 'dark:border-amber-500');
                  handleDropInCheatSheet(e);
                }
              }}
            >
              {cheatSheet.length === 0 ? (
                <div className="flex items-center justify-center h-full text-amber-700 dark:text-amber-400 text-center p-4">
                  <div>
                    <div className="text-lg sm:text-xl mb-2">Your draft watchlist is empty</div>
                    <div className="text-xs sm:text-sm">Drag players here to keep track of prospects you're targeting in the draft</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {cheatSheet.map((playerId) => {
                    const player = players[playerId];
                    if (!player) return null;
                    
                    // Check if player is drafted
                    const draftInfo = getPlayerDraftInfo(playerId);
                    
                    return (
                      <div
                        key={playerId}
                        className={`bg-white dark:bg-dark-700 rounded-lg p-2 border border-amber-200 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-500 shadow-sm transition duration-200 flex items-center max-w-[200px] sm:max-w-[220px] ${draftInfo ? 'opacity-75' : ''}`}
                      >
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full mr-2 ${
                          player.position === 'QB' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                          player.position === 'RB' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                          player.position === 'WR' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                          player.position === 'TE' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        } text-xs font-bold`}>
                          {player.position}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-dark-900 dark:text-white truncate text-sm">
                            {player.first_name} {player.last_name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <span>{player.team || 'FA'}</span>
                            {draftInfo && (
                              <span className="ml-1 text-primary-600 dark:text-primary-400">
                                · R{draftInfo.round}.{draftInfo.pickNumber}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCheatSheet(playerId)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 ml-1 touch-manipulation"
                          title="Remove from watchlist"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Quick Actions Bar */}
      {showQuickActions && selectedPlayer && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-600 p-4 z-50 safe-area-pb animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center text-white text-sm font-bold animate-pulse ${
                selectedPlayer.position === 'QB' ? 'bg-red-500' :
                selectedPlayer.position === 'RB' ? 'bg-blue-500' :
                selectedPlayer.position === 'WR' ? 'bg-green-500' :
                selectedPlayer.position === 'TE' ? 'bg-purple-500' :
                'bg-gray-500'
              }`}>
                {selectedPlayer.position}
              </div>
              <div>
                <div className="font-semibold text-dark-900 dark:text-white text-sm">
                  {selectedPlayer.first_name} {selectedPlayer.last_name}
                </div>
                <div className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                  👆 Tap any draft pick to assign this player
                </div>
              </div>
            </div>
            <button
              onClick={clearMobileSelection}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 touch-manipulation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleQuickWatchlistToggle}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors touch-manipulation ${
                cheatSheet.includes(selectedPlayer.player_id)
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800'
              }`}
            >
              {cheatSheet.includes(selectedPlayer.player_id) ? '★ Remove from Watchlist' : '☆ Add to Watchlist'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftBoard; 