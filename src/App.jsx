import { useState, useMemo } from 'react'
import './App.css'
import questions from './data/questions.json'

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [showResult, setShowResult] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]

  const shuffledOptions = useMemo(() => {
    return shuffleArray(currentQuestion.options);
  }, [currentQuestion]);

  const handleOptionClick = (optionId) => {
    if (showResult) return
    setSelectedOption(optionId)
    setShowResult(true)
  }

  const handleNextQuestion = () => {
    setSelectedOption(null)
    setShowResult(false)
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length)
  }

  return (
    <div className="app-container">
      <header>
        <h1>Two Tell</h1>
        <p className="topic">Topic: {currentQuestion.topic}</p>
      </header>

      <div className="cards-container">
        {shuffledOptions.map((option) => (
          <div
            key={option.id}
            className={`card ${showResult ? (option.isTrue ? 'correct' : 'incorrect') : ''} ${selectedOption === option.id ? 'selected' : ''}`}
            onClick={() => handleOptionClick(option.id)}
          >
            {option.image && (
              <div className="card-image">
                <img src={option.image} alt="Claim illustration" />
              </div>
            )}
            <div className="card-content">
              <p>{option.text}</p>
              {option.source && option.date && (
                <div className="source-date">
                  <small>Source: {option.source} • {option.date}</small>
                </div>
              )}
            </div>
            {showResult && (
              <div className="result-indicator">
                {option.isTrue ? '✅ TRUE' : '❌ FALSE'}
              </div>
            )}
          </div>
        ))}
      </div>

      {showResult && (
        <div className="controls">
          <button onClick={handleNextQuestion}>Next Question</button>
        </div>
      )}
    </div>
  )
}

export default App
