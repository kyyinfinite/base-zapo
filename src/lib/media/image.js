import { randomUUIDv7 } from "node:crypto"
import { mkdir, stat, writeFile, rename, rm, readdir } from "node:fs/promises"
import { Readable } from "node:stream"
import sharp from "sharp"
import { fileTypeFromFile } from "file-type"

const TEMP_PATH = './.temp/'

export const ensureTempDir = async () => {
    await mkdir(TEMP_PATH, { recursive: true })
}

export const getImageMetadata = async (url) => {
    try {
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}\n${await response.text()}`)
        }

        if (!response.body) {
            throw new Error("response body is empty")
        }

        const stream = Readable.fromWeb(response.body)
        return await resolveImage(stream)
    } catch (e) {
        return undefined
    }
}

export const resolveImage = async (stream) => {
    await ensureTempDir()
    const oldPath = TEMP_PATH + randomUUIDv7()
    await writeFile(oldPath, stream)

    const fileType = await fileTypeFromFile(oldPath)
    if (!fileType) {
        await rm(oldPath)
        throw Error(`unknown filetype`)
    }

    const newPath = oldPath + '.' + fileType.ext
    await rename(oldPath, newPath)

    const metadata = await sharp(newPath).metadata()
    const fileStat = await stat(newPath)

    return { metadata, fileStat, fileType, path: newPath }
}

export function resizeImageBox(stream, size = 48) {
    return stream.pipe(
        sharp()
            .resize(size, size, {
                fit: 'contain',
                position: 'centre',
                background: {
                    r: 0,
                    g: 0,
                    b: 0,
                    alpha: 0,
                },
            })
            .png()
    )
}

export function resizeImageKeepAspectRatio(stream, size = 48) {
    return stream.pipe(
        sharp()
            .resize({
                width: size,
                height: size,
                fit: 'inside',
                withoutEnlargement: true,
            })
            .jpeg()
    )
}

export const cleanupTempDir = async () => {
    await ensureTempDir()

    let removed = 0
    let kept = 0

    const entries = await readdir(TEMP_PATH)
    for (const name of entries) {
        try {
            await rm(TEMP_PATH + name, { force: true })
            removed++
        } catch {
            kept++
        }
    }

    return { removed, kept }
}

export const withTempFile = async (process, ext = 'bin') => {
    await ensureTempDir()
    const path = `${TEMP_PATH}${randomUUIDv7()}.${ext}`
    try {
        return await process(path)
    } finally {
        await rm(path, { force: true }).catch(() => { })
    }
}
