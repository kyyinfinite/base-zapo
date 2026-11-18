import { basename } from "path"

const sendPlugin = (ctx, handler) => {
    const wam = ctx.q ?? ctx.m
    const path = handler.__pluginFile ?? handler.__legacy?.path

    return ctx.conn.message.send(ctx.chat, {
        type: 'document',
        media: path,
        mimetype: 'text/javascript',
        fileName: basename(path),
        caption: `ini plugin ${handler.description || basename(path)} nya`
    }, { quote: wam.key })
}

export { sendPlugin }
