import { WaMediaTransferClient } from "zapo-js"
import { Readable } from "node:stream"

const waMediaTransfer = new WaMediaTransferClient()

const thumbnailRequest = (etm) => ({
    mediaType: 'thumbnail-link',
    mediaKey: etm.mediaKey,
    directPath: etm.thumbnailDirectPath,
    fileEncSha256: etm.thumbnailEncSha256,
    fileSha256: etm.thumbnailSha256
})

const downloadThumbnail = async (mode, etm) => {
    if (mode === 'bytes') {
        try {
            return await waMediaTransfer.downloadAndDecrypt(thumbnailRequest(etm))
        } catch (error) {
            if (error.message === "media MAC mismatch") {
                return await waMediaTransfer.downloadAndDecrypt({ ...thumbnailRequest(etm), mediaType: 'image' })
            }
            throw error
        }
    }

    try {
        const { plaintext } = await waMediaTransfer.downloadAndDecryptStream(thumbnailRequest(etm))
        return plaintext
    } catch (error) {
        if (error.message === "media MAC mismatch") {
            const { plaintext } = await waMediaTransfer.downloadAndDecryptStream({ ...thumbnailRequest(etm), mediaType: 'image' })
            return plaintext
        }
        throw error
    }
}

async function mDownload(dataType) {
    if (this?.content === "extendedTextMessage" && this?.message?.extendedTextMessage?.mediaKey) {
        const etm = this.message.extendedTextMessage
        if (dataType === "buffer") {
            const bytes = await waMediaTransfer.downloadAndDecrypt(thumbnailRequest(etm))
            return Buffer.from(bytes)
        }
        const { plaintext } = await waMediaTransfer.downloadAndDecryptStream(thumbnailRequest(etm))
        return plaintext
    }

    if (dataType === "buffer") {
        const bytes = await this.client.message.downloadBytes(this)
        return Buffer.from(bytes)
    }
    return this.client.message.download(this)
}

async function qDownload(dataType) {
    const isExtendedText = this?.content === "extendedTextMessage"
    const etm = this?.message?.extendedTextMessage

    if (isExtendedText && etm?.mediaKey) {
        return downloadThumbnail(dataType === "bytes" ? 'bytes' : 'stream', etm)
    }

    if (isExtendedText && etm?.jpegThumbnail) {
        const bytes = etm.jpegThumbnail
        return dataType === "bytes"
            ? Buffer.from(bytes)
            : Readable.from([bytes])
    }

    if (isExtendedText) {
        if (dataType === "bytes") {
            return this.client.message.downloadBytes(this.message)
        }
        return this.client.message.download(this.message)
    }

    if (this?.content === "groupStatusMessageV2") {
        return this.client.message.download(this.message.groupStatusMessageV2.message)
    }

    if (dataType === "bytes") {
        return this.client.message.downloadBytes(this.message)
    }
    return this.client.message.download(this.message)
}

export { mDownload, qDownload, downloadThumbnail }
