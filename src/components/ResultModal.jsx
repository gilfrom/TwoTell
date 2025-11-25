import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ExternalLink, User, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

export function ResultModal({ isCorrect, trueClaim, falseClaim, onNext, isLastRound }) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-end p-4 pointer-events-auto z-50"
                onClick={onNext}
            >
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    className="max-w-md mx-auto w-full bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Result Header */}
                    <div className={`p-6 ${isCorrect
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : 'bg-gradient-to-r from-red-500 to-rose-500'
                        }`}>
                        <div className="flex items-center gap-3">
                            {isCorrect ? (
                                <CheckCircle2 className="w-8 h-8 text-white" />
                            ) : (
                                <XCircle className="w-8 h-8 text-white" />
                            )}
                            <div>
                                <h3 className="text-white text-xl font-bold">
                                    {isCorrect ? 'Correct! 🎉' : 'Not quite! 😔'}
                                </h3>
                                <p className="text-white/90 text-sm">
                                    {isCorrect
                                        ? '+10 points'
                                        : 'Better luck next time!'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Claims Info */}
                    <div className="p-6 space-y-4">
                        {/* True Claim */}
                        <div className="border-2 border-green-500 rounded-xl p-4 bg-green-50">
                            <div className="flex items-start gap-2 mb-2">
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <div className="text-green-800 font-bold mb-1">TRUE</div>
                                    <p className="text-sm text-gray-700">{trueClaim.headline}</p>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-green-200 space-y-2">
                                {trueClaim.author && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <User className="w-4 h-4" />
                                        <span>{trueClaim.author}</span>
                                    </div>
                                )}
                                <a
                                    href={trueClaim.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-green-700 hover:text-green-800"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    <span>{trueClaim.sourceName}</span>
                                </a>
                            </div>
                        </div>

                        {/* False Claim */}
                        <div className="border-2 border-red-500 rounded-xl p-4 bg-red-50">
                            <div className="flex items-start gap-2 mb-2">
                                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <div className="text-red-800 font-bold mb-1">FALSE</div>
                                    <p className="text-sm text-gray-700">{falseClaim.headline}</p>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-red-200 space-y-2">
                                {falseClaim.author && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <User className="w-4 h-4" />
                                        <span>{falseClaim.author}</span>
                                    </div>
                                )}
                                <a
                                    href={falseClaim.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-red-700 hover:text-red-800"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    <span>{falseClaim.sourceName}</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="p-6 pt-0">
                        <Button
                            onClick={onNext}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl active:scale-95 rounded-xl"
                            size="lg"
                        >
                            <span className="mr-2">{isLastRound ? 'View Results' : 'Next Round'}</span>
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
