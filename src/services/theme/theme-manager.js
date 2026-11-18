import { createReadStream } from "node:fs"
import { Readable } from "node:stream"
import { resizeImageKeepAspectRatio, resizeImageBox } from "../../lib/media/image.js"
import { streamToBuffer } from "../../utils/stream.js"

import { mkdir, rename, rm, readFile } from "node:fs/promises"
import { proto } from "zapo-js"
import { configStmt } from "../../database/table-config.js"
import { resolveImage } from "../../lib/media/image.js"

const DEFAULT_THUMBNAIL_PATH = './assets/zapok.png'

export class ThemeManager {
    #categoriesArray = []

    #mainMenuText = ''

    #allMenuText = ''

    #categoriesMap = new Map()

    #registry = undefined

    #config = {
        theme_url: `https://github.com/kyyinfinite`,
        theme_title: `basw zapok`,
        theme_description: `with zapo`,
        theme_commandRows: `  ▸  @commands [@name]`,
        theme_categoryRows: `▨  *@category*`,

        theme_thumbnailLink: undefined,

        theme_favicon: undefined
    }

    constructor(registry) {
        this.#registry = registry
    }

    #readConfigFromDB = () => {
        const dbr = configStmt.getAllRows.all()
        const rows = dbr.filter(row => row.key.startsWith('theme'))
        for (const row of rows) {
            if (row.key === "theme_thumbnailLink" || row.key === "theme_favicon") {
                if (!row.value) continue
                const buffer = Buffer.from(row.value, 'base64url')
                this.#config[row.key] = proto.Message.decode(buffer)
            } else {
                this.#config[row.key] = row.value
            }
        }
    }

    #cleanup = () => {
        this.#categoriesArray.length = 0
        this.#mainMenuText = ''
        this.#categoriesMap.clear()
        this.#allMenuText = ''
    }

    rebuildMenu = () => {
        this.#cleanup()
        this.#readConfigFromDB()

        const plugins = (this.#registry?.list() ?? [])
            .map(entry => ({
                name: entry.metadata.description || entry.file,
                commands: entry.metadata.commands,
                category: entry.metadata.category
            }))

        plugins
            .map(plugin => {
                const command = plugin.commands.slice().sort((a, b) => a.localeCompare(b)).join(', ')
                const name = plugin.name

                const normalizedRow = this.#config.theme_commandRows
                    .replaceAll('@commands', command)
                    .replaceAll('@name', name)
                    .replaceAll('@enter', '\n')
                return { normalizedRow, plugin }
            })
            .forEach(v => {
                const categories = v.plugin.category ? [v.plugin.category] : []
                //baris command ditaro di semua kategori
                for (const category of categories) {
                    if (!this.#categoriesMap.has(category)) {
                        this.#categoriesMap.set(category, {
                            text: '',
                            commands: []
                        })
                    }
                    const entry = this.#categoriesMap.get(category)
                    entry.commands.push(...v.plugin.commands)
                }

                for (const category of categories) {
                    const entry = this.#categoriesMap.get(category)
                    entry.normalizedRows = [...(entry.normalizedRows ?? []), v.normalizedRow]
                }
            })

        this.#categoriesArray = [...this.#categoriesMap.keys()]
            .sort((a, b) => a.localeCompare(b))

        this.#categoriesArray
            .forEach(category => {
                const entry = this.#categoriesMap.get(category)
                const normalizedRows = (entry.normalizedRows ?? [])
                    .sort((a, b) => a.localeCompare(b))
                    .join('\n')
                const done = `${this.#config.theme_categoryRows}\n${normalizedRows}`.replaceAll(`@category`, category)
                entry.text = done
                delete entry.normalizedRows

                this.#allMenuText += `${done}\n\n`
            })

        this.#allMenuText = this.#allMenuText.trimEnd()

        this.#mainMenuText = `daftar kategori menu\n${this.#categoriesArray.map(v => `${this.#config.theme_categoryRows.replaceAll(`@category`, v)}`).join('\n')}`
    }

    ensureJpegThumbnail = async () => {
        if (!this.#config?.theme_thumbnailLink?.extendedTextMessage?.jpegThumbnail) {
            await this.useDefaultThumbnail()
        }
    }

    getConfig = () => this.#config

    init = async () => {
        this.rebuildMenu()
        await this.ensureJpegThumbnail()
    }

    getMenuCategory = (userInput) => {
        const paramType = typeof userInput
        if (paramType !== "string" || userInput.length === 0) return { error: `param harus tipe string dan gak boleh kosong. diterima ${paramType}` }
        const category = this.#categoriesMap.get(userInput)
        if (!category) return { error: `category \`${userInput}\` tidak ditemukan` }
        return { data: { text: category.text, commands: category.commands } }
    }

    getMainMenuText = () => this.#mainMenuText
    getMenuAll = () => this.#allMenuText

    updateUrl = (url) => {
        const urlType = typeof url
        if (urlType !== 'string') return { error: `url harus string, ${urlType} diterima` }
        const urlTrim = url.trim()
        if (!/^https?:\/\/.+\..+/.test(urlTrim)) return { error: `invalid url` }
        if (this.#config.theme_url === urlTrim) return { error: `url sama. nothing change` }
        const dbr = configStmt.editRow.get({ key: 'theme_url', value: urlTrim })
        this.#config.theme_url = dbr.value
        return { data: `url berhasil di update` }
    }

    updateTitle = (string) => {
        const stringType = typeof string
        if (stringType !== "string") return { error: `tipe data harus string, ${stringType} diterima` }
        if (string.length === 0 && !this.#config.theme_description) return { error: `tidak bisa clear title karena description kosong.` }
        if (this.#config.theme_title === string) return { error: `title ${this.#config.theme_title ? `sama` : `sudah clear`}. nothing change` }
        const dbr = configStmt.editRow.get({ key: 'theme_title', value: string })
        this.#config.theme_title = dbr.value
        if (!string) return { data: `title berhasil di hapus` }
        return { data: `title berhasil diubah menjadi [${string}]` }
    }

    updateDescription = (string) => {
        const stringType = typeof string
        if (stringType !== "string") return { error: `tipe data harus string, ${stringType} diterima` }
        if (string.length === 0 && !this.#config.theme_title) return { error: `tidak bisa clear description karena title kosong` }
        if (this.#config.theme_description === string) return { error: `title ${this.#config.theme_description ? `sama` : `sudah clear`}. nothing change` }
        const dbr = configStmt.editRow.get({ key: 'theme_description', value: string })
        this.#config.theme_description = dbr.value
        if (!string) return { data: `description berhasil di hapus` }
        return { data: `description berhasil diubah menjadi [${string}]` }
    }

    updateCommandRows = (string) => {
        const stringType = typeof string
        if (stringType !== "string") return { error: `param type harus string, ${stringType} diterima` }
        if (!/@name|@commands/gms.test(string)) return { error: `wajib ada keyword \`@commands\` atau \`@name\`, posisi bebas` }
        if (this.#config.theme_commandRows === string) return { error: `command rows sama, nothing change` }
        const dbr = configStmt.editRow.get({
            key: 'theme_commandRows',
            value: string
        })

        this.#config.theme_commandRows = dbr.value
        this.rebuildMenu()
        return { data: `berhasil` }
    }

    updateCategoryRows = (string) => {
        const stringType = typeof string
        if (stringType !== "string") return { error: `param type harus string, ${stringType} diterima` }
        if (!/@category/gms.test(string)) return { error: `wajib ada keyword \`@category\`, posisi bebas` }
        if (this.#config.theme_categoryRows === string) return { error: `category rows sama. nothing change` }
        const dbr = configStmt.editRow.get({
            key: 'theme_categoryRows',
            value: string
        })

        this.#config.theme_categoryRows = dbr.value
        this.rebuildMenu()
        return { data: `berhasil` }
    }

    updateThumbnail = async (client, stream) => {
        let path
        try {
            const img = await resolveImage(stream)
            path = img.path

            const media = await client.message.upload(createReadStream(img.path), {
                type: 'thumbnail-link',
                mimetype: img.metadata.mediaType
            })
            const jpegThumbnailStream = resizeImageKeepAspectRatio(createReadStream(img.path), 50)
            const jpegThumbnail = await streamToBuffer(jpegThumbnailStream)

            const result = {
                thumbnailDirectPath: media.directPath,
                thumbnailEncSha256: media.fileEncSha256,
                thumbnailSha256: media.fileSha256,
                mediaKey: media.mediaKey,
                mediaKeyTimestamp: media.mediaKeyTimestamp,
                thumbnailHeight: img.metadata.height,
                thumbnailWidth: img.metadata.width,
                jpegThumbnail,
            }
            const protoMessage = new proto.Message({ extendedTextMessage: result })
            const binary = proto.Message.encode(protoMessage).finish()
            const b64url = Buffer.from(binary).toString('base64url')
            const dbr = configStmt.editRow.get({
                key: `theme_thumbnailLink`,
                value: b64url
            })
            const buffer = Buffer.from(dbr.value, 'base64url')
            this.#config[dbr.key] = proto.Message.decode(buffer)
            await mkdir('./data', { recursive: true })
            await rename(img.path, './data/thumbnail.' + img.fileType.ext)
            return { data: `berhasil memperbarui thumbnail link` }
        } catch (error) {
            if (path) await rm(path, { force: true })
            return { error: error.message }
        }
    }

    updateFavicon = async (client, stream) => {
        let path
        try {
            const downscaleImage = resizeImageBox(stream)
            const img = await resolveImage(downscaleImage)
            path = img.path

            const media = await client.message.upload(createReadStream(img.path), {
                type: 'thumbnail-link',
                mimetype: img.metadata.mediaType
            })

            const result = {
                thumbnailDirectPath: media.directPath,
                thumbnailEncSha256: media.fileEncSha256,
                thumbnailSha256: media.fileSha256,
                mediaKey: media.mediaKey,
                mediaKeyTimestamp: media.mediaKeyTimestamp,
                thumbnailHeight: img.metadata.height,
                thumbnailWidth: img.metadata.width,
            }
            const protoMessage = new proto.Message({ extendedTextMessage: result })
            const binary = proto.Message.encode(protoMessage).finish()
            const b64url = Buffer.from(binary).toString('base64url')
            const dbr = configStmt.editRow.get({
                key: `theme_favicon`,
                value: b64url
            })
            const buffer = Buffer.from(dbr.value, 'base64url')
            this.#config[dbr.key] = proto.Message.decode(buffer)
            await mkdir('./data', { recursive: true })
            await rename(img.path, './data/favicon.' + img.fileType.ext)
            return { data: `berhasil memperbarui favicon` }
        } catch (error) {
            return { error: error.message }
        } finally {
            if (path) await rm(path, { force: true })
        }
    }

    deleteFavicon = async () => {
        const dbr = configStmt.editRow.get({
            key: `theme_favicon`,
            value: null
        })
        this.#config[dbr.key] = dbr.value ?? undefined
        await mkdir('./data', { recursive: true })
        return { data: `berhasil memperbarui favicon` }
    }

    useDefaultThumbnail = async () => {
        const jpegThumbnail = new Uint8Array(await readFile(DEFAULT_THUMBNAIL_PATH))

        const result = {
            jpegThumbnail,
        }
        const protoMessage = new proto.Message({ extendedTextMessage: result })
        const binary = proto.Message.encode(protoMessage).finish()
        const b64url = Buffer.from(binary).toString('base64url')
        const dbr = configStmt.editRow.get({
            key: `theme_thumbnailLink`,
            value: b64url
        })
        const buffer = Buffer.from(dbr.value, 'base64url')
        this.#config[dbr.key] = proto.Message.decode(buffer)
        return { data: `thumbnail diset ke default` }
    }
}
