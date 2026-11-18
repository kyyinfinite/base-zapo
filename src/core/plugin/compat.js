import { toCommandList } from './registry.js'

export const isLegacyPlugin = (moduleDefault) => {
    return (
        moduleDefault &&
        typeof moduleDefault === 'object' &&
        !Array.isArray(moduleDefault) &&
        typeof moduleDefault.execute === 'function' &&
        Array.isArray(moduleDefault.commands) &&
        moduleDefault.commands.length > 0
    )
}

export const toLegacyParam = (ctx, legacyPlugin) => ({
    client: ctx.conn,
    event: ctx.event,
    jid: ctx.chat,
    pluginManager: ctx.pluginManager,
    prefixManager: ctx.prefixManager,
    themeManager: ctx.themeManager,
    prefix: ctx.prefix,
    command: ctx.command,
    text: ctx.text,
    m: ctx.m,
    q: ctx.q
})

export const legacyToHandler = (plugin) => {
    const handler = async (m, ctx) => {
        return plugin.execute(toLegacyParam(ctx, plugin))
    }

    handler.command = toCommandList(plugin.commands)
    handler.description = plugin.name || ''
    handler.category = plugin.categories?.[0]
    if (plugin.options?.bypassPrefix) {
        handler.prefixless = true
    }

    handler.__legacy = plugin
    return handler
}
