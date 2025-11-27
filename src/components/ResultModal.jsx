import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ExternalLink, User, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

export function ResultModal({ isCorrect, claims, onNext, isLastRound }) {
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
                        <div className="text-center">
                            <h3 className="text-white text-3xl font-bold mb-1">
                                {isCorrect ? 'Correct! 🎉' : 'Not quite! 😔'}
                            </h3>
                            <p className="text-white/90 text-lg font-medium">
                                {isCorrect
                                    ? '+10 points'
                                    : 'Better luck next time!'}
                            </p>
                        </div>
                    </div>

                    {/* Claims Info */}
                    <div className="p-6 space-y-4">
                        {claims.map((claim) => (
                            <div
                                key={claim.id}
                                className={`border-2 rounded-xl p-4 ${claim.isTrue
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-red-500 bg-red-50'
                                    }`}
                            >
                                <div className="flex items-start gap-2 mb-2">
                                    {claim.isTrue ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                        <div className={`font-bold mb-1 ${claim.isTrue ? 'text-green-800' : 'text-red-800'
                                            }`}>
                                            {claim.isTrue ? 'TRUE' : 'FALSE'}
                                        </div>
                                        <p className="text-sm text-gray-700 text-left">{claim.headline}</p>
                                    </div>
                                </div>

                                <div className={`mt-3 pt-3 border-t space-y-2 ${claim.isTrue ? 'border-green-200' : 'border-red-200'
                                    }`}>
                                    {claim.affiliateLink && (
                                        <div className="mb-3">
                                            <a
                                                href={claim.affiliateLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block w-full bg-[#FF9900] hover:bg-[#FF9900]/90 text-white text-center font-bold py-2 px-4 rounded-lg shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <span>Buy Now on Amazon</span>
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <p className="text-[10px] text-gray-500 mt-1 text-center leading-tight">
                                                As an Amazon Associate we earn from qualifying purchases. Prices and availability may change.
                                            </p>
                                        </div>
                                    )}

                                    {claim.author && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <User className="w-4 h-4" />
                                            <span>{claim.author}</span>
                                        </div>
                                    )}
                                    <a
                                        href={claim.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-2 text-sm hover:underline ${claim.isTrue ? 'text-green-700 hover:text-green-800' : 'text-red-700 hover:text-red-800'
                                            }`}
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        <span>{claim.sourceName}</span>
                                    </a>
                                </div>
                            </div>
                        ))}
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
