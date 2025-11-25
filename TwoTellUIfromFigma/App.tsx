import { useState } from 'react';
import { ClaimCard } from './components/ClaimCard';
import { ScoreBoard } from './components/ScoreBoard';
import { ResultModal } from './components/ResultModal';
import { Trophy, RotateCcw } from 'lucide-react';
import { Button } from './components/ui/button';

export interface Claim {
  id: string;
  headline: string;
  image: string;
  postedDate: string;
  isTrue: boolean;
  sourceUrl: string;
  sourceName: string;
}

const GAME_DATA: Claim[][] = [
  [
    {
      id: '1a',
      headline: 'Scientists Discover New Species of Bioluminescent Jellyfish in Mariana Trench',
      image: 'ocean jellyfish bioluminescent',
      postedDate: 'November 22, 2025',
      isTrue: true,
      sourceUrl: 'https://example.com/jellyfish-discovery',
      sourceName: 'Nature Magazine'
    },
    {
      id: '1b',
      headline: 'Elon Musk Announces Plans to Build Underground City on Mars by 2026',
      image: 'mars colony futuristic',
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
      image: 'coffee cup morning',
      postedDate: 'November 24, 2025',
      isTrue: false,
      sourceUrl: 'https://example.com/fake-coffee-study',
      sourceName: 'Debunked by Medical Experts'
    },
    {
      id: '2b',
      headline: 'NASA Successfully Tests New Ion Propulsion System for Deep Space Missions',
      image: 'space rocket engine',
      postedDate: 'November 17, 2025',
      isTrue: true,
      sourceUrl: 'https://example.com/nasa-ion-propulsion',
      sourceName: 'NASA Official'
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
      sourceName: 'Debunked by IOC'
    },
    {
      id: '3b',
      headline: 'Archaeologists Uncover 3,000-Year-Old Bronze Age Settlement in Scotland',
      image: 'archaeology excavation ancient',
      postedDate: 'November 20, 2025',
      isTrue: true,
      sourceUrl: 'https://example.com/scotland-settlement',
      sourceName: 'BBC News'
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
      sourceName: 'Science Daily'
    },
    {
      id: '4b',
      headline: 'Bill Gates Secretly Bought All Farmland in Iowa to Control Food Supply',
      image: 'farm field agriculture',
      postedDate: 'November 24, 2025',
      isTrue: false,
      sourceUrl: 'https://example.com/fake-gates-farmland',
      sourceName: 'Debunked by Snopes'
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
      sourceName: 'Debunked by Historians'
    },
    {
      id: '5b',
      headline: 'New Malaria Vaccine Shows 95% Effectiveness in Clinical Trials',
      image: 'medical vaccine research',
      postedDate: 'November 19, 2025',
      isTrue: true,
      sourceUrl: 'https://example.com/malaria-vaccine',
      sourceName: 'WHO Official Report'
    }
  ]
];

export default function App() {
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [gameFinished, setGameFinished] = useState(false);

  const currentClaims = GAME_DATA[currentRound];
  const totalRounds = GAME_DATA.length;

  const handleClaimSelect = (claimId: string) => {
    if (selectedClaim) return; // Already selected

    setSelectedClaim(claimId);
    
    // Check if the selected claim is true
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
          <h1 className="mb-2">Game Complete!</h1>
          <p className="text-gray-600 mb-6">
            You've completed all {totalRounds} rounds
          </p>
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-6 mb-6">
            <div className="text-gray-600 mb-1">Final Score</div>
            <div className="text-purple-600">{score} / {totalRounds * 10} points</div>
          </div>
          <div className="text-gray-600 mb-6">
            {score === totalRounds * 10 ? '🎉 Perfect Score! You\'re a fact-checking expert!' :
             score >= totalRounds * 7 ? '👏 Great job! You can spot most fake news!' :
             score >= totalRounds * 5 ? '👍 Good work! Keep practicing!' :
             '💪 Keep learning to spot misinformation!'}
          </div>
          <Button 
            onClick={handleRestart}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-blue-600 pb-safe">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-white">TwoTell</h1>
            <ScoreBoard score={score} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-white/90">Which claim is true?</p>
            <div className="text-white/80">
              Round {currentRound + 1}/{totalRounds}
            </div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-4 pb-40">
        {currentClaims.map((claim) => (
          <ClaimCard
            key={claim.id}
            claim={claim}
            isSelected={selectedClaim === claim.id}
            isRevealed={selectedClaim !== null}
            onSelect={() => handleClaimSelect(claim.id)}
          />
        ))}
      </div>

      {/* Result Modal */}
      {selectedClaim && (
        <ResultModal
          isCorrect={currentClaims.find(c => c.id === selectedClaim)?.isTrue || false}
          trueClaim={currentClaims.find(c => c.isTrue)!}
          falseClaim={currentClaims.find(c => !c.isTrue)!}
          onNext={handleNextRound}
          isLastRound={currentRound >= totalRounds - 1}
        />
      )}
    </div>
  );
}