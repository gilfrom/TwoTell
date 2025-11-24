import { useState, useMemo, useEffect } from 'react'
import './App.css'
import localQuestions from './data/questions.json'
import { auth, signInWithGoogle, logout, db } from './firebase'
import { supabase } from './supabase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs, query, where } from 'firebase/firestore'
import AdminDashboard from './components/AdminDashboard'
import FigmaGame from './components/FigmaGame'

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

function App() {
  const [questions, setQuestions] = useState(localQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [timer, setTimer] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameFinished, setGameFinished] = useState(false)
  const [user, setUser] = useState(null)
  const [view, setView] = useState('game'); // 'game', 'admin', or 'figma'

  const currentQuestion = questions[currentQuestionIndex]

  const shuffledOptions = useMemo(() => {
    if (!currentQuestion) return [];
    return shuffleArray(currentQuestion.options);
  }, [currentQuestion]);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch questions from Firestore and Supabase
  useEffect(() => {
    const fetchQuestions = async () => {
      let allQuestions = [];

      // 1. Fetch from Supabase (prepared_game_rounds) - PRIORITY
      try {
        const { data: rounds, error: roundsError } = await supabase
          .from('prepared_game_rounds')
          .select('*')
          .eq('ready_for_game', true);

        if (roundsError) {
          console.error("Error fetching prepared rounds:", roundsError);
        } else if (rounds && rounds.length > 0) {
          console.log(`Fetched ${rounds.length} prepared rounds from Supabase`);

          const supabaseQuestions = rounds.map(round => ({
            id: `supa_${round.id}`,
            topic: "Fact Check", // Default topic since it's not in the table yet
            options: [
              {
                id: "a",
                text: round.true_fact_headline,
                isTrue: true,
                image: round.true_fact_image_url,
                source: round.true_fact_source,
                date: round.true_fact_posted_date || round.source_data_date,
                url: round.true_fact_url
              },
              {
                id: "b",
                text: round.false_claim_text,
                isTrue: false,
                image: round.false_claim_image_url,
                source: "Social Media",
                date: round.false_claim_posted_date || round.source_data_date,
                url: round.false_claim_fact_check_url,
                rating: round.textual_rating
              }
            ]
          }));

          allQuestions = [...supabaseQuestions];
        }
      } catch (error) {
        console.error("Unexpected error fetching Supabase rounds:", error);
      }

      // 2. If no Supabase rounds, fallback to Local + Firestore
      if (allQuestions.length === 0) {
        console.log("No Supabase rounds found, falling back to local + Firestore");
        allQuestions = [...localQuestions];

        try {
          const q = query(collection(db, "questions"), where("status", "==", "published"));
          const querySnapshot = await getDocs(q);
          const firestoreQuestions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          if (firestoreQuestions.length > 0) {
            allQuestions = [...allQuestions, ...firestoreQuestions];
          }
        } catch (error) {
          console.error("Error fetching Firestore questions:", error);
        }
      }

      setQuestions(allQuestions);
    };
    fetchQuestions();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameStarted && !showResult && !gameFinished) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, showResult, currentQuestionIndex, gameFinished]);

  const handleOptionClick = (optionId) => {
    if (showResult) return
    setSelectedOption(optionId)
    setShowResult(true)

    const selected = currentQuestion.options.find(opt => opt.id === optionId);
    if (selected && selected.isTrue) {
      // Base score 1000, minus 10 points per second, minimum 100 points
      const points = Math.max(100, 1000 - (timer * 10));
      setScore(prev => prev + points);
    }
  }

  const handleNextQuestion = () => {
    setSelectedOption(null)
    setShowResult(false)
    setTimer(0)
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      setGameFinished(true)
    }
  }

  const handleStartGame = () => {
    setGameStarted(true);
    setTimer(0);
  }

  const handleRestartGame = () => {
    setGameStarted(false);
    setGameFinished(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimer(0);
    setSelectedOption(null);
    setShowResult(false);
  }

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  }

  const handleLogout = async () => {
    try {
      await logout();
      setGameStarted(false); // Reset game on logout
      setView('game');
    } catch (error) {
      console.error("Logout failed", error);
    }
  }

  if (view === 'admin') {
    return <AdminDashboard onBack={() => setView('game')} />;
  }

  if (view === 'figma') {
    return <FigmaGame onBack={() => setView('game')} />;
  }

  if (!gameStarted) {
    return (
      <div className="app-container intro-screen">
        <h1>Two Tell</h1>
        <p className="intro-text">Can you spot the true fact from the fake one?</p>
        <div className="intro-instructions">
          <p>You'll see two claims. One is true, one is false.</p>
          <p>Click the one you think is <strong>TRUE</strong>.</p>
          <p>Score points for accuracy and speed!</p>
        </div>

        {user ? (
          <div className="user-welcome">
            <p>Welcome, {user.displayName}!</p>
            <button className="start-button" onClick={handleStartGame}>Start Game</button>
            <button className="start-button" onClick={() => setView('figma')} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>Try New UI ✨</button>
            {user.email === 'gil.from@gmail.com' && (
              <button className="admin-link" onClick={() => setView('admin')}>Admin Dashboard</button>
            )}
            <button className="logout-button-intro" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <button className="login-button" onClick={handleLogin}>Login with Google to Play</button>
        )}
      </div>
    )
  }

  if (gameFinished) {
    return (
      <div className="app-container summary-screen">
        <h1>Game Over!</h1>
        <div className="score-display">
          <p>Final Score</p>
          <div className="score-value">{score}</div>
        </div>
        <button className="restart-button" onClick={handleRestartGame}>Play Again</button>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
    )
  }

  return (
    <div className="app-container game-screen">
      <div className="game-header">
        <div className="score">Score: {score}</div>
        <div className="timer">Time: {timer}s</div>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      <div className="question-counter">
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>

      <h2 className="game-instruction">Which claim is TRUE?</h2>

      <div className="cards-container">
        {shuffledOptions.map((option) => (
          <div
            key={option.id}
            className={`card ${showResult
              ? option.isTrue
                ? 'correct'
                : selectedOption === option.id ? 'incorrect' : ''
              : ''
              }`}
            onClick={() => handleOptionClick(option.id)}
          >
            {option.image && (
              <div className="card-image">
                <img src={option.image} alt="Topic illustration" />
              </div>
            )}
            <div className="card-content">
              <p>{option.text}</p>
              {option.date && (
                <div className="date-display" style={{ fontSize: '0.8em', color: '#aaa', marginTop: '8px', fontStyle: 'italic' }}>
                  {option.date}
                </div>
              )}
              {showResult && option.source && (
                <div className="source-citation" style={{ fontSize: '0.8em', color: '#888', marginTop: '4px' }}>
                  Source: {option.source}
                </div>
              )}
              {showResult && (
                <div className="result-indicator">
                  {option.isTrue ? '✅ TRUE' : `❌ ${option.rating || 'FAKE'}`}
                </div>
              )}
              {showResult && option.url && (
                <div className="source-link" style={{ marginTop: '5px' }}>
                  <a href={option.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline', fontSize: '0.9em' }}>
                    Read Source
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showResult && (
        <button className="next-button" onClick={handleNextQuestion} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '1.2em', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
        </button>
      )}
    </div>
  )
}

export default App
