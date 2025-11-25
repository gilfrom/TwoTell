import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import './App.css'
import { auth, signInWithGoogle, logout } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import AdminDashboard from './components/AdminDashboard'
import FigmaGame from './components/FigmaGame'
import { LandingPage } from './components/LandingPage'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // If user is logged in and on landing page, redirect to game
      // But allow admin access if requested
      if (currentUser && location.pathname === '/') {
        navigate('/game');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      // Auth listener will handle redirect
    } catch (error) {
      console.error("Login failed", error);
    }
  }

  const handleGuestPlay = () => {
    setUser({ displayName: 'Guest', email: '', uid: 'guest', isAnonymous: true });
    navigate('/game');
  }

  const handleLogout = async () => {
    try {
      if (user && !user.isAnonymous) {
        await logout();
      }
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  }

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>
  }

  return (
    <Routes>
      <Route path="/" element={
        user ? <Navigate to="/game" replace /> :
          <LandingPage
            onPlayAsGuest={handleGuestPlay}
            onLoginWithGoogle={handleLogin}
          />
      } />

      <Route path="/game" element={
        user ? <FigmaGame onBack={handleLogout} /> : <Navigate to="/" replace />
      } />

      <Route path="/admin" element={
        user?.email === 'gil.from@gmail.com' ?
          <AdminDashboard onBack={() => navigate('/game')} /> :
          <Navigate to="/" replace />
      } />

      {/* Catch all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
