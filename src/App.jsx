// src/App.jsx
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import quizDataRaw from './quiz_storia_informatica1.json'

export default function QuizApp() {
    const [quizData] = useState(() => [...quizDataRaw].sort(() => Math.random() - 0.5))
    const [current, setCurrent] = useState(0)
    const [selected, setSelected] = useState(null)
    const [answered, setAnswered] = useState(false)
    const [score, setScore] = useState(0)
    const [mistakes, setMistakes] = useState(0)
    const [showExplanation, setShowExplanation] = useState(false)
    const [timeLeft, setTimeLeft] = useState(60)
    const [started, setStarted] = useState(false)
    const [reviewMode, setReviewMode] = useState(false)
    const [wrongAnswers, setWrongAnswers] = useState([])
    const [theme, setTheme] = useState('light')
    const [times, setTimes] = useState([])
    const [questionStart, setQuestionStart] = useState(null)

    useEffect(() => {
        if (started && !answered && !showExplanation) {
            if (questionStart === null) setQuestionStart(Date.now())
            if (timeLeft > 0) {
                const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
                return () => clearTimeout(id)
            }
            handleAnswer(null)
        }
    }, [timeLeft, answered, showExplanation, started])

    const handleAnswer = opt => {
        if (answered) return
        setAnswered(true)
        setSelected(opt)
        setTimes(ts => [...ts, (Date.now() - questionStart) / 1000])
        setQuestionStart(null)

        const correct = quizData[current].answer
        if (opt === correct) {
            setScore(s => s + 1)
        } else {
            setMistakes(m => m + 1)
            setWrongAnswers(ws => [...ws, { ...quizData[current], selected: opt }])
        }
        setShowExplanation(true)
    }

    const resetQuestion = () => {
        setSelected(null)
        setAnswered(false)
        setShowExplanation(false)
        setTimeLeft(60)
    }

    const goTo = idx => {
        const clamped = Math.min(Math.max(idx, 0), quizData.length)
        setCurrent(clamped)
        if (clamped < quizData.length) resetQuestion()
    }
    const prev = () => goTo(current - 1)
    const next = () => goTo(current + 1)
    const finishTest = () => goTo(quizData.length)
    const restartQuiz = () => {
        setStarted(false)
        setReviewMode(false)
        setCurrent(0)
        setScore(0)
        setMistakes(0)
        setWrongAnswers([])
        setTimes([])
        resetQuestion()
    }

    const reviewErrors = () => {
        setReviewMode(true)
    }

    const avgTime = times.length
        ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1)
        : 0
    const pctCorrect = ((score / quizData.length) * 100).toFixed(0)

    const navRange = () => {
        const span = 22
        const half = Math.floor(span / 2)
        let start = current - half
        if (start < 0) start = 0
        if (start + span > quizData.length) {
            start = Math.max(0, quizData.length - span)
        }
        return quizData
            .slice(start, start + span)
            .map((_, i) => start + i)
    }

    useEffect(() => {
        document.documentElement.className = theme
    }, [theme])

    if (!started) {
        return (
            <ScreenWrapper>
                <h1 className="text-3xl font-bold mb-4">🧠 Quiz Storia dell’Informatica</h1>
                <button onClick={() => setStarted(true)} className="btn-primary">🚀 Inizia Quiz</button>
                <ThemeSwitcher theme={theme} setTheme={setTheme} />
            </ScreenWrapper>
        )
    }

    // —— REVIEW
    if (reviewMode) {
        return (
            <ScreenWrapper>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-2xl">📘</span>
                    Revisione Errori
                </h2>

                <ul className="space-y-4">
                    {wrongAnswers.map((item, idx) => (
                        <li key={idx} className="bg-red-100 p-4 rounded shadow">
                            <p className="font-semibold text-red-700">❌ {item.question}</p>
                            <p><strong>Tua risposta:</strong> {item.selected || 'Nessuna'}</p>
                            <p><strong>Corretta:</strong> {item.answer}</p>
                            <p className="mt-2"><strong>Spiegazione:</strong> {item.explanation}</p>
                        </li>
                    ))}
                </ul>

                <div className="flex justify-center gap-4 mt-6">
                    <button
                        onClick={restartQuiz}
                        className="btn-primary"
                    >
                        🔄 Ricomincia
                    </button>

                    <button
                        onClick={() => {
                            setReviewMode(false);     // esci dalla review
                            setCurrent(quizData.length); // mostra riepilogo finale
                        }}
                        className="btn-secondary"
                    >
                        ← Torna al riepilogo
                    </button>
                </div>

                <ThemeSwitcher theme={theme} setTheme={setTheme} />
            </ScreenWrapper>
        )
    }

    if (current >= quizData.length) {
        return (
            <ScreenWrapper>
                <h2 className="text-3xl font-bold mb-2">🎉 Quiz Completo!</h2>
                <p>✅ Corrette: {score} ({pctCorrect}%)</p>
                <p>❌ Sbagliate: {mistakes}</p>
                <p>⏱️ Tempo medio: {avgTime}s/q</p>
                <div className="flex gap-4 mt-4">
                    <button onClick={restartQuiz} className="btn-primary">🔁 Ricomincia</button>
                    <button onClick={reviewErrors} className="btn-secondary">📘 Rivedi Errori</button>
                </div>
                <ThemeSwitcher theme={theme} setTheme={setTheme} />
            </ScreenWrapper>
        )
    }

    const { question, options, answer, explanation } = quizData[current]
    const pct = Math.round(((current + 1) / quizData.length) * 100)

    return (
        <ScreenWrapper>
            <div className="flex overflow-x-auto space-x-2 mb-4 px-2">
                {navRange().map(i => {
                    const isCorrect = quizData[i].answer === (wrongAnswers.find(w => w.question === quizData[i].question)?.selected ?? quizData[i].answer)
                    const isWrong = wrongAnswers.some(w => w.question === quizData[i].question)
                    return (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className={`w-8 h-8 rounded-full text-sm ${
                                i === current
                                    ? 'bg-indigo-600 text-white'
                                    : isCorrect
                                        ? 'bg-green-400 text-white'
                                        : isWrong
                                            ? 'bg-red-400 text-white'
                                            : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            {i + 1}
                        </button>
                    )
                })}
            </div>

            <div className="flex justify-between items-center mb-4">
                <button onClick={prev} disabled={current === 0} className="text-purple-600 disabled:opacity-50">← Precedente</button>
                <span className="font-medium">Domanda {current + 1}/{quizData.length}</span>
                <button onClick={next} disabled={current + 1 === quizData.length} className="text-purple-600 disabled:opacity-50">Successiva →</button>
            </div>

            <div className="progress-bg mb-4">
                <div className="progress-fg" style={{ width: pct + '%' }} />
            </div>

            <div className="counter mb-4">
                <span>✔️ {score}</span><span>❌ {mistakes}</span><span>⏳ {timeLeft}s</span>
            </div>

            <p className="text-center text-lg font-medium mb-6">{question}</p>
            <ul className="space-y-3 mb-6">
                {options.map(opt => (
                    <li key={opt}>
                        <button
                            onClick={() => handleAnswer(opt)}
                            className={`btn-answer ${answered
                                ? opt === answer ? 'correct'
                                    : opt === selected ? 'wrong' : ''
                                : ''}`}
                        >
                            {opt}
                        </button>
                    </li>
                ))}
            </ul>

            {showExplanation && (
                <motion.div className="explanation mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <strong>Spiegazione:</strong> {explanation}
                </motion.div>
            )}

            <div className="flex justify-between items-center">
                <button onClick={finishTest} className="btn-danger">🛑 Termina</button>
                {showExplanation && <button onClick={next} className="btn-primary">➡️ Prossima</button>}
                <ThemeSwitcher theme={theme} setTheme={setTheme} />
            </div>
        </ScreenWrapper>
    )
}

function ScreenWrapper({ children }) {
    return (
        <div className="page-bg flex flex-col items-center justify-center min-h-screen p-4">
            <motion.div className="card w-full max-w-2xl" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                {children}
            </motion.div>
        </div>
    )
}

function ThemeSwitcher({ theme, setTheme }) {
    return (
        <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="absolute top-4 right-4 p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
        >
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    )
}
