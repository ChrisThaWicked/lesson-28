import React, { useState, useEffect, useCallback } from 'react';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});

  const initializeAnswers = useCallback((data) => {
    const initialAnswers = {};
    data.forEach((quiz) => {
      quiz.questions.forEach((question) => {
        initialAnswers[question.id] = '';
      });
    });
    setAnswers(initialAnswers);
  }, []);

  const fetchQuizzes = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4000/quizzes');
      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }
      const data = await response.json();
      setQuizzes(data);
      initializeAnswers(data); // Initialize answers state for each question
    } catch (error) {
      console.error('Fetch quizzes error:', error.message);
      setError('Failed to fetch quizzes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [initializeAnswers]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleInputChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmitAnswer = async (quizId) => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }

      const response = await fetch(`http://localhost:4000/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ quizId, answers }),
      });
      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }
      // Handle successful submission as needed
      alert('Answers submitted successfully!');
    } catch (error) {
      console.error('Submit answer error:', error.message);
      setError('Failed to submit answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-semibold mb-4 text-center">Quizzes</h1>
      {error && <p className="text-red-500">{error}</p>}
      {isLoading ? (
        <p>Loading quizzes...</p>
      ) : (
        <div>
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-gray-800 p-4 mb-4 rounded">
              <h2 className="text-xl text-white">{quiz.title}</h2>
              <p className="text-gray-300 mb-2">{quiz.description}</p>
              {quiz.questions.map((question) => (
                <div key={question.id} className="mb-4">
                  <p className="text-gray-300">{question.text}</p>
                  <input
                    type="text"
                    value={answers[question.id]}
                    onChange={(e) => handleInputChange(question.id, e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 mb-2 block w-full text-black bg-gray-200"
                  />
                </div>
              ))}
              <button
                className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => handleSubmitAnswer(quiz.id)}
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Answers'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Quizzes;