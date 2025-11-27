import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Flame } from 'lucide-react';

export function Toast({ message, isVisible, type = 'speed', onClose }) {
    const isStreak = type === 'streak';

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -20, x: '-50%' }}
                    className={`fixed top-24 left-1/2 z-50 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold border-2 whitespace-nowrap ${isStreak
                            ? 'bg-orange-500 text-white border-orange-400'
                            : 'bg-yellow-400 text-yellow-900 border-yellow-500'
                        }`}
                >
                    {isStreak ? (
                        <Flame className="w-5 h-5 fill-orange-100 text-orange-100" />
                    ) : (
                        <Zap className="w-5 h-5 fill-yellow-900" />
                    )}
                    {message}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
