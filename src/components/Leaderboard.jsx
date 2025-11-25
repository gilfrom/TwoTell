import { Trophy, Medal, Share2, Bell } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

// Mock leaderboard data for today
const generateLeaderboard = (userScore) => {
    const mockPlayers = [
        { name: 'Sarah K.', score: 50 },
        { name: 'Michael T.', score: 50 },
        { name: 'Emma L.', score: 40 },
        { name: 'James R.', score: 40 },
        { name: 'Olivia M.', score: 30 },
    ];

    // Add current user with their score
    const currentUser = { name: 'You', score: userScore, isCurrentUser: true };

    // Combine and sort by score
    const allPlayers = [...mockPlayers.map(p => ({ ...p, isCurrentUser: false })), currentUser];
    allPlayers.sort((a, b) => b.score - a.score);

    // Add ranks
    return allPlayers.map((player, index) => ({
        ...player,
        rank: index + 1
    }));
};

export function Leaderboard({ userScore, maxScore, onPlayAgain }) {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const leaderboard = generateLeaderboard(userScore);

    const handleShare = async () => {
        const shareData = {
            title: 'TwoTell - Fact Checking Game',
            text: `I scored ${userScore}/${maxScore} points on TwoTell! Can you spot fake news better than me? 🎯`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(
                    `${shareData.text}\n${shareData.url}`
                );
                alert('Score copied to clipboard!');
            }
        } catch (err) {
            console.log('Share failed:', err);
        }
    };

    const handleNotifications = () => {
        setNotificationsEnabled(true);
        // In a real app, this would subscribe to notifications
        setTimeout(() => {
            alert('You\'ll be notified when new content is available! 🔔');
        }, 300);
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
        if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
        return null;
    };

    const today = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="fixed inset-0 overflow-y-auto bg-gradient-to-b from-purple-600 to-blue-600">
            <div className="min-h-full flex items-center justify-center p-4 pb-safe pt-safe">
                <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative z-10">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-center text-white">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
                            <Trophy className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="mb-1 text-2xl font-bold">Game Complete!</h1>
                        <p className="text-white/90">Today's Leaderboard</p>
                        <p className="text-white/70 text-sm">{today}</p>
                    </div>

                    {/* User Score Highlight */}
                    <div className="p-6 pb-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-4 mb-4"
                        >
                            <div className="text-center">
                                <div className="text-gray-600 text-sm mb-1">Your Score</div>
                                <div className="text-purple-600 mb-2 font-bold text-xl">{userScore} / {maxScore} points</div>
                                <div className="text-gray-600 text-sm">
                                    {userScore === maxScore ? '🎉 Perfect Score! You\'re a fact-checking expert!' :
                                        userScore >= maxScore * 0.7 ? '👏 Great job! You can spot most fake news!' :
                                            userScore >= maxScore * 0.5 ? '👍 Good work! Keep practicing!' :
                                                '💪 Keep learning to spot misinformation!'}
                                </div>
                            </div>
                        </motion.div>

                        {/* Leaderboard Table */}
                        <div className="mb-4">
                            <h3 className="text-gray-600 mb-3 text-center font-semibold">Top Players</h3>
                            <div className="space-y-2">
                                {leaderboard.slice(0, 5).map((entry, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${entry.isCurrentUser
                                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg scale-105'
                                            : 'bg-gray-50 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${entry.isCurrentUser ? 'bg-white/20' : 'bg-gray-200'
                                                }`}>
                                                {getRankIcon(entry.rank) || (
                                                    <span className={`font-bold ${entry.isCurrentUser ? 'text-white' : 'text-gray-600'}`}>
                                                        {entry.rank}
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`font-medium ${entry.isCurrentUser ? 'text-white' : 'text-gray-900'}`}>
                                                {entry.name}
                                            </span>
                                        </div>
                                        <span className={`font-bold ${entry.isCurrentUser ? 'text-white' : 'text-gray-600'}`}>
                                            {entry.score} pts
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
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
                                onClick={onPlayAgain}
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
