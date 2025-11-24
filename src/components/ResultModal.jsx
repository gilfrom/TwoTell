import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export function ResultModal({ isCorrect, trueClaim, falseClaim, onNext, isLastRound }) {
    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`p-3 rounded-full ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                            {isCorrect ? (
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            ) : (
                                <XCircle className="w-8 h-8 text-red-600" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {isCorrect ? 'Correct!' : 'Incorrect'}
                            </h2>
                            <p className="text-gray-600">
                                {isCorrect ? 'You spotted the truth!' : 'You fell for the fake news!'}
                            </p>
                        </div>
                    </div>

                    {/* Explanation */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <h3 className="font-semibold mb-2 text-green-700 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            The Truth
                        </h3>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            "{trueClaim.headline}" is the true story, reported by {trueClaim.sourceName}.
                        </p>

                        <div className="my-3 border-t border-gray-200" />

                        <h3 className="font-semibold mb-2 text-red-700 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            The Fake
                        </h3>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            "{falseClaim.headline}" is false information that has been debunked.
                        </p>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={onNext}
                        className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-95 ${isCorrect ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isLastRound ? 'Finish Game' : 'Next Round'}
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
