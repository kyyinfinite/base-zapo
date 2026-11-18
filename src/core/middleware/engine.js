import { createLogger } from '../../services/logger/logger.js'
import { ownerMiddleware, setOwnerJids } from './owner.js'
import { groupMiddleware } from './group.js'
import { privateMiddleware } from './private.js'
import { adminMiddleware, botAdminMiddleware } from './admin.js'
import { cooldownMiddleware } from './cooldown.js'

const log = createLogger('middleware')

const middlewares = []

export const useMiddleware = (fn) => {
    if (typeof fn !== 'function') {
        throw new TypeError('Middleware harus berupa fungsi')
    }
    middlewares.push(fn)
    return () => {
        const index = middlewares.indexOf(fn)
        if (index !== -1) middlewares.splice(index, 1)
    }
}

export const runMiddleware = async (ctx, handler) => {
    for (const middleware of middlewares) {
        let result
        try {
            result = await middleware(ctx, handler)
        } catch (error) {
            log.error(`middleware ${middleware.name || 'anonymous'} error: ${error.message}`, {
                command: ctx?.command,
                chat: ctx?.chat
            })
            return { allowed: false, message: 'Terjadi kesalahan pada pemeriksaan akses. Coba lagi nanti.' }
        }

        if (!result) continue

        if (result.allowed === false) {
            try { ctx._cooldownRelease?.() } catch { }
            return result
        }
    }

    return { allowed: true }
}

export const getMiddlewares = () => [...middlewares]

export const resetMiddlewares = () => {
    middlewares.length = 0
}

export const installBuiltinMiddlewares = ({ ownerJids }) => {
    resetMiddlewares()
    setOwnerJids(ownerJids)
    middlewares.push(
        ownerMiddleware,
        groupMiddleware,
        privateMiddleware,
        adminMiddleware,
        botAdminMiddleware,
        cooldownMiddleware
    )
}
