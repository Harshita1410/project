import React, { useState, useEffect } from 'react';
import './App.css';

const Quiz = () => {
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await fetch("/api/Uw5CrX"); // Adjust this with your actual API endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch quiz data");
        }
        const data = await response.json();
        setQuizData(data);
        setUserAnswers(Array(data.questions.length).fill(null));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, []);

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerSelect = (answer, questionIndex) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[questionIndex] = answer;
    setUserAnswers(updatedAnswers);
  };

  const handleNext = () => {
    setCurrentQuestion(currentQuestion + 1);
  };

  const handlePrevious = () => {
    setCurrentQuestion(currentQuestion - 1);
  };

  const handleSubmit = () => {
    setQuizCompleted(true);
  };

  const handleRestart = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setCurrentQuestion(0);
    setUserAnswers(Array(quizData.questions.length).fill(null));
  };

  const calculateScore = () => {
    let score = 0;
    if (quizData && quizData.questions) {
      quizData.questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const correctOption = question.options.find(option => option.is_correct);
        if (userAnswer === correctOption.description) {
          score++;
        }
      });
    }
    return score;
  };

  const renderSummary = () => {
    return (
      <div className="table-container">
        <table className="table-summary">
          <thead>
            <tr>
              <th>Question</th>
              <th>Status</th>
              <th>Correct Answer</th>
            </tr>
          </thead>
          <tbody>
            {quizData.questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const correctOption = question.options.find(option => option.is_correct);
              const correctAnswer = correctOption ? correctOption.description : '';

              let statusClass = 'not-attempted';
              if (userAnswer === correctAnswer) {
                statusClass = 'correct';
              } else if (userAnswer) {
                statusClass = 'incorrect';
              }

              return (
                <tr key={index}>
                  <td>{index + 1}. {question.description}</td>
                  <td className={statusClass}>
                    {statusClass === 'correct' && 'Correct'}
                    {statusClass === 'incorrect' && 'Incorrect'}
                    {statusClass === 'not-attempted' && 'Not Attempted'}
                  </td>
                  <td>
                    <span className="correct-answer">
                      The correct answer is: {correctAnswer}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return <div>Loading quiz data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return <div>No quiz data available.</div>;
  }

  if (!quizStarted) {
    return (
      <div id="quiz">
        <h1>Welcome to Quiz</h1>
        
        <button className="start-btn" onClick={handleStartQuiz}>Start Quiz</button>
      </div>
    );
  }

  if (quizCompleted) {
    const score = calculateScore();
    return (
      <div className="container">
        <h1 id="complete">Quiz Completed</h1>
        <h2 id="score">Your Score: {score} / {quizData.questions.length}</h2>
        {renderSummary()}
        <button className="restart-btn" onClick={handleRestart}>Start Over</button>
      </div>
    );
  }

  const question = quizData.questions[currentQuestion];

  return (
    <div className="quiz-container">
      <div className="question-box">
        <h1>Quiz</h1>
        <hr />
        <h2>{currentQuestion + 1}. {question.description}</h2>
        <ul>
          {question.options.map((option, index) => (
            <li key={index}>
              <label>
                <input
                  type="radio"
                  name={`answer-${currentQuestion}`}
                  value={option.description}
                  onChange={(e) => handleAnswerSelect(e.target.value, currentQuestion)}
                  checked={userAnswers[currentQuestion] === option.description}
                />
                {option.description}
              </label>
            </li>
          ))}
        </ul>
        <div className="button-container">
          {currentQuestion > 0 && <button id="previous" onClick={handlePrevious}>Previous</button>}
          {currentQuestion < quizData.questions.length - 1 ? (
            <button id="next" onClick={handleNext}>Next</button>
          ) : (
            <button id="submit" onClick={handleSubmit}>Submit Quiz</button>
          )}
        </div>
        <div className="index">{currentQuestion + 1} of {quizData.questions.length} questions</div>
      </div>
    </div>
  );
};

export default Quiz;
