
export const CACHE_TIME = 10 * 60;

export async function checkCache(url: string) {
    const cache = (global as any).cache || new Map();
    return cache.get(url);
}

export function storeCache(url: string, data: any) {
    const cache = (global as any).cache || new Map();
    cache.set(url, data);
    (global as any).cache = cache;
}