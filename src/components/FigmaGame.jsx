import { useState } from 'react';
import { ClaimCard } from './ClaimCard';
import { ScoreBoard } from './ScoreBoard';
import { ResultModal } from './ResultModal';
import { Leaderboard } from './Leaderboard';

const GAME_DATA = [
    [
        {
            id: '1a',
            headline: 'Scientists Discover New Species of Bioluminescent Jellyfish in Mariana Trench',
            image: 'ocean jellyfish bioluminescent',
            postedDate: 'November 22, 2025',
            isTrue: true,
            sourceUrl: 'https://example.com/jellyfish-discovery',
            sourceName: 'Nature Magazine',
            author: 'Dr. Jane Smith'
        },
        {
            id: '1b',
            headline: 'Elon Musk Announces Plans to Build Underground City on Mars by 2026',
            image: 'mars colony futuristic',
            postedDate: 'November 23, 2025',
            isTrue: false,
            sourceUrl: 'https://example.com/fake-mars-city',
            sourceName: 'Debunked by Fact Checkers',
            author: 'John Doe'
        }
    ],
    [
        {
            id: '2a',
            headline: 'New Study Shows Drinking Coffee Can Extend Lifespan by 20 Years',
            image: 'coffee cup morning',
            postedDate: 'November 24, 2025',
            isTrue: false,
            sourceUrl: 'https://example.com/fake-coffee-study',
            sourceName: 'Debunked by Medical Experts',
            author: 'Dr. Emily Johnson'
        },
        {
            id: '2b',
            headline: 'NASA Successfully Tests New Ion Propulsion System for Deep Space Missions',
            image: 'space rocket engine',
            postedDate: 'November 17, 2025',
            isTrue: true,
            sourceUrl: 'https://example.com/nasa-ion-propulsion',
            sourceName: 'NASA Official',
            author: 'NASA Team'
        }
    ],
    [
        {
            id: '3a',
            headline: 'Tokyo 2025 Olympics to Feature Competitive Video Gaming as Official Sport',
            image: 'esports gaming tournament',
            postedDate: 'November 21, 2025',
            isTrue: false,
            sourceUrl: 'https://example.com/fake-olympics',
            sourceName: 'Debunked by IOC',
            author: 'IOC Staff'
        },
        {
            id: '3b',
            headline: 'Archaeologists Uncover 3,000-Year-Old Bronze Age Settlement in Scotland',
            image: 'archaeology excavation ancient',
            postedDate: 'November 20, 2025',
            isTrue: true,
            sourceUrl: 'https://example.com/scotland-settlement',
            sourceName: 'BBC News',
            author: 'BBC Reporter'
        }
    ],
    [
        {
            id: '4a',
            headline: 'Researchers Develop AI That Can Predict Earthquakes 48 Hours in Advance',
            image: 'artificial intelligence technology',
            postedDate: 'November 10, 2025',
            isTrue: true,
            sourceUrl: 'https://example.com/earthquake-ai',
            sourceName: 'Science Daily',
            author: 'Dr. Alex Brown'
        },
        {
            id: '4b',
            headline: 'Bill Gates Secretly Bought All Farmland in Iowa to Control Food Supply',
            image: 'farm field agriculture',
            postedDate: 'November 24, 2025',
            isTrue: false,
            sourceUrl: 'https://example.com/fake-gates-farmland',
            sourceName: 'Debunked by Snopes',
            author: 'Snopes Team'
        }
    ],
    [
        {
            id: '5a',
            headline: 'Ancient Mayan Calendar Predicts Major Solar Event in December 2025',
            image: 'mayan calendar ancient',
            postedDate: 'November 23, 2025',
            isTrue: false,
            sourceUrl: 'https://example.com/fake-mayan-prediction',
            sourceName: 'Debunked by Historians',
            author: 'Historian'
        },
        {
            id: '5b',
            headline: 'New Malaria Vaccine Shows 95% Effectiveness in Clinical Trials',
            image: 'medical vaccine research',
            postedDate: 'November 19, 2025',
            isTrue: true,
            sourceUrl: 'https://example.com/malaria-vaccine',
            sourceName: 'WHO Official Report',
            author: 'WHO Team'
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
            <Leaderboard
                userScore={score}
                maxScore={totalRounds * 10}
                onPlayAgain={handleRestart}
            />
        );
    }

    return (
        <div className="h-[100dvh] w-full overflow-hidden bg-gradient-to-b from-purple-600 to-blue-600 flex flex-col">
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
