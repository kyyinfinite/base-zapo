const METADATA_TTL_MS = 5 * 60 * 1000

const metadataCache = new Map()

export const bindGroupSource = (client) => {
    groupSource = async (groupJid) => {
        return client.group.queryGroupMetadata(groupJid)
    }
}

let groupSource = async () => undefined

export const resetGroupSource = (source) => {
    metadataCache.clear()
    groupSource = source || (async () => undefined)
}

export const getGroupMetadata = async (groupJid) => {
    const cached = metadataCache.get(groupJid)
    if (cached && Date.now() - cached.at < METADATA_TTL_MS) return cached.data

    const data = await groupSource(groupJid)
    if (!data) return undefined

    metadataCache.set(groupJid, { at: Date.now(), data })
    return data
}

export const participantIsAdmin = (metadata, jid) => {
    if (!metadata?.participants || !jid) return false
    return metadata.participants.some(p =>
        (p.isAdmin || p.isSuperAdmin) && (p.jid === jid || p.lid === jid)
    )
}

export const getAdminState = async (ctx) => {
    if (!ctx.isGroup) return { isAdmin: false, isBotAdmin: false }

    const metadata = await getGroupMetadata(ctx.chat)

    const credentials = ctx.conn?.auth?.getCurrentCredentials?.()
    const botJid = credentials?.meJid
    const botLid = credentials?.meLid

    const isAdmin = participantIsAdmin(metadata, ctx.sender)
    const isBotAdmin = participantIsAdmin(metadata, botJid) || participantIsAdmin(metadata, botLid)

    return { isAdmin, isBotAdmin }
}

export const adminMiddleware = async (ctx, handler) => {
    if (!handler.admin) return null
    if (!ctx.isGroup) {
        return { allowed: false, message: 'Perintah ini hanya bisa digunakan di dalam grup.' }
    }

    const state = await getAdminState(ctx)
    if (state.isAdmin) return null

    return {
        allowed: false,
        message: 'Perintah ini hanya untuk admin grup.'
    }
}

export const botAdminMiddleware = async (ctx, handler) => {
    if (!handler.botAdmin) return null
    if (!ctx.isGroup) {
        return { allowed: false, message: 'Perintah ini hanya bisa digunakan di dalam grup.' }
    }

    const state = await getAdminState(ctx)
    if (state.isBotAdmin) return null

    return {
        allowed: false,
        message: 'Bot harus menjadi admin grup untuk menjalankan perintah ini.'
    }
}
