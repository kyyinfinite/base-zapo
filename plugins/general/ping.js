const handler = async (m, ctx) => {
    await ctx.reply(`pong`)
}

handler.command = ['ping']
handler.description = 'ping'
handler.category = 'general'
handler.prefixless = true

export default handler
