import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Claim } from '../App';
import { Button } from './ui/button';

interface ResultModalProps {
  isCorrect: boolean;
  trueClaim: Claim;
  falseClaim: Claim;
  onNext: () => void;
  isLastRound: boolean;
}

export function ResultModal({ isCorrect, trueClaim, falseClaim, onNext, isLastRound }: ResultModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-x-0 bottom-0 p-4 pointer-events-none"
      >
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className={`max-w-md mx-auto rounded-2xl p-6 shadow-2xl pointer-events-auto ${
            isCorrect 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
              : 'bg-gradient-to-r from-red-500 to-rose-500'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            {isCorrect ? (
              <CheckCircle2 className="w-8 h-8 text-white" />
            ) : (
              <XCircle className="w-8 h-8 text-white" />
            )}
            <div>
              <h3 className="text-white">
                {isCorrect ? 'Correct! 🎉' : 'Not quite! 😔'}
              </h3>
              <p className="text-white/90 text-sm">
                {isCorrect 
                  ? '+10 points' 
                  : 'Better luck next time!'}
              </p>
            </div>
          </div>
          
          <Button
            onClick={onNext}
            className="w-full bg-white hover:bg-gray-100 text-gray-900"
            size="lg"
          >
            {isLastRound ? 'View Results →' : 'Next Round →'}
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}