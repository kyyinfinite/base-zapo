import { isDispatchable, resolveSender, senderCandidates } from '../ingest/ingest.js'
import { parseCommand } from './parse.js'
import { createContext } from '../context/createContext.js'
import { runMiddleware } from '../middleware/engine.js'
import { mSerialize } from '../../lib/message/serialize.js'
import { sendPlugin } from '../../lib/message/send-plugin.js'
import { isOwnerJid } from '../middleware/owner.js'
import { createLogger } from '../../services/logger/logger.js'

const log = createLogger('dispatcher')

export const createDispatcher = (app) => {
    const { client, registry, prefixManager, outbound, config } = app
    const metrics = app.metrics

    const executeWithTimeout = async (handler, m, ctx) => {
        const timeoutMs = Number(handler.timeoutMs || 0)
        if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
            return handler(m, ctx)
        }

        const controller = new AbortController()
        ctx.signal = controller.signal

        let timedOut = false
        const timeout = setTimeout(() => {
            timedOut = true
            log.warn(`handler timeout ${timeoutMs}ms terlampaui (cooperative abort) — handler masih berjalan di background`, {
                plugin: handler.description || handler.__pluginFile,
                command: ctx.command,
                chat: ctx.chat,
                messageId: m.key?.id
            })
            controller.abort(new Error(`handler timeout ${timeoutMs}ms`))
        }, timeoutMs)

        try {
            return await handler(m, ctx)
        } finally {
            clearTimeout(timeout)
            if (timedOut) {
                metrics?.inc('handlerTimeouts')
            }
        }
    }

    const executePlugin = async (handler, m, ctx) => {
        metrics?.inc('commandsExecuted')
        const startedAt = Date.now()
        try {
            const result = await executeWithTimeout(handler, m, ctx)

            const durationMs = Date.now() - startedAt
            metrics?.set('lastHandlerDurationMs', durationMs)
            if (durationMs > 1000) {
                log.warn(`handler lambat: ${durationMs}ms`, {
                    command: ctx.command,
                    plugin: handler.description || handler.__pluginFile,
                    chat: ctx.chat
                })
            }

            return { ok: true, result }
        } catch (error) {
            metrics?.inc('pluginErrors')
            log.error(`plugin fail: ${error.message}`, {
                plugin: handler.description || handler.__pluginFile,
                command: ctx.command,
                chat: ctx.chat,
                messageId: m.key?.id
            })

            //gagal ya cooldown dibalikin, biar user ga kena hukuman
            try { ctx._cooldownRelease?.() } catch { }

            const userMessage = ctx.isOwner
                ? `💔 plugin fail\n${error.message}`
                : `💔 plugin fail. coba lagi nanti.`

            try {
                await outbound.reply(ctx.chat, userMessage, m)
            } catch (replyError) {
                log.error(`gagal mengirim pesan error ke user: ${replyError.message}`)
            }

            return { ok: false }
        }
    }

    const handleMessage = async (event) => {
        try {
            if (!isDispatchable(event)) return

            //mode self: cuma owner sama pesan sendiri
            const candidates = senderCandidates(event.key)
            const isOwner = candidates.some(jid => isOwnerJid(jid))
            if (config.BOT_MODE === 'self' && !isOwner && !event.key.fromMe) return

            const m = mSerialize(event, client)
            const sender = resolveSender(event.key)

            const prefixResolve = prefixManager.resolve(m?.text)
            const parsed = parseCommand(prefixResolve.string)
            if (!parsed) return

            const handler = registry.get(parsed.command)
            if (!handler) return

            //tanpa prefix cuma buat plugin prefixless
            if (!prefixResolve.ok && !handler.prefixless) return

            const ctx = createContext({
                conn: client,
                event,
                m,
                q: m.q,
                parsed: {
                    command: parsed.command,
                    prefix: prefixResolve.prefix,
                    text: parsed.text,
                    args: parsed.args
                },
                outbound,
                app,
                isOwner,
                sender
            })

            //fitur lama, kirim source plugin kalo diakhiri .js (owner doang)
            if (ctx.isOwner && ctx.text?.trim() === '.js') {
                return await sendPlugin(ctx, handler)
            }

            const middleware = await runMiddleware(ctx, handler)
            if (!middleware.allowed) {
                if (middleware.message) {
                    try {
                        await outbound.reply(ctx.chat, middleware.message, m)
                    } catch { }
                }
                return
            }

            await executePlugin(handler, m, ctx)
        } catch (error) {
            log.error(`dispatcher error: ${error.message}`, {
                chat: event?.key?.remoteJid,
                messageId: event?.key?.id
            })
        }
    }

    return handleMessage
}

export default createDispatcher
