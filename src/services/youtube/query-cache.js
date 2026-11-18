const MAX_ENTRIES = 500

const youtubeQueryCache = new Map()

export const addCache = (query, youtubeVideoId) => {
    if (typeof query !== "string" || query?.trim()?.length === 0) return undefined
    if (typeof youtubeVideoId !== "string" || youtubeVideoId?.trim()?.length === 0) return undefined
    const cleanQuery = query.toLocaleLowerCase()

    //LRU simpel, hapus terus set lagi biar jadi yang paling baru
    youtubeQueryCache.delete(cleanQuery)
    youtubeQueryCache.set(cleanQuery, youtubeVideoId)

    if (youtubeQueryCache.size > MAX_ENTRIES) {
        const oldest = youtubeQueryCache.keys().next().value
        youtubeQueryCache.delete(oldest)
    }
}

export const getCache = (query) => {
    if (typeof query !== "string" || query?.trim()?.length === 0) return undefined
    const cleanQuery = query.toLocaleLowerCase()
    return youtubeQueryCache.get(cleanQuery)
}

export const cacheSize = () => youtubeQueryCache.size

export const clearCache = () => youtubeQueryCache.clear()
