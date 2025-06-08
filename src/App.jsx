import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import quizDataRaw from './quiz_storia_informatica.json'

export default function QuizApp() {
    // clona e mescola una volta sola
    const [quizData] = useState(() =>
        [...quizDataRaw].sort(() => Math.random() - 0.5)
    )
    const [current, setCurrent] = useState(0)

    // mappa domandaIdx → opzione selezionata
    const [selectedMap, setSelectedMap] = useState({})
    // mappa domandaIdx → 'correct' | 'wrong'
    const [questionStatus, setQuestionStatus] = useState({})

    const [score, setScore] = useState(0)
    const [mistakes, setMistakes] = useState(0)
    const [showExplanation, setShowExplanation] = useState(false)
    const [timeLeft, setTimeLeft] = useState(60)
    const [started, setStarted] = useState(false)
    const [reviewMode, setReviewMode] = useState(false)
    const [wrongAnswers, setWrongAnswers] = useState([])

    // timer automatico
    useEffect(() => {
        if (!started) return
        const answered = questionStatus[current] !== undefined
        if (answered || showExplanation) return
        if (timeLeft > 0) {
            const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
            return () => clearTimeout(id)
        }
        handleAnswer(null)
    }, [timeLeft, questionStatus, showExplanation, started, current])

    const handleAnswer = opt => {
        if (questionStatus[current] !== undefined) return

        const correct = quizData[current].answer
        const isCorrect = opt === correct

        // registra scelta e stato
        setSelectedMap(m => ({ ...m, [current]: opt }))
        setQuestionStatus(qs => ({
            ...qs,
            [current]: isCorrect ? 'correct' : 'wrong'
        }))

        // aggiorna punteggi
        if (isCorrect) setScore(s => s + 1)
        else {
            setMistakes(m => m + 1)
            setWrongAnswers(ws => [
                ...ws,
                { ...quizData[current], selected: opt }
            ])
        }

        setShowExplanation(true)
    }

    const resetQuestion = () => {
        setTimeLeft(60)
        setShowExplanation(false)
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
        setSelectedMap({})
        setQuestionStatus({})
        resetQuestion()
    }

    // derive answered & selected locali
    const answered = questionStatus[current] !== undefined
    const selected = selectedMap[current] ?? null

    // ——— START SCREEN ———
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
                    <button onClick={() => setStarted(true)} className="btn-primary">
                        🚀 Inizia Quiz
                    </button>
                </motion.div>
            </div>
        )
    }

    // ——— REVIEW MODE ———
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
                            <div
                                key={i}
                                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
                            >
                                <p className="font-semibold text-red-800">{q.question}</p>
                                <p className="text-sm">
                                    ❌ Tu: {q.selected ?? 'Nessuna'} | ✔️ {q.answer}
                                </p>
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
        )
    }

    // ——— END SCREEN ———
    if (current >= quizData.length) {
        return (
            <div className="page-bg flex items-center justify-center min-h-screen p-4">
                <motion.div
                    className="card max-w-lg text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <h2 className="text-3xl font-bold mb-2">🎉 Quiz Completo!</h2>
                    <p>
                        Punteggio: {score}/{quizData.length}
                    </p>
                    <p className="text-red-500">Errori: {mistakes}</p>
                    <div className="flex justify-center gap-4 mt-4">
                        <button onClick={restartQuiz} className="btn-primary">
                            Ricomincia
                        </button>
                        {wrongAnswers.length > 0 && (
                            <button
                                onClick={() => {
                                    setReviewMode(true)
                                    goTo(0)
                                }}
                                className="btn-warning"
                            >
                                🔍 Rivedi Errori
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        )
    }

    // ——— MAIN QUIZ VIEW ———
    const { question, options, answer, explanation } = quizData[current]
    const pct = Math.round(((current + 1) / quizData.length) * 100)

    return (
        <div className="page-bg flex items-center justify-center min-h-screen p-4">
            <motion.div
                className="card max-w-2xl w-full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* domanda-pill */}
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {quizData.map((_, idx) => {
                        const status = questionStatus[idx] // 'correct'|'wrong'|undefined
                        return (
                            <button
                                key={idx}
                                onClick={() => goTo(idx)}
                                className={`pill ${status || ''} ${
                                    idx === current ? 'current' : ''
                                }`}
                            >
                                {idx + 1}
                            </button>
                        )
                    })}
                </div>

                {/* Nav & Progress */}
                <div className="flex justify-between items-center mb-4">
                    <button onClick={prev} disabled={current === 0} className="text-purple-600 disabled:opacity-50">
                        ← Precedente
                    </button>
                    <span className="font-medium">
            Domanda {current + 1}/{quizData.length}
          </span>
                    <button
                        onClick={next}
                        disabled={current + 1 === quizData.length}
                        className="text-purple-600 disabled:opacity-50"
                    >
                        Successiva →
                    </button>
                </div>

                {/* Progress bar */}
                <div className="progress-bg mb-4">
                    <div className="progress-fg" style={{ width: pct + '%' }} />
                </div>

                {/* Counters */}
                <div className="flex justify-center space-x-6 text-sm mb-4">
                    <span className="text-green-600">✔️ {score}</span>
                    <span className="text-red-500">❌ {mistakes}</span>
                    <span className="text-blue-600">⏳ {timeLeft}s</span>
                </div>

                <p className="text-center text-lg font-medium mb-6">{question}</p>
                <ul className="space-y-3 mb-6">
                    {options.map(opt => (
                        <li key={opt}>
                            <button
                                onClick={() => handleAnswer(opt)}
                                disabled={answered}
                                className={`w-full text-left px-4 py-3 rounded-xl border font-semibold transition-all duration-200 ${
                                    answered
                                        ? opt === answer
                                            ? 'bg-green-200 border-green-600'
                                            : opt === selected
                                                ? 'bg-red-200 border-red-600'
                                                : 'bg-gray-100 border-gray-300'
                                        : 'hover:bg-blue-50 border-gray-200'
                                }`}
                            >
                                {opt}
                            </button>
                        </li>
                    ))}
                </ul>

                {showExplanation && (
                    <motion.div
                        className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <p className="text-sm text-gray-700">
                            <strong>Spiegazione:</strong> {explanation}
                        </p>
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
    )
}