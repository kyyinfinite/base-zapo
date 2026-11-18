const handler = async (m, ctx) => {
    const start = Date.now()
    const msg = await ctx.reply('pong')
    const diff = Date.now() - start

    await ctx.conn.message.send(ctx.chat, `roundtrip ${diff} ms`, {
        editKey: { id: msg.id }
    })
}

handler.command = ['p2']
handler.description = 'ping 2'
handler.category = 'general'
handler.prefixless = true

export default handler
