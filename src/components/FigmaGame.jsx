import { useState, useEffect } from 'react';
import { trackEvent } from '../analytics';
import { supabase } from '../supabase';
import { ClaimCard } from './ClaimCard';
import { ScoreBoard } from './ScoreBoard';
import { ResultModal } from './ResultModal';
import { Leaderboard } from './Leaderboard';
import { Toast } from './Toast';

import { ArrowLeft, LogOut } from 'lucide-react';
import logo from '../assets/logo.png';

export default function FigmaGame({ onBack, user }) {
    const [gameData, setGameData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentRound, setCurrentRound] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [gameFinished, setGameFinished] = useState(false);
    const [maxTime, setMaxTime] = useState(10); // Default 10s, can be fetched from settings
    const [timeLeft, setTimeLeft] = useState(10);
    const [streak, setStreak] = useState(0);
    const [toastConfig, setToastConfig] = useState({ show: false, message: '', type: 'speed' });
    const [hasShownSpeedToast, setHasShownSpeedToast] = useState(false);
    const [roundScores, setRoundScores] = useState({}); // Track points per round

    useEffect(() => {
        // Lock body and html scroll and prevent overscroll
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.body.style.overscrollBehavior = 'none';
        document.body.style.touchAction = 'none';
        return () => {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.overscrollBehavior = '';
            document.body.style.touchAction = '';
        };
    }, []);

    // Timer Effect
    useEffect(() => {
        if (selectedClaim || gameFinished || loading) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 0.1;
            });
        }, 100);

        return () => clearInterval(timer);
    }, [selectedClaim, gameFinished, loading, currentRound]);

    useEffect(() => {
        const fetchGameData = async () => {
            try {
                const { data, error } = await supabase
                    .from('prepared_game_rounds')
                    .select('*')
                    .eq('ready_for_game', true)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data && data.length > 0) {
                    const formattedData = data.map(round => {
                        const trueClaim = {
                            id: `${round.id}_true`,
                            headline: round.true_fact_headline,
                            image: round.true_fact_image_url || 'https://placehold.co/400x300?text=True+Fact',
                            postedDate: round.true_fact_posted_date || new Date().toLocaleDateString(),
                            isTrue: true,
                            sourceUrl: round.true_fact_url,
                            sourceName: round.true_fact_source || 'Verified Source',
                            author: round.true_fact_author,
                            affiliateLink: round.true_fact_affiliate_link
                        };

                        const falseClaim = {
                            id: `${round.id}_false`,
                            headline: round.false_claim_text,
                            image: round.false_claim_image_url || 'https://placehold.co/400x300?text=Fake+News',
                            postedDate: round.false_claim_posted_date || new Date().toLocaleDateString(),
                            isTrue: false,
                            sourceUrl: round.false_claim_fact_check_url,
                            sourceName: 'Fact Check',
                            author: 'Social Media'
                        };

                        // Randomize order
                        return Math.random() > 0.5 ? [trueClaim, falseClaim] : [falseClaim, trueClaim];
                    });
                    setGameData(formattedData);
                }
            } catch (err) {
                console.error('Error fetching game data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchGameData();
    }, []);

    const currentClaims = gameData[currentRound];
    const totalRounds = gameData.length;

    const showToastMessage = (message, type = 'speed') => {
        setToastConfig({ show: true, message, type });
        setTimeout(() => setToastConfig(prev => ({ ...prev, show: false })), 3000);
    };

    const handleClaimSelect = (claimId) => {
        if (selectedClaim) return;

        setSelectedClaim(claimId);

        const claim = currentClaims.find(c => c.id === claimId);
        const isCorrect = !claim?.isTrue;

        // Calculate score
        let points = 0;
        let newStreak = isCorrect ? streak + 1 : 0;

        if (isCorrect) {
            points = 10; // Base points

            // Streak Bonus (5 in a row)
            if (newStreak === 5) {
                points += 20;
                showToastMessage("🔥 5 Streak! +20 pts", 'streak');
            }
            // Speed Bonus (only if not streak bonus to avoid overlap, or prioritize streak)
            else if (timeLeft > 0) {
                points += 5; // Bonus for speed

                // Show toast only if it hasn't been shown before
                if (!hasShownSpeedToast) {
                    showToastMessage("⚡ Speed Bonus! +5 pts", 'speed');
                    setHasShownSpeedToast(true);
                }
            }
        }

        const newScore = score + points;

        if (isCorrect) {
            setScore(newScore);
            setStreak(newStreak);
            setRoundScores(prev => ({ ...prev, [currentRound]: points }));
        } else {
            setStreak(0);
        }

        trackEvent('round_answered', {
            round: currentRound + 1,
            is_correct: isCorrect,
            score_so_far: newScore,
            time_left: timeLeft,
            streak: newStreak
        });
    };

    const handleNextRound = () => {
        if (currentRound < totalRounds - 1) {
            setCurrentRound(currentRound + 1);
            setSelectedClaim(null);
            setTimeLeft(maxTime);
        } else {
            trackEvent('game_completed', {
                final_score: score,
                total_rounds: totalRounds
            });
            setGameFinished(true);
        }
    };

    const handleRestart = () => {
        setCurrentRound(0);
        setScore(0);
        setStreak(0);
        setSelectedClaim(null);
        setGameFinished(false);
        setTimeLeft(maxTime);
        setHasShownSpeedToast(false);
        setRoundScores({});
    };

    const handleBack = () => {
        if (currentRound > 0) {
            const prevRound = currentRound - 1;

            // Deduct points from current round (if answered) and previous round (since we are resetting it)
            const currentRoundPoints = roundScores[currentRound] || 0;
            const prevRoundPoints = roundScores[prevRound] || 0;

            setScore(prev => Math.max(0, prev - currentRoundPoints - prevRoundPoints));
            setStreak(0); // Reset streak on back navigation to prevent exploits

            setRoundScores(prev => {
                const newScores = { ...prev };
                delete newScores[currentRound];
                delete newScores[prevRound];
                return newScores;
            });

            setCurrentRound(prevRound);
            setSelectedClaim(null);
            setTimeLeft(maxTime);
        } else {
            onBack();
        }
    };

    if (loading) {
        return (
            <div className="h-[100dvh] w-full bg-gradient-to-b from-purple-600 to-blue-600 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            </div>
        );
    }

    if (!gameData.length) {
        return (
            <div className="h-[100dvh] w-full bg-gradient-to-b from-purple-600 to-blue-600 flex flex-col items-center justify-center p-4 text-white text-center">
                <h2 className="text-2xl font-bold mb-4">No Games Available</h2>
                <p className="mb-6">Check back later for new fact-checking rounds!</p>
                <button
                    onClick={onBack}
                    className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition"
                >
                    Back to Menu
                </button>
            </div>
        );
    }

    if (gameFinished) {
        return (
            <Leaderboard
                userScore={score}
                maxScore={totalRounds * 10}
                onPlayAgain={handleRestart}
            />
        );
    }

    // Safety check to prevent crash if data is inconsistent
    if (!currentClaims) {
        return null;
    }

    return (
        <div className="fixed inset-0 w-full overflow-hidden bg-gradient-to-b from-purple-600 to-blue-600 flex flex-col touch-none">
            {/* Header */}
            <div className="flex-none bg-white/10 backdrop-blur-sm border-b border-white/20 z-10 pt-safe relative">
                <div className="max-w-md mx-auto px-4 py-2 flex flex-col gap-2">
                    {/* Top Row: Back - Logo - Logout */}
                    <div className="flex items-center justify-between relative h-10">
                        <button
                            onClick={handleBack}
                            className="p-1 text-white hover:text-white/80 bg-transparent transition"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>

                        <img src={logo} alt="TwoTell" className="h-12 w-auto object-contain absolute left-1/2 -translate-x-1/2" />

                        <div className="w-8 flex justify-end">
                            {!user?.isAnonymous && (
                                <button
                                    onClick={onBack}
                                    className="p-1 text-white hover:text-white/80 bg-transparent transition"
                                    title="Logout"
                                >
                                    <LogOut className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Bottom Row: Round - Question - Score */}
                    <div className="flex items-center justify-between relative h-9">
                        {/* Left: Round Info */}
                        <div className="w-24 flex justify-center bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-white/90 text-xs font-medium border border-white/10 items-center gap-1">
                            <span className="opacity-70">Round</span>
                            <span className="font-bold">{currentRound + 1}/{totalRounds}</span>
                        </div>

                        {/* Right: Score */}
                        <ScoreBoard score={score} className="w-24 justify-center" />
                    </div>
                </div>

                {/* Time Progress Bar */}
                {!selectedClaim && !gameFinished && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                        <div
                            className="h-full bg-yellow-400 transition-all duration-100 ease-linear"
                            style={{ width: `${(timeLeft / maxTime) * 100}%` }}
                        />
                    </div>
                )}
            </div>

            {/* Game Area */}
            <div className="flex-1 overflow-hidden flex flex-col justify-center px-4 py-2 gap-4 pb-safe">
                <p className="text-white/90 font-medium text-lg text-center drop-shadow-md">
                    Which claim is FALSE?
                </p>
                {currentClaims.map((claim) => (
                    <div key={claim.id} className="w-full max-w-md mx-auto">
                        <ClaimCard
                            claim={claim}
                            isSelected={selectedClaim === claim.id}
                            isRevealed={selectedClaim !== null}
                            onSelect={() => handleClaimSelect(claim.id)}
                        />
                    </div>
                ))}
            </div>

            {/* Result Modal */}
            {selectedClaim && (
                <ResultModal
                    isCorrect={currentClaims.find(c => c.id === selectedClaim)?.isTrue === false}
                    claims={currentClaims}
                    onNext={handleNextRound}
                    isLastRound={currentRound >= totalRounds - 1}
                />
            )}
            {/* Toast Notification */}
            <Toast
                message={toastConfig.message}
                isVisible={toastConfig.show}
                type={toastConfig.type}
                onClose={() => setToastConfig(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
}
