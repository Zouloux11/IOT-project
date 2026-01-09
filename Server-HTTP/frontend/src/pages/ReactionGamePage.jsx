import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Zap, Timer, Target, User, RotateCcw, Crown, Medal, Award, Loader2, RefreshCw } from 'lucide-react';

const ReactionGame = () => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'waiting', 'ready', 'finished'
  const [playerName, setPlayerName] = useState('');
  const [reactionTime, setReactionTime] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const [bestPlayer, setBestPlayer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [averageTime, setAverageTime] = useState(0);
  const [allTimes, setAllTimes] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(5);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [isLoadingPlayerStats, setIsLoadingPlayerStats] = useState(false);
  
  const startTimeRef = useRef(null);
  const timeoutRef = useRef(null);

  // API Configuration
  const API_BASE_URL = 'https://api.loiccapdeville.fr/api/sensormanager';
  const GAME_TYPE = 'reaction';

  // Load leaderboard on startup
  useEffect(() => {
    loadLeaderboard();
  }, []);

  // Load player stats when playerName changes
  useEffect(() => {
    if (playerName.trim()) {
      loadPlayerStats(playerName.trim());
    } else {
      setPlayerStats(null);
    }
  }, [playerName]);

  const loadLeaderboard = async () => {
    setIsLoadingLeaderboard(true);
    try {
      const response = await fetch(`${API_BASE_URL}/game/${GAME_TYPE}/leaderboard?limit=10`);
      if (response.ok) {
        const data = await response.json();
        const leaderboardData = data.leaderboard || data;
        setLeaderboard(leaderboardData);
        if (leaderboardData.length > 0) {
          setBestTime(leaderboardData[0].score);
          setBestPlayer(leaderboardData[0].playerName);
        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
    setIsLoadingLeaderboard(false);
  };

  const loadPlayerStats = async (playerName) => {
    if (!playerName.trim()) return;
    
    setIsLoadingPlayerStats(true);
    try {
      const response = await fetch(`${API_BASE_URL}/game/${GAME_TYPE}/player/${encodeURIComponent(playerName)}/stats`);
      if (response.ok) {
        const data = await response.json();
        setPlayerStats(data.stats);
      } else {
        setPlayerStats(null);
      }
    } catch (error) {
      console.error('Error loading player stats:', error);
      setPlayerStats(null);
    }
    setIsLoadingPlayerStats(false);
  };

  const submitScore = async (score) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/game/${GAME_TYPE}/scores/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: playerName,
          score: score,
          gameType: GAME_TYPE
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSubmitSuccess(true);
        
        if (!bestTime || score < bestTime) {
          setIsNewRecord(true);
        }
        
        await Promise.all([
          loadLeaderboard(),
          loadPlayerStats(playerName)
        ]);
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    }
    setIsSubmitting(false);
  };

  const startGame = () => {
    if (!playerName.trim()) {
      alert('Please enter your username!');
      return;
    }
    
    setGameState('waiting');
    setCurrentRound(1);
    setAllTimes([]);
    setSubmitSuccess(false);
    setIsNewRecord(false);
    
    // Wait for random delay between 2 and 6 seconds
    const delay = Math.random() * 4000 + 2000;
    
    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleClick = () => {
    if (gameState === 'waiting') {
      // Too early!
      clearTimeout(timeoutRef.current);
      setGameState('menu');
      alert('Too early! Wait for the screen to turn green.');
      return;
    }
    
    if (gameState === 'ready') {
      const endTime = Date.now();
      const time = endTime - startTimeRef.current;
      setReactionTime(time);
      
      const newTimes = [...allTimes, time];
      setAllTimes(newTimes);
      
      if (currentRound < totalRounds) {
        // Next round
        setCurrentRound(currentRound + 1);
        setGameState('waiting');
        
        const delay = Math.random() * 4000 + 2000;
        
        timeoutRef.current = setTimeout(() => {
          setGameState('ready');
          startTimeRef.current = Date.now();
        }, delay);
      } else {
        // End of game
        const avg = newTimes.reduce((a, b) => a + b, 0) / newTimes.length;
        const best = Math.min(...newTimes);
        
        setAverageTime(avg);
        setAttempts(attempts + 1);
        
        submitScore(best);
        
        setGameState('finished');
      }
    }
  };

  const resetGame = async () => {
    setGameState('menu');
    setReactionTime(0);
    setCurrentRound(1);
    setAllTimes([]);
    setSubmitSuccess(false);
    setIsNewRecord(false);
    clearTimeout(timeoutRef.current);
    await loadLeaderboard();
  };

  const getTimeColor = (time) => {
    if (time < 300) return 'text-green-500';
    if (time < 400) return 'text-yellow-500';
    if (time < 500) return 'text-orange-500';
    return 'text-red-500';
  };

  const getPerformanceMessage = (time) => {
    if (time < 200) return '🚀 Lightning fast!';
    if (time < 300) return '⚡ Excellent reflexes!';
    if (time < 400) return '👍 Very good!';
    if (time < 500) return '👌 Good job!';
    if (time < 600) return '🐌 Could be better';
    return '🦥 Wake up!';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-6xl w-full"
        >
          <div className="text-center mb-12">
            <motion.h1 
              className="text-5xl md:text-7xl font-extrabold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="block">Test Your</span>
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent block mt-2">Lightning Reflexes</span>
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Challenge yourself and players worldwide in the ultimate reaction time test. 
              Click as fast as you can when the screen turns green!
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Main game panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold mb-4 flex items-center justify-center">
                    <Zap className="mr-3 h-10 w-10 text-primary" />
                    Reaction Master
                  </CardTitle>
                  <p className="text-lg text-muted-foreground">
                    Get ready for {totalRounds} lightning-fast rounds
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Input
                      placeholder="Enter your username"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="text-lg py-6 border-primary/30 focus:border-primary"
                      onKeyPress={(e) => e.key === 'Enter' && startGame()}
                    />
                  </div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={startGame}
                      className="w-full text-xl py-8 bg-primary hover:bg-primary/90 font-bold"
                      size="lg"
                    >
                      <Target className="mr-3 h-6 w-6" />
                      Start Challenge ({totalRounds} rounds)
                    </Button>
                  </motion.div>
                  
                  {bestTime && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center p-6 bg-primary/10 border border-primary/20 rounded-lg"
                    >
                      <Trophy className="mx-auto h-10 w-10 text-primary mb-3" />
                      <p className="text-sm text-muted-foreground mb-1">World Record</p>
                      <p className="text-3xl font-bold text-primary mb-1">
                        {bestTime}ms
                      </p>
                      <p className="text-sm text-muted-foreground">by {bestPlayer}</p>
                    </motion.div>
                  )}
                  
                  {attempts > 0 && (
                    <div className="text-center text-muted-foreground">
                      <p className="text-sm">Your attempts: {attempts}</p>
                    </div>
                  )}

                  {playerName.trim() && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center p-4 bg-secondary/50 rounded-lg"
                    >
                      <User className="mx-auto h-6 w-6 text-primary mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">Personal Stats for {playerName}</p>
                      
                      {isLoadingPlayerStats ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : playerStats ? (
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Best</p>
                            <p className="font-bold text-green-500">{playerStats.bestScore}ms</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Games</p>
                            <p className="font-bold text-blue-500">{playerStats.totalGames}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Rank</p>
                            <p className="font-bold text-primary">#{playerStats.rank}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No previous games found</p>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="border-primary/20 bg-card/50 backdrop-blur-sm h-fit">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl font-bold flex items-center">
                    <Trophy className="mr-3 h-6 w-6 text-primary" />
                    Global Champions
                  </CardTitle>
                  <Button
                    onClick={loadLeaderboard}
                    variant="ghost"
                    size="sm"
                    disabled={isLoadingLeaderboard}
                    className="hover:bg-primary/10"
                  >
                    {isLoadingLeaderboard ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingLeaderboard ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : leaderboard.length > 0 ? (
                    <div className="space-y-3">
                      {leaderboard.map((entry, index) => (
                        <motion.div
                          key={entry.id || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                            entry.playerName === playerName.trim() 
                              ? 'bg-primary/10 border-primary/30' 
                              : 'bg-secondary/30 border-secondary hover:bg-secondary/50'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {getRankIcon(index + 1)}
                            <div>
                              <p className="font-semibold text-foreground">{entry.playerName}</p>
                              <p className="text-xs text-muted-foreground">
                                {entry.date && new Date(entry.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold text-lg ${getTimeColor(entry.score)}`}>
                              {entry.score}ms
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No scores recorded yet</p>
                      <p className="text-sm text-muted-foreground mt-1">Be the first champion!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen flex flex-col items-center justify-center cursor-pointer transition-colors duration-75 ${
        gameState === 'ready' ? 'bg-green-500' : 'bg-red-500'
      }`}
      onClick={handleClick}
    >
      <div className="text-center text-white p-8">
        {/* Round indicator */}
        <div className="mb-8">
          <p className="text-2xl font-bold mb-4">
            Round {currentRound} of {totalRounds}
          </p>
          <div className="flex justify-center gap-3">
            {Array.from({ length: totalRounds }, (_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-colors ${
                  i < currentRound - 1 ? 'bg-green-400' : 
                  i === currentRound - 1 ? 'bg-yellow-400' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {gameState === 'waiting' && (
          <div className="text-center">
            <Timer className="mx-auto h-24 w-24 mb-8 animate-pulse" />
            <h1 className="text-6xl md:text-8xl font-bold mb-6">Wait...</h1>
            <p className="text-2xl md:text-3xl">Don't click yet!</p>
          </div>
        )}

        {gameState === 'ready' && (
          <div className="text-center">
            <Target className="mx-auto h-24 w-24 mb-8" />
            <h1 className="text-6xl md:text-8xl font-bold mb-6">CLICK NOW!</h1>
            <p className="text-2xl md:text-3xl">Go go go!</p>
          </div>
        )}

        {gameState === 'finished' && (
          <motion.div
            key="finished"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto text-foreground"
          >
            <Trophy className="mx-auto h-16 w-16 mb-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              {playerName}'s Results
            </h1>
            
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground mb-2">Average Time</p>
                  <p className={`text-4xl font-bold ${getTimeColor(averageTime)}`}>
                    {Math.round(averageTime)}ms
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground mb-2">Best Time</p>
                  <p className={`text-4xl font-bold ${getTimeColor(Math.min(...allTimes))}`}>
                    {Math.min(...allTimes)}ms
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mb-10">
              <h3 className="text-xl font-bold mb-6">Round Breakdown</h3>
              <div className="grid grid-cols-5 gap-3">
                {allTimes.map((time, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card/80 backdrop-blur-sm rounded-lg p-3 border border-primary/20"
                  >
                    <p className="text-sm text-muted-foreground">R{index + 1}</p>
                    <p className={`font-bold text-lg ${getTimeColor(time)}`}>
                      {time}ms
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.p 
              className="text-2xl md:text-3xl mb-10 font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {getPerformanceMessage(averageTime)}
            </motion.p>

            {/* Success messages */}
            {isSubmitting && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-primary/10 border border-primary/30 rounded-lg p-6 mb-8"
              >
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-primary font-semibold">Submitting your score...</p>
              </motion.div>
            )}

            {submitSuccess && isNewRecord && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-2 border-yellow-400/50 rounded-lg p-8 mb-8"
              >
                <Crown className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                  🎉 NEW WORLD RECORD! 🎉
                </p>
                <p className="text-muted-foreground">You're now the global champion!</p>
              </motion.div>
            )}

            {submitSuccess && !isNewRecord && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-8"
              >
                <p className="text-green-500 font-semibold">✅ Score recorded successfully!</p>
              </motion.div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={resetGame}
                  className="bg-primary hover:bg-primary/90 px-8 py-6 text-lg"
                  size="lg"
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Play Again
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={async () => {
                    setPlayerName('');
                    setPlayerStats(null);
                    await resetGame();
                  }}
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/10 px-8 py-6 text-lg"
                  size="lg"
                >
                  <User className="mr-2 h-5 w-5" />
                  Change Player
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ReactionGame;