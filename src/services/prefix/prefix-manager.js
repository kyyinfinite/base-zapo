import { prefixListStmt } from '../../database/table-prefix-list.js'
import { configStmt } from '../../database/table-config.js'

export class PrefixManager {
    String = {
        ENABLE: `prefix diaktifkan`,
        DISABLE: `prefix matikan`,
        ALREADY_ENABLE: `prefix sudah aktif, tidak ada perubahan`,
        ALREADY_DISABLE: `prefix sudah mati. tidak ada perubahan`
    }

    CONFIG_KEY = 'is_prefix_active'

    prefixList = []

    isPrefixActive = undefined

    #registry = undefined

    constructor(registry) {
        this.#registry = registry
    }

    bindRegistry = (registry) => {
        this.#registry = registry
    }

    resolve = (input) => {
        if (typeof input !== "string" || !input) return {
            ok: false,
            prefix: undefined,
            string: undefined,
        }

        if (!this.isPrefixActive) return {
            ok: true,
            prefix: undefined,
            string: input,
        }

        let matchedPrefix

        for (const prefix of this.prefixList) {
            if (input.startsWith(prefix) && (!matchedPrefix || prefix.length > matchedPrefix.length)) {
                matchedPrefix = prefix
            }
        }

        if (matchedPrefix) {
            return {
                ok: true,
                prefix: matchedPrefix,
                string: input.substring(matchedPrefix.length) || undefined,
            }
        }

        return {
            ok: false,
            prefix: undefined,
            string: input,
        }
    }

    enablePrefix = () => {
        if (this.isPrefixActive === true) return { error: this.String.ALREADY_ENABLE }
        const dbr = configStmt.editRow.get({
            key: this.CONFIG_KEY,
            value: '1'
        })
        this.isPrefixActive = Boolean(parseInt(dbr.value))
        return { data: this.String.ENABLE }
    }

    disablePrefix = () => {
        if (this.isPrefixActive === false) return { error: this.String.ALREADY_DISABLE }
        const dbr = configStmt.editRow.get({
            key: this.CONFIG_KEY,
            value: '0'
        })
        this.isPrefixActive = Boolean(parseInt(dbr.value))
        return { data: this.String.DISABLE }
    }

    getConfig = () => {
        return {
            isActive: this.isPrefixActive,
            prefixList: this.prefixList
        }
    }

    addPrefix = (newPrefix) => {
        const paramType = typeof newPrefix
        if (paramType !== "string") return { error: `param harus string, ${paramType} diterima.` }

        const newPrefixTrim = newPrefix.trim()

        if (!newPrefixTrim) return { error: `prefix gak boleh kosong` }

        const collision = this.#registry?.findPrefixlessCommand(newPrefixTrim)
        if (collision) {
            return { error: `prefix bentrok dengan command prefixless \`${collision.command}\` (${collision.__pluginFile}). nothing change` }
        }

        const dbr = prefixListStmt.addPrefix.run({ prefix: newPrefixTrim })
        if (dbr.changes) {
            this.syncPrefixList()
            return { data: `prefix ${newPrefixTrim} berhasil ditambahkan` }
        } else {
            return { error: `prefix sudah ada. nothing change` }
        }
    }

    deletePrefix = (userPrefixUntrim) => {
        const paramType = typeof userPrefixUntrim
        if (paramType !== "string") return { error: `param harus string, ${paramType} diterima.` }

        const userPrefix = userPrefixUntrim.trim()

        if (!userPrefix) return { error: `prefix gak boleh kosong` }

        if (this.prefixList.length <= 1) return { error: `tidak bisa menghapus prefix terakhir.` }

        const dbr = prefixListStmt.deletePrefix.run({ prefix: userPrefix })
        if (dbr.changes) {
            this.syncPrefixList()
            return { data: `prefix ${userPrefix} berhasil di hapus` }
        } else {
            const angka = /^\d+$/.test(userPrefix)
            if (!angka) return { error: `prefix tidak ada` }
            const integer = parseInt(userPrefix)
            if (integer <= 0) return { error: `invalid index. gak boleh kurang dari atau sama dengan 0` }
            if (integer > this.prefixList.length) return { error: `invalid. index prefix maksimal cuma ${this.prefixList.length}` }
            const prefix = this.prefixList[integer - 1]
            const dbr = prefixListStmt.deletePrefix.run({ prefix: prefix })
            if (!dbr.changes) return { error: 'prefix tidak ada' }
            this.syncPrefixList()
            return { data: `prefix ${prefix} berhasil di hapus` }
        }
    }

    resetPrefix = () => {
        this.disablePrefix()
        prefixListStmt.deleteAll.run()
        this.init()
        return {
            data: `prefix di reset ke default`
        }
    }

    syncPrefixList = () => {
        this.prefixList = prefixListStmt.selectAll.all().map(v => v?.prefix)
    }

    init = () => {
        this.syncPrefixList()
        if (this.prefixList.length === 0) {
            this.addPrefix(".")
        }

        const dbr = configStmt.getRow.get({ key: this.CONFIG_KEY })
        if (dbr === undefined) {
            this.disablePrefix()
        } else {
            this.isPrefixActive = Boolean(parseInt(dbr.value))
        }
    }
}
