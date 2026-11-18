import { getCacheDb } from "./database.js"

let stmt = null

const bind = () => {
    if (stmt) return stmt
    const db = getCacheDb()

    //timestamp = kapan cache dibuat (detik), bukan mediaKeyTimestamp dari wa, itu beda hal
    const upsert = db.prepare(`
        INSERT INTO youtube_cache (
            'video_id',
            'title',
            'duration',
            'size',
            'timestamp',
            'proto_message')
        VALUES (:videoId, :title, :duration, :size, :timestamp, :protoMessage)
        ON CONFLICT DO UPDATE SET
            title = coalesce(excluded.title, title),
            duration = coalesce(excluded.duration, duration),
            size = coalesce(excluded.size, size),
            timestamp = excluded.timestamp,
            proto_message = excluded.proto_message
    `)

    const proto = db.prepare(`
        SELECT
        video_id as videoId,
            timestamp as timestamp,
            proto_message as protoMessage,
        title,
        duration,
        size
        FROM youtube_cache
        WHERE video_id = :videoId
    `)

    stmt = { upsert, proto }
    return stmt
}

export const youtubeCacheSTMT = {
    get upsert() { return bind().upsert },
    get proto() { return bind().proto },
}

export const resetYoutubeCacheStmt = () => { stmt = null }
