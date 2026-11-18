import { getImageMetadata, resizeImageKeepAspectRatio } from '../../src/lib/media/image.js'
import { createReadStream } from "fs"
import { rm } from "fs/promises"
import { streamToBuffer } from '../../src/utils/stream.js'

const handler = async (m, ctx) => {
    const { conn, chat, text } = ctx

    if (!text) return await m.reply(`masukkan url`)
    const url = text?.trim()
    if (!url?.startsWith("http")) return await m.reply(`masukkan url yang valid`)

    //file temp dibersihin di finally, biar kalo error ga nyisa di .temp
    const img = await getImageMetadata(url)
    if (!img) return await m.reply(`gagal mengambil gambar dari url`)

    try {
        const media = await conn.message.upload(createReadStream(img.path), {
            type: 'thumbnail-link',
            mimetype: img.metadata.mediaType ?? 'image/jpeg'
        })

        const stream = resizeImageKeepAspectRatio(createReadStream(img.path))
        let jpegThumbnail = await streamToBuffer(stream)

        await conn.message.send(chat, {
            extendedTextMessage: {
                title: 'title',
                description: 'description',
                matchedText: 'https://example.com',
                text: `https://example.com` + `\n` + `your text goes here`,
                jpegThumbnail,

                thumbnailDirectPath: media.directPath,
                thumbnailEncSha256: media.fileEncSha256,
                thumbnailSha256: media.fileSha256,

                mediaKey: media.mediaKey,
                mediaKeyTimestamp: media.mediaKeyTimestamp,

                thumbnailHeight: img.metadata.height,
                thumbnailWidth: img.metadata.width,

                faviconMmsMetadata: {
                    mediaKey: media.mediaKey,
                    mediaKeyTimestamp: media.mediaKeyTimestamp,
                    thumbnailDirectPath: media.directPath,
                    thumbnailEncSha256: media.fileEncSha256,
                    thumbnailSha256: media.fileSha256,

                    thumbnailHeight: img.metadata.height,
                    thumbnailWidth: img.metadata.width,
                }
            }
        })
    } finally {
        await rm(img.path, { force: true }).catch(() => { })
    }
}

handler.command = ['ct']
handler.description = 'create thumbnail'
handler.category = 'experimental'

export default handler
