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

                    {/* User Score Highlight */}
                    <div className="p-6 pb-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-4 mb-6"
                        >
                            <div className="text-center">
                                <div className="text-gray-600 text-sm mb-1">Your Score</div>
                                <div className="text-purple-600 mb-2 font-bold text-xl">{userScore} / {maxScore} points</div>
                                <div className="text-gray-600 text-sm font-medium">
                                    {userRank ? `You are ranked #${userRank}!` : 'Calculating rank...'}
                                </div>
                            </div>
                        </motion.div>

                        {/* Name Submission Form */}
                        {!hasSubmitted ? (
                            <motion.form
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onSubmit={handleSubmitScore}
                                className="mb-6"
                            >
                                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                                    Enter your name to join the leaderboard
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={playerName}
                                        onChange={(e) => setPlayerName(e.target.value)}
                                        placeholder="Your Name"
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-900 bg-white"
                                        maxLength={15}
                                        required
                                    />
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || !playerName.trim()}
                                        className="bg-purple-600 text-white hover:bg-purple-700 rounded-xl"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            </motion.form>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mb-6 text-center text-green-600 font-medium bg-green-50 p-3 rounded-xl border border-green-100"
                            >
                                Score submitted! You are on the board.
                            </motion.div>
                        )}

                        {/* Leaderboard Table */}
                        <div className="mb-6">
                            <h3 className="text-gray-600 mb-3 text-center font-semibold">Top 5 Players</h3>
                            {loading ? (
                                <div className="text-center text-gray-400 py-4">Loading scores...</div>
                            ) : leaderboard.length > 0 ? (
                                <div className="space-y-2">
                                    {leaderboard.map((entry, index) => (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`flex items-center justify-between p-3 rounded-xl transition-all ${entry.player_name === playerName && hasSubmitted
                                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg scale-105'
                                                : 'bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${entry.player_name === playerName && hasSubmitted ? 'bg-white/20' : 'bg-gray-200'
                                                    }`}>
                                                    {getRankIcon(index + 1) || (
                                                        <span className={`font-bold ${entry.player_name === playerName && hasSubmitted ? 'text-white' : 'text-gray-600'}`}>
                                                            {index + 1}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={`font-medium ${entry.player_name === playerName && hasSubmitted ? 'text-white' : 'text-gray-900'}`}>
                                                    {formatName(entry.player_name)}
                                                </span>
                                            </div>
                                            <span className={`font-bold ${entry.player_name === playerName && hasSubmitted ? 'text-white' : 'text-gray-600'}`}>
                                                {entry.score} pts
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 py-4">No scores yet. Be the first!</div>
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
                                onClick={handleNotifications}
                                variant="outline"
                                className={`w-full border-2 transition-all ${notificationsEnabled
                                    ? 'border-green-600 text-green-600 bg-green-50'
                                    : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                                    }`}
                                disabled={notificationsEnabled}
                            >
                                <Bell className="w-4 h-4 mr-2" />
                                {notificationsEnabled ? 'Notifications Enabled ✓' : 'Notify Me of New Content'}
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
