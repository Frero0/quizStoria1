// src/App.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function QuizApp() {
    const [quizData, setQuizData] = useState([]);
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);
    const [timeLeft, setTimeLeft] = useState(20);
    const [started, setStarted] = useState(false);
    const [reviewMode, setReviewMode] = useState(false);
    const [wrongAnswers, setWrongAnswers] = useState([]);

    // Carica e mescola
    useEffect(() => {
        fetch('/quiz_storia_informatica.json')
            .then(r => r.json())
            .then(data => setQuizData(data.sort(() => Math.random() - 0.5)));
    }, []);

    // Timer e auto-submit
    useEffect(() => {
        if (started && !answered && !showExplanation) {
            if (timeLeft > 0) {
                const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
                return () => clearTimeout(id);
            }
            handleAnswer(null);
        }
    }, [timeLeft, answered, showExplanation, started]);

    const handleAnswer = opt => {
        if (answered) return;
        setAnswered(true);
        setSelected(opt);
        const correct = quizData[current].answer;
        if (opt === correct) {
            setScore(s => s + 1);
        } else {
            setMistakes(m => m + 1);
            setWrongAnswers(w => [...w, { ...quizData[current], selected: opt }]);
        }
        setShowExplanation(true);
    };

    const resetQuestion = () => {
        setSelected(null);
        setAnswered(false);
        setShowExplanation(false);
        setTimeLeft(20);
    };

    const goTo = idx => {
        if (idx < 0) idx = 0;
        if (idx > quizData.length) idx = quizData.length;
        setCurrent(idx);
        if (idx < quizData.length) resetQuestion();
    };
    const prev = () => goTo(current - 1);
    const next = () => goTo(current + 1);
    const finishTest = () => goTo(quizData.length);
    const restartQuiz = () => {
        setStarted(false);
        setReviewMode(false);
        setCurrent(0);
        setScore(0);
        setMistakes(0);
        setWrongAnswers([]);
        resetQuestion();
    };

    // --- START SCREEN ---
    if (!started) {
        return (
            <div className="page-bg flex items-center justify-center min-h-screen p-4">
                <motion.div
                    className="card max-w-md text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl font-bold text-purple-700 mb-4">
                        🧠 Quiz Storia dell’Informatica
                    </h1>
                    <button
                        onClick={() => setStarted(true)}
                        className="btn-primary"
                    >
                        🚀 Inizia Quiz
                    </button>
                </motion.div>
            </div>
        );
    }

    // --- LOADING ---
    if (quizData.length === 0) {
        return (
            <div className="page-bg flex items-center justify-center min-h-screen p-4">
                <motion.div className="card text-center">
                    <p>Loading…</p>
                </motion.div>
            </div>
        );
    }

    // --- REVIEW MODE ---
    if (reviewMode) {
        return (
            <div className="page-bg flex items-center justify-center min-h-screen p-4">
                <motion.div
                    className="card max-w-xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <h2 className="text-xl font-bold mb-4">📘 Revisione Errori</h2>
                    {wrongAnswers.length === 0 ? (
                        <p className="text-green-600">Nessun errore! Bravo!</p>
                    ) : (
                        wrongAnswers.map((q, i) => (
                            <div key={i} className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="font-semibold text-red-800">{q.question}</p>
                                <p className="text-sm">❌ Tu: {q.selected ?? 'Nessuna'} | ✔️ {q.answer}</p>
                                <p className="mt-2 text-gray-700">
                                    <strong>Spiegazione:</strong> {q.explanation}
                                </p>
                            </div>
                        ))
                    )}
                    <button onClick={restartQuiz} className="btn-primary mt-4">
                        🔁 Ricomincia
                    </button>
                </motion.div>
            </div>
        );
    }

    // --- END SCREEN ---
    if (current >= quizData.length) {
        return (
            <div className="page-bg flex items-center justify-center min-h-screen p-4">
                <motion.div
                    className="card max-w-lg text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <h2 className="text-3xl font-bold mb-2">🎉 Quiz Completo!</h2>
                    <p>Punteggio: {score}/{quizData.length}</p>
                    <p className="text-red-500">Errori: {mistakes}</p>
                    <div className="flex justify-center gap-4 mt-4">
                        <button onClick={restartQuiz} className="btn-primary">
                            Ricomincia
                        </button>
                        {wrongAnswers.length > 0 && (
                            <button
                                onClick={() => { setReviewMode(true); setCurrent(0); }}
                                className="btn-warning"
                            >
                                🔍 Rivedi Errori
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    // --- QUIZ VIEW ---
    const { question, options, answer, explanation } = quizData[current];
    const pct = Math.round(((current + 1) / quizData.length) * 100);

    return (
        <div className="page-bg flex items-center justify-center min-h-screen p-4">
            <motion.div
                className="card max-w-2xl w-full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Nav & Progress */}
                <div className="flex justify-between items-center mb-4">
                    <button onClick={prev} disabled={current === 0} className="text-purple-600 disabled:opacity-50">
                        ← Precedente
                    </button>
                    <span className="font-medium">Domanda {current + 1}/{quizData.length}</span>
                    <button onClick={next} disabled={current + 1 === quizData.length} className="text-purple-600 disabled:opacity-50">
                        Successiva →
                    </button>
                </div>
                <div className="progress-bg mb-4">
                    <div className="progress-fg" style={{ width: pct + '%' }} />
                </div>

                {/* Counters */}
                <div className="counter mb-4">
                    <span>✔️ {score}</span>
                    <span>❌ {mistakes}</span>
                    <span>⏳ {timeLeft}s</span>
                </div>

                {/* Question */}
                <p className="text-center text-lg font-medium mb-6">{question}</p>
                <ul className="space-y-3 mb-6">
                    {options.map(opt => (
                        <li key={opt}>
                            <button
                                onClick={() => handleAnswer(opt)}
                                className={`btn-answer ${
                                    answered
                                        ? opt === answer
                                            ? 'correct'
                                            : opt === selected
                                                ? 'wrong'
                                                : ''
                                        : ''
                                }`}
                            >
                                {opt}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Explanation */}
                {showExplanation && (
                    <motion.div className="explanation mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                        <strong>Spiegazione:</strong> {explanation}
                    </motion.div>
                )}

                {/* Actions */}
                <div className="flex justify-between">
                    <button onClick={finishTest} className="btn-danger">
                        🛑 Termina Test
                    </button>
                    {showExplanation && (
                        <button onClick={next} className="btn-primary">
                            ➡️ Prossima Domanda
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}