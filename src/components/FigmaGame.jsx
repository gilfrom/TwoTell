import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { ClaimCard } from './ClaimCard';
import { ScoreBoard } from './ScoreBoard';
import { ResultModal } from './ResultModal';
import { Leaderboard } from './Leaderboard';

export default function FigmaGame({ onBack }) {
    const [gameData, setGameData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentRound, setCurrentRound] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [gameFinished, setGameFinished] = useState(false);

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
                            author: round.true_fact_author
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

    const handleClaimSelect = (claimId) => {
        if (selectedClaim) return;

        setSelectedClaim(claimId);

        const claim = currentClaims.find(c => c.id === claimId);
        if (claim?.isTrue) {
            setScore(score + 10);
        }
    };

    const handleNextRound = () => {
        if (currentRound < totalRounds - 1) {
            setCurrentRound(currentRound + 1);
            setSelectedClaim(null);
        } else {
            setGameFinished(true);
        }
    };

    const handleRestart = () => {
        setCurrentRound(0);
        setScore(0);
        setSelectedClaim(null);
        setGameFinished(false);
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

    return (
        <div className="fixed inset-0 w-full overflow-hidden bg-gradient-to-b from-purple-600 to-blue-600 flex flex-col touch-none">
            {/* Header */}
            <div className="flex-none bg-white/10 backdrop-blur-sm border-b border-white/20 z-10 pt-safe">
                <div className="max-w-md mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-2xl font-bold text-white">TwoTell</h1>
                        <ScoreBoard score={score} />
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-white/90">Which claim is true?</p>
                        <div className="text-white/80 text-sm">
                            Round {currentRound + 1}/{totalRounds}
                        </div>
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <div className="flex-1 overflow-hidden flex flex-col justify-center px-4 py-2 gap-4 pb-safe">
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
                    isCorrect={currentClaims.find(c => c.id === selectedClaim)?.isTrue || false}
                    trueClaim={currentClaims.find(c => c.isTrue)}
                    falseClaim={currentClaims.find(c => !c.isTrue)}
                    onNext={handleNextRound}
                    isLastRound={currentRound >= totalRounds - 1}
                />
            )}
        </div>
    );
}
