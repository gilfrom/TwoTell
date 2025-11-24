import { Trophy } from 'lucide-react';

export function ScoreBoard({ score }) {
    return (
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <Trophy className="w-4 h-4 text-yellow-300" />
            <span className="text-white font-bold">{score}</span>
        </div>
    );
}
