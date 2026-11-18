const handler = async (m, ctx) => {
    const { conn, chat, themeManager, text } = ctx

    const param = text?.trim()

    if (!param) {
        const config = themeManager.getConfig()
        return await conn.message.send(chat, {
            extendedTextMessage: {
                ...config.theme_thumbnailLink?.extendedTextMessage,
                matchedText: config.theme_url,
                text: config.theme_url + "\n\n" + themeManager.getMainMenuText(),
                title: config.theme_title,
                description: config.theme_description,
                faviconMmsMetadata: config.theme_favicon?.extendedTextMessage
            }
        })
    }

    else if (param === "all") {
        return await conn.message.send(chat, themeManager.getMenuAll())
    }

    else {
        const r = themeManager.getMenuCategory(param)
        if (r.error) return await m.reply(r.error)
        return await conn.message.send(chat, r.data.text)
    }
}

handler.command = ['menu']
handler.description = 'menu'
handler.category = 'general'

export default handler
