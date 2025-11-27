import { Trophy, Medal, Share2, Bell, User } from 'lucide-react';
import { trackEvent } from '../analytics';
import logo from '../assets/logo.png';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { supabase } from '../supabase';

export function Leaderboard({ userScore, maxScore, onPlayAgain }) {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [playerName, setPlayerName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [userRank, setUserRank] = useState(null);

    useEffect(() => {
        fetchLeaderboard();
        calculateUserRank();
    }, [userScore]);

    const fetchLeaderboard = async () => {
        try {
            const { data, error } = await supabase
                .from('leaderboard')
                .select('*')
                .order('score', { ascending: false })
                .limit(5);

            if (error) throw error;

            let displayData = data || [];

            // Fill with mock data if less than 5 entries
            if (displayData.length < 5) {
                const mockData = [
                    { id: 'mock1', player_name: 'Sarah K.', score: 45 },
                    { id: 'mock2', player_name: 'Mike T.', score: 35 },
                    { id: 'mock3', player_name: 'Emma L.', score: 25 },
                    { id: 'mock4', player_name: 'John D.', score: 15 },
                    { id: 'mock5', player_name: 'Guest', score: 5 }
                ];

                // Append just enough mock items to reach 5
                const needed = 5 - displayData.length;
                displayData = [...displayData, ...mockData.slice(0, needed)];

                // Re-sort just in case (though mock scores are low)
                displayData.sort((a, b) => b.score - a.score);
            }

            setLeaderboard(displayData);
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateUserRank = async () => {
        try {
            // Count how many players have a higher score than the user
            const { count, error } = await supabase
                .from('leaderboard')
                .select('*', { count: 'exact', head: true })
                .gt('score', userScore);

            if (error) throw error;
            // Rank is count + 1 (if 0 people are better, you are #1)
            setUserRank((count || 0) + 1);
        } catch (err) {
            console.error('Error calculating rank:', err);
        }
    };

    const handleSubmitScore = async (e) => {
        e.preventDefault();
        if (!playerName.trim()) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('leaderboard')
                .insert([{ player_name: playerName, score: userScore }]);

            if (error) throw error;

            setHasSubmitted(true);
            fetchLeaderboard(); // Refresh list to see if we made top 5
            calculateUserRank(); // Re-calculate rank (though it shouldn't change much unless tie-breaking logic exists)
        } catch (err) {
            console.error('Error submitting score:', err);
            alert('Failed to submit score. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShare = async () => {
        trackEvent('share_click', { score: userScore });
        const shareData = {
            title: 'TwoTell - Fact Checking Game',
            text: `I scored ${userScore}/${maxScore} points on TwoTell! I'm ranked #${userRank || '?'}! Can you beat me? 🎯`,
            url: 'https://twotell.ca'
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                alert('Score copied to clipboard!');
            }
        } catch (err) {
            console.log('Share failed:', err);
        }
    };

    const handleNotifications = () => {
        setNotificationsEnabled(true);
        setTimeout(() => {
            alert('You\'ll be notified when new content is available! 🔔');
        }, 300);
    };

    const handlePlayAgain = () => {
        trackEvent('play_again_click');
        onPlayAgain();
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
        if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
        return null;
    };

    const formatName = (name) => {
        if (!name) return 'Guest';
        const parts = name.trim().split(/\s+/);
        if (parts.length < 2) return name;
        return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
    };

    const today = new Date().toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
    });

    return (
        <div className="fixed inset-0 overflow-y-auto bg-gradient-to-b from-purple-600 to-blue-600">
            <div className="min-h-full flex items-center justify-center p-4 pb-safe pt-safe">
                <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative z-10">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-center text-white">
                        <img src={logo} alt="TwoTell" className="h-16 w-auto object-contain mx-auto mb-3" />
                        <h1 className="mb-1 text-2xl font-bold">Game Complete!</h1>
                        <p className="text-white/90">Global Leaderboard</p>
                        <p className="text-white/70 text-sm">{today}</p>
                    </div>

                    {/* Leaderboard Table */}
                    <div className="p-6 pb-4">
                        <div className="mb-6">
                            <h3 className="text-gray-600 mb-3 text-center font-semibold">Top Players</h3>
                            {loading ? (
                                <div className="text-center text-gray-400 py-4">Loading scores...</div>
                            ) : (
                                <div className="space-y-2">
                                    {/* Render merged list of top players + current user */}
                                    {(() => {
                                        // Create a display list
                                        let displayList = [...leaderboard];

                                        // If user hasn't submitted, insert them locally for display
                                        if (!hasSubmitted) {
                                            const currentUserEntry = {
                                                id: 'current-user',
                                                player_name: playerName, // Will be empty initially
                                                score: userScore,
                                                isCurrentUser: true,
                                                rank: userRank || '?'
                                            };

                                            // If user is in top 5 (based on score), insert and slice
                                            // Otherwise append
                                            const isInTop = displayList.some(p => userScore >= p.score);

                                            if (isInTop || displayList.length < 5) {
                                                displayList.push(currentUserEntry);
                                                displayList.sort((a, b) => b.score - a.score);
                                                displayList = displayList.slice(0, 5);
                                            } else {
                                                // If not in top 5, show top 5 then user
                                                displayList = displayList.slice(0, 5);
                                                displayList.push(currentUserEntry);
                                            }
                                        }

                                        return displayList.map((entry, index) => {
                                            const isCurrentUser = entry.isCurrentUser || (hasSubmitted && entry.player_name === playerName && entry.score === userScore);
                                            const rank = entry.rank || index + 1;

                                            return (
                                                <motion.div
                                                    key={entry.id || index}
                                                    initial={{ x: -20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${isCurrentUser
                                                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg scale-105'
                                                        : 'bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCurrentUser ? 'bg-white/20' : 'bg-gray-200'
                                                            }`}>
                                                            {getRankIcon(rank) || (
                                                                <span className={`font-bold ${isCurrentUser ? 'text-white' : 'text-gray-600'}`}>
                                                                    {rank}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {isCurrentUser && !hasSubmitted ? (
                                                            <form
                                                                onSubmit={handleSubmitScore}
                                                                className="flex-1 flex gap-2 min-w-0"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    value={playerName}
                                                                    onChange={(e) => setPlayerName(e.target.value)}
                                                                    placeholder="Enter Name"
                                                                    className="w-full px-3 py-1 text-sm text-gray-900 bg-white rounded-lg border-0 focus:ring-2 focus:ring-purple-300 outline-none"
                                                                    maxLength={15}
                                                                    autoFocus
                                                                />
                                                                <button
                                                                    type="submit"
                                                                    disabled={isSubmitting || !playerName.trim()}
                                                                    className="px-3 py-1 text-xs font-bold bg-white/20 hover:bg-white/30 text-white rounded-lg transition disabled:opacity-50"
                                                                >
                                                                    SAVE
                                                                </button>
                                                            </form>
                                                        ) : (
                                                            <span className={`font-medium truncate ${isCurrentUser ? 'text-white' : 'text-gray-900'}`}>
                                                                {formatName(entry.player_name || 'You')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className={`font-bold ml-3 ${isCurrentUser ? 'text-white' : 'text-gray-600'}`}>
                                                        {entry.score}
                                                    </span>
                                                </motion.div>
                                            );
                                        });
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Button
                                onClick={handleShare}
                                variant="outline"
                                className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share Your Score
                            </Button>

                            <Button
                                onClick={handlePlayAgain}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                size="lg"
                            >
                                Play Again
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
