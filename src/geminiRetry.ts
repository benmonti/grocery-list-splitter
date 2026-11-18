const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 4;

export function isRetryableGeminiError(error: unknown): boolean {
    if (typeof error !== "object" || error === null || !("status" in error)) {
        return false;
    }

    return (
        typeof error.status === "number" && RETRYABLE_STATUSES.has(error.status)
    );
}

export async function withGeminiRetries<T>(
    generate: () => Promise<T>,
): Promise<T> {
    for (let attempt = 1; ; attempt += 1) {
        try {
            return await generate();
        } catch (error) {
            if (!isRetryableGeminiError(error) || attempt >= MAX_ATTEMPTS) {
                throw error;
            }

            const delayMs = 1000 * 2 ** (attempt - 1) + Math.random() * 1000;
            console.warn(
                `Gemini temporarily unavailable; retrying request (${attempt + 1}/${MAX_ATTEMPTS}) in ${Math.round(delayMs)}ms`,
            );
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
}
