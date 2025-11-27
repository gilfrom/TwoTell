import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

export function Toast({ message, isVisible, onClose }) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -20, x: '-50%' }}
                    className="fixed top-24 left-1/2 z-50 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold border-2 border-yellow-500 whitespace-nowrap"
                >
                    <Zap className="w-5 h-5 fill-yellow-900" />
                    {message}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
