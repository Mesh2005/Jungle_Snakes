import { useEffect, useMemo, useState } from 'react';
import { fetchTriviaQuestion, type TriviaQuestion } from '../services/triviaApi';

export const useTrivia = () => {
    const [question, setQuestion] = useState<TriviaQuestion | null>(null);
    const [answers, setAnswers] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const [correct, setCorrect] = useState<boolean | null>(null);

    const load = async (abort?: AbortSignal) => {
        setLoading(true);
        setError(null);
        setSelected(null);
        setCorrect(null);
        try {
            const q = await fetchTriviaQuestion(abort);
            setQuestion(q);
            const shuffled = [...q.incorrect_answers, q.correct_answer].sort(
                () => Math.random() - 0.5
            );
            setAnswers(shuffled);
        } catch (err: unknown) {
            const e = err as { name?: string; message?: string };
            if (e?.name === 'AbortError') return;
            setError(e?.message || 'Failed to load trivia.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        void load(controller.signal);
        return () => controller.abort();
    }, []);

    const handleSelect = (answer: string) => {
        if (!question || selected) return;
        setSelected(answer);
        setCorrect(answer === question.correct_answer);
    };

    const difficultyLabel = useMemo(() => {
        if (!question) return '';
        return question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1);
    }, [question]);

    return {
        question,
        answers,
        loading,
        error,
        selected,
        correct,
        difficultyLabel,
        reload: () => load(),
        selectAnswer: handleSelect,
    };
};

