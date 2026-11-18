export const groupMiddleware = async (ctx, handler) => {
    if (!handler.group) return null
    if (ctx.isGroup) return null

    return {
        allowed: false,
        message: 'Perintah ini hanya bisa digunakan di dalam grup.'
    }
}
