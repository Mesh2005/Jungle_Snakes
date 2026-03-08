export interface HeartApiQuestion {
    question: string; // URL to the image
    solution: number;
    carrots: number; // Likely useless or extra data
}

const API_URL = "https://marcconrad.com/uob/heart/api.php";

export const fetchQuestion = async (signal?: AbortSignal): Promise<HeartApiQuestion> => {
    try {
        const response = await fetch(API_URL, { signal });
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        return data as HeartApiQuestion;
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            // Ignore abort errors
            throw error;
        }
        console.error("Failed to fetch question:", error);
        throw error;
    }
};
