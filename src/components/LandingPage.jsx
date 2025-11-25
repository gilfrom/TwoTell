import { motion } from 'framer-motion';
import { Shield, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { Button } from './ui/button';

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
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-2xl mb-4">
                            <div className="relative">
                                <CheckCircle2 className="w-10 h-10 text-green-500 absolute -left-3" />
                                <XCircle className="w-10 h-10 text-red-500 absolute left-3" />
                            </div>
                        </div>
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-white mb-2 text-4xl font-bold"
                        >
                            TwoTell
                        </motion.h1>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center justify-center gap-2 text-white/90 text-sm"
                        >
                            <Shield className="w-4 h-4" />
                            <span>Truth Detective Game</span>
                        </motion.div>
                    </motion.div>

                    {/* Tagline */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 mb-8"
                    >
                        <h2 className="text-white mb-3 text-lg font-semibold">
                            Can you spot the true fact from the false or misleading one?
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
                            Play as Guest
                        </Button>

                        <Button
                            onClick={onLoginWithGoogle}
                            variant="outline"
                            className="w-full bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white/20 font-semibold"
                            size="lg"
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Login with Google
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
