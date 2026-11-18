import { createMessageBuilderFactory } from '../outbound/builder.js'

export const createContext = ({ conn, event, m, q, parsed, outbound, app, isOwner, sender, signal }) => {
    if (!conn) throw new TypeError('createContext butuh conn')
    if (!m) throw new TypeError('createContext butuh m')

    const chat = m.key.remoteJid

    const ctx = {
        conn,
        client: conn,
        event,
        m,
        q,

        chat,
        jid: chat,
        sender,
        isGroup: !!m.key.isGroup,
        isOwner,
        fromMe: !!m.key.fromMe,

        command: parsed.command,
        prefix: parsed.prefix,
        text: parsed.text,
        args: parsed.args,
        signal,

        prefixManager: app.prefixManager,
        themeManager: app.themeManager,
        plugins: app.registry,
        pluginManager: app.legacyPluginFacade,

        reply: (text, options = {}) => outbound.reply(chat, text, m, options),
        send: (content, options = {}, chatId) => outbound.send(chatId ?? chat, content, options),
        react: (emoji) => outbound.react(chat, emoji, m),
        download: (mode) => (q ?? m).download(mode),

        message: () => createMessageBuilderFactory(outbound.send)(ctx),

        //internal, plugin jangan pake
        _cooldownRelease: undefined
    }

    return ctx
}

export default createContext
