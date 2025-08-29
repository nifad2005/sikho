
import React, { useState, useEffect } from 'react';
import { MCQ } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface PracticeSectionProps {
  mcqs: MCQ[];
  onComplete: () => void;
}

const PracticeSection: React.FC<PracticeSectionProps> = ({ mcqs, onComplete }) => {
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setAnswers(new Array(mcqs.length).fill(null));
    setSubmitted(false);
    setScore(0);
  }, [mcqs]);

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    let currentScore = 0;
    answers.forEach((answer, index) => {
      if (answer === mcqs[index].correctAnswerIndex) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setSubmitted(true);
    if (currentScore / mcqs.length >= 0.6) { // Mark complete if score is 60% or higher
      onComplete();
    }
  };

  if (!mcqs || mcqs.length === 0) {
    return (
      <div className="text-center p-8 bg-slate-50 rounded-lg animate-fade-in">
        <h3 className="text-2xl font-bold text-slate-800 mb-4">Practice Complete</h3>
        <p className="text-slate-600 mb-6">There are no quiz questions for this topic. You can mark it as complete to proceed.</p>
        <button
          onClick={onComplete}
          className="flex items-center justify-center mx-auto px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors"
        >
          <CheckCircleIcon className="h-6 w-6 mr-2" />
          Mark as Complete
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-slate-800 mb-6">Test Your Knowledge</h3>
      <div className="space-y-8">
        {mcqs.map((mcq, qIndex) => (
          <div key={qIndex} className="p-6 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-semibold text-lg text-slate-800 mb-4">{qIndex + 1}. {mcq.question}</p>
            <div className="space-y-3">
              {mcq.options.map((option, oIndex) => {
                const isSelected = answers[qIndex] === oIndex;
                const isCorrect = mcq.correctAnswerIndex === oIndex;
                let optionClass = "bg-white hover:bg-indigo-50 border-slate-300";
                if (submitted) {
                  if (isCorrect) {
                    optionClass = "bg-green-100 border-green-400";
                  } else if (isSelected && !isCorrect) {
                    optionClass = "bg-red-100 border-red-400";
                  }
                } else if (isSelected) {
                    optionClass = "bg-indigo-100 border-indigo-400";
                }

                return (
                  <button
                    key={oIndex}
                    onClick={() => handleSelectAnswer(qIndex, oIndex)}
                    disabled={submitted}
                    className={`w-full text-left p-4 border rounded-lg flex justify-between items-center transition-all ${optionClass} ${!submitted ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <span>{option}</span>
                    {submitted && isCorrect && <CheckCircleIcon className="h-6 w-6 text-green-600" />}
                    {submitted && isSelected && !isCorrect && <XCircleIcon className="h-6 w-6 text-red-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-slate-200 text-center">
        {submitted ? (
          <div className="flex flex-col items-center">
            <h4 className="text-xl font-bold">Your Score: {score} / {mcqs.length}</h4>
            <button
              onClick={() => {
                setAnswers(new Array(mcqs.length).fill(null));
                setSubmitted(false);
              }}
              className="mt-4 px-6 py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-200"
            >
              Try Again
            </button>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={answers.some(a => a === null)}
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-slate-400"
          >
            Submit Answers
          </button>
        )}
      </div>
    </div>
  );
};

export default PracticeSection;
