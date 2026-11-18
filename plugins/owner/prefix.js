import { splitString } from '../../src/utils/string.js'

const String = {
    SHOW_HELP: `opsi tersedia\n\n- on\n- off\n- add <prefix>\n- delete <prefix|index>\n- reset`,
    WARN_PREFIX_OFF: `prefix berhasil ditambahkan, namun bot sedang menggunakan konfigurasi prefix off... ketik \`prefix on\` agar bisa menggunakan prefix`,
    EMOJI_SUCCESS: "✅",
    EMOJI_WARN: "☑️"
}

const handler = async (m, ctx) => {
    const { prefixManager, text, command, prefix } = ctx
    if (!text) {
        //ingetin kalo prefix lagi off
        const prefixConfig = prefixManager.getConfig()
        const status = prefixConfig.isActive ? 'on' : 'off'
        const list = prefixConfig.prefixList.map((p, i) => `${i + 1}. [${p}]`).join('\n')
        const print = `prefix : ${status}\n\nlist :\n${list}`
        return await m.reply(print)
    }

    const split1 = splitString(text.trimStart())

    const subCommand1 = split1.first
    const param1 = split1.rest?.trimStart()

    if (subCommand1 === "on") {
        const r = prefixManager.enablePrefix()
        if (r.error) return await m.reply(r.error)
        return await m.react(String.EMOJI_SUCCESS)
    }

    else if (subCommand1 === "off") {
        const r = prefixManager.disablePrefix()
        if (r.error) return await m.reply(r.error)
        return await m.react(String.EMOJI_SUCCESS)
    }

    else if (subCommand1 === "add" || subCommand1 === "a") {
        const r = prefixManager.addPrefix(param1)
        if (r.error) return await m.reply(r.error)

        const prefixConfig = prefixManager.getConfig()
        if (!prefixConfig.isActive) {
            setTimeout(async () => {
                try {
                    await m.reply(String.WARN_PREFIX_OFF)
                } catch (e) {
                    console.error(e)
                }
            }, 1000);
        }
        return await m.react(prefixConfig.isActive ? String.EMOJI_SUCCESS : String.EMOJI_WARN)
    }

    else if (subCommand1 === "delete" || subCommand1 === "d") {
        const r = prefixManager.deletePrefix(param1)
        if (r.error) return await m.reply(r.error)
        return await m.reply(r.data)
    }

    else if (subCommand1 === "reset" || subCommand1 === "r") {
        const r = prefixManager.resetPrefix()
        if (r.error) return await m.reply(r.error)
        return await m.reply(r.data)
    }

    else if (subCommand1 === "-h") {
        return await m.reply(String.SHOW_HELP)
    }

    else {
        return await m.reply(`invalid subcommand.\ngunakan command \`${prefix ? prefix : ''}${command} -h\` untuk bantuan`)
    }
}

handler.command = ['prefix']
handler.description = 'prefix manager'
handler.category = 'owner'
handler.owner = true
handler.prefixless = true

export default handler
