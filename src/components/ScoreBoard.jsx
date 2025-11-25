import { Trophy } from 'lucide-react';

export function ScoreBoard({ score, className = "" }) {
    return (
        <div className={`flex items-center gap-1 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 ${className}`}>
            <Trophy className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-white/90 font-bold text-xs">{score}</span>
        </div>
    );
}
