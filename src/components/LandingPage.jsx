import { motion } from 'framer-motion';
import { Shield, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { Button } from './ui/button';
import logo from '../assets/logo.png';

export function LandingPage({ onPlayAsGuest, onLoginWithGoogle }) {
    return (
        <div className="h-screen overflow-hidden bg-gradient-to-b from-purple-600 to-blue-600 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    {/* Logo */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="mb-6"
                    >
                        <div className="flex justify-center mb-4">
                            <img src={logo} alt="TwoTell Logo" className="h-24 object-contain" />
                        </div>


                    </motion.div>

                    {/* Tagline */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 mb-8"
                    >
                        <h2 className="text-white mb-3 text-lg font-semibold">
                            Can you spot the false or misleading fact from the true one?
                        </h2>
                        <p className="text-white/80 text-sm">
                            Test your ability to identify fake news and misinformation in this fast-paced educational game.
                        </p>
                    </motion.div>

                    {/* Features */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="grid grid-cols-3 gap-3 mb-8"
                    >
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                            <Zap className="w-5 h-5 text-yellow-300 mx-auto mb-1" />
                            <div className="text-white text-xs font-medium">Quick</div>
                            <div className="text-white/70 text-xs">Rounds</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                            <Shield className="w-5 h-5 text-blue-300 mx-auto mb-1" />
                            <div className="text-white text-xs font-medium">Real</div>
                            <div className="text-white/70 text-xs">Sources</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                            <CheckCircle2 className="w-5 h-5 text-green-300 mx-auto mb-1" />
                            <div className="text-white text-xs font-medium">Learn</div>
                            <div className="text-white/70 text-xs">Facts</div>
                        </div>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="space-y-3"
                    >
                        <Button
                            onClick={onPlayAsGuest}
                            className="w-full bg-white text-purple-600 hover:bg-gray-100 shadow-xl font-bold"
                            size="lg"
                        >
                            Play
                        </Button>
                    </motion.div>

                    {/* Footer Note */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="text-white/60 text-xs mt-6"
                    >
                        Learn to identify misinformation • Challenge your friends • Climb the leaderboard
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
}
