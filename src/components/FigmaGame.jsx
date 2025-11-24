import { useState } from 'react';
import { ClaimCard } from './ClaimCard';
import { ScoreBoard } from './ScoreBoard';
import { ResultModal } from './ResultModal';
import { Trophy, RotateCcw } from 'lucide-react';

const GAME_DATA = [
    [
        {
            id: '1a',
            headline: 'Scientists Discover New Species of Bioluminescent Jellyfish in Mariana Trench',
            image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
            postedDate: 'November 22, 2025',
            isTrue: true,
            sourceUrl: 'https://example.com/jellyfish-discovery',
            sourceName: 'Nature Magazine'
        },
        {
            id: '1b',
            headline: 'Elon Musk Announces Plans to Build Underground City on Mars by 2026',
            image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400',
            postedDate: 'November 23, 2025',
            isTrue: false,
            sourceUrl: 'https://example.com/fake-mars-city',
            sourceName: 'Debunked by Fact Checkers'
        }
    ],
    [
        {
            id: '2a',
            headline: 'New Study Shows Drinking Coffee Can Extend Lifespan by 20 Years',
            image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
            postedDate: 'November 24, 2025',
            isTrue: false,
            sourceUrl: 'https://example.com/fake-coffee-study',
            sourceName: 'Debunked by Medical Experts'
        },
        {
            id: '2b',
            headline: 'NASA Successfully Tests New Ion Propulsion System for Deep Space Missions',
            image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400',
            postedDate: 'November 17, 2025',
            isTrue: true,
            sourceUrl: 'https://example.com/nasa-ion-propulsion',
            sourceName: 'NASA Official'
        }
    ]
];

export default function FigmaGame({ onBack }) {
    const [currentRound, setCurrentRound] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [gameFinished, setGameFinished] = useState(false);

    const currentClaims = GAME_DATA[currentRound];
    const totalRounds = GAME_DATA.length;

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

    if (gameFinished) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-purple-600 to-blue-600 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
                    <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-gray-900">Game Complete!</h1>
                    <p className="text-gray-600 mb-6">
                        You've completed all {totalRounds} rounds
                    </p>
                    <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-6 mb-6">
                        <div className="text-gray-600 mb-1">Final Score</div>
                        <div className="text-4xl font-bold text-purple-600">{score} / {totalRounds * 10} points</div>
                    </div>
                    <div className="text-gray-600 mb-6">
                        {score === totalRounds * 10 ? '🎉 Perfect Score! You\'re a fact-checking expert!' :
                            score >= totalRounds * 7 ? '👏 Great job! You can spot most fake news!' :
                                score >= totalRounds * 5 ? '👍 Good work! Keep practicing!' :
                                    '💪 Keep learning to spot misinformation!'}
                    </div>
                    <button
                        onClick={handleRestart}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold mb-3 flex items-center justify-center"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Play Again
                    </button>
                    <button
                        onClick={onBack}
                        className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold"
                    >
                        Back to Main Menu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[100dvh] w-full overflow-hidden bg-gradient-to-b from-purple-600 to-blue-600 flex flex-col">
            {/* Header */}
            <div className="flex-none bg-white/10 backdrop-blur-sm border-b border-white/20 z-10">
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
