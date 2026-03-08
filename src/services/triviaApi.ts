export interface TriviaQuestion {
    category: string;
    type: 'multiple' | 'boolean';
    difficulty: 'easy' | 'medium' | 'hard';
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
}

interface OpenTriviaResponse {
    response_code: number;
    results: TriviaQuestion[];
}

const TRIVIA_URL = 'https://opentdb.com/api.php?amount=1&type=multiple';

// Very small HTML entity decoder for common cases from Open Trivia DB
const decodeHtml = (text: string): string => {
    const txt = document.createElement('textarea');
    txt.innerHTML = text;
    return txt.value;
};

export const fetchTriviaQuestion = async (signal?: AbortSignal): Promise<TriviaQuestion> => {
    const res = await fetch(TRIVIA_URL, { signal });
    if (!res.ok) {
        throw new Error(`Trivia API error: ${res.status}`);
    }

    const data = (await res.json()) as OpenTriviaResponse;
    if (data.response_code !== 0 || !data.results.length) {
        throw new Error('No trivia question available');
    }

    const raw = data.results[0];

    return {
        ...raw,
        question: decodeHtml(raw.question),
        correct_answer: decodeHtml(raw.correct_answer),
        incorrect_answers: raw.incorrect_answers.map(decodeHtml),
    };
};

