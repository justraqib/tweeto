export function isCSR() {
    return typeof window !== "undefined"
}

export function isSSR() {
    return !isCSR()
}

export function getApiBase() {
    const API_HOST = isSSR() ? "nginx" : "localhost";
    return `http://${API_HOST}/api`;
}
