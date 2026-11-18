import { readdir, stat } from "node:fs/promises"
import { join, basename, dirname } from "node:path"
import { pathToFileURL } from "node:url"

import { PluginRegistry } from './registry.js'
import { isLegacyPlugin, legacyToHandler } from './compat.js'
import { events } from '../events/bus.js'
import { createLogger } from '../../services/logger/logger.js'

const log = createLogger('loader')

const DEFAULT_PLUGIN_ROOT = './plugins'

export class PluginLoader {
    #handlers = new Map()

    #failures = new Map()

    #counter = 0

    constructor(options = {}) {
        this.pluginRoot = options.pluginRoot || DEFAULT_PLUGIN_ROOT
        this.registry = options.registry || new PluginRegistry()
        this.enableUnsafe = options.enableUnsafe === true
        this.app = options.app || null
    }

    async #install(file, handler, options) {
        try {
            this.registry.validate(handler)
        } catch (error) {
            this.#failures.set(file, { file, phase: 'validate', error: error.message })
            throw error
        }

        if (typeof handler.init === 'function') {
            try {
                await handler.init(this.app)
            } catch (error) {
                this.#failures.set(file, { file, phase: 'init', error: error.message })

                //init gagal di tengah, coba dispose seadanya
                await this.#rollbackInit(file, handler, error)
                throw error
            }
        }

        try {
            this.registry.register(file, handler, options)
        } catch (error) {
            this.#failures.set(file, { file, phase: 'register', error: error.message })
            await this.#rollbackInit(file, handler, error)
            throw error
        }

        this.#handlers.set(file, handler)
    }

    async #rollbackInit(file, handler, primaryError) {
        if (typeof handler.dispose !== 'function') return
        try {
            await handler.dispose()
        } catch (disposeError) {
            log.error(
                `dispose rollback plugin ${basename(file)} juga gagal: ${disposeError?.message ?? disposeError}`,
                { primaryError: primaryError?.message ?? String(primaryError) }
            )
        }
    }

    loadPlugin = async (file, options = {}) => {
        this.#failures.delete(file)
        try {
            const cacheBust = `${Date.now()}-${this.#counter++}`
            const module = await import(`${pathToFileURL(file).href}?load=${cacheBust}`)

            let handler = module.default

            if (isLegacyPlugin(handler)) {
                log.warn(`${basename(file)} memakai format plugin lama (object). Migrasikan ke handler function.`)
                handler = legacyToHandler(handler)
            }

            if (typeof handler !== 'function') {
                log.error(`${basename(file)} tidak mengekspor handler`, { got: typeof handler })
                this.#failures.set(file, { file, phase: 'load', error: `default export bukan function (${typeof handler})` })
                return undefined
            }

            //reload = ganti yang lama
            if (this.#handlers.has(file)) {
                await this.unloadPlugin(file)
            }

            await this.#install(file, handler, options)
            return handler
        } catch (error) {
            if (!this.#failures.has(file)) {
                this.#failures.set(file, { file, phase: 'load', error: error?.message ?? String(error) })
            }
            log.error(`gagal load plugin ${basename(file)}: ${error?.message ?? error}`)
            events.emit('plugin:error', file, error)
            return undefined
        }
    }

    failures = () => [...this.#failures.values()]

    unloadPlugin = async (file) => {
        const handler = this.#handlers.get(file)
        if (!handler) return false

        if (typeof handler.dispose === 'function') {
            try {
                await handler.dispose()
            } catch (error) {
                log.error(`dispose plugin ${basename(file)} gagal: ${error.message}`)
            }
        }

        this.registry.unregister(file)
        this.#handlers.delete(file)
        return true
    }

    loadAll = async () => {
        let loaded = 0

        const categories = await this.#readCategories()

        for (const { folder, category } of categories) {
            const isUnsafe = category === 'unsafe'
            if (isUnsafe && !this.enableUnsafe) {
                log.warn('folder unsafe/ dilewati (ENABLE_UNSAFE=false)')
                continue
            }

            const files = await this.#readPluginFiles(folder)
            for (const file of files) {
                const handler = await this.loadPlugin(file, {
                    category,
                    forceOwner: isUnsafe
                })
                if (handler) loaded++
            }
        }

        return loaded
    }

    async #readCategories() {
        try {
            const entries = await readdir(this.pluginRoot, { withFileTypes: true })
            return entries
                .filter(e => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules')
                .map(e => ({ folder: join(e.parentPath, e.name), category: e.name }))
        } catch {
            log.warn(`folder plugin tidak ditemukan: ${this.pluginRoot}`)
            return []
        }
    }

    async #readPluginFiles(folder) {
        try {
            const entries = await readdir(folder, { withFileTypes: true })
            return entries
                .filter(e => e.isFile() && e.name.endsWith('.js') && !e.name.startsWith('.'))
                .map(e => join(e.parentPath, e.name))
        } catch {
            return []
        }
    }

    unloadAll = async () => {
        for (const file of [...this.#handlers.keys()]) {
            await this.unloadPlugin(file)
        }
    }

    reloadPlugin = async (file) => {
        const category = basename(dirname(file))
        const isUnsafe = category === 'unsafe'
        return this.loadPlugin(file, { category, forceOwner: isUnsafe })
    }
}
