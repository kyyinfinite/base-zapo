import { exec } from "node:child_process"
import { promisify } from "node:util"

const sh = promisify(exec)
const MAX_REPLY = 3500

const handler = async (m, ctx) => {
    const { text, conn, chat } = ctx

    if (!text) {
        return await m.reply("Masukkan perintah shell.")
    }

    try {
        const { stdout, stderr } = await sh(text?.trim(), {
            windowsHide: true,
            maxBuffer: 20 * 1024 * 1024
        })

        const output = (stdout || stderr || "Done.").trim()

        if (output.length <= MAX_REPLY) {
            return await m.reply(output)
        }

        return await conn.message.send(chat, {
            type: 'document',
            media: Buffer.from(output),
            fileName: 'shell-output.txt',
            mimetype: 'text/plain'
        })
    } catch (err) {
        const output = `${err.stdout || ""}${err.stderr || err.message}`.trim()

        if (output.length <= MAX_REPLY) {
            return await m.reply(output)
        }

        return await conn.message.send(chat, {
            type: 'document',
            media: Buffer.from(output),
            fileName: 'shell-error.txt',
            mimetype: 'text/plain'
        })
    }
}

handler.command = ['$']
handler.description = 'shell'
handler.category = 'unsafe'
handler.owner = true
handler.prefixless = true

export default handler
