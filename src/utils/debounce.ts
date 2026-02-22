// src/utils/debounce.ts

/**
 * Cria uma versão debounced de uma função.
 * Atrasa a execução até que `delay` ms tenham passado sem novas chamadas.
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
    fn: T,
    delay: number,
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
            timeoutId = null;
        }, delay);
    };
}
