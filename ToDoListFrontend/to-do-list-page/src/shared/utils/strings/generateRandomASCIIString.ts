export function generateRandomString(length: number): string {
    const result = Array.from({ length }, () => String.fromCharCode(Math.floor(Math.random() * 128)));
    return result.join('');
}
