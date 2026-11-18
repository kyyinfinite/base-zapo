import { streamFromUrl } from '../../src/utils/stream.js'
import { nowSecond } from '../../src/utils/format.js'
import { youtubeSearch } from '../../src/services/youtube/search.js'
import { fetchConvert } from '../../src/services/youtube/download.js'
import { addCache, getCache } from '../../src/services/youtube/query-cache.js'
import { proto } from "zapo-js"
import { youtubeCacheSTMT } from '../../src/database/table-youtube-cache.js'

const DUA_MINGGU = 60 * 60 * 24 * 14

const handler = async (m, ctx) => {
    const { q, text, conn, chat } = ctx

    if (!text) return await m.reply(`ketik lagu yang ingin kamu mainkan.`)

    const query = text?.trim()
    const wam = q ?? m

    let ytsResult
    const cachedVideoId = getCache(query)
    if (!cachedVideoId) {
        ytsResult = await youtubeSearch(query)
        addCache(query, ytsResult[0].videoId)
    }

    const videoId = cachedVideoId ?? ytsResult[0].videoId

    //cek cache dulu
    const ytCache = youtubeCacheSTMT.proto.get({ videoId })
    const cacheExpired = nowSecond() - ytCache?.timestamp > DUA_MINGGU
    if (ytCache && !cacheExpired) {
        const pm = proto.Message.decode(ytCache.protoMessage)
        return await conn.message.send(chat, {
            audioMessage: {
                ...pm.audioMessage,
                contextInfo: {
                    stanzaId: wam.key.id,
                    participant: wam.key.participant ?? wam.key.remoteJid,
                    quotedMessage: wam.message
                }
            }
        })
    }

    //✨ ada di cache, 🕒 harus download dulu
    m.react(ytCache ? '✨' : '🕒')
    const ytMp3Result = await fetchConvert(videoId, 'mp3')
    const stream = await streamFromUrl(ytMp3Result.downloadURL)
    const media = await conn.message.upload(stream, {
        type: 'audio',
        mimetype: 'audio/mpeg'
    })

    let duration
    if (ytCache) {
        duration = ytCache.duration
    } else {
        duration = toSecond(ytsResult?.[0]?.duration)
    }

    const msg = {
        audioMessage: {
            url: media.url,
            mimetype: media.mimetype,
            fileSha256: media.fileSha256,
            fileLength: media.fileLength,
            seconds: duration,
            ptt: false,
            mediaKey: media.mediaKey,
            fileEncSha256: media.fileEncSha256,
            directPath: media.directPath,
            mediaKeyTimestamp: media.mediaKeyTimestamp,
            contextInfo: {
                stanzaId: wam.key.id,
                participant: wam.key.participant ?? wam.key.remoteJid,
                quotedMessage: wam.message,
            }
        }
    }

    await conn.message.send(chat, msg)

    delete msg.audioMessage.contextInfo
    const protoMessage = proto.Message.encode(msg).finish()

    const youtubeCache = {
        videoId: videoId,
        title: ytsResult?.[0]?.title ? ytsResult?.[0]?.title : null,
        duration: duration ? duration : null,
        protoMessage,
        size: media.fileLength,
        timestamp: nowSecond()
    }

    youtubeCacheSTMT.upsert.get(youtubeCache)
    await m.react('💾')
}

const toSecond = (string) => {
    const type = typeof string
    if (type !== "string") throw Error(`toSecond: type harus string ${type} diterima`)
    const time = string.replaceAll(/\s/g, '')
        .split(":")
        .reverse()
    if (!time.every(t => /^\d+$/.test(t))) throw Error(`invalid string`)
    let totalSecond = 0
    const hour = time[2] ? time[2] * 3600 : 0
    totalSecond += hour
    const minute = time[1] ? time[1] * 60 : 0
    totalSecond += minute
    totalSecond += parseInt(time[0])
    return totalSecond
}

handler.command = ['play', 'mainkan']
handler.description = 'yt play'
handler.category = 'tools'

export default handler
