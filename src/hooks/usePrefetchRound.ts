import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchQuestion } from '../services/heartApi';
import type { HeartApiQuestion } from '../services/heartApi';

export interface RoundData extends HeartApiQuestion {
    id: string; // Unique ID for keying
}

export const usePrefetchRound = () => {
    const [currentRound, setCurrentRound] = useState<RoundData | null>(null);
    const [nextRound, setNextRound] = useState<RoundData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const pendingRequest = useRef<AbortController | null>(null);

    // Helper to wrap API data with ID
    const prepareRound = (data: HeartApiQuestion): RoundData => ({
        ...data,
        id: crypto.randomUUID()
    });

    const fetchNext = useCallback(async () => {
        // If we already have a next round or a request is pending, skip
        // Actually we want to always ensure we have a next round if missing
        if (nextRound) return;

        if (pendingRequest.current) {
            pendingRequest.current.abort();
        }

        const controller = new AbortController();
        pendingRequest.current = controller;

        try {
            const data = await fetchQuestion(controller.signal);
            setNextRound(prepareRound(data));
            setError(null);
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') return;
            console.error("Prefetch failed", err);
            // Don't set global error here to avoid disrupting current game
            // We'll retry on next advance or interval? 
        } finally {
            pendingRequest.current = null;
        }
    }, [nextRound]);

    // Initial load
    useEffect(() => {
        let mounted = true;
        const init = async () => {
            try {
                const [r1, r2] = await Promise.all([
                    fetchQuestion(),
                    fetchQuestion()
                ]);
                if (mounted) {
                    setCurrentRound(prepareRound(r1));
                    setNextRound(prepareRound(r2));
                    setLoading(false);
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err : new Error('Init failed'));
                    setLoading(false);
                }
            }
        };
        init();
        return () => { mounted = false; };
    }, []);

    // Ensure next round is always present (replenish)
    useEffect(() => {
        if (!nextRound && !loading && !error) {
            fetchNext();
        }
    }, [nextRound, loading, error, fetchNext]);

    const advanceRound = useCallback(() => {
        if (nextRound) {
            setCurrentRound(nextRound);
            setNextRound(null); // Triggers effect to fetch next
        } else {
            // Emergency: no next round ready, must fetch
            setLoading(true);
            fetchQuestion().then(data => {
                setCurrentRound(prepareRound(data));
                setLoading(false);
                fetchNext(); // Start prefetching again
            }).catch(err => {
                setError(err);
                setLoading(false);
            });
        }
    }, [nextRound, fetchNext]);

    return { currentRound, nextRound, loading, error, advanceRound };
};
