import { Agent } from "node:https"
import { mkdir } from "node:fs/promises"

import { createMediaProcessor } from "@zapo-js/media-utils"
import { createSqliteStore } from '@zapo-js/store-sqlite'
import { createStore, WaClient, ConsoleLogger } from 'zapo-js'

import { initDatabases, closeDatabases } from '../../database/database.js'
import { PluginLoader } from '../plugin/loader.js'
import { PluginRegistry } from '../plugin/registry.js'
import { PrefixManager } from '../../services/prefix/prefix-manager.js'
import { ThemeManager } from '../../services/theme/theme-manager.js'
import { createOutbound } from '../outbound/outbound.js'
import { createDispatcher } from '../dispatcher/dispatcher.js'
import { installBuiltinMiddlewares } from '../middleware/engine.js'
import { bindGroupSource } from '../middleware/admin.js'
import { setOwnerJids } from '../middleware/owner.js'
import { initTempService } from '../../services/media/temp-files.js'
import { events } from '../events/bus.js'
import { createLogger } from '../../services/logger/logger.js'
import { createMetrics } from '../../services/metrics/metrics.js'
import { createReconnectSupervisor } from './reconnect.js'
import { createPairingRequester } from './pairing.js'

const log = createLogger('app')

export const createApp = (options = {}) => {
    const config = options.config

    let registry

    let loader

    let prefixManager

    let themeManager

    let client

    let outbound
    let dispatcher

    let legacyPluginFacade

    let zapoStore = null

    let dispatchOpen = false

    let state = 'idle'

    let stopPromise = null

    const startedAt = Date.now()
    const metrics = createMetrics(['messagesProcessed', 'commandsExecuted', 'pluginErrors', 'disconnects'])

    const setState = (next) => {
        state = next
        metrics.set('connectionState', next)
    }

    const botCheck = options.botCheck

    const aborted = () => state === 'stopping' || state === 'stopped'

    const pairing = createPairingRequester({
        client: null,
        config,
        emit: (name, payload) => events.emit(name, payload)
    })

    const supervisor = createReconnectSupervisor({
        connect: async () => {
            //koneksi baru = boleh pairing lagi
            pairing.reset()
            await client.connect()
        }
    })

    const app = {
        get client() { return client },
        get registry() { return registry },
        get prefixManager() { return prefixManager },
        get themeManager() { return themeManager },
        get config() { return config },
        get metrics() { return metrics },
        get state() { return state },
        get isRunning() { return state === 'running' },

        health() {
            return {
                state,
                uptimeMs: Date.now() - startedAt,
                reconnect: supervisor.snapshot(),
                plugins: {
                    active: registry?.size ?? 0,
                    failures: loader?.failures() ?? []
                },
                metrics: metrics.snapshot()
            }
        },

        start,
        stop
    }

    const setupClient = () => {
        client = new WaClient(
            {
                store: zapoStore,
                sessionId: 'default',
                connectTimeoutMs: 15_000,
                nodeQueryTimeoutMs: 30_000,
                history: { enabled: false, requireFullSync: false },
                proxy: {
                    ws: new Agent()
                },
                media: {
                    processor: createMediaProcessor(),
                    generateThumbnail: true,
                    generateWaveform: true,
                    normalizeVoiceNote: true
                },
                ...(options.waClientOptions ?? {})
            },
            new ConsoleLogger('error')
        )

        pairing.bindClient(client)

        client.on('auth_qr', (event) => {
            void pairing.handleAuthQr(event)
        })

        client.on('connection', (event) => {
            log.info(`connection: ${event.status} ${event.reason ?? ''}`)

            if (event.status === 'open') {
                supervisor.notifyOpen()
                setState('running')
                events.emit('bot:ready')
                return
            }

            if (event.status === 'close') {
                metrics.inc('disconnects')
                events.emit('bot:closed', event)

                if (event.isLogout) {
                    //udah di-logout dari hp, ga usah reconnect, harus pair ulang
                    setState('stopped')
                    log.error('device di-logout server (isLogout). Berhenti. Hapus folder .auth dan pair ulang untuk melanjutkan.')
                    return
                }

                if (state !== 'stopping' && state !== 'stopped') {
                    setState('recovering')
                    supervisor.schedule()
                }
            }
        })

        client.on('message', (event) => {
            if (!dispatchOpen) return
            metrics.inc('messagesProcessed')

            //jaga2 biar error dispatcher ga bikin bot mati
            void Promise.resolve(dispatcher(event)).catch((error) => {
                log.error(`message pipeline error: ${error?.message ?? error}`, {
                    chat: event?.key?.remoteJid,
                    messageId: event?.key?.id
                })
            })
        })
    }

    async function start() {
        setState('starting')

        const check = botCheck()
        if (check.error) {
            console.error(check.error)
            process.exitCode = 1
            setState('idle')
            return
        }

        //db aplikasi, bukan punya zapo
        await initDatabases(options.databases ?? {})
        if (aborted()) return

        //beresin file temp sisa crash
        await initTempService()
        if (aborted()) return

        registry = new PluginRegistry()
        loader = new PluginLoader({
            pluginRoot: options.pluginRoot ?? './plugins',
            registry,
            enableUnsafe: config.ENABLE_UNSAFE,
            app
        })
        const loaded = await loader.loadAll()
        metrics.set('activePlugins', registry.size)
        log.info(`plugin termuat: ${loaded}`)
        if (aborted()) return

        prefixManager = new PrefixManager(registry)
        prefixManager.init()

        themeManager = new ThemeManager(registry)
        await themeManager.init()
        if (aborted()) return

        installBuiltinMiddlewares({ ownerJids: config.OWNER_PNS })

        //biar plugin lama yg masih pake pluginManager ga rusak
        legacyPluginFacade = {
            get: (command) => {
                const handler = registry.get(command)
                if (!handler) return undefined
                return {
                    name: handler.description || command,
                    commands: Array.isArray(handler.command) ? handler.command : [handler.command],
                    path: handler.__pluginFile,
                    options: handler.prefixless ? { bypassPrefix: true } : {},
                    execute: (ctx) => handler(ctx.m, ctx)
                }
            },
            get array() {
                return registry.list().map(entry => legacyPluginFacade.get(entry.metadata.commands[0]))
            }
        }

        //kalo test bisa suntik store sendiri
        if (options.zapoStore) {
            zapoStore = options.zapoStore
        } else {
            await mkdir('.auth', { recursive: true })
            zapoStore = createStore({
                backends: {
                    sqlite: createSqliteStore({ path: '.auth/state.sqlite', driver: 'auto' })
                },
                providers: {
                    auth: 'sqlite',
                    signal: 'sqlite',
                    preKey: 'sqlite',
                    session: 'sqlite',
                    identity: 'sqlite',
                    senderKey: 'sqlite',
                    appState: 'sqlite',
                    privacyToken: 'sqlite',
                    messages: 'none',
                    threads: 'none',
                    contacts: 'none'
                }
            })
        }
        if (aborted()) return

        setupClient()

        outbound = createOutbound(client)
        dispatcher = createDispatcher({ ...app, client, registry, prefixManager, themeManager, outbound, legacyPluginFacade, config })

        bindGroupSource(client)

        //legacy, cuma buat plugin eval lama. jangan nambah pake ini lagi
        global._ = {
            ...(global._ ?? {}),
            client: null,
            app,
            registry,
            prefixManager,
            themeManager
        }

        if (options.installProcessHandlers !== false) {
            installProcessHandlers()
        }

        //connect awal gagal jangan langsung mati, nanti dicoba lagi sama supervisor
        dispatchOpen = true
        try {
            await client.connect()
        } catch (error) {
            if (aborted()) return
            log.error(`connect awal gagal: ${error?.message ?? error}`)
            setState('recovering')
            supervisor.schedule()
            return
        }
        global._.client = client
    }

    function installProcessHandlers() {
        let stopping = false

        const handleSignal = (signalName) => {
            if (stopping) {
                log.warn(`${signalName} kedua diterima — paksa keluar`)
                process.exit(1)
            }
            stopping = true
            log.info(`${signalName} diterima — graceful shutdown`)

            //kalo cleanup nyangkut, paksa keluar aja
            const forceExitTimer = setTimeout(() => {
                log.error('shutdown melebihi 10s — paksa keluar')
                process.exit(process.exitCode ?? 1)
            }, 10_000)
            forceExitTimer.unref?.()

            void app.stop().finally(() => {
                clearTimeout(forceExitTimer)
                process.exit(process.exitCode ?? 0)
            })
        }

        process.once('SIGINT', () => handleSignal('SIGINT'))
        process.once('SIGTERM', () => handleSignal('SIGTERM'))

        process.on('unhandledRejection', (reason) => {
            //1 rejection nyasar jangan sampe matiin bot
            log.error(`unhandled rejection: ${reason instanceof Error ? reason.stack ?? reason.message : String(reason)}`)
            metrics.inc('unhandledRejections')
        })

        process.on('uncaughtException', (error) => {
            log.error(`uncaught exception: ${error?.stack ?? error?.message ?? error}`)
            process.exitCode = 1
            void app.stop().finally(() => process.exit(1))
        })
    }

    function stop() {
        if (stopPromise) return stopPromise

        //stop() sebelum start() aman
        if (state === 'stopped' || state === 'idle') {
            setState('stopped')
            return Promise.resolve()
        }

        setState('stopping')

        stopPromise = (async () => {
            //urutan: tutup gerbang -> batalin reconnect -> dispose plugin -> tutup db -> disconnect
            dispatchOpen = false

            supervisor.cancel()

            try {
                if (loader) {
                    await loader.unloadAll()
                }

                closeDatabases()

                //disconnect ga hapus kredensial, cuma flush data
                if (client) {
                    await client.disconnect().catch((error) => log.warn(`disconnect: ${error?.message ?? error}`))
                }
            } finally {
                setState('stopped')
                log.info('zapok berhenti')
            }
        })()

        return stopPromise
    }

    return app
}
