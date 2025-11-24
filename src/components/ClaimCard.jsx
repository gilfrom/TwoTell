import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function ClaimCard({ claim, isSelected, isRevealed, onSelect }) {
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        // Use the image URL directly if it's already a full URL
        if (claim.image.startsWith('http')) {
            setImageUrl(claim.image);
        } else {
            // Otherwise use as-is (placeholder)
            setImageUrl(claim.image);
        }
    }, [claim.image]);

    const getBorderColor = () => {
        if (!isRevealed) return 'border-white/20';
        if (claim.isTrue) return 'border-green-500';
        return 'border-red-500';
    };

    const getBackgroundColor = () => {
        if (!isRevealed) return 'bg-white';
        if (claim.isTrue) return 'bg-green-50';
        return 'bg-red-50';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={!isRevealed ? { scale: 0.98 } : {}}
            className={`rounded-2xl border-2 overflow-hidden shadow-lg transition-all cursor-pointer ${getBorderColor()} ${getBackgroundColor()} ${isSelected && !isRevealed ? 'ring-4 ring-white/50' : ''
                }`}
            onClick={onSelect}
        >
            {/* Image */}
            <div className="relative h-48 bg-gray-200 overflow-hidden">
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt={claim.headline}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                )}

                {/* Revealed Badge */}
                {isRevealed && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`absolute top-4 right-4 rounded-full p-2 ${claim.isTrue ? 'bg-green-500' : 'bg-red-500'
                            } shadow-lg`}
                    >
                        {claim.isTrue ? (
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        ) : (
                            <XCircle className="w-6 h-6 text-white" />
                        )}
                    </motion.div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-center gap-2 mb-2 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{claim.postedDate}</span>
                </div>

                <h3 className="text-lg font-semibold mb-3">{claim.headline}</h3>

                {/* Source Info (shown when revealed) */}
                {isRevealed && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-gray-200"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <div className="text-sm text-gray-600 mb-1">Source</div>
                                <div className="text-sm font-medium">{claim.sourceName}</div>
                            </div>
                            <a
                                href={claim.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-700 underline whitespace-nowrap"
                                onClick={(e) => e.stopPropagation()}
                            >
                                View Source →
                            </a>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
