import { getConfigDb } from "./database.js"

let stmt = null

const bind = () => {
    if (stmt) return stmt
    const db = getConfigDb()

    const addPrefix = db.prepare(`
        INSERT INTO prefix_list ('prefix')
        VALUES (:prefix)
        ON CONFLICT DO NOTHING
    `)

    const deletePrefix = db.prepare(`
        DELETE FROM prefix_list
        WHERE prefix = :prefix
    `)

    const selectAll = db.prepare(`
        SELECT * FROM prefix_list
    `)

    const deleteAll = db.prepare(`
        DELETE FROM prefix_list`)

    stmt = { addPrefix, deletePrefix, selectAll, deleteAll }
    return stmt
}

export const prefixListStmt = {
    get addPrefix() { return bind().addPrefix },
    get deletePrefix() { return bind().deletePrefix },
    get selectAll() { return bind().selectAll },
    get deleteAll() { return bind().deleteAll },
}

export const resetPrefixListStmt = () => { stmt = null }
