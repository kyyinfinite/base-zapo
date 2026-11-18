import { getConfigDb } from "./database.js"

let stmt = null

const bind = () => {
    if (stmt) return stmt
    const db = getConfigDb()

    const editRow = db.prepare(`
        INSERT INTO config ('key', 'value')
        VALUES (:key, :value)
        ON CONFLICT DO UPDATE SET
        value = excluded.value
        RETURNING *
    `)

    const getRow = db.prepare(`
        SELECT * FROM config
        WHERE key = :key
    `)

    const getAllRows = db.prepare(`SELECT * FROM config`)

    stmt = { editRow, getRow, getAllRows }
    return stmt
}

export const configStmt = {
    get editRow() { return bind().editRow },
    get getRow() { return bind().getRow },
    get getAllRows() { return bind().getAllRows },
}

export const resetConfigStmt = () => { stmt = null }
