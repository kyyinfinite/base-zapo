const owners = new Set()

export const setOwnerJids = (jids) => {
    owners.clear()
    for (const jid of jids ?? []) owners.add(jid)
}

export const isOwnerJid = (jid) => owners.has(jid)

export const ownerMiddleware = async (ctx, handler) => {
    if (!handler.owner) return null
    if (ctx.isOwner) return null

    return {
        allowed: false,
        message: 'Perintah ini hanya dapat digunakan oleh owner.'
    }
}
