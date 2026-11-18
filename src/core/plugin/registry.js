import { events } from '../events/bus.js'
import { createLogger } from '../../services/logger/logger.js'

const log = createLogger('registry')

const ALLOWED_META_TYPES = {
    description: 'string',
    category: 'string',
    owner: 'boolean',
    group: 'boolean',
    private: 'boolean',
    admin: 'boolean',
    botAdmin: 'boolean',
    cooldown: 'number',
    prefixless: 'boolean',
    timeoutMs: 'number',
    init: 'function',
    dispose: 'function'
}

export const toCommandList = (command) => {
    const list = Array.isArray(command) ? command : [command]
    const cleaned = []
    for (const item of list) {
        if (typeof item !== 'string' || !item.trim()) {
            throw new TypeError(`handler.command harus string atau array of string, dapat: ${typeof item}`)
        }
        cleaned.push(item.trim().toLowerCase())
    }
    if (cleaned.length === 0) {
        throw new TypeError('handler.command tidak boleh kosong')
    }
    return [...new Set(cleaned)]
}

export const validateHandler = (handler) => {
    if (typeof handler !== 'function') {
        throw new TypeError(`plugin harus berupa function handler, dapat: ${typeof handler}`)
    }

    if (handler.command === undefined || handler.command === null) {
        throw new TypeError('plugin butuh handler.command (string atau array of string)')
    }

    toCommandList(handler.command)

    for (const [key, kind] of Object.entries(ALLOWED_META_TYPES)) {
        const value = handler[key]
        if (value === undefined || value === null) continue

        let valid = false
        if (kind === 'string') valid = typeof value === 'string'
        else if (kind === 'boolean') valid = typeof value === 'boolean'
        else if (kind === 'number') valid = typeof value === 'number' && Number.isFinite(value) && value >= 0
        else if (kind === 'function') valid = typeof value === 'function'

        if (!valid) {
            throw new TypeError(`handler.${key} tidak valid (harus ${kind}, dapat ${typeof value})`)
        }
    }

    return true
}

export const buildMetadata = (handler, commands, fallbackCategory) => ({
    commands,
    description: handler.description || '',
    category: handler.category || fallbackCategory,
    owner: !!handler.owner,
    group: !!handler.group,
    private: !!handler.private,
    admin: !!handler.admin,
    botAdmin: !!handler.botAdmin,
    cooldown: handler.cooldown || 0,
    prefixless: !!handler.prefixless,
    timeoutMs: handler.timeoutMs || 0,
    file: handler.__pluginFile || ''
})

class PluginRegistry {
    #commands = new Map()

    #files = new Map()

    validate(handler) {
        return validateHandler(handler)
    }

    register(file, handler, options = {}) {
        validateHandler(handler)

        //folder unsafe selalu owner-only
        if (options.forceOwner) {
            handler.owner = true
        }

        const commands = toCommandList(handler.command)
        const registered = []

        for (const command of commands) {
            const existingOwner = this.#commandOwner(command)
            if (existingOwner && existingOwner !== file) {
                log.warn(`COLLISION: command "${command}" dari ${file} bertabrakan dengan ${existingOwner}. ${existingOwner} dipertahankan, ${file} dibuang untuk command ini.`)
                events.emit('plugin:collision', command, file, existingOwner)
                continue
            }
            this.#commands.set(command, handler)
            registered.push(command)
        }

        if (registered.length === 0) {
            throw new Error(`plugin ${file} tidak mendaftarkan satu pun command (semua bentrok)`)
        }

        handler.__pluginFile = file
        this.#files.set(file, {
            commands: registered,
            handler,
            metadata: buildMetadata(handler, registered, options.category || 'uncategorized')
        })

        events.emit('plugin:loaded', file, registered)
        return registered
    }

    #commandOwner(command) {
        const handler = this.#commands.get(command)
        return handler?.__pluginFile
    }

    unregister(file) {
        const entry = this.#files.get(file)
        if (!entry) return false

        for (const command of entry.commands) {
            if (this.#commands.get(command) === entry.handler) {
                this.#commands.delete(command)
            }
        }
        this.#files.delete(file)
        events.emit('plugin:unloaded', file)
        return true
    }

    get(command) {
        if (typeof command !== 'string') return undefined
        return this.#commands.get(command.trim().toLowerCase())
    }

    list() {
        return [...this.#files.entries()].map(([file, entry]) => ({ file, ...entry }))
    }

    commands() {
        return [...this.#commands.keys()]
    }

    get size() {
        return this.#files.size
    }

    findPrefixlessCommand(prefix) {
        const command = prefix.trim().toLowerCase()
        if (!command) return undefined
        const handler = this.#commands.get(command)
        if (handler?.prefixless) return handler
        return undefined
    }
}

export { PluginRegistry }
