import util from "node:util"

const handler = async (m, ctx) => {
    const code = ctx.text?.trimStart()
    if (!code) return await m.reply(`mana code js nya?`)

    //sama kayak zapok lama biar kode eval tetep bisa pake variabel2 ini
    const { client, jid, text, command, prefix, prefixManager, pluginManager, event, q } = ctx

    try {
        let result = await eval(`(async () => { ${code} })()`)
        if (typeof (result) !== 'string') result = util.inspect(result)
        const wam = q ?? m
        return await wam.reply(result)
    } catch (e) {
        return await m.reply(e.message)
    }
}

handler.command = ['!!']
handler.description = 'eval async'
handler.category = 'unsafe'
handler.owner = true
handler.prefixless = true

export default handler
