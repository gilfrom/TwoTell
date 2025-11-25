import { Star } from 'lucide-react';
import { motion } from 'motion/react';

interface ScoreBoardProps {
  score: number;
}

export function ScoreBoard({ score }: ScoreBoardProps) {
  return (
    <motion.div
      key={score}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
    >
      <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
      <span className="text-white">{score}</span>
    </motion.div>
  );
}
