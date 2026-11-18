export const privateMiddleware = async (ctx, handler) => {
    if (!handler.private) return null
    if (!ctx.isGroup) return null

    return {
        allowed: false,
        message: 'Perintah ini hanya bisa digunakan di chat pribadi.'
    }
}
